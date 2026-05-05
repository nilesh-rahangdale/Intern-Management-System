package com.niyora.Cert_Gen_Backend.Controllers.certificate.verification;


import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateVerificationResponse;
import com.niyora.Cert_Gen_Backend.DTOs.common.ApiResponse;
import com.niyora.Cert_Gen_Backend.Services.certificate.verification.CertificateVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
public class VerificationController {

    private final CertificateVerificationService verificationService;

    /**
     * Verify certificate authenticity and integrity
     * @param certificateId The certificate ID to verify
     * @return ResponseEntity containing verification result wrapped in ApiResponse
     */
    @GetMapping("/verify/{certificateId}")
    public ResponseEntity<ApiResponse<CertificateVerificationResponse>> verify(
            @PathVariable String certificateId
    ) throws Exception {
        log.info("Verifying certificate with ID: {}", certificateId);
        
        CertificateVerificationResponse verificationResult = verificationService.verifyCertificate(certificateId);
//
//        String message = verificationResult.isValid()
//                ? "Certificate verified successfully"
//                : "Certificate verification failed";
        
        return ResponseEntity.ok(
                ApiResponse.success("Certificate verified successfully", verificationResult)
        );
    }

}
