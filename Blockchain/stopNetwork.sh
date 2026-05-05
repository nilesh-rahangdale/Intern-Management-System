#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "${ROOT_DIR}"

echo "[1/4] Stopping peer/orderer stack..."
docker compose -f docker/network/docker-compose-net.yaml down || true

echo "[2/4] Stopping CA stack..."
docker compose -f docker/ca/docker-compose-ca.yaml down || true

echo "[3/4] Clearing organizations folder..."
rm -rf organizations
mkdir -p organizations

echo "[4/4] Cleaning channel artifacts..."
rm -rf config/channel-artifacts/*

echo "[4/4] Teardown complete."
