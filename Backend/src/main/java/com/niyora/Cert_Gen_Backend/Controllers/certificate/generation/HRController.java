package com.niyora.Cert_Gen_Backend.Controllers.certificate.generation;


import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateGenerationResponse;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateRevocationResponse;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain.BlockchainCertDto;
import com.niyora.Cert_Gen_Backend.DTOs.common.ApiResponse;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Repositories.UserRepository;
import com.niyora.Cert_Gen_Backend.Services.certificate.ceritificateGenerator.HrCertificateService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/hr/certificates")
@RequiredArgsConstructor
public class HRController {

    private final HrCertificateService hrCertificateService;
    private final UserRepository userRepository;

    /**
     * Generate a certificate for an intern
     * @param internId The intern ID for whom the certificate is to be generated
     * @param certificateType The type of certificate to generate
     * @return ResponseEntity containing generated certificate details wrapped in ApiResponse
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<CertificateGenerationResponse>> generateCertificate(
            @RequestParam @NotBlank(message = "Intern ID is required") String internId,
            @RequestParam @NotBlank(message = "Certificate type is required") String certificateType,
             Authentication authentication) {

        log.info("HR requesting certificate generation for intern: {} with type: {}", internId, certificateType);

        if (authentication == null) {
            log.error("Unauthorized attempt to generate certificate");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        String userEmail = authentication.getName();
        User hr = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Hr not found with email: " + userEmail));

        Certificate certificate = hrCertificateService.generateCertificate(internId, certificateType, hr);

        log.info("Certificate generated successfully with ID: {}", certificate.getCertificateId());

        CertificateGenerationResponse response = CertificateGenerationResponse.builder()
                .certificateId(certificate.getCertificateId())
                .certificateType(certificate.getCertificateType().toString())
                .internId(certificate.getIntern().getInternId())
                .internName(certificate.getIntern().getFullName())
                .issueDate(certificate.getIssueDate())
                .issuedBy(certificate.getIssuedBy().getFullName())
                .status(certificate.getStatus().toString())
                .pdfPath(certificate.getPdfPath())
                .verificationUrl(certificate.getQrMetadata() != null ?
                        certificate.getQrMetadata().getVerificationUrl() : null)
                .qrEmbedded(certificate.getQrMetadata() != null)
                .signed(certificate.getDigitalSignature() != null)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Certificate generated successfully", response));
    }


    @PostMapping("/revoke")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<CertificateRevocationResponse>> revokeCertificate(
            @RequestParam @NotBlank(message = "Intern ID is required") String certificateId,
            @RequestParam @NotBlank(message = "Revocation Reason is required") String revocationReason,
             Authentication authentication) {
        log.info("HR requesting certificate revocation for certificate ID: {} with reason: {}", certificateId, revocationReason);

        if (authentication == null) {
            log.error("Unauthorized attempt to revoke certificate");
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

        CertificateRevocationResponse response = hrCertificateService.revokeCertificate(
                certificateId,
                revocationReason,
                blockChainIdentity
        );

        return ResponseEntity.ok(
                ApiResponse.success("Certificate revoked successfully", response)
        );
    }


    @PostMapping("/uploadCertificateToBlockchain")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<BlockchainCertDto>> uploadCertificateToBlockchain(
            @RequestParam @NotBlank(message = "Certificate ID is required") String certificateId,
            Authentication authentication
    ){
        log.info("HR uploading certificate to blockchain with certificate ID: {}", certificateId);

        if (authentication == null) {
            log.error("Unauthorized attempt to upload certificate to blockchain");
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

        BlockchainCertDto blockchainCertDto = hrCertificateService.uploadCertificateToBlockchain(certificateId, blockChainIdentity);

        return ResponseEntity.ok(
                ApiResponse.success("Certificate uploaded successfully to blockchain", blockchainCertDto)
        );
    }





}
