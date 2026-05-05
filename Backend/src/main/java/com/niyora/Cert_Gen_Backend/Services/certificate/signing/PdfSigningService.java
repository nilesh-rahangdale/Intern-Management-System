package com.niyora.Cert_Gen_Backend.Services.certificate.signing;

import com.niyora.Cert_Gen_Backend.DTOs.certificate.CertificateResponseDTO;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import com.niyora.Cert_Gen_Backend.Entities.digitalSignature.DigitalSignature;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Repositories.CertificateRepository;
import com.niyora.Cert_Gen_Backend.Repositories.DigitalSignatureRepository;
import com.niyora.Cert_Gen_Backend.Services.certificate.CertificateService;
import com.niyora.Cert_Gen_Backend.Services.utils.hashing.PdfHashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.SignatureOptions;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Path;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Calendar;

//
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDSignatureField;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationWidget;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAppearanceDictionary;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAppearanceStream;


import javax.naming.ldap.LdapName;
import javax.naming.ldap.Rdn;
import javax.security.auth.x500.X500Principal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfSigningService {

    private final CertificateRepository certificateRepository;
    private final DigitalSignatureRepository digitalSignatureRepository;
    private final KeyStoreService keyStoreService;
    private final CertificateService certificateService;
    private final PdfHashUtil pdfHashUtil;

    public CertificateResponseDTO signCertificate(String certificateId, User director) throws Exception {

        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found"));

        if (certificate.getStatus() != Certificate.Status.GENERATED) {
            throw new IllegalStateException("Certificate not eligible for signing");
        }

        PrivateKey privateKey = keyStoreService.getPrivateKey();
        X509Certificate[] chain =
                Arrays.stream(keyStoreService.getCertificateChain())
                        .map(c -> (X509Certificate) c)
                        .toArray(X509Certificate[]::new);

        Path src = Path.of(certificate.getPdfPath());
        Path dest = Path.of(
                certificate.getPdfPath()
                        .replace(".pdf", "_SIGNED.pdf")
//                        .replace("unsigned", "signed") // Signed Certificate path
        );

        signPdf(src, dest, privateKey, chain, director);

        certificate.setPdfPath(dest.toString());
        certificate.setStatus(Certificate.Status.SIGNED);
        certificate.setMetadataHashSha256(pdfHashUtil.sha256(dest));

        DigitalSignature ds = new DigitalSignature();
        ds.setCertificate(certificate);
        ds.setSignerName(director.getFullName());
        ds.setSignerRole(director.getRoles().toString());
        ds.setSignatureAlgorithm("SHA256withRSA");
        ds.setCertificateChainPath("PKCS12 keystore");
        ds.setSignedAt(LocalDateTime.now());

        ds=digitalSignatureRepository.save(ds);

        certificate.setDigitalSignature(ds);

        certificate=certificateRepository.save(certificate);

        return certificateService.mapToResponseDTO(certificate);
    }

    private void signPdf(
            Path src,
            Path dest,
            PrivateKey privateKey,
            X509Certificate[] chain,
            User director
    ) throws Exception {

        X509Certificate signerCert = chain[0];

        try (PDDocument document = PDDocument.load(src.toFile());
             FileOutputStream fos = new FileOutputStream(dest.toFile())) {

            String signerName = getField(signerCert, "CN");
            String organization = getField(signerCert, "O");
            String organizationalUnit = getField(signerCert, "OU");
            String locality = getField(signerCert, "L");
            String state = getField(signerCert, "ST");
            String country = getField(signerCert, "C");

            PDSignature signature = new PDSignature();
            signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
            signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);
            signature.setName(signerName);
            signature.setReason("Certificate Approval");
            signature.setLocation( organizationalUnit + ", " + organization + ", " + state + ", " + country);
            signature.setSignDate(Calendar.getInstance());

            SignatureOptions signatureOptions = createVisibleSignature(document, signature);
            document.addSignature(
                    signature,
                    new PdfBoxSignature(privateKey, chain),
                    signatureOptions
            );

            document.saveIncremental(fos);
        }
    }

    private SignatureOptions createVisibleSignature(
            PDDocument document,
            PDSignature signature
    ) throws IOException {

        PDPage firstPage = document.getPage(0);
        PDRectangle pageRect = firstPage.getMediaBox();

        PDRectangle signatureRect = new PDRectangle(
                pageRect.getWidth() - 200,
                50,
                180,
                70
        );

        SignatureOptions options = new SignatureOptions();
        options.setPreferredSignatureSize(SignatureOptions.DEFAULT_SIGNATURE_SIZE * 4);
        options.setVisualSignature(
                createVisualSignatureTemplate(document, signatureRect, signature)
        );
        options.setPage(0);

        return options;
    }

    private InputStream createVisualSignatureTemplate(
            PDDocument srcDoc,
            PDRectangle rect,
            PDSignature signature
    ) throws IOException {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (PDDocument doc = new PDDocument()) {

            PDPage page = new PDPage(srcDoc.getPage(0).getMediaBox());
            doc.addPage(page);

            PDAcroForm acroForm = new PDAcroForm(doc);
            doc.getDocumentCatalog().setAcroForm(acroForm);

            acroForm.setSignaturesExist(true);
            acroForm.setAppendOnly(true);

            PDResources resources = new PDResources();
            acroForm.setDefaultResources(resources);
            acroForm.setDefaultAppearance("/Helv 10 Tf 0 g");

            PDSignatureField signatureField = new PDSignatureField(acroForm);
            acroForm.getFields().add(signatureField);
            signatureField.setValue(new PDSignature());

            PDAnnotationWidget widget = signatureField.getWidgets().get(0);
            widget.setRectangle(rect);
            widget.setPage(page);
            page.getAnnotations().add(widget);

            PDAppearanceStream appearanceStream = new PDAppearanceStream(doc);
            appearanceStream.setBBox(new PDRectangle(rect.getWidth(), rect.getHeight()));
            appearanceStream.setResources(new PDResources());

            PDAppearanceDictionary appearanceDictionary = new PDAppearanceDictionary();
            appearanceDictionary.setNormalAppearance(appearanceStream);
            widget.setAppearance(appearanceDictionary);

            // ===== Dynamic values =====
            String signer = signature.getName();
            String reason = signature.getReason();
            String location = signature.getLocation();

            String date = signature.getSignDate() != null
                    ? new java.text.SimpleDateFormat("yyyy.MM.dd HH:mm:ss z")
                    .format(signature.getSignDate().getTime())
                    : "N/A";

            try (PDPageContentStream cs = new PDPageContentStream(doc, appearanceStream)) {

                float marginLeft = 6;
                float startY = rect.getHeight() - 14;
                float leading = 11;

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 8);
                cs.newLineAtOffset(marginLeft, startY - leading);

                cs.showText("Digitally signed by " + signer);
                cs.newLineAtOffset(0, -leading);

                cs.showText("Date: " + date);
                cs.newLineAtOffset(0, -leading);

                cs.showText("Reason: " + reason);
                cs.newLineAtOffset(0, -leading);

                cs.showText("Location: " + location);
                cs.endText();
            }

            doc.save(baos);
        }

        return new ByteArrayInputStream(baos.toByteArray());
    }

    private String getField(X509Certificate cert, String field) {
        try {
            String dn = cert.getSubjectX500Principal()
                    .getName(X500Principal.RFC2253);

            LdapName ldapDN = new LdapName(dn);

            for (Rdn rdn : ldapDN.getRdns()) {
                if (rdn.getType().equalsIgnoreCase(field)) {
                    return rdn.getValue().toString();
                }
            }
        } catch (Exception e) {
            // Log error
            log.info("Error extracting field {} from certificate: {}", field, e.getMessage());

        }
        return null;
    }






}

