#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PROJECT_ROOT=$(cd "${ROOT_DIR}/../.." && pwd)
ORG_ROOT="${PROJECT_ROOT}/organizations"

source "${ROOT_DIR}/.env"

require_bin() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "ERROR: required binary '$1' not found in PATH"
    exit 1
  }
}

copy_first_file() {
  local src_dir="$1"
  local dest_file="$2"
  local first_file

  # sort ensures deterministic selection when multiple files exist
  first_file=$(find "${src_dir}" -maxdepth 1 -type f | sort | head -n 1)
  if [ -z "${first_file}" ]; then
    echo "ERROR: no file found in ${src_dir}"
    exit 1
  fi

  cp "${first_file}" "${dest_file}"
}

write_node_ou_config() {
  local msp_dir="$1"
  local ca_port="$2"
  local ca_name="$3"

  {
    printf 'NodeOUs:\n'
    printf '  Enable: true\n'
    printf '  ClientOUIdentifier:\n'
    printf '    Certificate: cacerts/localhost-%s-%s.pem\n' "${ca_port}" "${ca_name}"
    printf '    OrganizationalUnitIdentifier: client\n'
    printf '  PeerOUIdentifier:\n'
    printf '    Certificate: cacerts/localhost-%s-%s.pem\n' "${ca_port}" "${ca_name}"
    printf '    OrganizationalUnitIdentifier: peer\n'
    printf '  AdminOUIdentifier:\n'
    printf '    Certificate: cacerts/localhost-%s-%s.pem\n' "${ca_port}" "${ca_name}"
    printf '    OrganizationalUnitIdentifier: admin\n'
    printf '  OrdererOUIdentifier:\n'
    printf '    Certificate: cacerts/localhost-%s-%s.pem\n' "${ca_port}" "${ca_name}"
    printf '    OrganizationalUnitIdentifier: orderer\n'
  } > "${msp_dir}/config.yaml"
}

enroll_ca_admin() {
  local home_dir="$1"
  local ca_name="$2"
  local ca_port="$3"
  local ca_admin="$4"
  local ca_admin_pw="$5"
  local ca_cert="$6"

  export FABRIC_CA_CLIENT_HOME="${home_dir}"
  mkdir -p "${FABRIC_CA_CLIENT_HOME}"

  fabric-ca-client enroll \
    -u "https://${ca_admin}:${ca_admin_pw}@localhost:${ca_port}" \
    --caname "${ca_name}" \
    --tls.certfiles "${ca_cert}"
}

register_affiliation() {
  local ca_name="$1"
  local ca_cert="$2"
  local affiliation="$3"

  fabric-ca-client affiliation add "${affiliation}" \
    --caname "${ca_name}" \
    --tls.certfiles "${ca_cert}" || true
}

register_identity() {
  local ca_name="$1"
  local ca_cert="$2"
  local id_name="$3"
  local id_secret="$4"
  local id_type="$5"
  local affiliation="${6:-}"

  if [ -n "${affiliation}" ]; then
    fabric-ca-client register \
      --caname "${ca_name}" \
      --id.name "${id_name}" \
      --id.secret "${id_secret}" \
      --id.type "${id_type}" \
      --id.affiliation "${affiliation}" \
      --tls.certfiles "${ca_cert}" || true
  else
    fabric-ca-client register \
      --caname "${ca_name}" \
      --id.name "${id_name}" \
      --id.secret "${id_secret}" \
      --id.type "${id_type}" \
      --tls.certfiles "${ca_cert}" || true
  fi
}

enroll_msp() {
  local ca_name="$1"
  local ca_port="$2"
  local ca_cert="$3"
  local id_name="$4"
  local id_secret="$5"
  local msp_dir="$6"

  fabric-ca-client enroll \
    -u "https://${id_name}:${id_secret}@localhost:${ca_port}" \
    --caname "${ca_name}" \
    -M "${msp_dir}" \
    --tls.certfiles "${ca_cert}"
}

