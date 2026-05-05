# Channel Configuration (Step 3)

This folder contains the channel configuration and scripts for certportal-channel.

## Files
- [configtx.yaml](configtx.yaml): Channel and orderer profile definitions
- [channel-artifacts](channel-artifacts/): Generated blocks and config updates
- [scripts](scripts/): Helper scripts for channel setup

## Generate channel artifacts
From repo root:

```bash
bash config/scripts/generate-channel-artifacts.sh
```

## Join orderers and peers

```bash
bash config/scripts/join-channel.sh
```

## Update anchor peers

```bash
bash config/scripts/set-anchor-peers.sh
```

## Notes
- Uses local Fabric binaries (`configtxgen`, `peer`, `osnadmin`) installed on the host.
- Channel participation mode uses the config block (no system channel, no create-channel tx).
- Do not run inside Docker.
