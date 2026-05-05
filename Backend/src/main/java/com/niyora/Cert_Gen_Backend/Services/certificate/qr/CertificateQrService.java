package com.niyora.Cert_Gen_Backend.Services.certificate.qr;


import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateResponseDTO;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import com.niyora.Cert_Gen_Backend.Entities.qrMetadata.QRMetadata;
import com.niyora.Cert_Gen_Backend.Exception.CertificateNotFoundException;
import com.niyora.Cert_Gen_Backend.Repositories.CertificateRepository;
import com.niyora.Cert_Gen_Backend.Repositories.QRMetadataRepository;
import com.niyora.Cert_Gen_Backend.Services.certificate.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.nio.file.Path;
import java.security.MessageDigest;

@Service
@RequiredArgsConstructor
public class CertificateQrService {

    private final CertificateRepository certificateRepository;
    private final QRMetadataRepository qrMetadataRepository;
    private final QrCodeService qrCodeService;
    private final PdfQrEmbedService pdfQrEmbedService;
    private final CertificateService certificateService;

    @Value("${VERIFICATION_BASE_URL}")
    private  String VERIFICATION_BASE_URL ;

    public CertificateResponseDTO embedQrIntoCertificate(String certificateId) throws Exception {

        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new CertificateNotFoundException("Certificate not found"+ certificateId));

        if ( certificate.getStatus() != Certificate.Status.GENERATED ) {
            throw new IllegalStateException("QR can only be added to GENERATED certificates");
        }

        String verificationUrl =
                VERIFICATION_BASE_URL + certificateId;

//        Path qrPath = qrCodeService.generateQr(
//                verificationUrl,
//                certificateId
//        );
//
//        Path updatedPdfPath = pdfQrEmbedService.embedQr(
//                Path.of(certificate.getPdfPath()),
//                qrPath
//        );
//
//        QRMetadata qrMetadata = new QRMetadata();
//        qrMetadata.setCertificate(certificate);
//        qrMetadata.setVerificationUrl(verificationUrl);
//        qrMetadata.setQrPayloadHash(sha256(verificationUrl));
//
//        certificate.setPdfPath(updatedPdfPath.toString());
//        certificate.setQrMetadata(qrMetadata);
//
//        qrMetadataRepository.save(qrMetadata);
//        certificate= certificateRepository.save(certificate);
//
//        return certificateService.mapToResponseDTO(certificate);

        // Generate QR image in memory
        BufferedImage qrImage = qrCodeService.generateQrImage(verificationUrl);

        // Embed QR directly without storing it locally
        Path updatedPdfPath = pdfQrEmbedService.embedQr(
                Path.of(certificate.getPdfPath()),
                qrImage
        );

        QRMetadata qrMetadata = new QRMetadata();
        qrMetadata.setCertificate(certificate);
        qrMetadata.setVerificationUrl(verificationUrl);
        qrMetadata.setQrPayloadHash(sha256(verificationUrl));

        certificate.setPdfPath(updatedPdfPath.toString());
        certificate.setQrMetadata(qrMetadata);

        qrMetadataRepository.save(qrMetadata);
        certificate = certificateRepository.save(certificate);

        return certificateService.mapToResponseDTO(certificate);


    }

    private String sha256(String data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