enroll_tls() {
  local ca_name="$1"
  local ca_port="$2"
  local ca_cert="$3"
  local id_name="$4"
  local id_secret="$5"
  local tls_dir="$6"
  shift 6
  # Remaining args are CSR hosts (variadic — supports any number of --csr.hosts)
  local host_args=()
  for h in "$@"; do
    host_args+=(--csr.hosts "${h}")
  done

  fabric-ca-client enroll \
    -u "https://${id_name}:${id_secret}@localhost:${ca_port}" \
    --caname "${ca_name}" \
    -M "${tls_dir}" \
    --enrollment.profile tls \
    "${host_args[@]}" \
    --tls.certfiles "${ca_cert}"
}

setup_org_msp_skeleton() {
  local org_dir="$1"
  local ca_cert="$2"
  local ca_port="$3"
  local ca_name="$4"
  local domain="$5"

  mkdir -p "${org_dir}/msp/cacerts"
  cp "${ca_cert}" "${org_dir}/msp/cacerts/localhost-${ca_port}-${ca_name}.pem"
  write_node_ou_config "${org_dir}/msp" "${ca_port}" "${ca_name}"

  mkdir -p "${org_dir}/msp/tlscacerts"
  cp "${ca_cert}" "${org_dir}/msp/tlscacerts/tlsca.${domain}-cert.pem"

  mkdir -p "${org_dir}/tlsca"
  cp "${ca_cert}" "${org_dir}/tlsca/tlsca.${domain}-cert.pem"

  mkdir -p "${org_dir}/ca"
  cp "${ca_cert}" "${org_dir}/ca/ca.${domain}-cert.pem"
}

create_peer_org() {
  local domain="$1"
  local ca_name="$2"
  local ca_port="$3"
  local ca_admin="$4"
  local ca_admin_pw="$5"
  local ca_cert="$6"
  local affiliation="$7"
  local p1_id="$8"
  local p1_pw="$9"
  local p2_id="${10}"
  local p2_pw="${11}"
  local user1_id="${12}"
  local user1_pw="${13}"
  local user2_id="${14}"
  local user2_pw="${15}"
  local admin_id="${16}"
  local admin_pw="${17}"

  echo "Creating peer organization: ${domain}"
  mkdir -p "${ORG_ROOT}/peerOrganizations/${domain}"

  enroll_ca_admin "${ORG_ROOT}/peerOrganizations/${domain}" "${ca_name}" "${ca_port}" "${ca_admin}" "${ca_admin_pw}" "${ca_cert}"
  setup_org_msp_skeleton "${ORG_ROOT}/peerOrganizations/${domain}" "${ca_cert}" "${ca_port}" "${ca_name}" "${domain}"

  register_affiliation "${ca_name}" "${ca_cert}" "${affiliation}"
  register_identity "${ca_name}" "${ca_cert}" "${p1_id}" "${p1_pw}" "peer" "${affiliation}"
  register_identity "${ca_name}" "${ca_cert}" "${p2_id}" "${p2_pw}" "peer" "${affiliation}"
  register_identity "${ca_name}" "${ca_cert}" "${user1_id}" "${user1_pw}" "client" "${affiliation}"
  register_identity "${ca_name}" "${ca_cert}" "${user2_id}" "${user2_pw}" "client" "${affiliation}"
  register_identity "${ca_name}" "${ca_cert}" "${admin_id}" "${admin_pw}" "admin" "${affiliation}"

  local peer1_fqdn="peer1.${domain}"
  local peer2_fqdn="peer2.${domain}"

  enroll_msp "${ca_name}" "${ca_port}" "${ca_cert}" "${p1_id}" "${p1_pw}" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer1_fqdn}/msp"
  cp "${ORG_ROOT}/peerOrganizations/${domain}/msp/config.yaml" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer1_fqdn}/msp/config.yaml"

  enroll_tls "${ca_name}" "${ca_port}" "${ca_cert}" "${p1_id}" "${p1_pw}" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer1_fqdn}/tls" "${peer1_fqdn}" "localhost" "127.0.0.1"
  copy_first_file "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer1_fqdn}/tls/tlscacerts" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer1_fqdn}/tls/ca.crt"
  copy_first_file "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer1_fqdn}/tls/signcerts" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer1_fqdn}/tls/server.crt"
  copy_first_file "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer1_fqdn}/tls/keystore" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer1_fqdn}/tls/server.key"

  enroll_msp "${ca_name}" "${ca_port}" "${ca_cert}" "${p2_id}" "${p2_pw}" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer2_fqdn}/msp"
  cp "${ORG_ROOT}/peerOrganizations/${domain}/msp/config.yaml" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer2_fqdn}/msp/config.yaml"

  enroll_tls "${ca_name}" "${ca_port}" "${ca_cert}" "${p2_id}" "${p2_pw}" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer2_fqdn}/tls" "${peer2_fqdn}" "localhost" "127.0.0.1"
  copy_first_file "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer2_fqdn}/tls/tlscacerts" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer2_fqdn}/tls/ca.crt"
  copy_first_file "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer2_fqdn}/tls/signcerts" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer2_fqdn}/tls/server.crt"
  copy_first_file "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer2_fqdn}/tls/keystore" "${ORG_ROOT}/peerOrganizations/${domain}/peers/${peer2_fqdn}/tls/server.key"
  
