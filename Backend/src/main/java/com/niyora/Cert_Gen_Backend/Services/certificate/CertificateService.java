package com.niyora.Cert_Gen_Backend.Services.certificate;


import com.niyora.Cert_Gen_Backend.Controllers.certificate.access.CertificateController;
import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateResponseDTO;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import com.niyora.Cert_Gen_Backend.Exception.CertificateNotFoundException;
import com.niyora.Cert_Gen_Backend.Exception.InternNotFoundException;
import com.niyora.Cert_Gen_Backend.Repositories.CertificateRepository;
import com.niyora.Cert_Gen_Backend.Repositories.InternRepo;
import com.niyora.Cert_Gen_Backend.Services.intern.InternService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
public class CertificateService {
    
    private final CertificateRepository certificateRepository;
    private final InternService internService;
    private final InternRepo internRepo;
    
    /**
     * Get certificate by certificate ID
     * @param certificateId The certificate ID
     * @return CertificateResponseDTO
     * @throws RuntimeException if certificate not found
     */
    public CertificateResponseDTO getCertificateByCertificateId(String certificateId) {
        Certificate certificate = certificateRepository.findByCertificateId(certificateId)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found with ID: " + certificateId));
        
        return mapToResponseDTO(certificate);
    }
    
    /**
     * Get certificates by intern ID
     *
     * @param internId The intern ID
     * @param status The certificate status to filter by (optional, can be null to get all certificates regardless of status)
     * @return CertificateResponseDTO
     * @throws RuntimeException if certificate not found
     */
    public List<CertificateResponseDTO> getCertificatesForInternId(String internId, Certificate.Status status) {

        if (internId == null || internId.trim().isEmpty()) {
            throw new IllegalArgumentException("Intern ID must not be null or empty");
        }
        if(!internRepo.existsById(internId)) {
            throw new InternNotFoundException("Intern not found with ID: " + internId);
        }

        List<Certificate> certificates=new ArrayList<>();

        if(status == null){
            certificates=certificateRepository.findByIntern_InternId(internId);
        }else{
            certificates=certificateRepository.findByIntern_InternIdAndStatus(internId, status);
        }

        List<CertificateResponseDTO> certificateDtos= certificates.stream()
                .map(this::mapToResponseDTO)
                .toList();

        return certificateDtos;
    }

    public List<CertificateResponseDTO> getAllCertificates(Certificate.Status status) {
        List<Certificate> certificates;

        if (status == null) {
            certificates = certificateRepository.findAll();
        } else {
            certificates = certificateRepository.findByStatus(status);
        }

        return certificates.stream()
                .map(this::mapToResponseDTO)
                .collect(toList());
    }


    /**
     * Map Certificate entity to CertificateResponseDTO
     * @param certificate The certificate entity
     * @return CertificateResponseDTO
     */
    public CertificateResponseDTO mapToResponseDTO(Certificate certificate) {
        return CertificateResponseDTO.builder()
                .certificateId(certificate.getCertificateId())
                .certificateType(certificate.getCertificateType().name())
                .issueDate(certificate.getIssueDate())
                .issuedBy(certificate.getIssuedBy().getFullName())
                .status(certificate.getStatus().name())
                .pdfPath(certificate.getPdfPath())
                .internId(certificate.getIntern().getInternId())
                .internName(certificate.getIntern().getFullName())
                .metadataHashSha256(certificate.getMetadataHashSha256())
                .qrMetadata(certificate.getQrMetadata() != null ? mapQRMetadata(certificate) : null)
                .digitalSignature(mapDigitalSignature(certificate))
                .isUploaded(certificate.isUploaded())
                .build();
    }
    
    /**
     * Get certificate PDF file by certificate ID
     * @param certificateId The certificate ID
     * @return Resource containing the PDF file
     * @throws IOException if file not found or cannot be read
     */
    public Resource getCertificatePdfByCertificateId(String certificateId) throws IOException {
        Certificate certificate = certificateRepository.findByCertificateId(certificateId)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found with ID: " + certificateId));
        
        return loadPdfResource(certificate.getPdfPath(), certificateId);
    }




    /**
     * Load PDF file as a Resource
     * @param pdfPath The path to the PDF file
     * @param certificateId The certificate ID for error messages
     * @return Resource containing the PDF file
     * @throws IOException if file not found or cannot be read
     */
    private Resource loadPdfResource(String pdfPath, String certificateId) throws IOException {
        if (pdfPath == null || pdfPath.trim().isEmpty()) {
            throw new IllegalStateException("PDF path is not set for certificate: " + certificateId);
        }

        Path filePath = Paths.get(pdfPath);
        File pdfFile = filePath.toFile();

        if (!pdfFile.exists()) {
            throw new IOException("Certificate PDF file not found at path: " + pdfPath + " for certificate: " + certificateId);
        }

        if (!pdfFile.canRead()) {
            throw new IOException("Cannot read certificate PDF file at path: " + pdfPath + " for certificate: " + certificateId);
        }

        return new FileSystemResource(pdfFile);
    }

    /**
     * Map QRMetadata to DTO
     * @param certificate The certificate entity
     * @return QRMetadataDTO or null if not present
     */
    private CertificateResponseDTO.QRMetadataDTO mapQRMetadata(Certificate certificate) {
        if (certificate.getQrMetadata() == null) {
            return null;
        }
        return CertificateResponseDTO.QRMetadataDTO.builder()
                .id(certificate.getQrMetadata().getId())
                .verificationUrl(certificate.getQrMetadata().getVerificationUrl())
                .qrPayloadHash(certificate.getQrMetadata().getQrPayloadHash())
                .build();
    }
    
    /**
     * Map DigitalSignature to DTO
     * @param certificate The certificate entity
     * @return DigitalSignatureDTO or null if not present
     */
    private CertificateResponseDTO.DigitalSignatureDTO mapDigitalSignature(Certificate certificate) {
        if (certificate.getDigitalSignature() == null) {
            return null;
        }
        return CertificateResponseDTO.DigitalSignatureDTO.builder()
                .id(certificate.getDigitalSignature().getId())
                .signerName(certificate.getDigitalSignature().getSignerName())
                .signerRole(certificate.getDigitalSignature().getSignerRole())
                .signatureAlgorithm(certificate.getDigitalSignature().getSignatureAlgorithm())
                .certificateChainPath(certificate.getDigitalSignature().getCertificateChainPath())
                .signedAt(certificate.getDigitalSignature().getSignedAt())
                .build();
    }


}
