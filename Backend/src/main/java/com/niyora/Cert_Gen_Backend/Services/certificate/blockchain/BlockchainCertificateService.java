package com.niyora.Cert_Gen_Backend.Services.certificate.blockchain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain.BLockchainCertHistoryDto;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain.BlockchainCertDto;
import com.niyora.Cert_Gen_Backend.DTOs.common.ApiResponse;
import com.niyora.Cert_Gen_Backend.Configs.FabricGatewayConfig;
import com.niyora.Cert_Gen_Backend.Exception.FabricGatewayException;
import com.niyora.Cert_Gen_Backend.Services.blockchain.FabricGatewayService;
import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

/**
 * Service for managing certificates on Hyperledger Fabric blockchain
 * Handles certificate creation, retrieval, revocation, and history tracking
 */
@Slf4j
@Service
@AllArgsConstructor
public class BlockchainCertificateService {

    private final FabricGatewayService fabricGatewayService;
    private final FabricGatewayConfig fabricConfig;
    private final ObjectMapper objectMapper;



    private enum FunctionKey {
        CREATE_CERTIFICATE,
        GET_CERTIFICATE,
        GET_CERTIFICATE_WITH_TX_ID,
        REVOKE_CERTIFICATE,
        GET_CERTIFICATE_HISTORY,
        GET_ALL_CERTIFICATES
    }

    private String resolveRequiredFunctionName(FunctionKey key) {
        FabricGatewayConfig.Functions functions = fabricConfig.getFunctions();
        if (functions == null) {
            throw new FabricGatewayException(
                "Missing blockchain function mapping under app.blockchain.functions. " +
                "Ensure application-fabric.yaml is loaded (spring.config.import or active fabric profile).",
                "FABRIC_FUNCTIONS_CONFIG_MISSING"
            );
        }

        String value = switch (key) {
            case CREATE_CERTIFICATE -> functions.getCreateCertificate();
            case GET_CERTIFICATE -> functions.getGetCertificate();
            case GET_CERTIFICATE_WITH_TX_ID -> functions.getGetCertificateWithTxId();
            case REVOKE_CERTIFICATE -> functions.getRevokeCertificate();
            case GET_CERTIFICATE_HISTORY -> functions.getGetCertificateHistory();
            case GET_ALL_CERTIFICATES -> functions.getGetAllCertificates();
        };

        if (value == null || value.isBlank()) {
            throw new FabricGatewayException(
                "Missing chaincode function name for " + key + " under app.blockchain.functions.",
                "FABRIC_FUNCTION_NAME_MISSING"
            );
        }

        return value;
    }

