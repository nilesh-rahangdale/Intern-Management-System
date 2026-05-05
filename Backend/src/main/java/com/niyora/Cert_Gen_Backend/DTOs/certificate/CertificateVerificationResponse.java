package com.niyora.Cert_Gen_Backend.DTOs.certificate;

import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateVerificationResponse {

    private boolean valid;
    private String message;
    private String certificateId;
    private String internId;
    private String internName;
    private String issuedBy;
    private LocalDate issuedAt;
//    private String signerName;

    public static CertificateVerificationResponse verified(
            Certificate cert,
            PdfVerificationResult pdf
    ) {
        return new CertificateVerificationResponse(
                true,
                "Certificate is valid",
                cert.getCertificateId(),
                cert.getIntern().getInternId(),
                cert.getIntern().getFullName(),
                "SAG, DRDO",
                cert.getIssueDate()
//                cert.getDigitalSignature().getSignerName()
        );
    }

    public static CertificateVerificationResponse invalid(String msg) {
        return new CertificateVerificationResponse(false, msg   , null, null, null, null, null);
    }
}

