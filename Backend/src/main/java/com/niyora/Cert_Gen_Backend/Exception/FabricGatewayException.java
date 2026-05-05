package com.niyora.Cert_Gen_Backend.Exception;

import lombok.Getter;

/**
 * Exception thrown during Hyperledger Fabric gateway operations
 */
@Getter
public class FabricGatewayException extends RuntimeException {
    private String errorCode;
    private String organization;

    public FabricGatewayException(String message) {
        super(message);
    }

    public FabricGatewayException(String message, Throwable cause) {
        super(message, cause);
    }

    public FabricGatewayException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public FabricGatewayException(String message, String errorCode, String organization) {
        super(message);
        this.errorCode = errorCode;
        this.organization = organization;
    }

    public FabricGatewayException(String message, String errorCode, String organization, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.organization = organization;
    }

}
