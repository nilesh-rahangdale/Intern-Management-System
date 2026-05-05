package com.niyora.Cert_Gen_Backend.Controllers.certificate.access;


import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateResponseDTO;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain.BLockchainCertHistoryDto;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain.BlockchainCertDto;
import com.niyora.Cert_Gen_Backend.DTOs.common.ApiResponse;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Exception.FabricGatewayException;
import com.niyora.Cert_Gen_Backend.Repositories.UserRepository;
import com.niyora.Cert_Gen_Backend.Services.certificate.CertificateService;
import com.niyora.Cert_Gen_Backend.Services.certificate.blockchain.BlockchainCertificateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {
    
    private final CertificateService certificateService;
    private final BlockchainCertificateService blockchainCertificateService;
    private final UserRepository userRepository;
    
    /**
     * Get certificate by certificate ID
     * @param certificateId The certificate ID
     * @return ResponseEntity containing CertificateResponseDTO wrapped in ApiResponse
     */
    @GetMapping("/certificate/{certificateId}")
    public ResponseEntity<ApiResponse<CertificateResponseDTO>> getCertificateByCertificateId(
            @PathVariable String certificateId) {
        
        log.info("Fetching certificate with ID: {}", certificateId);
        
        CertificateResponseDTO certificate = certificateService.getCertificateByCertificateId(certificateId);
        
        return ResponseEntity.ok(
                ApiResponse.success("Certificate retrieved successfully", certificate)
        );
    }
    
    /**
     * Get certificate by intern ID
     * @param status The certificate status to filter by (optional, can be null to get all certificates regardless of status)
     * @return ResponseEntity containing CertificateResponseDTO wrapped in ApiResponse
     */
    @GetMapping("/certificate")
    public ResponseEntity<ApiResponse<List<CertificateResponseDTO>>> getAllCertificates(
            @RequestParam(required = false) Certificate.Status status) {
        
        log.info("Fetching All certificates from database");
        
        List<CertificateResponseDTO> certificates = certificateService.getAllCertificates(status);
        
        return ResponseEntity.ok(
                ApiResponse.success("Certificate retrieved successfully", certificates)
        );
    }


    /**
     * Get certificate by intern ID
     * @param internId The intern ID
     * @param status The certificate status to filter by (optional, can be null to get all certificates regardless of status)
     * @return ResponseEntity containing CertificateResponseDTO wrapped in ApiResponse
     */
    @GetMapping("/intern")
    public ResponseEntity<ApiResponse<List<CertificateResponseDTO>>> getCertificatesForInternId(
            @RequestParam String internId,
            @RequestParam(required = false) Certificate.Status status) {

        log.info("Fetching certificates for intern ID: {}", internId);

        List<CertificateResponseDTO> certificates = certificateService.getCertificatesForInternId(internId,status);

        return ResponseEntity.ok(
                ApiResponse.success("Certificate retrieved successfully", certificates)
        );
    }


    /**
     * Download certificate PDF by certificate ID
     * @param certificateId The certificate ID
     * @return ResponseEntity containing the PDF file
     */
    @GetMapping("/certificate/{certificateId}/pdf")
    public ResponseEntity<Resource> downloadCertificatePdfByCertificateId(
            @PathVariable String certificateId) throws IOException {
        
        log.info("Downloading certificate PDF for certificate ID: {}", certificateId);
        
        Resource pdfResource = certificateService.getCertificatePdfByCertificateId(certificateId);
        
        log.info("Certificate PDF retrieved successfully for certificate ID: {}", certificateId);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "inline; filename=\"" + certificateId + ".pdf\"")
                .body(pdfResource);
    }




