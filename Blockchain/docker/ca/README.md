# Fabric CA Setup (Step 1)

This folder contains the Fabric CA setup for the DRDO Intern Certificate Portal.

## What is included
- 3 Fabric CAs (HR, Director, Orderer)
- TLS enabled for all CAs
- Bootstrap admin credentials
- Register/enroll script for org admins, peers, orderers, and users


## Configuration
Update environment variables in [.env](.env) if needed:
- CA ports
- CA admin credentials
- Org domains
- Operations ports

Default CA credentials (temporary):
- HR CA admin: `admin` / `adminpw`
- Director CA admin: `admin` / `adminpw`
- Orderer CA admin: `admin` / `adminpw`

Registered identities (temporary):
- HR: `hradmin`, `hrpeer1`, `hrpeer2`, `hruser1`, `hruser2`
- Director: `directoradmin`, `directorpeer1`, `directorpeer2`, `directoruser1`, `directoruser2`
- Orderer: `ordereradmin`, `orderer1`, `orderer2`, `orderer3`

## Start the CA servers
From this folder:

```bash
docker compose -f docker-compose-ca.yaml --env-file .env up -d
```

## Register and enroll identities
Once the CA servers are up:

```bash
chmod +x scripts/registerEnroll.sh
./scripts/registerEnroll.sh
```

## Outputs
- CA server data: [organizations/fabric-ca](../../organizations/fabric-ca)
- MSPs: [organizations/peerOrganizations](../../organizations/peerOrganizations) and [organizations/ordererOrganizations](../../organizations/ordererOrganizations)

## Next Step
After CA setup, Configure peers, orderers, and the channel.
