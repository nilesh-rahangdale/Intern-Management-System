package com.niyora.Cert_Gen_Backend.Controllers.certificate.generation;

import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateResponseDTO;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateSigningResponse;
import com.niyora.Cert_Gen_Backend.DTOs.common.ApiResponse;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Repositories.UserRepository;
import com.niyora.Cert_Gen_Backend.Services.certificate.signing.PdfSigningService;
import com.niyora.Cert_Gen_Backend.Services.certificate.qr.CertificateQrService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/director/certificates")
@RequiredArgsConstructor
public class DirectorController {

    private final CertificateQrService certificateQrService;
    private final PdfSigningService signingService;
    private final UserRepository userRepository;

//    /**
//     * Embed QR code into certificate PDF
//     * @param certificateId The certificate ID
//     * @return ResponseEntity containing updated certificate details wrapped in ApiResponse
//     */
//    @PostMapping("/add-qr/{certificateId}")
//    @PreAuthorize("hasRole('DIRECTOR')")
//    public ResponseEntity<ApiResponse<CertificateResponseDTO>> addQr(
//            @PathVariable String certificateId) throws Exception {
//
//        log.info("Adding QR code to certificate: {}", certificateId);
//
//        CertificateResponseDTO response = certificateQrService.embedQrIntoCertificate(certificateId);
//
//        return ResponseEntity.ok(
//                ApiResponse.success("QR code embedded successfully", response)
//        );
//    }

    /**
     * Digitally sign the certificate
     * @param certificateId The certificate ID to sign
     * @param authentication The authenticated director's details
     * @return ResponseEntity containing signed certificate details wrapped in ApiResponse
     */
    @PostMapping("/{certificateId}/sign")
    @PreAuthorize("hasRole('DIRECTOR')")
    @Transactional
    public ResponseEntity<ApiResponse<CertificateSigningResponse>> signCertificate(
            @PathVariable String certificateId, 
            Authentication authentication) throws Exception {

        log.info("Director requesting to sign certificate: {}", certificateId);

        if (authentication == null) {
            log.error("Unauthorized attempt to sign certificate: {}", certificateId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        String userEmail = authentication.getName();
        User director = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Director not found with email: " + userEmail));

        CertificateResponseDTO certResponse = signingService.signCertificate(certificateId, director);

        CertificateSigningResponse response = CertificateSigningResponse.builder()
                .certificateId(certResponse.getCertificateId())
                .status(certResponse.getStatus())
                .signerDetails(CertificateSigningResponse.SignerDetails.builder()
                        .signerName(certResponse.getDigitalSignature().getSignerName())
                        .signerRole(certResponse.getDigitalSignature().getSignerRole())
                        .signatureAlgorithm(certResponse.getDigitalSignature().getSignatureAlgorithm())
                        .build())
                .signedAt(certResponse.getDigitalSignature().getSignedAt())
                .signedPdfPath(certResponse.getPdfPath())
                .verificationEnabled(true)
                .build();

        log.info("Certificate signed successfully: {}", certificateId);

        return ResponseEntity.ok(
                ApiResponse.success("Certificate signed successfully", response)
        );
    }
}
