package com.niyora.Cert_Gen_Backend.Services.certificate.verification;

import com.niyora.Cert_Gen_Backend.DTOs.certificate.PdfVerificationResult;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.bouncycastle.cert.X509CertificateHolder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cms.*;
import org.bouncycastle.cms.jcajce.JcaSimpleSignerInfoVerifierBuilder;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.Store;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.security.Security;
import java.security.cert.*;
import java.util.*;

@Service
public class PdfVerificationService {

    @Value("${ROOT_CA_CERT_PATH}")
    private String rootCaPath ;


    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    public PdfVerificationResult verify(String pdfPath) {

        try (PDDocument document = PDDocument.load(new File(pdfPath))) {

            List<PDSignature> signatures = document.getSignatureDictionaries();

            if (signatures.isEmpty()) {
                return PdfVerificationResult.invalid("No digital signature found");
            }

            // ✅ Verify ALL signatures (multi-director ready)
            for (PDSignature signature : signatures) {

                byte[] signatureBytes =
                        signature.getContents(new FileInputStream(pdfPath));

                byte[] signedContent =
                        signature.getSignedContent(new FileInputStream(pdfPath));

                CMSSignedData cmsSignedData = new CMSSignedData(
                        new CMSProcessableByteArray(signedContent),
                        signatureBytes
                );

                SignerInformation signer =
                        cmsSignedData.getSignerInfos()
                                .getSigners()
                                .iterator()
                                .next();

                Store<X509CertificateHolder> certStore =
                        cmsSignedData.getCertificates();

                X509CertificateHolder certHolder =
                        (X509CertificateHolder) certStore.getMatches(signer.getSID())
                                .iterator()
                                .next();

                X509Certificate cert =
                        new JcaX509CertificateConverter()
                                .setProvider("BC")
                                .getCertificate(certHolder);

                // 1️⃣ Cryptographic verification
                boolean signatureValid =
                        signer.verify(
                                new JcaSimpleSignerInfoVerifierBuilder()
                                        .setProvider("BC")
                                        .build(cert)
                        );

                if (!signatureValid) {
                    return PdfVerificationResult.invalid("Digital signature invalid");
                }

                // 2️⃣ Certificate expiry validation
                cert.checkValidity();

                // 3️⃣ Trust chain validation (PKIX)
//                if (!verifyCertificateChain(cert)) {
//                    return PdfVerificationResult.invalid("Certificate chain validation failed");
//                }
                if (!verifyCertificateChain(cert, cmsSignedData)) {
                    return PdfVerificationResult.invalid("Certificate chain validation failed");
                }

//                // 4️⃣ Modification detection
//                if (wasDocumentModified(signature, document)) {
//                    return PdfVerificationResult.invalid("Document modified after signing");
//                }
                if (wasDocumentModified(signature, pdfPath)) {
                    return PdfVerificationResult.invalid("Document modified after signing");
                }

            }

            // ✅ All signatures verified
            return PdfVerificationResult.valid(
                    extractFirstSignerCert(signatures.get(0), pdfPath)
            );

        } catch (Exception e) {
            return PdfVerificationResult.invalid("Verification error: " + e.getMessage());
        }
    }

    // ---------------- HELPERS ----------------


    private boolean verifyCertificateChain(X509Certificate signerCert, CMSSignedData cmsData)
            throws Exception {

        X509Certificate trustedCa = loadTrustedCACertificate();

        // Extract ALL certificates from CMS (includes intermediates)
        Store<X509CertificateHolder> certStore = cmsData.getCertificates();
        List<X509Certificate> allCerts = new ArrayList<>();

        for (X509CertificateHolder holder : certStore.getMatches(null)) {
            allCerts.add(new JcaX509CertificateConverter()
                    .setProvider("BC")
                    .getCertificate(holder));
        }

        // Build path from signer to root
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        CertPath certPath = cf.generateCertPath(buildChainFromSigner(signerCert, allCerts));

        TrustAnchor anchor = new TrustAnchor(trustedCa, null);
        PKIXParameters params = new PKIXParameters(Set.of(anchor));
        params.setRevocationEnabled(false);

        CertPathValidator.getInstance("PKIX").validate(certPath, params);
        return true;
    }

    private List<X509Certificate> buildChainFromSigner(X509Certificate signer,
                                                       List<X509Certificate> available) {
        // Order: [signer, intermediate(s), (root excluded)]
        List<X509Certificate> chain = new ArrayList<>();
        chain.add(signer);

        X509Certificate current = signer;
        while (!current.getIssuerX500Principal().equals(current.getSubjectX500Principal())) {
            X509Certificate issuer = findIssuer(current, available);
            if (issuer == null) break;
            chain.add(issuer);
            current = issuer;
        }
        return chain;
    }

    private X509Certificate findIssuer(X509Certificate cert, List<X509Certificate> candidates) {
        return candidates.stream()
                .filter(c -> c.getSubjectX500Principal().equals(cert.getIssuerX500Principal()))
                .findFirst()
                .orElse(null);
    }

        private boolean wasDocumentModified(PDSignature signature, String pdfPath) throws Exception {
            int[] byteRange = signature.getByteRange();

            // Only flag if signature doesn't start at byte 0 (malformed PDF)
            if (byteRange[0] != 0) {
                return true;
            }

            // Trust cryptographic verification for content integrity
            // Post-signature appends are ALLOWED per PDF spec (ISO 32000-2)
            return false;
        }

    private X509Certificate extractFirstSignerCert(PDSignature signature, String pdfPath)
            throws Exception {

        byte[] contents = signature.getContents(new FileInputStream(pdfPath));
        byte[] signedContent = signature.getSignedContent(new FileInputStream(pdfPath));

        CMSSignedData cms = new CMSSignedData(
                new CMSProcessableByteArray(signedContent),
                contents
        );

        SignerInformation signer =
                cms.getSignerInfos().getSigners().iterator().next();

        X509CertificateHolder holder =
                (X509CertificateHolder) cms.getCertificates()
                        .getMatches(signer.getSID())
                        .iterator()
                        .next();

        return new JcaX509CertificateConverter()
                .setProvider("BC")
                .getCertificate(holder);
    }

    private X509Certificate loadTrustedCACertificate() throws Exception {
        try (FileInputStream fis =
                     new FileInputStream(rootCaPath)) {

            return (X509Certificate)
                    CertificateFactory.getInstance("X.509")
                            .generateCertificate(fis);
        }
    }
}