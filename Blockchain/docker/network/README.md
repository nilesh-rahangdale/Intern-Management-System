# Peer and Orderer Infrastructure (Step 2)

This folder contains the Docker Compose setup for peers, orderers, and per-peer CouchDB instances.

## What is included
- 4 peers (2 HR, 2 Director)
- 3 orderers (Raft)
- 4 CouchDB instances (one per peer)
- TLS enabled for all nodes
- Channel participation enabled for orderers

## Prerequisites
- Complete Step 1 (CA setup + enrollments)
- Ensure organizations folder contains MSP/TLS material

## Start the network
From repo root:

```bash
docker compose -f docker/network/docker-compose-net.yaml --env-file docker/network/.env up -d
```

## CouchDB ports
- HR peer1: 5984
- HR peer2: 6984
- Director peer1: 7984
- Director peer2: 8984

## Next Step
Create the channel artifacts and join peers/orderers.
