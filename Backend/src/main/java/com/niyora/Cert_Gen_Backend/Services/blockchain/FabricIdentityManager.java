package com.niyora.Cert_Gen_Backend.Services.blockchain;

import com.niyora.Cert_Gen_Backend.Configs.FabricGatewayConfig;
import com.niyora.Cert_Gen_Backend.Exception.FabricGatewayException;
import org.hyperledger.fabric.client.identity.Identities;
import org.hyperledger.fabric.client.identity.X509Identity;
import org.springframework.stereotype.Component;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.List;

@Slf4j
@Component
@AllArgsConstructor
public class FabricIdentityManager {

    private FabricGatewayConfig fabricConfig;

    /**
     * Creates a Fabric identity for the specified organization
     * Returns X509Identity which implements both Identity and Signer
     *
     * @param userId Organization name (HR or DIRECTOR)
     * @return Fabric X509Identity object
     */
    public X509Identity createIdentity(String userId) {
        try {
            FabricGatewayConfig.Identity identityConfig = fabricConfig.getIdentities().get(userId.toLowerCase());

            if (identityConfig == null) {
                throw new FabricGatewayException(
                    "Identity configuration not found for organization: " + userId,
                    "IDENTITY_NOT_FOUND",
                    userId
                );
            }

            log.info("Creating identity for organization: {} with MSP ID: {}", userId, identityConfig.getMspId());

            // Read certificate
            X509Certificate certificate = readCertificate(identityConfig.getCertPath());

            // Read private key
            PrivateKey privateKey = readPrivateKey(identityConfig.getKeyDir());

            // Create and return X509 identity using X509Identity constructor
            // X509Identity implements both Identity and Signer interfaces
            // Constructor: X509Identity(mspId, certificate, privateKey)
            return new X509Identity(identityConfig.getMspId(), certificate);

        } catch (Exception e) {
            log.error("Error creating identity for organization: {}", userId, e);
            throw new FabricGatewayException(
                "Failed to create identity for organization: " + userId,
                "IDENTITY_CREATION_FAILED",
                userId,
                e
            );
        }
    }

    /**
     * Reads X509 certificate from PEM file
     * Uses Fabric Identities API for proper PEM parsing
     *
     * @param certPath Path to certificate file
     * @return X509Certificate
     */
    private X509Certificate readCertificate(String certPath) throws Exception {
        log.debug("Reading certificate from: {}", certPath);
        
        // Read PEM file as string and use Identities API
        String pemContent = Files.readString(Paths.get(certPath), StandardCharsets.UTF_8);
        return Identities.readX509Certificate(pemContent);
    }

    /**
     * Reads private key from keystore directory
     * Uses Fabric Identities API for proper PEM parsing
     *
     * @param keyDir Path to keystore directory
     * @return PrivateKey
     */
    private PrivateKey readPrivateKey(String keyDir) throws Exception {
        log.debug("Reading private key from directory: {}", keyDir);

        Path keyDirPath = Paths.get(keyDir);
        if (!Files.exists(keyDirPath) || !Files.isDirectory(keyDirPath)) {
            throw new FabricGatewayException(
                "Keystore directory does not exist or is not a directory: " + keyDir,
                "PRIVATE_KEY_DIR_INVALID"
            );
        }

        List<Path> candidateFiles;
        try (var stream = Files.list(keyDirPath)) {
            candidateFiles = stream
                .filter(Files::isRegularFile)
                .sorted()
                .toList();
        }

        if (candidateFiles.isEmpty()) {
            throw new FabricGatewayException(
                "Keystore directory is empty: " + keyDir,
                "PRIVATE_KEY_NOT_FOUND"
            );
        }

        // Hyperledger Fabric key files are often named *_sk (or sometimes *_pk),
        // but we validate by parsing PEM content to avoid filename assumptions.
        for (Path candidate : candidateFiles) {
            try {
                String pemContent = Files.readString(candidate, StandardCharsets.UTF_8);
                PrivateKey privateKey = Identities.readPrivateKey(pemContent);
                log.debug("Using private key file: {}", candidate);
                return privateKey;
            } catch (Exception ignored) {
                // Try next candidate file.
            }
        }

        String fileNames = candidateFiles.stream()
            .map(path -> path.getFileName().toString())
            .reduce((a, b) -> a + ", " + b)
            .orElse("none");

        throw new FabricGatewayException(
            "No readable private key PEM found in keystore directory: " + keyDir +
            ". Files scanned: [" + fileNames + "]",
            "PRIVATE_KEY_NOT_FOUND"
        );
    }

    /**
     * Validates if identity configuration exists for the organization
     *
     * @param userId Organization name
     * @return true if configuration exists
     */
    public boolean identityExists(String userId) {
        return fabricConfig.getIdentities().containsKey(userId.toLowerCase());
    }

    /**
     * Gets MSP ID for the organization
     *
     * @param userId Organization name
     * @return MSP ID
     */
    public String getMspId(String userId) {
        FabricGatewayConfig.Identity identity = fabricConfig.getIdentities().get(userId.toLowerCase());
        if (identity == null) {
            throw new FabricGatewayException(
                "Identity not found for organization: " + userId,
                "IDENTITY_NOT_FOUND",
                userId
            );
        }
        return identity.getMspId();
    }

    /**
     * Loads an X509Certificate from a PEM file path
     * Used for loading TLS CA certificates
     *
     * @param certPath Path to certificate file
     * @return X509Certificate
     */
    public X509Certificate loadX509Certificate(String certPath) throws Exception {
        log.debug("Loading X509 certificate from: {}", certPath);
        String pemContent = Files.readString(Paths.get(certPath), StandardCharsets.UTF_8);
        return Identities.readX509Certificate(pemContent);
    }
}
