package com.niyora.Cert_Gen_Backend.DTOs.certificate;


import lombok.Data;

import java.security.cert.X509Certificate;

@Data
public class PdfVerificationResult {

    private boolean valid;
    private String message;
    private X509Certificate signerCertificate;

    private PdfVerificationResult(boolean valid, String message, X509Certificate cert) {
        this.valid = valid;
        this.message = message;
        this.signerCertificate = cert;
    }

    public static PdfVerificationResult valid(X509Certificate cert) {
        return new PdfVerificationResult(true, "Signature valid", cert);
    }

    public static PdfVerificationResult invalid(String message) {
        return new PdfVerificationResult(false, message, null);
    }


}
