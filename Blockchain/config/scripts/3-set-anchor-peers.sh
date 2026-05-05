#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
ARTIFACTS_DIR="${ROOT_DIR}/config/channel-artifacts"
CHANNEL_NAME="certportal-channel"

ORG_ROOT="${ROOT_DIR}/organizations"
ORDERER_ORG="${ORG_ROOT}/ordererOrganizations/orderer.certportal.com"
HR_ORG="${ORG_ROOT}/peerOrganizations/hr.certportal.com"
DIRECTOR_ORG="${ORG_ROOT}/peerOrganizations/director.certportal.com"

ORDERER_ADDR="localhost:7050"
ORDERER_HOST_OVERRIDE="orderer1.orderer.certportal.com"
ORDERER_CA="${ORDERER_ORG}/orderers/orderer1.orderer.certportal.com/tls/ca.crt"

export FABRIC_CFG_PATH="${ROOT_DIR}/peercfg"

require_bin() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "ERROR: required binary '$1' not found in PATH"
    exit 1
  }
}

check_file() {
  local path="$1"
  [ -f "${path}" ] || {
    echo "ERROR: required file not found: ${path}"
    exit 1
  }
}

set_anchor_peer() {
  local org_name="$1"
  local msp_id="$2"
  local peer_host="$3"
  local peer_port="$4"
  local peer_addr="$5"
  local admin_msp="$6"
  local peer_tls_ca="$7"
  local prefix="$8"

  local config_block_pb="${ARTIFACTS_DIR}/${prefix}_config_block.pb"
  local config_block_json="${ARTIFACTS_DIR}/${prefix}_config_block.json"
  local config_json="${ARTIFACTS_DIR}/${prefix}_config.json"
  local config_copy_json="${ARTIFACTS_DIR}/${prefix}_config_copy.json"
  local modified_config_json="${ARTIFACTS_DIR}/${prefix}_modified_config.json"
  local config_pb="${ARTIFACTS_DIR}/${prefix}_config.pb"
  local modified_config_pb="${ARTIFACTS_DIR}/${prefix}_modified_config.pb"
  local config_update_pb="${ARTIFACTS_DIR}/${prefix}_config_update.pb"
  local config_update_json="${ARTIFACTS_DIR}/${prefix}_config_update.json"
  local envelope_json="${ARTIFACTS_DIR}/${prefix}_config_update_in_envelope.json"
  local envelope_pb="${ARTIFACTS_DIR}/${prefix}_config_update_in_envelope.pb"
  local compute_err="${ARTIFACTS_DIR}/${prefix}_compute_update.err"

  echo ""
  echo "----------------------------------------------"
  echo "${org_name} anchor peer update"
  echo "----------------------------------------------"

  unset CORE_PEER_LOCALMSPID CORE_PEER_MSPCONFIGPATH CORE_PEER_TLS_ROOTCERT_FILE CORE_PEER_ADDRESS
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="${msp_id}"
  export CORE_PEER_MSPCONFIGPATH="${admin_msp}"
  export CORE_PEER_TLS_ROOTCERT_FILE="${peer_tls_ca}"
  export CORE_PEER_ADDRESS="${peer_addr}"

  check_file "${CORE_PEER_MSPCONFIGPATH}/signcerts/cert.pem"
  echo "Signer certificate subject:"
  openssl x509 -in "${CORE_PEER_MSPCONFIGPATH}/signcerts/cert.pem" -noout -subject

  echo "Fetching latest channel config block..."
  peer channel fetch config "${config_block_pb}" \
    -o "${ORDERER_ADDR}" \
    --ordererTLSHostnameOverride "${ORDERER_HOST_OVERRIDE}" \
    -c "${CHANNEL_NAME}" \
    --tls \
    --cafile "${ORDERER_CA}"

  configtxlator proto_decode --input "${config_block_pb}" --type common.Block --output "${config_block_json}"
  jq '.data.data[0].payload.data.config' "${config_block_json}" > "${config_json}"
  cp "${config_json}" "${config_copy_json}"

  jq ".channel_group.groups.Application.groups.\"${msp_id}\".values += {\"AnchorPeers\":{\"mod_policy\":\"Admins\",\"value\":{\"anchor_peers\":[{\"host\":\"${peer_host}\",\"port\":${peer_port}}]},\"version\":\"0\"}}" \
    "${config_copy_json}" > "${modified_config_json}"

  configtxlator proto_encode --input "${config_json}" --type common.Config --output "${config_pb}"
  configtxlator proto_encode --input "${modified_config_json}" --type common.Config --output "${modified_config_pb}"

  set +e
  configtxlator compute_update \
    --channel_id "${CHANNEL_NAME}" \
    --original "${config_pb}" \
    --updated "${modified_config_pb}" \
    --output "${config_update_pb}" 2>"${compute_err}"
  local rc=$?
  set -e

  if [ ${rc} -ne 0 ]; then
    if grep -qi "no differences detected" "${compute_err}"; then
      echo "Anchor peer already set for ${org_name}. Skipping update submit."
      return 0
    fi
    echo "ERROR: failed to compute config update for ${org_name}"
    cat "${compute_err}"
    return 1
  fi

  configtxlator proto_decode --input "${config_update_pb}" --type common.ConfigUpdate --output "${config_update_json}"
  echo "{\"payload\":{\"header\":{\"channel_header\":{\"channel_id\":\"${CHANNEL_NAME}\",\"type\":2}},\"data\":{\"config_update\":$(cat "${config_update_json}")}}}" \
    | jq . > "${envelope_json}"
  configtxlator proto_encode --input "${envelope_json}" --type common.Envelope --output "${envelope_pb}"

  peer channel update \
    -f "${envelope_pb}" \
    -c "${CHANNEL_NAME}" \
    -o "${ORDERER_ADDR}" \
    --ordererTLSHostnameOverride "${ORDERER_HOST_OVERRIDE}" \
    --tls \
    --cafile "${ORDERER_CA}"

  echo "Anchor peer updated for ${org_name}"
}

mkdir -p "${ARTIFACTS_DIR}"

require_bin peer
require_bin configtxlator
require_bin jq
require_bin openssl

check_file "${ORDERER_CA}"

set_anchor_peer \
  "HR" \
  "HRMSP" \
  "peer1.hr.certportal.com" \
  "7051" \
  "localhost:7051" \
  "${HR_ORG}/users/Admin@hr.certportal.com/msp" \
  "${HR_ORG}/peers/peer1.hr.certportal.com/tls/ca.crt" \
  "hr"

set_anchor_peer \
  "Director" \
  "DirectorMSP" \
  "peer1.director.certportal.com" \
  "9051" \
  "localhost:9051" \
  "${DIRECTOR_ORG}/users/Admin@director.certportal.com/msp" \
  "${DIRECTOR_ORG}/peers/peer1.director.certportal.com/tls/ca.crt" \
  "director"

echo ""
echo "Anchor peer configuration completed successfully."
echo "══════════════════════════════════════════════"