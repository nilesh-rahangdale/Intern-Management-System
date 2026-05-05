package contracts

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type Certificate struct {
	CertificateID string `json:"certificateId"`
	InternID      string `json:"internId"`
	InternName    string `json:"internName"`
	Hash          string `json:"hash"`
	IssuedBy      string `json:"issuedBy"`
	ApprovedBy    string `json:"approvedBy"`
	IssueDate     string `json:"issueDate"`
	Status        string `json:"status"`
	TxId          string `json:"txId"` 
}

type HistoryRecord struct {
	TxId      string      `json:"txId"`
	Timestamp string      `json:"timestamp"`
	Value     Certificate `json:"value"`
	IsDelete  bool        `json:"isDelete"`
}

type CertificateWithTxID struct {
	Certificate Certificate `json:"certificate"`
	TxId        string      `json:"txId"`
}

// ================= EXIST =================

func (s *SmartContract) CertificateExists(ctx contractapi.TransactionContextInterface,
	certificateID string) (bool, error) {

	data, err := ctx.GetStub().GetState(certificateID)
	if err != nil {
		return false, err
	}
	return data != nil, nil
}

// ================= CREATE =================

func (s *SmartContract) CreateCertificate(ctx contractapi.TransactionContextInterface,
	certificateID, internID, internName, hash, issuedBy, approvedBy, issueDate string) (*Certificate, error) {

	if certificateID == "" || hash == "" || internID == "" || internName == "" || issuedBy == "" || approvedBy == "" {
		return nil, fmt.Errorf("required fields are missing")
	}

	exists, err := s.CertificateExists(ctx, certificateID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("certificate already exists")
	}

	txId := ctx.GetStub().GetTxID()

	cert := Certificate{
		CertificateID: certificateID,
		InternID:      internID,
		InternName:    internName,
		Hash:          hash,
		IssuedBy:      issuedBy,
		ApprovedBy:    approvedBy,
		IssueDate:     issueDate,
		Status:        "SIGNED",
		TxId:          txId, 
	}

	certJSON, err := json.Marshal(cert)
	if err != nil {
		return nil, err
	}

	if err := ctx.GetStub().PutState(certificateID, certJSON); err != nil {
		return nil, err
	}

	return &cert, nil
}

// ================= GET =================

func (s *SmartContract) GetCertificate(ctx contractapi.TransactionContextInterface,
	certificateID string) (*Certificate, error) {

	data, err := ctx.GetStub().GetState(certificateID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state")
	}
	if data == nil {
		return nil, fmt.Errorf("certificate not found")
	}

	var cert Certificate
	if err := json.Unmarshal(data, &cert); err != nil {
		return nil, err
	}

	return &cert, nil
}

// ================= GET ALL =================

func (s *SmartContract) GetAllCertificates(ctx contractapi.TransactionContextInterface) ([]Certificate, error) {

	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get world state: %v", err)
	}
	defer resultsIterator.Close()

	var certificates []Certificate

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		// skip empty values (safety)
		if queryResponse.Value == nil {
			continue
		}

		var cert Certificate
		if err := json.Unmarshal(queryResponse.Value, &cert); err != nil {
			return nil, err
		}

		certificates = append(certificates, cert)
	}

	return certificates, nil
}


func (s *SmartContract) GetCertificateWithTxID(ctx contractapi.TransactionContextInterface,
	certificateID string) (*CertificateWithTxID, error) {

	data, err := ctx.GetStub().GetState(certificateID)
	if err != nil {
		return nil, fmt.Errorf("failed to read world state: %v", err)
	}
	if data == nil {
		return nil, fmt.Errorf("certificate not found")
	}

	var cert Certificate
	if err := json.Unmarshal(data, &cert); err != nil {
		return nil, err
	}

	// Get TxId from history
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(certificateID)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var latestTxId string

	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		latestTxId = response.TxId
	}

	// fallback (edge case)
	if latestTxId == "" {
		latestTxId = ctx.GetStub().GetTxID()
	}

	return &CertificateWithTxID{
		Certificate: cert,
		TxId:        latestTxId,
	}, nil
}

// ================= REVOKE =================

func (s *SmartContract) RevokeCertificate(ctx contractapi.TransactionContextInterface,
	certificateID string) (*Certificate, error) {

	data, err := ctx.GetStub().GetState(certificateID)
	if err != nil {
		return nil, fmt.Errorf("failed to read world state")
	}
	if data == nil {
		return nil, fmt.Errorf("certificate not found")
	}

	var cert Certificate
	if err := json.Unmarshal(data, &cert); err != nil {
		return nil, err
	}

	if cert.Status == "REVOKED" {
		return nil, fmt.Errorf("certificate already revoked")
	}

	cert.Status = "REVOKED"
	cert.TxId = ctx.GetStub().GetTxID() 

	updatedJSON, err := json.Marshal(cert)
	if err != nil {
		return nil, err
	}

	if err := ctx.GetStub().PutState(certificateID, updatedJSON); err != nil {
		return nil, err
	}

	return &cert, nil
}

// ================= HISTORY =================

func (s *SmartContract) GetCertificateHistory(ctx contractapi.TransactionContextInterface,
	certificateID string) ([]HistoryRecord, error) {

	clientMSP, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, err
	}

	if clientMSP != "HRMSP" {
		return nil, fmt.Errorf("only HR can access certificate history")
	}

	exists, err := s.CertificateExists(ctx, certificateID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, fmt.Errorf("certificate does not exist")
	}

	resultsIterator, err := ctx.GetStub().GetHistoryForKey(certificateID)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var records []HistoryRecord

	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var cert Certificate
		if response.Value != nil {
			if err := json.Unmarshal(response.Value, &cert); err != nil {
				return nil, err
			}
		}

		timestamp := ""
		if response.Timestamp != nil {
			timestamp = time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String()
		}

		record := HistoryRecord{
			TxId:      response.TxId,
			Timestamp: timestamp,
			Value:     cert,
			IsDelete:  response.IsDelete,
		}

		records = append(records, record)
	}

	return records, nil
}