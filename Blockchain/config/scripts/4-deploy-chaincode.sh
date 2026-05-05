#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
export FABRIC_CFG_PATH="${ROOT_DIR}/peercfg"

CHANNEL_NAME="${CHANNEL_NAME:-certportal-channel}"
CC_NAME="${CC_NAME:-certificatecc}"
CC_VERSION="${CC_VERSION:-1.0}"
CC_SEQUENCE="${CC_SEQUENCE:-1}"
CC_LANG="${CC_LANG:-golang}"
CC_SRC_PATH="${CC_SRC_PATH:-${ROOT_DIR}/chaincode}"
CC_ENDORSEMENT_POLICY="${CC_ENDORSEMENT_POLICY:-AND('HRMSP.peer','DirectorMSP.peer')}"

CC_LABEL="${CC_NAME}_${CC_VERSION}"
ARTIFACTS_DIR="${ROOT_DIR}/config/channel-artifacts"
CC_PACKAGE_FILE="${ARTIFACTS_DIR}/${CC_LABEL}.tar.gz"

ORG_ROOT="${ROOT_DIR}/organizations"
ORDERER_CA="${ORG_ROOT}/ordererOrganizations/orderer.certportal.com/orderers/orderer1.orderer.certportal.com/tls/ca.crt"
ORDERER_ADDR="localhost:7050"
ORDERER_HOST_OVERRIDE="orderer1.orderer.certportal.com"

HR_PEER1_TLS_CA="${ORG_ROOT}/peerOrganizations/hr.certportal.com/peers/peer1.hr.certportal.com/tls/ca.crt"
HR_PEER2_TLS_CA="${ORG_ROOT}/peerOrganizations/hr.certportal.com/peers/peer2.hr.certportal.com/tls/ca.crt"
DIRECTOR_PEER1_TLS_CA="${ORG_ROOT}/peerOrganizations/director.certportal.com/peers/peer1.director.certportal.com/tls/ca.crt"
DIRECTOR_PEER2_TLS_CA="${ORG_ROOT}/peerOrganizations/director.certportal.com/peers/peer2.director.certportal.com/tls/ca.crt"

require_bin() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "ERROR: '$1' not found in PATH"
    exit 1
  }
}

check_file() {
  [ -f "$1" ] || {
    echo "ERROR: required file not found: $1"
    exit 1
  }
}

set_globals() {
  local org="$1"
  local peer_index="$2"

  if [ "${org}" = "hr" ]; then
    export CORE_PEER_LOCALMSPID="HRMSP"
    export CORE_PEER_MSPCONFIGPATH="${ORG_ROOT}/peerOrganizations/hr.certportal.com/users/Admin@hr.certportal.com/msp"

    if [ "${peer_index}" = "1" ]; then
      export CORE_PEER_ADDRESS="localhost:7051"
      export CORE_PEER_TLS_ROOTCERT_FILE="${HR_PEER1_TLS_CA}"
    else
      export CORE_PEER_ADDRESS="localhost:8051"
      export CORE_PEER_TLS_ROOTCERT_FILE="${HR_PEER2_TLS_CA}"
    fi

  elif [ "${org}" = "director" ]; then
    export CORE_PEER_LOCALMSPID="DirectorMSP"
    export CORE_PEER_MSPCONFIGPATH="${ORG_ROOT}/peerOrganizations/director.certportal.com/users/Admin@director.certportal.com/msp"

    if [ "${peer_index}" = "1" ]; then
      export CORE_PEER_ADDRESS="localhost:9051"
      export CORE_PEER_TLS_ROOTCERT_FILE="${DIRECTOR_PEER1_TLS_CA}"
    else
      export CORE_PEER_ADDRESS="localhost:10051"
      export CORE_PEER_TLS_ROOTCERT_FILE="${DIRECTOR_PEER2_TLS_CA}"
    fi
  else
    echo "ERROR: unknown org '${org}'"
    exit 1
  fi

  export CORE_PEER_TLS_ENABLED=true
}

