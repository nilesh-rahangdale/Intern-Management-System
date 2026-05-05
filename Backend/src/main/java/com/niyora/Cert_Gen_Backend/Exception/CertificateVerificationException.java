package com.niyora.Cert_Gen_Backend.Exception;

public class CertificateVerificationException extends RuntimeException {
    
    public CertificateVerificationException(String message) {
        super(message);
    }
    
    public CertificateVerificationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static CertificateVerificationException invalidSignature(String certificateId) {
        return new CertificateVerificationException(
                String.format("Certificate '%s' has an invalid signature", certificateId)
        );
    }
    
    public static CertificateVerificationException tampered(String certificateId) {
        return new CertificateVerificationException(
                String.format("Certificate '%s' has been tampered with", certificateId)
        );
    }
}
