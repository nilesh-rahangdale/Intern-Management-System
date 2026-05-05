package com.niyora.Cert_Gen_Backend.Services.certificate.verification;

import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateVerificationResponse;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.PdfVerificationResult;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain.BlockchainCertDto;
import com.niyora.Cert_Gen_Backend.DTOs.common.ApiResponse;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import com.niyora.Cert_Gen_Backend.Exception.FabricGatewayException;
import com.niyora.Cert_Gen_Backend.Repositories.CertificateRepository;
import com.niyora.Cert_Gen_Backend.Services.certificate.blockchain.BlockchainCertificateService;
import com.niyora.Cert_Gen_Backend.Services.utils.hashing.PdfHashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CertificateVerificationService {

    private final CertificateRepository certificateRepository;
    private final PdfVerificationService pdfVerificationService;
    private final BlockchainCertificateService blockchainCertificateService;
    private final PdfHashUtil pdfHashUtil;

    public CertificateVerificationResponse verifyCertificate(String certificateId) throws Exception {

        Optional<Certificate> cert = certificateRepository.findById(certificateId);

        try{
            BlockchainCertDto blockchainCertificate=blockchainCertificateService.getCertificate(certificateId,"verifier");
            if (cert.isEmpty() || blockchainCertificate == null) {
                return CertificateVerificationResponse.invalid(
                        "The certificate could not be verified as no matching record was found in the system."
                );
            }

            if (cert.get().getStatus() == Certificate.Status.GENERATED
                    || blockchainCertificate.getStatus() == Certificate.Status.GENERATED) {
                return CertificateVerificationResponse.invalid(
                        "The certificate is not yet approved by the issuing organization and is therefore not valid."
                );
            }

            if (cert.get().getStatus() == Certificate.Status.REVOKED
                    || blockchainCertificate.getStatus() == Certificate.Status.REVOKED) {
                return CertificateVerificationResponse.invalid(
                        "The certificate has been officially revoked by the issuing organization. Reason: "
                                + cert.get().getRevocationReason()
                );
            }

            String newHash=pdfHashUtil.sha256(Path.of(cert.get().getPdfPath()));


            if (    !newHash.equals(blockchainCertificate.getHash()) ||
                    !newHash.equals(cert.get().getMetadataHashSha256()) ) {

                return CertificateVerificationResponse.invalid(
                        "The certificate failed integrity verification and may have been altered or tampered."
                );
            }

        } catch (FabricGatewayException e) {
            if ("FABRIC_CERTIFICATE_NOT_FOUND".equals(e.getErrorCode())) {
                return CertificateVerificationResponse.invalid(
                        "The certificate could not be verified as no matching record was found in the system."
                );
            }
                throw e; // Rethrow other unexpected exceptions
        }





        PdfVerificationResult pdfResult =
                pdfVerificationService.verify(cert.get().getPdfPath());

        if (!pdfResult.isValid()) {
            return CertificateVerificationResponse.invalid(pdfResult.getMessage());
        }

        return CertificateVerificationResponse.verified(cert.get(), pdfResult);
    }
}
