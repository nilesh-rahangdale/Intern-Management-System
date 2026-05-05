package com.niyora.Cert_Gen_Backend.DTOs.certificate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateGenerationResponse {
    
    private String certificateId;
    private String certificateType;
    private String internId;
    private String internName;
    private LocalDate issueDate;
    private String issuedBy;
    private String status;
    private String pdfPath;
    private String verificationUrl;
    private boolean qrEmbedded;
    private boolean signed;
}
