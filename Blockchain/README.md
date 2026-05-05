# Blockchain-Enabled Secure Intern and Digital Certificate Management System

Hyperledger Fabric network for intern certificate workflow, with two application orgs and one orderer org.

## Network Topology

- Channel: `certportal-channel`
- Org 1: HR (`HRMSP`)
- Org 2: Director (`DirectorMSP`)
- Orderer org: `OrdererMSP`
- Consensus: Raft (3 orderers)
- State DB: CouchDB (one instance per peer)
- TLS: enabled for CA, peers, and orderers

## Project Structure

- `docker/ca/`
  - `docker-compose-ca.yaml`
  - `scripts/registerEnroll.sh`
- `docker/network/`
  - `docker-compose-net.yaml`
- `config/`
  - `configtx.yaml`
  - `scripts/1-generate-artifacts.sh`
  - `scripts/2-join-channel.sh`
  - `scripts/3-set-anchor-peers.sh`
  - `scripts/4-deploy-chaincode.sh`
  - `channel-artifacts/`
- `chaincode/`
- `startNetwork.sh`
- `stopNetwork.sh`

## Prerequisites

Install and keep in PATH:

- `docker`, `docker compose`
- `peer`, `osnadmin`, `configtxgen`, `configtxlator`
- `jq`, `openssl`
- Go toolchain (for Go chaincode)

## Start and Stop

From project root:

```bash
./startNetwork.sh
```

This does:

1. Start CA stack
2. Run `registerEnroll.sh`
3. Start peer/orderer stack
4. Generate channel block
5. Join orderers/peers
6. Set anchor peers

To stop and clean:

```bash
./stopNetwork.sh
```

## Manual Script Flow (if needed)

From project root:

```bash
# 1) Start CAs
docker compose -f docker/ca/docker-compose-ca.yaml up -d

# 2) Register/enroll identities
bash docker/ca/scripts/registerEnroll.sh

# 3) Start peers/orderers
docker compose -f docker/network/docker-compose-net.yaml up -d

# 4) Generate channel block
bash config/scripts/1-generate-artifacts.sh

# 5) Join channel
bash config/scripts/2-join-channel.sh

# 6) Set anchors
bash config/scripts/3-set-anchor-peers.sh
```

## Chaincode Deployment

Current deploy script:

```bash
bash config/scripts/4-deploy-chaincode.sh
```

Default values used by script:

- `CHANNEL_NAME=certportal-channel`
- `CC_NAME=certificatecc`
- `CC_VERSION=1.0`
- `CC_SEQUENCE=1`
- `CC_LANG=golang`
- `CC_SRC_PATH=<repo>/chaincode`
- `CC_ENDORSEMENT_POLICY=AND('HRMSP.peer','DirectorMSP.peer')`

Override example:

```bash
CC_NAME=certificatecc CC_VERSION=1.1 CC_SEQUENCE=2 bash config/scripts/4-deploy-chaincode.sh
```

## Invoke and Query Commands

Run from project root.

### 1) Common variables

```bash
export ROOT=/home/nilesh/DRDO_BLOCKCHAIN_PROJECT
export CHANNEL=certportal-channel
export CC=certificatecc

export ORDERER_CA=$ROOT/organizations/ordererOrganizations/orderer.certportal.com/orderers/orderer1.orderer.certportal.com/tls/ca.crt
export HR_PEER_CA=$ROOT/organizations/peerOrganizations/hr.certportal.com/peers/peer1.hr.certportal.com/tls/ca.crt
export DIRECTOR_PEER_CA=$ROOT/organizations/peerOrganizations/director.certportal.com/peers/peer1.director.certportal.com/tls/ca.crt

export FABRIC_CFG_PATH=$ROOT/peercfg
export CORE_PEER_TLS_ENABLED=true
```

### 2) HR admin context