    /**
     * Creates a new certificate on the blockchain
     *
     * @param certificateID Unique certificate identifier
     * @param internID Intern identifier
     * @param internName Intern name
     * @param hash Certificate hash (for integrity verification)
     * @param issuedBy Issuer identifier
     * @param approvedBy Approver identifier
     * @param issueDate Certificate issue date
     * @param userId Organization creating the certificate (HR or DIRECTOR)
     * @return Transaction status
     */
    public BlockchainCertDto createCertificate(
            String certificateID,
            String internID,
            String internName,
            String hash,
            String issuedBy,
            String approvedBy,
            String issueDate,
            String userId) {

        try {
            log.info("Creating certificate on blockchain - Certificate ID: {}, Organization: {}", 
                certificateID, userId);

            String functionName = resolveRequiredFunctionName(FunctionKey.CREATE_CERTIFICATE);
            
            String response = fabricGatewayService.submitTransaction(
                userId,
                functionName,
                certificateID,
                internID,
                internName,
                hash,
                issuedBy,
                approvedBy,
                issueDate
            );

            log.info("Certificate created successfully on blockchain. Certificate ID: {}", certificateID);

            Object parsedResult = parseBlockchainPayload(response);

            BlockchainCertDto certDto = toBlockchainCertDto(parsedResult);
            if (certDto.getCertificateId() == null || certDto.getCertificateId().isBlank()) {
                certDto.setCertificateId(certificateID);
            }
            return certDto;

        } catch (FabricGatewayException e) {
            log.error("Fabric gateway error creating certificate: {}", certificateID, e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating certificate on blockchain: {}", certificateID, e);
            throw new FabricGatewayException(
                "Unexpected error: " + e.getMessage(),
                "FABRIC_CREATE_CERTIFICATE_FAILED"
            );
        }
    }

    /**
     * Retrieves a certificate from the blockchain
     *
     * @param certificateID Certificate identifier
     * @param userId Organization retrieving the certificate
     * @return Certificate data
     */
    public BlockchainCertDto getCertificate(String certificateID, String userId) {
        try {
            log.info("Retrieving certificate from blockchain - Certificate ID: {}, Organization: {}", 
                certificateID, userId);

            String functionName = resolveRequiredFunctionName(FunctionKey.GET_CERTIFICATE);
            String response = fabricGatewayService.evaluateTransaction(userId, functionName, certificateID);
            Object parsedCertificate = parseBlockchainPayload(response);

            log.info("Certificate retrieved successfully from blockchain");

            BlockchainCertDto certDto = toBlockchainCertDto(parsedCertificate);
            if (certDto.getCertificateId() == null || certDto.getCertificateId().isBlank()) {
                certDto.setCertificateId(certificateID);
            }
            return certDto;

        } catch (FabricGatewayException e) {
            log.error("Fabric gateway error retrieving certificate: {}", certificateID, e);
            if (isCertificateNotFoundError(e)) {
                throw new FabricGatewayException(
                        "Certificate not found",
                        "FABRIC_CERTIFICATE_NOT_FOUND",
                        userId,
                        e
                );
            }
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error retrieving certificate from blockchain: {}", certificateID, e);
            if (isCertificateNotFoundError(e)) {
                throw new FabricGatewayException(
                        "Certificate not found",
                        "FABRIC_CERTIFICATE_NOT_FOUND",
                        userId,
                        e
                );
            }
            throw new FabricGatewayException(
                "Unexpected error: " + e.getMessage(),
                "FABRIC_GET_CERTIFICATE_FAILED"
            );
        }
    }

    public List<BlockchainCertDto> getAllCertificate(String blockChainIdentity) {
        try {
            log.info("Retrieving certificates from blockchain");

            String functionName = resolveRequiredFunctionName(FunctionKey.GET_ALL_CERTIFICATES);
            String response = fabricGatewayService.evaluateTransaction(blockChainIdentity, functionName);
            Object parsedCertificate = parseBlockchainPayload(response);

            log.info("Certificates retrieved successfully from blockchain");

            List<BlockchainCertDto> certDtos =toBlockchainCertDtos(parsedCertificate);

            return certDtos;

        } catch (FabricGatewayException e) {
            log.error("Fabric gateway error retrieving certificates", e);
            if (isCertificateNotFoundError(e)) {
                throw new FabricGatewayException(
                        "Certificate not found",
                        "FABRIC_CERTIFICATE_NOT_FOUND",
                        blockChainIdentity,
                        e
                );
            }
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error retrieving certificate from blockchains ", e);
            throw new FabricGatewayException(
                    "Unexpected error: " + e.getMessage(),
                    "FABRIC_GET_ALL_CERTIFICATES_FAILED"
            );
        }
    }

    /**
     * Revokes a certificate on the blockchain
     *
     * @param certificateID Certificate identifier
     * @param userId Organization revoking the certificate
     * @return Revocation status
     */
    public BlockchainCertDto revokeCertificate(String certificateID, String userId) {
        try {
            log.info("Revoking certificate on blockchain - Certificate ID: {}, Organization: {}", 
                certificateID, userId);

            String functionName = resolveRequiredFunctionName(FunctionKey.REVOKE_CERTIFICATE);
            String data = fabricGatewayService.submitTransaction(userId, functionName, certificateID);
            Object parsedResult = parseBlockchainPayload(data);

            log.info("Certificate revoked successfully on blockchain. certificateID ID: {}", certificateID);


            BlockchainCertDto certDto = toBlockchainCertDto(parsedResult);
            if (certDto.getCertificateId() == null || certDto.getCertificateId().isBlank()) {
                certDto.setCertificateId(certificateID);
            }
            return certDto;

        } catch (FabricGatewayException e) {
            log.error("Fabric gateway error revoking certificate: {}", certificateID, e);
            if (isCertificateNotFoundError(e)) {
                throw new FabricGatewayException(
                        "Certificate not found",
                        "FABRIC_CERTIFICATE_NOT_FOUND",
                        userId,
                        e
                );
            }
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error revoking certificate on blockchain: {}", certificateID, e);
            throw new FabricGatewayException(
                "Unexpected error: " + e.getMessage(),
                "FABRIC_REVOKE_CERTIFICATE_FAILED"
            );
        }
    }

    /**
     * Retrieves the history of a certificate from the blockchain
     *
     * @param certificateID Certificate identifier
     * @param userId Organization retrieving the history
     * @return Certificate history
     */
    public List<BLockchainCertHistoryDto> getCertificateHistory(String certificateID, String userId) {
        try {
            log.info("Retrieving certificate history from blockchain - Certificate ID: {}, Organization: {}", 
                certificateID, userId);

            String functionName = resolveRequiredFunctionName(FunctionKey.GET_CERTIFICATE_HISTORY);
            String response = fabricGatewayService.evaluateTransaction(userId, functionName, certificateID);
            Object parsedHistory = parseBlockchainPayload(response);

            log.info("Certificate history retrieved successfully from blockchain");

            List<BLockchainCertHistoryDto> historyDtos = toBlockchainHistoryDtos(parsedHistory);
            for (BLockchainCertHistoryDto historyDto : historyDtos) {
                if (historyDto.getValue() != null &&
                    (historyDto.getValue().getCertificateId() == null || historyDto.getValue().getCertificateId().isBlank())) {
                    historyDto.getValue().setCertificateId(certificateID);
                }
            }
            return historyDtos;

        } catch (FabricGatewayException e) {
            log.error("Fabric gateway error retrieving certificate history: {}", certificateID, e);
            if (isCertificateNotFoundError(e)) {
                throw new FabricGatewayException(
                        "Certificate not found",
                        "FABRIC_CERTIFICATE_NOT_FOUND",
                        userId,
                        e
                );
            }
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error retrieving certificate history from blockchain: {}", certificateID, e);
            throw new FabricGatewayException(
                "Unexpected error: " + e.getMessage(),
                "FABRIC_GET_CERTIFICATE_HISTORY_FAILED"
            );
        }
    }



    private Object parseBlockchainPayload(String payload) {
        if (payload == null || payload.isBlank()) {
            return null;
        }

        String trimmed = payload.trim();
        if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
            return payload;
        }

        try {
            return objectMapper.readValue(trimmed, Object.class);
        } catch (Exception ex) {
            log.warn("Failed to parse blockchain JSON payload, returning raw response", ex);
            return payload;
        }
    }

