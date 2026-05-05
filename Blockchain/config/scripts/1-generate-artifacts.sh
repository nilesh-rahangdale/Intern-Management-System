#!/usr/bin/env bash
# =============================================================================
# Script 1: Generate Channel Artifacts
# Generates:
#   - certportal-channel.block  (genesis / channel block)
# Run from project root: bash config/scripts/1-generate-artifacts.sh
# =============================================================================

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
ARTIFACTS_DIR="${ROOT_DIR}/config/channel-artifacts"
CHANNEL_NAME="certportal-channel"

export FABRIC_CFG_PATH="${ROOT_DIR}/config"

# ── Preflight checks ──────────────────────────────────────────────────────────
command -v configtxgen >/dev/null 2>&1 || {
  echo "ERROR: 'configtxgen' not found in PATH."
  echo "   Add Fabric binaries to PATH: export PATH=\$PATH:/path/to/fabric/bin"
  exit 1
}

if [ ! -f "${ROOT_DIR}/config/configtx.yaml" ]; then
  echo "ERROR: configtx.yaml not found at ${ROOT_DIR}/config/configtx.yaml"
  exit 1
fi

# Verify all orderer TLS certs referenced in configtx.yaml exist
for idx in 1 2 3; do
  cert="${ROOT_DIR}/organizations/ordererOrganizations/orderer.certportal.com/orderers/orderer${idx}.orderer.certportal.com/tls/server.crt"
  if [ ! -f "${cert}" ]; then
    echo "ERROR: Orderer${idx} TLS cert not found: ${cert}"
    echo "   Run registerEnroll.sh first."
    exit 1
  fi
done

mkdir -p "${ARTIFACTS_DIR}"

# ── Step 1: Genesis block ──────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════"
echo " Generating genesis block → ${CHANNEL_NAME}.block"
echo "══════════════════════════════════════════════"

configtxgen \
  -profile CertPortalChannel \
  -channelID "${CHANNEL_NAME}" \
  -outputBlock "${ARTIFACTS_DIR}/${CHANNEL_NAME}.block"

echo "Genesis block: ${ARTIFACTS_DIR}/${CHANNEL_NAME}.block"
echo "   Size: $(du -sh "${ARTIFACTS_DIR}/${CHANNEL_NAME}.block" | cut -f1)"


ls -lh "${ARTIFACTS_DIR}"
echo ""
echo " Next: bash config/scripts/2-join-channel.sh"
echo "══════════════════════════════════════════════"
