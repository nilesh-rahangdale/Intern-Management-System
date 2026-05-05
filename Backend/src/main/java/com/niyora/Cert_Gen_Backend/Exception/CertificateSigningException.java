package com.niyora.Cert_Gen_Backend.Exception;

public class CertificateSigningException extends RuntimeException {
    
    public CertificateSigningException(String message) {
        super(message);
    }
    
    public CertificateSigningException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static CertificateSigningException forCertificate(String certificateId, Throwable cause) {
        return new CertificateSigningException(
                String.format("Failed to sign certificate '%s'", certificateId), 
                cause
        );
    }
}
