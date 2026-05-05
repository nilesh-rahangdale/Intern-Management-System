package com.niyora.Cert_Gen_Backend.DTOs.certificate;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CertificatePdfData {
    private String certificateId;
    private String internName;
    private String internId;
    private String internshipTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate issueDate;
    private String directorName;
    private byte[] qrCodeImage;
}

