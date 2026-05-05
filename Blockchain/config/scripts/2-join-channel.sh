#!/usr/bin/env bash
# =============================================================================
# Script 2: Join Channel
# Joins all 3 orderers and all 4 peers to certportal-channel.
#
# Order:
#   1. Join orderer1, orderer2, orderer3 via osnadmin
#   2. Join peer1.hr, peer2.hr via peer channel join
#   3. Join peer1.director, peer2.director via peer channel join
#
# Run from project root: bash config/scripts/2-join-channel.sh
# Prerequisites:
#   - Network containers must be running (docker/network)
#   - Channel block must exist (run 1-generate-artifacts.sh first)
# =============================================================================

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
CHANNEL_NAME="certportal-channel"
CHANNEL_BLOCK="${ROOT_DIR}/config/channel-artifacts/${CHANNEL_NAME}.block"

ORG_ROOT="${ROOT_DIR}/organizations"
ORDERER_ORG="${ORG_ROOT}/ordererOrganizations/orderer.certportal.com"
HR_ORG="${ORG_ROOT}/peerOrganizations/hr.certportal.com"
DIRECTOR_ORG="${ORG_ROOT}/peerOrganizations/director.certportal.com"

# ── Preflight checks ──────────────────────────────────────────────────────────
for bin in osnadmin peer; do
  command -v "${bin}" >/dev/null 2>&1 || {
    echo "ERROR: '${bin}' not found in PATH."
    exit 1
  }
done

if [ ! -f "${CHANNEL_BLOCK}" ]; then
  echo "ERROR: Channel block not found: ${CHANNEL_BLOCK}"
  echo "   Run: bash config/scripts/1-generate-artifacts.sh"
  exit 1
fi

echo "   Channel block: ${CHANNEL_BLOCK} ($(du -sh "${CHANNEL_BLOCK}" | cut -f1))"

# ── Shared TLS / Admin certs for osnadmin ─────────────────────────────────────
ORDERER_TLS_CA="${ORDERER_ORG}/orderers/orderer1.orderer.certportal.com/tls/ca.crt"
ORDERER_ADMIN_CERT="${ORDERER_ORG}/users/Admin@orderer.certportal.com/tls/client.crt"
ORDERER_ADMIN_KEY="${ORDERER_ORG}/users/Admin@orderer.certportal.com/tls/client.key"

for f in "${ORDERER_TLS_CA}" "${ORDERER_ADMIN_CERT}" "${ORDERER_ADMIN_KEY}"; do
  [ -f "${f}" ] || { echo "ERROR: Missing file: ${f}"; exit 1; }
done

# ── Function: Join orderer via osnadmin ───────────────────────────────────────
join_orderer() {
  local name="$1"
  local admin_addr="$2"

  echo "  → Joining ${name} at ${admin_addr}..."
  osnadmin channel join \
    --channelID  "${CHANNEL_NAME}" \
    --config-block "${CHANNEL_BLOCK}" \
    --orderer-address "${admin_addr}" \
    --ca-file   "${ORDERER_TLS_CA}" \
    --client-cert "${ORDERER_ADMIN_CERT}" \
    --client-key  "${ORDERER_ADMIN_KEY}"
  echo "  ${name} joined"
}

# ── Function: Join peer via peer channel join ─────────────────────────────────
join_peer() {
  local name="$1"
  local msp_id="$2"
  local peer_addr="$3"
  local admin_msp="$4"
  local tls_ca="$5"

  echo "  → Joining ${name} at ${peer_addr}..."
  CORE_PEER_TLS_ENABLED=true \
  CORE_PEER_LOCALMSPID="${msp_id}" \
  CORE_PEER_MSPCONFIGPATH="${admin_msp}" \
  CORE_PEER_TLS_ROOTCERT_FILE="${tls_ca}" \
  CORE_PEER_ADDRESS="${peer_addr}" \
    peer channel join -b "${CHANNEL_BLOCK}"
  echo "  ${name} joined"
}

# ══════════════════════════════════════════════
# Step 1 — Join Orderers
# ══════════════════════════════════════════════
echo ""
echo "══════════════════════════════════════════════"
echo " Step 1: Joining orderers to ${CHANNEL_NAME}"
echo "══════════════════════════════════════════════"

join_orderer "orderer1" "localhost:7053"
join_orderer "orderer2" "localhost:8053"
join_orderer "orderer3" "localhost:9053"

echo ""
echo "  Waiting 3s for Raft leader election..."
sleep 3

# ══════════════════════════════════════════════
# Step 2 — Join HR Peers
# ══════════════════════════════════════════════
echo ""
echo "══════════════════════════════════════════════"
echo " Step 2: Joining HR peers to ${CHANNEL_NAME}"
echo "══════════════════════════════════════════════"

export FABRIC_CFG_PATH=$PWD/peercfg
HR_ADMIN_MSP="${HR_ORG}/users/Admin@hr.certportal.com/msp"

join_peer "peer1.hr.certportal.com" \
  "HRMSP" \
  "localhost:7051" \
  "${HR_ADMIN_MSP}" \
  "${HR_ORG}/peers/peer1.hr.certportal.com/tls/ca.crt"

join_peer "peer2.hr.certportal.com" \
  "HRMSP" \
  "localhost:8051" \
  "${HR_ADMIN_MSP}" \
  "${HR_ORG}/peers/peer2.hr.certportal.com/tls/ca.crt"

# ══════════════════════════════════════════════
# Step 3 — Join Director Peers
# ══════════════════════════════════════════════
echo ""
echo "══════════════════════════════════════════════"
echo " Step 3: Joining Director peers to ${CHANNEL_NAME}"
echo "══════════════════════════════════════════════"

DIRECTOR_ADMIN_MSP="${DIRECTOR_ORG}/users/Admin@director.certportal.com/msp"

join_peer "peer1.director.certportal.com" \
  "DirectorMSP" \
  "localhost:9051" \
  "${DIRECTOR_ADMIN_MSP}" \
  "${DIRECTOR_ORG}/peers/peer1.director.certportal.com/tls/ca.crt"

join_peer "peer2.director.certportal.com" \
  "DirectorMSP" \
  "localhost:10051" \
  "${DIRECTOR_ADMIN_MSP}" \
  "${DIRECTOR_ORG}/peers/peer2.director.certportal.com/tls/ca.crt"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════"
echo "  All nodes joined channel: ${CHANNEL_NAME}"
echo "    3 orderers | 2 HR peers | 2 Director peers"
echo ""
echo " Next: bash config/scripts/3-set-anchor-peers.sh"
echo "══════════════════════════════════════════════"