    private List<BlockchainCertDto> toBlockchainCertDtos(Object payload) {
        if (payload == null) {
            return Collections.emptyList();
        }

        if (payload instanceof String strPayload) {
            Object parsed = parseBlockchainPayload(strPayload);

            if (parsed instanceof String) {
                throw new IllegalArgumentException("Invalid payload: recursive string parsing detected");
            }

            return toBlockchainCertDtos(parsed);
        }

        if (payload instanceof List<?> listPayload) {
            return listPayload.stream()
                    .filter(Objects::nonNull)
                    .map(this::toBlockchainCertDto)
                    .toList();
        }

        return List.of(toBlockchainCertDto(payload));
    }

    private BlockchainCertDto toBlockchainCertDto(Object payload) {
        if (payload == null) {
            return new BlockchainCertDto();
        }

        if (payload instanceof BlockchainCertDto certDto) {
            return certDto;
        }

        if (payload instanceof String strPayload) {
            return toBlockchainCertDto(parseBlockchainPayload(strPayload));
        }

        try {
            return objectMapper.convertValue(payload, BlockchainCertDto.class);
        } catch (IllegalArgumentException ex) {
            log.warn("Failed to map blockchain payload to BlockchainCertDto, returning empty DTO", ex);
            return new BlockchainCertDto();
        }
    }

    private List<BLockchainCertHistoryDto> toBlockchainHistoryDtos(Object payload) {
        if (payload == null) {
            return Collections.emptyList();
        }

        if (payload instanceof Map<?, ?> map && map.get("history") != null) {
            return toBlockchainHistoryDtos(map.get("history"));
        }

        if (payload instanceof String strPayload) {
            Object parsed = parseBlockchainPayload(strPayload);

            if (parsed instanceof String) {
                throw new IllegalArgumentException("Invalid payload: recursive string parsing detected");
            }

            return toBlockchainHistoryDtos(parsed);
        }

        if (payload instanceof List<?> listPayload) {
            return listPayload.stream()
                    .filter(Objects::nonNull)
                    .map(this::toBlockchainHistoryDto)
                    .toList();
        }

        return List.of(toBlockchainHistoryDto(payload));
    }



    private BLockchainCertHistoryDto toBlockchainHistoryDto(Object payload) {
        try {
            return objectMapper.convertValue(payload, BLockchainCertHistoryDto.class);
        } catch (IllegalArgumentException ex) {
            log.warn("Failed to map blockchain payload to BLockchainCertHistoryDto, returning empty DTO", ex);
            return new BLockchainCertHistoryDto();
        }
    }

    private boolean isCertificateNotFoundError(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            String message = current.getMessage();
            if (message != null &&( message.toLowerCase(Locale.ROOT).contains("certificate not found") || message.toLowerCase(Locale.ROOT).contains("certificate does not exist"))) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }
}
