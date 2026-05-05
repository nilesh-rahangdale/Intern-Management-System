package com.niyora.Cert_Gen_Backend.Services.certificate.ceritificateGenerator;

import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateRevocationResponse;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.blockchain.BlockchainCertDto;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import com.niyora.Cert_Gen_Backend.Entities.intern.Intern;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Exception.CertificateNotFoundException;
import com.niyora.Cert_Gen_Backend.Exception.FabricGatewayException;
import com.niyora.Cert_Gen_Backend.Exception.InternNotFoundException;
import com.niyora.Cert_Gen_Backend.Repositories.CertificateRepository;
import com.niyora.Cert_Gen_Backend.Repositories.InternRepo;
import com.niyora.Cert_Gen_Backend.Services.certificate.blockchain.BlockchainCertificateService;
import com.niyora.Cert_Gen_Backend.Services.certificate.qr.CertificateQrService;
import com.niyora.Cert_Gen_Backend.Services.utils.hashing.PdfHashUtil;
import com.niyora.Cert_Gen_Backend.Services.utils.idGenerator.IdGeneratorService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.time.LocalDate;
import java.time.Year;
import java.util.Arrays;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class HrCertificateService {

    private static final int BLOCKCHAIN_MAX_RETRIES = 3;
    private static final long BLOCKCHAIN_RETRY_DELAY_MS = 1000L;

    private final InternRepo internRepo;
    private final CertificateRepository certificateRepo;
    private final IdGeneratorService idGeneratorService;
    private final PdfHashUtil pdfHashUtil;
    private final CertificatePdfGeneratorService pdfGenerator;
    private final CertificateQrService certificateQrService;
    private final BlockchainCertificateService blockchainCertificateService;
    private final CertificateRepository certificateRepository;

    public Intern validateInternForCertificate(String internId) {
        if (internId == null || internId.trim().isEmpty()) {
            throw new IllegalArgumentException("Intern ID must not be null or empty");
        }

        Intern intern = internRepo.findByInternId(internId).orElseThrow(
                ()-> new InternNotFoundException("Intern not found for internId: " + internId)
        );

        if (intern.getStatus() != Intern.Status.COMPLETED) {
            throw new IllegalStateException(
                    "Internship not completed. Certificate cannot be generated."
            );
        }

        return intern;
    }

    private Certificate.CertificateType validateAndParseCertificateType(String certificateType) {
        if (certificateType == null || certificateType.trim().isEmpty()) {
            throw new IllegalArgumentException("Certificate type must not be null or empty");
        }

        try {
            return Certificate.CertificateType.valueOf(certificateType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid certificate type: " + certificateType +
                    ". Valid types are: " + Arrays.toString(Certificate.CertificateType.values())
            );
        }
    }

    @Transactional
    public Certificate generateCertificate(String internId, String certificateType, User hr) {
        log.info("Starting certificate generation for intern: {} with type: {}", internId, certificateType);

        Intern intern = validateInternForCertificate(internId);
        Certificate.CertificateType type = validateAndParseCertificateType(certificateType);

        Certificate certificate = new Certificate();
        certificate.setCertificateId(idGeneratorService.generateCertificateId(Year.now().getValue()));
        certificate.setCertificateType(type);
        certificate.setIssueDate(LocalDate.now());
        certificate.setStatus(Certificate.Status.GENERATED);
        certificate.setIntern(intern);
        certificate.setIssuedBy(hr);

        try {
            Path pdfPath = pdfGenerator.generateUnsignedPdf(certificate);
            certificate.setPdfPath(pdfPath.toString());
            certificate.setMetadataHashSha256(pdfHashUtil.sha256(pdfPath));

            Certificate savedCertificate = certificateRepo.save(certificate);

            // Ensure final stored PDF (with QR) is what gets hashed and uploaded to blockchain.
            certificateQrService.embedQrIntoCertificate(savedCertificate.getCertificateId());

            Certificate qrUpdatedCertificate = certificateRepo.findById(savedCertificate.getCertificateId())
                    .orElseThrow(() -> new CertificateNotFoundException("Certificate not found after QR embedding"));

            qrUpdatedCertificate.setMetadataHashSha256(
                    pdfHashUtil.sha256(Path.of(qrUpdatedCertificate.getPdfPath()))
            );
            qrUpdatedCertificate = certificateRepo.save(qrUpdatedCertificate);

            log.info("Certificate generated certId={}",
                    qrUpdatedCertificate.getCertificateId());

            return qrUpdatedCertificate;

        } catch (Exception e) {
            log.error("Failed to generate certificate for intern {}: {}", internId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate certificate PDF: " + e.getMessage(), e);
        }
    }

    @Transactional
    public BlockchainCertDto uploadCertificateToBlockchain(@NotBlank(message = "Certificate ID is required") String certificateId,@NotBlank(message = "Blockchain Identity is required") String blockChainIdentity) {
//        check existance
        Certificate signedCertificate=certificateRepository.findByCertificateId(certificateId).orElseThrow(
                ()-> new CertificateNotFoundException("Certificate not found for certificateId: " + certificateId)
        );
//        weather signed
        if (signedCertificate.getStatus() != Certificate.Status.SIGNED) {
            throw new IllegalStateException("Certificate is not signed");
        }
//        update issue date
        signedCertificate.setIssueDate(LocalDate.now());
        signedCertificate.setUploaded(true);

        Certificate finalSignedCertificate=certificateRepository.save(signedCertificate);



        BlockchainCertDto blockchainResult = executeWithBlockchainRetry(
                () -> blockchainCertificateService.createCertificate(
                        finalSignedCertificate.getCertificateId(),
                        finalSignedCertificate.getIntern().getInternId(),
                        finalSignedCertificate.getIntern().getFullName(),
                        finalSignedCertificate.getMetadataHashSha256(),
                        finalSignedCertificate.getIssuedBy().getFullName(),
                        finalSignedCertificate.getDigitalSignature().getSignerName(),
                        finalSignedCertificate.getIssueDate().toString(),
                        blockChainIdentity
                ),
                "create",
                signedCertificate.getCertificateId()
        );

        return blockchainResult;
    }


    @Transactional
    public CertificateRevocationResponse revokeCertificate(@NotBlank(message = "Intern ID is required") String certificateId,@NotBlank(message = "Revocation reason is required") String revocationReason,String blockChainIdentity
    ) {
        Certificate certificate = certificateRepo.findById(certificateId)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found with ID: " + certificateId));

        if (certificate.getStatus() == Certificate.Status.REVOKED) {
            throw new IllegalStateException("Certificate is already revoked");
        }

        certificate.setStatus(Certificate.Status.REVOKED);
        certificate.setRevocationReason(revocationReason);
        Certificate revokedCertificate = certificateRepo.save(certificate);

        executeWithBlockchainRetry(
                () -> blockchainCertificateService.revokeCertificate(
                        revokedCertificate.getCertificateId(),
                        resolveBlockchainIdentity(blockChainIdentity)
                ),
                "revoke",
                revokedCertificate.getCertificateId()
        );

        return CertificateRevocationResponse.builder()
                .certificateId(revokedCertificate.getCertificateId())
                .internId(revokedCertificate.getIntern().getInternId())
                .internName(revokedCertificate.getIntern().getFullName())
                .status(revokedCertificate.getStatus().name())
                .revocationReason(revokedCertificate.getRevocationReason())
                .build();
    }


    private String resolveBlockchainIdentity(String blockChainIdentity) {
        if (blockChainIdentity == null || blockChainIdentity.isBlank()) {
            return "invalid user";
        }
        return blockChainIdentity.trim();
    }

    private <T> T executeWithBlockchainRetry(Supplier<T> action, String operation, String certificateId) {
        int attempt = 1;
        while (attempt <= BLOCKCHAIN_MAX_RETRIES) {
            try {
                return action.get();
            } catch (FabricGatewayException ex) {
                if (attempt >= BLOCKCHAIN_MAX_RETRIES) {
                    log.error("Blockchain {} failed after {} attempts for certificate {}",
                            operation, BLOCKCHAIN_MAX_RETRIES, certificateId, ex);
                    throw ex;
                }

                log.warn("Blockchain {} failed (attempt {}/{}), retrying for certificate {}. Reason: {}",
                        operation, attempt, BLOCKCHAIN_MAX_RETRIES, certificateId, ex.getMessage());

                try {
                    Thread.sleep(BLOCKCHAIN_RETRY_DELAY_MS);
                } catch (InterruptedException interruptedException) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Blockchain retry interrupted", interruptedException);
                }
                attempt++;
            }
        }

        throw new IllegalStateException("Unexpected retry flow termination for blockchain " + operation);
    }



}