# Enroll users (client identities)
  enroll_msp "${ca_name}" "${ca_port}" "${ca_cert}" "${user1_id}" "${user1_pw}" "${ORG_ROOT}/peerOrganizations/${domain}/users/User1@${domain}/msp"
  cp "${ORG_ROOT}/peerOrganizations/${domain}/msp/config.yaml" "${ORG_ROOT}/peerOrganizations/${domain}/users/User1@${domain}/msp/config.yaml"

  enroll_msp "${ca_name}" "${ca_port}" "${ca_cert}" "${user2_id}" "${user2_pw}" "${ORG_ROOT}/peerOrganizations/${domain}/users/User2@${domain}/msp"
  cp "${ORG_ROOT}/peerOrganizations/${domain}/msp/config.yaml" "${ORG_ROOT}/peerOrganizations/${domain}/users/User2@${domain}/msp/config.yaml"

  enroll_msp "${ca_name}" "${ca_port}" "${ca_cert}" "${admin_id}" "${admin_pw}" "${ORG_ROOT}/peerOrganizations/${domain}/users/Admin@${domain}/msp"
  cp "${ORG_ROOT}/peerOrganizations/${domain}/msp/config.yaml" "${ORG_ROOT}/peerOrganizations/${domain}/users/Admin@${domain}/msp/config.yaml"
}

