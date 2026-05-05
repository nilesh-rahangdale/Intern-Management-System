package com.niyora.Cert_Gen_Backend.DTOs.certificate;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateResponseDTO {
    private String certificateId;
    private String certificateType;
    private boolean isUploaded;
    private LocalDate issueDate;
    private String issuedBy;
    private String status;
    private String pdfPath;
    private String internId;
    private String internName;
    private String metadataHashSha256;
    private QRMetadataDTO qrMetadata;
    private DigitalSignatureDTO digitalSignature;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QRMetadataDTO {
        private Long id;
        private String verificationUrl;
        private String qrPayloadHash;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DigitalSignatureDTO {
        private Long id;
        private String signerName;
        private String signerRole;
        private String signatureAlgorithm;
        private String certificateChainPath;
        private LocalDateTime signedAt;
    }
}
