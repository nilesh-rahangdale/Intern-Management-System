package com.niyora.Cert_Gen_Backend.Services.blockchain;

import com.niyora.Cert_Gen_Backend.Configs.FabricGatewayConfig;
import com.niyora.Cert_Gen_Backend.Exception.FabricGatewayException;
import io.grpc.ManagedChannel;
import io.grpc.netty.shaded.io.grpc.netty.NettyChannelBuilder;
import io.grpc.netty.shaded.io.grpc.netty.GrpcSslContexts;
import org.hyperledger.fabric.client.*;
import org.hyperledger.fabric.client.identity.*;
import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Service to manage Hyperledger Fabric gateway connections
 * Maintains separate gateways for HR and Director organizations
 */
@Slf4j
@Service
@AllArgsConstructor
public class FabricGatewayService {

    private FabricGatewayConfig fabricConfig;
    private FabricIdentityManager identityManager;

    private final ConcurrentMap<String, Gateway> gateways = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Network> networks = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Contract> contracts = new ConcurrentHashMap<>();

    /**
     * Initializes or retrieves a cached Fabric gateway for the specified organization
     *
     * @param userId Identity name (HR or DIRECTOR)
     * @return Connected Gateway instance
     */
    public synchronized Gateway getGateway(String userId,String organizationName) {
        String userKey = userId.toLowerCase();
        
        if (gateways.containsKey(userKey) && gateways.get(userKey) != null) {
            log.debug("Returning cached gateway for organization: {}", userId);
            return gateways.get(userKey);
        }

        try {
            log.info("Initializing new gateway for organization: {}", userId);

            X509Identity identity = identityManager.createIdentity(userId);
            Signer signer = createSigner(userId);
            Gateway gateway = createGateway(identity, signer, organizationName);
            
            gateways.put(userKey, gateway);
            log.info("Gateway successfully initialized for organization: {}", userId);
            
            return gateway;
        } catch (Exception e) {
            log.error("Error initializing gateway for organization: {}", userId, e);
            throw new FabricGatewayException(
                "Failed to initialize gateway for organization: " + userId,
                "GATEWAY_INITIALIZATION_FAILED",
                    userId,
                e
            );
        }
    }

    /**
     * Creates a Gateway instance with gRPC ManagedChannel and TLS configuration
     *
     * @param identity Fabric identity
     * @param signer Fabric signer built from private key
     * @param organizationName Organization name
     * @return Initialized Gateway
     */
    private Gateway createGateway(Identity identity, Signer signer, String organizationName) throws Exception {
        FabricGatewayConfig.Peer peer = fabricConfig.getPeers().get(organizationName.toLowerCase());

        if (peer == null) {
            throw new FabricGatewayException(
                "No peer configuration found for organization: " + organizationName,
                "PEER_CONFIG_NOT_FOUND",
                organizationName
            );
        }

        String endpoint = peer.getEndpoint();  // e.g. localhost:7051
        String tlsCertPath = peer.getTlsCaCertPath();  // path to TLS CA cert
        String overrideAuth = peer.getTlsHostOverride();  // e.g. peer1.hr.certportal.com

        log.debug("Connecting with TLS to peer: {} with hostname override: {}", endpoint, overrideAuth);

        // Load TLS certificate
        X509Certificate tlsCert = identityManager.loadX509Certificate(tlsCertPath);

        // Create secure gRPC channel with TLS
        ManagedChannel channel = NettyChannelBuilder.forTarget(endpoint)
                .sslContext(GrpcSslContexts.forClient()
                        .trustManager(tlsCert)
                        .build())
                .overrideAuthority(overrideAuth)  // CRITICAL for Fabric TLS hostname verification
                .build();

        // Build gateway with identity and signer
        Gateway.Builder builder = Gateway.newInstance()
                .identity(identity)
            .signer(signer)
                .connection(channel);

        // Configure timeouts using deadline options
        if (fabricConfig.getGateway() != null) {
            builder.evaluateOptions(options ->
                    options.withDeadlineAfter(
                            parseDurationToSeconds(fabricConfig.getGateway().getEvaluateTimeout()),
                            TimeUnit.SECONDS));

            builder.endorseOptions(options ->
                    options.withDeadlineAfter(
                            parseDurationToSeconds(fabricConfig.getGateway().getEndorseTimeout()),
                            TimeUnit.SECONDS));

            builder.submitOptions(options ->
                    options.withDeadlineAfter(
                            parseDurationToSeconds(fabricConfig.getGateway().getSubmitTimeout()),
                            TimeUnit.SECONDS));

            builder.commitStatusOptions(options ->
                    options.withDeadlineAfter(
                            parseDurationToSeconds(fabricConfig.getGateway().getCommitStatusTimeout()),
                            TimeUnit.SECONDS));
        }

        return builder.connect();
    }

