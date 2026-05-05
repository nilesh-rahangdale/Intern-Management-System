package com.niyora.Cert_Gen_Backend.Exception;

public class InternNotFoundException extends RuntimeException {
    
    public InternNotFoundException(String message) {
        super(message);
    }
    
    public InternNotFoundException(String internId, String reason) {
        super(String.format("Intern with ID '%s' not found: %s", internId, reason));
    }
    
    public static InternNotFoundException byInternId(String internId) {
        return new InternNotFoundException(internId, "No intern exists with this ID");
    }
}