//

    /**
     * Retrieves a certificate from the blockchain
     * GET /api/blockchain/certificates/{certificateId}
     */
    @GetMapping("/blockchain/{certificateId}")
    public ResponseEntity<ApiResponse<BlockchainCertDto>> getCertificateFromBlockchain(
            @PathVariable String certificateId,
            Authentication authentication) {

        log.info("request to retrieve certificate from blockchain - Certificate ID: {}", certificateId);

        if (authentication == null) {
            log.error("Unauthorized attempt to acccess certificate from blockchain");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        String userEmail = authentication.getName();
        User hr = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Hr not found with email: " + userEmail));

        String blockChainIdentity = hr.getBlockChainIdentity();

        if(blockChainIdentity == null || blockChainIdentity.isBlank()) {
            return ResponseEntity.ok(
                    ApiResponse.error(userEmail+" does not have a blockchain identity associated")
            );
        }

        try {

            BlockchainCertDto response = blockchainCertificateService.getCertificate(certificateId, blockChainIdentity);
            return ResponseEntity.ok(ApiResponse.success("Certificate successfully retrieved from blockchain", response));

        } catch (FabricGatewayException e) {
            if ("FABRIC_CERTIFICATE_NOT_FOUND".equals(e.getErrorCode())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(
                                "Certificate not found",
                                ApiResponse.ErrorDetails.builder()
                                        .code("FABRIC_CERTIFICATE_NOT_FOUND")
                                        .details("certificate not found with Id:" + certificateId)
                                        .build()
                        ));
            }
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
     * Retrieves the history of a certificate from the blockchain
     * GET /api/blockchain/certificates/{certificateId}/history
     */
    @GetMapping("/blockchain/{certificateId}/history")
    public ResponseEntity<ApiResponse<List<BLockchainCertHistoryDto>>> getCertificateHistory(
            @PathVariable String certificateId,
            Authentication authentication) {

        log.info("request to retrieve certificate history from blockchain - Certificate ID: {}", certificateId);

        if (authentication == null) {
            log.error("Unauthorized attempt to acccess certificate from blockchain");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        String userEmail = authentication.getName();
        User hr = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Hr not found with email: " + userEmail));

        String blockChainIdentity = hr.getBlockChainIdentity();

        if(blockChainIdentity == null || blockChainIdentity.isBlank()) {
            return ResponseEntity.ok(
                    ApiResponse.error(userEmail+" does not have a blockchain identity associated")
            );
        }
        try {

            List<BLockchainCertHistoryDto> response = blockchainCertificateService.getCertificateHistory(certificateId, blockChainIdentity);
            return ResponseEntity.ok(ApiResponse.success("Certificate history successfully retrieved from blockchain", response));

        } catch (FabricGatewayException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(
                            "Failed to retrieve certificate history: " + e.getMessage(),
                            ApiResponse.ErrorDetails.builder()
                                    .code(e.getErrorCode())
                                    .details("certificate not found with Id:" + certificateId)
                                    .build()
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Unexpected error: " + e.getMessage()));
        }
    }


    @GetMapping("/blockchain/certificates")
    public ResponseEntity<ApiResponse<List<BlockchainCertDto>>> getAllCertificatesFromBlockchain(
            Authentication authentication) {

        log.info("request to retrieve All certificates from blockchain ");

        if (authentication == null) {
            log.error("Unauthorized attempt to acccess certificate from blockchain");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        String userEmail = authentication.getName();
        User hr = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Hr not found with email: " + userEmail));

        String blockChainIdentity = hr.getBlockChainIdentity();

        if(blockChainIdentity == null || blockChainIdentity.isBlank()) {
            return ResponseEntity.ok(
                    ApiResponse.error(userEmail+" does not have a blockchain identity associated")
            );
        }

        try {

            List<BlockchainCertDto> certificates = blockchainCertificateService.getAllCertificate( blockChainIdentity);
            return ResponseEntity.ok(ApiResponse.success("Certificates successfully retrieved from blockchain",certificates));

        } catch (FabricGatewayException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(
                            "Failed to retrieve certificate: " + e.getMessage(),
                            ApiResponse.ErrorDetails.builder()
                                    .code(e.getErrorCode())
                                    .details(e.getMessage())
                                    .build()
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Unexpected error: " + e.getMessage()));
        }
    }



//    /**
//     * Download certificate PDF by intern ID
//     * @param internId The intern ID
//     * @return ResponseEntity containing the PDF file
//     */
//    @GetMapping("/intern/{internId}/pdf")
//    public ResponseEntity<Resource> downloadCertificatePdfByInternId(
//            @PathVariable String internId) throws IOException {
//
//        log.info("Downloading certificate PDF for intern ID: {}", internId);
//
//        Resource pdfResource = certificateService.getCertificatePdfByInternId(internId);
//
//        log.info("Certificate PDF retrieved successfully for intern ID: {}", internId);
//
//        // Get certificate ID for filename
//        CertificateResponseDTO certificate = certificateService.getCertificateByInternId(internId);
//
//        return ResponseEntity.ok()
//                .contentType(MediaType.APPLICATION_PDF)
//                .header(HttpHeaders.CONTENT_DISPOSITION,
//                        "inline; filename=\"" + certificate.getCertificateId() + ".pdf\"")
//                .body(pdfResource);
//    }




}
