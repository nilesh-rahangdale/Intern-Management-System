package com.niyora.Cert_Gen_Backend.DTOs.certificate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateSigningResponse {
    
    private String certificateId;
    private String status;
    private SignerDetails signerDetails;
    private LocalDateTime signedAt;
    private String signedPdfPath;
    private boolean verificationEnabled;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignerDetails {
        private String signerName;
        private String signerRole;
        private String signatureAlgorithm;
    }
}