install_on_peer() {
  local org="$1"
  local peer_index="$2"
  set_globals "${org}" "${peer_index}"

  echo "Installing on ${CORE_PEER_LOCALMSPID} peer${peer_index} (${CORE_PEER_ADDRESS})"

  if peer lifecycle chaincode queryinstalled | grep -q "${CC_LABEL}"; then
    echo "Already installed on ${CORE_PEER_ADDRESS}, skipping..."
  else
    peer lifecycle chaincode install "${CC_PACKAGE_FILE}"
  fi
}

approve_for_org() {
  local org="$1"
  set_globals "${org}" "1"

  echo "Approving for ${CORE_PEER_LOCALMSPID}"

  peer lifecycle chaincode approveformyorg \
    -o "${ORDERER_ADDR}" \
    --ordererTLSHostnameOverride "${ORDERER_HOST_OVERRIDE}" \
    --tls \
    --cafile "${ORDERER_CA}" \
    --channelID "${CHANNEL_NAME}" \
    --name "${CC_NAME}" \
    --version "${CC_VERSION}" \
    --package-id "${PACKAGE_ID}" \
    --sequence "${CC_SEQUENCE}" \
    --signature-policy "${CC_ENDORSEMENT_POLICY}"
}

mkdir -p "${ARTIFACTS_DIR}"

require_bin peer
require_bin jq
check_file "${ORDERER_CA}"
check_file "${HR_PEER1_TLS_CA}"
check_file "${HR_PEER2_TLS_CA}"
check_file "${DIRECTOR_PEER1_TLS_CA}"
check_file "${DIRECTOR_PEER2_TLS_CA}"

if [ ! -d "${CC_SRC_PATH}" ]; then
  echo "ERROR: chaincode source path does not exist: ${CC_SRC_PATH}"
  exit 1
fi

echo "[1/7] Packaging chaincode"
rm -f "${CC_PACKAGE_FILE}"
peer lifecycle chaincode package "${CC_PACKAGE_FILE}" \
  --path "${CC_SRC_PATH}" \
  --lang "${CC_LANG}" \
  --label "${CC_LABEL}"

echo "[2/7] Installing chaincode on all peers"
install_on_peer hr 1
install_on_peer hr 2
install_on_peer director 1
install_on_peer director 2

echo "[3/7] Getting PACKAGE_ID"
set_globals hr 1
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r \
  ".installed_chaincodes[] | select(.label==\"${CC_LABEL}\") | .package_id")

if [ -z "${PACKAGE_ID}" ]; then
  echo "ERROR: package ID not found"
  exit 1
fi

echo "Package ID: ${PACKAGE_ID}"

echo "[4/7] Approving for HR"
approve_for_org hr

echo "[5/7] Approving for Director"
approve_for_org director

echo "[6/7] Checking commit readiness"
set_globals hr 1
peer lifecycle chaincode checkcommitreadiness \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}" \
  --version "${CC_VERSION}" \
  --sequence "${CC_SEQUENCE}" \
  --signature-policy "${CC_ENDORSEMENT_POLICY}" \
  --output json

echo "[7/7] Committing chaincode definition"
peer lifecycle chaincode commit \
  -o "${ORDERER_ADDR}" \
  --ordererTLSHostnameOverride "${ORDERER_HOST_OVERRIDE}" \
  --tls \
  --cafile "${ORDERER_CA}" \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}" \
  --version "${CC_VERSION}" \
  --sequence "${CC_SEQUENCE}" \
  --signature-policy "${CC_ENDORSEMENT_POLICY}" \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${HR_PEER1_TLS_CA}" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${DIRECTOR_PEER1_TLS_CA}" \
  --peerAddresses localhost:8051 \
  --tlsRootCertFiles "${HR_PEER2_TLS_CA}" \
  --peerAddresses localhost:10051 \
  --tlsRootCertFiles "${DIRECTOR_PEER2_TLS_CA}"

echo "Query committed definition"
peer lifecycle chaincode querycommitted \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}"

echo "Chaincode deployment completed successfully."