    /**
     * Creates a Fabric signer for the given organization using its private key.
     */
    private Signer createSigner(String userId) throws Exception {
        FabricGatewayConfig.Identity identityConfig = fabricConfig.getIdentities().get(userId.toLowerCase());
        if (identityConfig == null) {
            throw new FabricGatewayException(
                "Identity configuration not found for organization: " + userId,
                "IDENTITY_NOT_FOUND",
                    userId
            );
        }

        Path keyDir = Paths.get(identityConfig.getKeyDir());
        if (!Files.exists(keyDir) || !Files.isDirectory(keyDir)) {
            throw new FabricGatewayException(
                "Keystore directory does not exist or is not a directory: " + identityConfig.getKeyDir(),
                "PRIVATE_KEY_DIR_INVALID",
                    userId
            );
        }

        List<Path> candidateFiles;
        try (var stream = Files.list(keyDir)) {
            candidateFiles = stream
                .filter(Files::isRegularFile)
                .sorted()
                .toList();
        }

        if (candidateFiles.isEmpty()) {
            throw new FabricGatewayException(
                "Keystore directory is empty: " + identityConfig.getKeyDir(),
                "PRIVATE_KEY_NOT_FOUND",
                    userId
            );
        }

        for (Path candidate : candidateFiles) {
            try {
                String privateKeyPem = Files.readString(candidate, StandardCharsets.UTF_8);
                PrivateKey privateKey = Identities.readPrivateKey(privateKeyPem);
                log.debug("Using private key file for signer: {}", candidate);
                return Signers.newPrivateKeySigner(privateKey);
            } catch (Exception ignored) {
                // Continue searching other files in keystore directory.
            }
        }

        String fileNames = candidateFiles.stream()
            .map(path -> path.getFileName().toString())
            .reduce((a, b) -> a + ", " + b)
            .orElse("none");

        throw new FabricGatewayException(
            "No readable private key PEM found in keystore directory: " + identityConfig.getKeyDir() +
            ". Files scanned: [" + fileNames + "]",
            "PRIVATE_KEY_NOT_FOUND",
                userId
        );
    }

    /**
     * Gets or creates a Network for the specified organization
     *
     * @param organizationName Organization name
     * @return Connected Network instance
     */
    public synchronized Network getNetwork(String organizationName,String userId) {
        String userKey = userId.toLowerCase();
        
        if (networks.containsKey(userKey) && networks.get(userKey) != null) {
            return networks.get(userKey);
        }

        try {
            Gateway gateway = getGateway(userId, organizationName);
            Network network = gateway.getNetwork(fabricConfig.getChannelName());
            networks.put(userKey, network);
            log.info("Network retrieved for channel: {} and organization: {}", fabricConfig.getChannelName(), organizationName);
            return network;
        } catch (Exception e) {
            log.error("Error getting network for organization: {}", organizationName, e);
            throw new FabricGatewayException(
                "Failed to get network for organization: " + organizationName,
                "NETWORK_RETRIEVAL_FAILED",
                organizationName,
                e
            );
        }
    }

    /**
     * Gets or creates a Contract for the specified organization
     *
     * @param organizationName Organization name
     * @param userId Identity name
     * @return Contract instance
     */
    public synchronized Contract getContract(String organizationName, String userId) {
        String userKey = userId.toLowerCase();
        
        if (contracts.containsKey(userKey) && contracts.get(userKey) != null) {
            return contracts.get(userKey);
        }

        try {
            Network network = getNetwork(organizationName,userId);
            Contract contract = network.getContract(fabricConfig.getChaincode().getName());
            contracts.put(userKey, contract);
            log.info("Contract retrieved for chaincode: {} and organization: {}", 
                fabricConfig.getChaincode().getName(), organizationName);
            return contract;
        } catch (Exception e) {
            log.error("Error getting contract for organization: {}", organizationName, e);
            throw new FabricGatewayException(
                "Failed to get contract for organization: " + organizationName,
                "CONTRACT_RETRIEVAL_FAILED",
                organizationName,
                e
            );
        }
    }

    /**
     * Evaluates (reads) data from the ledger without modifying it
     *
     * @param userId Identity name
     * @param functionName Function name to evaluate
     * @param args Function arguments
     * @return Response from the function
     */
    public String evaluateTransaction(String userId, String functionName, String... args) {
        String organizationName=getOrganization(userId);
        try {

            Contract contract = getContract(organizationName,userId);
            log.info("Evaluating transaction - Function: {}, Organization: {}, Args: {}", 
                functionName, organizationName, java.util.Arrays.toString(args));
            
            byte[] result = contract.evaluateTransaction(functionName, args);
            return new String(result, StandardCharsets.UTF_8);
        } catch (FabricGatewayException e) {
            log.error("Endorsement failed for function: {}", functionName, e);
            throw new FabricGatewayException(
                "Endorsement failed for " + functionName,
                "ENDORSEMENT_FAILED",
                organizationName,
                e
            );
        } catch (Exception e) {
            log.error("Error evaluating transaction for function: {} in organization: {}", functionName, organizationName, e);
            throw new FabricGatewayException(
                "Failed to evaluate transaction: " + functionName,
                "TRANSACTION_EVALUATION_FAILED",
                organizationName,
                e
            );
        }
    }