create_orderer_org() {
  local domain="$1"
  local ca_name="$2"
  local ca_port="$3"
  local ca_admin="$4"
  local ca_admin_pw="$5"
  local ca_cert="$6"

  echo "Creating orderer organization: ${domain}"
  mkdir -p "${ORG_ROOT}/ordererOrganizations/${domain}"

  enroll_ca_admin "${ORG_ROOT}/ordererOrganizations/${domain}" "${ca_name}" "${ca_port}" "${ca_admin}" "${ca_admin_pw}" "${ca_cert}"
  setup_org_msp_skeleton "${ORG_ROOT}/ordererOrganizations/${domain}" "${ca_cert}" "${ca_port}" "${ca_name}" "${domain}"

  # (Optional) keep affiliation but DO NOT assign it to identities
  register_affiliation "${ca_name}" "${ca_cert}" "ordererOrg"

  register_identity "${ca_name}" "${ca_cert}" "orderer1" "orderer1pw" "orderer"
  register_identity "${ca_name}" "${ca_cert}" "orderer2" "orderer2pw" "orderer"
  register_identity "${ca_name}" "${ca_cert}" "orderer3" "orderer3pw" "orderer"

  register_identity "${ca_name}" "${ca_cert}" "ordereradmin" "ordereradminpw" "admin"

  for idx in 1 2 3; do
    local orderer_fqdn="orderer${idx}.${domain}"

    enroll_msp "${ca_name}" "${ca_port}" "${ca_cert}" "orderer${idx}" "orderer${idx}pw" "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/msp"
    cp "${ORG_ROOT}/ordererOrganizations/${domain}/msp/config.yaml" "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/msp/config.yaml"

    enroll_tls "${ca_name}" "${ca_port}" "${ca_cert}" "orderer${idx}" "orderer${idx}pw" "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/tls" "${orderer_fqdn}" "localhost" "127.0.0.1"
    copy_first_file "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/tls/tlscacerts" "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/tls/ca.crt"
    copy_first_file "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/tls/signcerts" "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/tls/server.crt"
    copy_first_file "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/tls/keystore" "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/tls/server.key"

    mkdir -p "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/msp/tlscacerts"
    cp "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/tls/ca.crt" "${ORG_ROOT}/ordererOrganizations/${domain}/orderers/${orderer_fqdn}/msp/tlscacerts/tlsca.${domain}-cert.pem"
  done

  enroll_msp "${ca_name}" "${ca_port}" "${ca_cert}" "ordereradmin" "ordereradminpw" "${ORG_ROOT}/ordererOrganizations/${domain}/users/Admin@${domain}/msp"
  cp "${ORG_ROOT}/ordererOrganizations/${domain}/msp/config.yaml" "${ORG_ROOT}/ordererOrganizations/${domain}/users/Admin@${domain}/msp/config.yaml"

  enroll_tls "${ca_name}" "${ca_port}" "${ca_cert}" "ordereradmin" "ordereradminpw" "${ORG_ROOT}/ordererOrganizations/${domain}/users/Admin@${domain}/tls" "${domain}" "localhost" "127.0.0.1"
  copy_first_file "${ORG_ROOT}/ordererOrganizations/${domain}/users/Admin@${domain}/tls/signcerts" "${ORG_ROOT}/ordererOrganizations/${domain}/users/Admin@${domain}/tls/client.crt"
  copy_first_file "${ORG_ROOT}/ordererOrganizations/${domain}/users/Admin@${domain}/tls/keystore" "${ORG_ROOT}/ordererOrganizations/${domain}/users/Admin@${domain}/tls/client.key"
  copy_first_file "${ORG_ROOT}/ordererOrganizations/${domain}/users/Admin@${domain}/tls/tlscacerts" "${ORG_ROOT}/ordererOrganizations/${domain}/users/Admin@${domain}/tls/ca.crt"
}

main() {
  require_bin fabric-ca-client

  mkdir -p "${ORG_ROOT}/peerOrganizations"
  mkdir -p "${ORG_ROOT}/ordererOrganizations"

  create_peer_org \
    "${HR_DOMAIN}" \
    "${CA_HR_NAME}" \
    "${CA_HR_PORT}" \
    "${CA_HR_ADMIN}" \
    "${CA_HR_ADMIN_PW}" \
    "${ORG_ROOT}/fabric-ca/ca-hr/ca-cert.pem" \
    "hr" \
    "hrpeer1" "hrpeer1pw" \
    "hrpeer2" "hrpeer2pw" \
    "hruser1" "hruser1pw" \
    "hruser2" "hruser2pw" \
    "hradmin" "hradminpw"

  create_peer_org \
    "${DIRECTOR_DOMAIN}" \
    "${CA_DIRECTOR_NAME}" \
    "${CA_DIRECTOR_PORT}" \
    "${CA_DIRECTOR_ADMIN}" \
    "${CA_DIRECTOR_ADMIN_PW}" \
    "${ORG_ROOT}/fabric-ca/ca-director/ca-cert.pem" \
    "director" \
    "directorpeer1" "directorpeer1pw" \
    "directorpeer2" "directorpeer2pw" \
    "directoruser1" "directoruser1pw" \
    "directoruser2" "directoruser2pw" \
    "directoradmin" "directoradminpw"

  create_orderer_org \
    "${ORDERER_DOMAIN}" \
    "${CA_ORDERER_NAME}" \
    "${CA_ORDERER_PORT}" \
    "${CA_ORDERER_ADMIN}" \
    "${CA_ORDERER_ADMIN_PW}" \
    "${ORG_ROOT}/fabric-ca/ca-orderer/ca-cert.pem"

  echo "CA registration and enrollment completed successfully."
}

main "$@"
