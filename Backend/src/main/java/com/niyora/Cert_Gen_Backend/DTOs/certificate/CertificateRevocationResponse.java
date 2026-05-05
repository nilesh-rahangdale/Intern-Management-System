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
public class CertificateRevocationResponse {

    private String certificateId;
    private String internId;
    private String internName;
    private String status;
    private String revocationReason;

}
