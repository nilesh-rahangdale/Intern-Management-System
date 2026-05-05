package com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BlockchainCertDto {
    private String certificateId;
    private String internId;
    private String internName;
    private String hash;
    private String issuedBy;
    private String approvedBy;
    private String issueDate;
    private Certificate.Status status;
    private String txId;
}