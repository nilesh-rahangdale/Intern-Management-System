package com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BLockchainCertHistoryDto {
    private String txId;
    private String timestamp;
    private BlockchainCertDto value;
    private Boolean isDelete;
}