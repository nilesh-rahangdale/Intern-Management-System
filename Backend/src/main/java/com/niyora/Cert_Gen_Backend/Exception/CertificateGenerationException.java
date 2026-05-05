package com.niyora.Cert_Gen_Backend.Exception;

public class CertificateGenerationException extends RuntimeException {
    
    public CertificateGenerationException(String message) {
        super(message);
    }
    
    public CertificateGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static CertificateGenerationException forIntern(String internId, Throwable cause) {
        return new CertificateGenerationException(
                String.format("Failed to generate certificate for intern '%s'", internId), 
                cause
        );
    }
}
