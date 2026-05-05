#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "${ROOT_DIR}"

echo "[1/8] Starting CA stack..."
docker compose -f docker/ca/docker-compose-ca.yaml up -d
sleep 2  # Wait for CA servers to start

echo "[2/8] Running CA register/enroll script..."
bash docker/ca/scripts/registerEnroll.sh
sleep 2


echo "[3/8] Granting permissions to organizations folder..."
sudo chmod -R 777 organizations/
sleep 1

echo "[4/8] Starting peer/orderer network stack..."
docker compose -f docker/network/docker-compose-net.yaml up -d
sleep 2  # Wait for orderers and peers to start

echo "[5/8] Generating channel artifacts..."
bash config/scripts/1-generate-artifacts.sh
sleep 2

echo "[6/8] Joining orderers and peers to channel..."
bash config/scripts/2-join-channel.sh
sleep 2

echo "[7/8] Setting anchor peers..."
bash config/scripts/3-set-anchor-peers.sh
sleep 2

echo "[8/8] Deploying chaincode..."
bash  config/scripts/4-deploy-chaincode.sh
sleep 2

echo "Granting permissions to organizations folder..."
sudo chmod -R 777 organizations/
sleep 1

echo "Done. Network is up and channel setup is complete."
