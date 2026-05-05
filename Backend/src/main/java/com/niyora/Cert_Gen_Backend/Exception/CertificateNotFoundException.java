package com.niyora.Cert_Gen_Backend.Exception;

public class CertificateNotFoundException extends RuntimeException {
    
    public CertificateNotFoundException(String message) {
        super(message);
    }
    
    public CertificateNotFoundException(String certificateId, String reason) {
        super(String.format("Certificate with ID '%s' not found: %s", certificateId, reason));
    }
    
    public static CertificateNotFoundException byCertificateId(String certificateId) {
        return new CertificateNotFoundException(certificateId, "No certificate exists with this ID");
    }
    
    public static CertificateNotFoundException byInternId(String internId) {
        return new CertificateNotFoundException(
                String.format("No certificate found for intern with ID '%s'", internId)
        );
    }
}
