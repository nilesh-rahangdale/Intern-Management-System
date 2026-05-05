package com.niyora.Cert_Gen_Backend.Configs;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "app.blockchain")
@Data
public class FabricGatewayConfig {

    private String channelName;
    private Chaincode chaincode;
    private Gateway gateway;
    private Orderer orderer;
    private Map<String, Peer> peers;
    private Msp msp;
    private Map<String, Identity> identities;
    private Functions functions;

    @Data
    public static class Chaincode {
        private String name;
        private String version;
        private Integer sequence;
        private String endorsementPolicy;
    }

    @Data
    public static class Gateway {
        private String evaluateTimeout;
        private String endorseTimeout;
        private String submitTimeout;
        private String commitStatusTimeout;
    }

    @Data
    public static class Orderer {
        private String endpoint;
        private String tlsHostOverride;
        private String tlsCaCertPath;
    }

    @Data
    public static class Peer {
        private String endpoint;
        private String tlsHostOverride;
        private String tlsCaCertPath;
        private String endpointBackup;
    }

    @Data
    public static class Msp {
        private String hrMspId;
        private String directorMspId;
        private String ordererMspId;

        public Map<String, String> getMspMap() {
            Map<String, String> mspMap = new HashMap<>();
            mspMap.put("HR", hrMspId);
            mspMap.put("DIRECTOR", directorMspId);
            mspMap.put("ORDERER", ordererMspId);
            return mspMap;
        }
    }

    @Data
    public static class Identity {
        private String mspId;
        private String org;
        private String certPath;
        private String keyDir;
    }

    @Data
    public static class Functions {
        private String createCertificate;
        private String getCertificate;
        private String getCertificateWithTxId;
        private String revokeCertificate;
        private String getCertificateHistory;
        private String getAllCertificates;
    }
}