    /**
     * Submits (writes) a transaction to the ledger
     *
     * @param userId Identity name
     * @param functionName Function name to submit
     * @param args Function arguments
     * @return Transaction ID
     */
    public String submitTransaction(String userId, String functionName, String... args) {
        try {
            String organizationName=getOrganization(userId);
            Contract contract = getContract(organizationName, userId);
            log.info("Submitting transaction - Function: {}, Organization: {}, Args: {}", 
                functionName, organizationName, java.util.Arrays.toString(args));
            
            byte[] result = contract.submitTransaction(functionName, args);
            String txnId = new String(result, StandardCharsets.UTF_8);
            log.info("Transaction submitted successfully. Transaction ID: {}", txnId);
            return txnId;
        } catch (FabricGatewayException e) {
            log.error("Endorsement failed for function: {}", functionName, e);
            throw new FabricGatewayException(
                "Endorsement failed for " + functionName,
                "ENDORSEMENT_FAILED",
                userId,
                e
            );
        } catch (CommitException e) {
            log.error("Commit failed for function: {}", functionName, e);
            throw new FabricGatewayException(
                "Commit failed for " + functionName,
                "COMMIT_FAILED",
                userId,
                e
            );
        } catch (Exception e) {
            log.error("Error submitting transaction for function: {} in userId: {}", functionName, userId, e);
            throw new FabricGatewayException(
                "Failed to submit transaction: " + functionName,
                "TRANSACTION_SUBMISSION_FAILED",
                    userId,
                e
            );
        }
    }

    /**
     * Extracts organizationName from configuration
     */
    public String getOrganization(String userId) {
        FabricGatewayConfig.Identity identity =
                fabricConfig.getIdentities().get(userId.toLowerCase());

        if (identity == null) {
            throw new FabricGatewayException(
                    "Identity not found for user: " + userId,
                    "IDENTITY_NOT_FOUND",
                    userId
            );
        }

        return identity.getOrg(); // 🔥 NEW FIELD
    }

    /**
     * Extracts hostname from endpoint string (format: localhost:7051 or hostname:port)
     */
    private String extractHostname(String endpoint) {
        String[] parts = endpoint.split(":");
        return parts.length > 0 ? parts[0] : "localhost";
    }

    /**
     * Extracts port number from endpoint string (format: localhost:7051)
     */
    private int extractPort(String endpoint) {
        String[] parts = endpoint.split(":");
        if (parts.length > 1) {
            try {
                return Integer.parseInt(parts[1]);
            } catch (NumberFormatException e) {
                log.warn("Failed to parse port from endpoint: {}", endpoint);
                return 7051; // Default Fabric port
            }
        }
        return 7051;
    }

    /**
     * Parses duration string (e.g. 10s, 500ms, 2m) to seconds for gRPC deadlines.
     */
    private long parseDurationToSeconds(String duration) {
        if (duration == null || duration.isBlank()) {
            return 30L;
        }

        String trimmed = duration.trim().toLowerCase();
        try {
            if (trimmed.endsWith("ms")) {
                long millis = Long.parseLong(trimmed.substring(0, trimmed.length() - 2));
                return Math.max(1L, (millis + 999L) / 1000L);
            }
            if (trimmed.endsWith("s")) {
                return Long.parseLong(trimmed.substring(0, trimmed.length() - 1));
            }
            if (trimmed.endsWith("m")) {
                long minutes = Long.parseLong(trimmed.substring(0, trimmed.length() - 1));
                return minutes * 60L;
            }
            return Long.parseLong(trimmed);
        } catch (NumberFormatException e) {
            log.warn("Failed to parse duration '{}', using default 30s", duration, e);
            return 30L;
        }
    }

    /**
     * Closes all cached gateway connections
     */
    public synchronized void closeAll() {
        log.info("Closing all Fabric gateways");
        gateways.values().forEach(gateway -> {
            try {
                if (gateway != null) {
                    gateway.close();
                }
            } catch (Exception e) {
                log.warn("Error closing gateway", e);
            }
        });
        gateways.clear();
        networks.clear();
        contracts.clear();
        log.info("All Fabric gateways closed");
    }


}