```bash
export CORE_PEER_LOCALMSPID=HRMSP
export CORE_PEER_MSPCONFIGPATH=$ROOT/organizations/peerOrganizations/hr.certportal.com/users/Admin@hr.certportal.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_TLS_ROOTCERT_FILE=$HR_PEER_CA
```

### 3) Check committed chaincode

```bash
peer lifecycle chaincode querycommitted --channelID $CHANNEL --name $CC
```

### 4) Invoke CreateCertificate

```bash
peer chaincode invoke \
-o localhost:7050 \
--ordererTLSHostnameOverride orderer1.orderer.certportal.com \
--tls --cafile $ORDERER_CA \
-C $CHANNEL -n $CC \
--peerAddresses localhost:7051 --tlsRootCertFiles $HR_PEER_CA \
--peerAddresses localhost:9051 --tlsRootCertFiles $DIRECTOR_PEER_CA \
-c '{"Args":["CreateCertificate","CERT001","INT001","Alice","HASH001","HR","Director","2026-04-13"]}'
```

### 5) Query certificate

```bash
peer chaincode query -C $CHANNEL -n $CC -c '{"Args":["GetCertificate","CERT001"]}'
```

### 6) Director admin context

```bash
export CORE_PEER_LOCALMSPID=DirectorMSP
export CORE_PEER_MSPCONFIGPATH=$ROOT/organizations/peerOrganizations/director.certportal.com/users/Admin@director.certportal.com/msp
export CORE_PEER_ADDRESS=localhost:9051
export CORE_PEER_TLS_ROOTCERT_FILE=$DIRECTOR_PEER_CA
```

### 7) Invoke RevokeCertificate

```bash
peer chaincode invoke \
-o localhost:7050 \
--ordererTLSHostnameOverride orderer1.orderer.certportal.com \
--tls --cafile $ORDERER_CA \
-C $CHANNEL -n $CC \
--peerAddresses localhost:7051 --tlsRootCertFiles $HR_PEER_CA \
--peerAddresses localhost:9051 --tlsRootCertFiles $DIRECTOR_PEER_CA \
-c '{"Args":["RevokeCertificate","CERT001"]}'
```

### 8) Query again

```bash
peer chaincode query -C $CHANNEL -n $CC -c '{"Args":["GetCertificate","CERT001"]}'
```

## Check Blocks

Use these commands to inspect channel blocks.

### 1) Set HR context for block queries

```bash
export ROOT=/home/nilesh/DRDO_BLOCKCHAIN_PROJECT
export CHANNEL=certportal-channel
export FABRIC_CFG_PATH=$ROOT/peercfg

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=HRMSP
export CORE_PEER_MSPCONFIGPATH=$ROOT/organizations/peerOrganizations/hr.certportal.com/users/Admin@hr.certportal.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_TLS_ROOTCERT_FILE=$ROOT/organizations/peerOrganizations/hr.certportal.com/peers/peer1.hr.certportal.com/tls/ca.crt

export ORDERER_CA=$ROOT/organizations/ordererOrganizations/orderer.certportal.com/orderers/orderer1.orderer.certportal.com/tls/ca.crt
```

### 2) Get ledger height

```bash
peer channel getinfo -c $CHANNEL
```

### 3) Fetch latest block

```bash
peer channel fetch newest $ROOT/config/channel-artifacts/latest.block \
  -c $CHANNEL \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer1.orderer.certportal.com \
  --tls --cafile $ORDERER_CA
```

### 4) Fetch a specific block number (example: block 0)

```bash
peer channel fetch 0 $ROOT/config/channel-artifacts/block0.block \
  -c $CHANNEL \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer1.orderer.certportal.com \
  --tls --cafile $ORDERER_CA
```

### 5) Decode fetched block to JSON

```bash
configtxlator proto_decode \
  --input $ROOT/config/channel-artifacts/latest.block \
  --type common.Block \
  --output $ROOT/config/channel-artifacts/latest.json
```

### 6) Print block number and tx count

```bash
jq '.header.number, (.data.data | length)' $ROOT/config/channel-artifacts/latest.json
```
