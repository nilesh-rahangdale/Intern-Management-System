package main

import (
	"log"

	"certportal/contracts"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	chaincode, err := contractapi.NewChaincode(&contracts.SmartContract{})
	if err != nil {
		log.Panicf("Could not create chaincode : %v", err)
	}

	if err := chaincode.Start(); err != nil {
		log.Panicf("Failed to start chaincode : %v", err)
	}
}
