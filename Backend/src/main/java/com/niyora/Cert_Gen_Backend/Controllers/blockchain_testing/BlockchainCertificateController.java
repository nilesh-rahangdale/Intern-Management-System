package com.niyora.Cert_Gen_Backend.Controllers.blockchain_testing;

import com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain.BLockchainCertHistoryDto;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain.BlockchainCertDto;
import com.niyora.Cert_Gen_Backend.DTOs.common.ApiResponse;
import com.niyora.Cert_Gen_Backend.Exception.FabricGatewayException;
import com.niyora.Cert_Gen_Backend.Services.certificate.blockchain.BlockchainCertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * REST Controller for Hyperledger Fabric blockchain certificate operations
 * Exposes endpoints for creating, retrieving, revoking, and tracking certificates
 */
@Slf4j
@RestController
@RequestMapping("/api/blockchain/certificates")
@AllArgsConstructor
public class BlockchainCertificateController {

    private BlockchainCertificateService blockchainCertificateService;

    /**
     * Creates a new certificate on the blockchain
     * POST /api/blockchain/certificates/create
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BlockchainCertDto>> createCertificate(
            @RequestParam String certificateId,
            @RequestParam String internId,
            @RequestParam String internName,
            @RequestParam String hash,
            @RequestParam String issuedBy,
            @RequestParam String approvedBy,
            @RequestParam String issueDate,
            @RequestParam String userId) {

        log.info("REST request to create certificate on blockchain - Certificate ID: {}", certificateId);

        try {
            BlockchainCertDto response = blockchainCertificateService.createCertificate(
                certificateId, internId, internName, hash, issuedBy, approvedBy, issueDate, userId
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Certificate successfully created on blockchain", response));
        } catch (FabricGatewayException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                    "Failed to create certificate: " + e.getMessage(),
                    ApiResponse.ErrorDetails.builder()
                        .code(e.getErrorCode())
                        .details("certificateId=" + certificateId)
                        .build()
                ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Unexpected error: " + e.getMessage()));
        }
    }

    /**
     * Retrieves a certificate from the blockchain
     * GET /api/blockchain/certificates/{certificateId}
     */
    @GetMapping("/{certificateId}")
    public ResponseEntity<ApiResponse<BlockchainCertDto>> getCertificate(
            @PathVariable String certificateId,
            @RequestParam String userId) {

        log.info("REST request to retrieve certificate from blockchain - Certificate ID: {}", certificateId);

        try {
            BlockchainCertDto response = blockchainCertificateService.getCertificate(certificateId, userId);
            return ResponseEntity.ok(ApiResponse.success("Certificate successfully retrieved from blockchain", response));
        } catch (FabricGatewayException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(
                    "Failed to retrieve certificate: " + e.getMessage(),
                    ApiResponse.ErrorDetails.builder()
                        .code(e.getErrorCode())
                        .details("certificateId=" + certificateId)
                        .build()
                ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Unexpected error: " + e.getMessage()));
        }
    }

    /**
     * Revokes a certificate on the blockchain
     * DELETE /api/blockchain/certificates/{certificateId}
     */
    @DeleteMapping("/{certificateId}")
    public ResponseEntity<ApiResponse<BlockchainCertDto>> revokeCertificate(
            @PathVariable String certificateId,
            @RequestParam String userId) {

        log.info("REST request to revoke certificate on blockchain - Certificate ID: {}", certificateId);

        try {
            BlockchainCertDto response = blockchainCertificateService.revokeCertificate(certificateId, userId);
            return ResponseEntity.ok(ApiResponse.success("Certificate successfully revoked on blockchain", response));
        } catch (FabricGatewayException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                    "Failed to revoke certificate: " + e.getMessage(),
                    ApiResponse.ErrorDetails.builder()
                        .code(e.getErrorCode())
                        .details("certificateId=" + certificateId)
                        .build()
                ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Unexpected error: " + e.getMessage()));
        }
    }

    /**
     * Retrieves the history of a certificate from the blockchain
     * GET /api/blockchain/certificates/{certificateId}/history
     */
    @GetMapping("/{certificateId}/history")
    public ResponseEntity<ApiResponse<List<BLockchainCertHistoryDto>>> getCertificateHistory(
            @PathVariable String certificateId,
            @RequestParam String userId) {

        log.info("REST request to retrieve certificate history from blockchain - Certificate ID: {}", certificateId);

        try {
            List<BLockchainCertHistoryDto> response = blockchainCertificateService.getCertificateHistory(certificateId, userId);
            return ResponseEntity.ok(ApiResponse.success("Certificate history successfully retrieved from blockchain", response));
        } catch (FabricGatewayException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(
                    "Failed to retrieve certificate history: " + e.getMessage(),
                    ApiResponse.ErrorDetails.builder()
                        .code(e.getErrorCode())
                        .details("certificateId=" + certificateId)
                        .build()
                ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Unexpected error: " + e.getMessage()));
        }
    }


}
