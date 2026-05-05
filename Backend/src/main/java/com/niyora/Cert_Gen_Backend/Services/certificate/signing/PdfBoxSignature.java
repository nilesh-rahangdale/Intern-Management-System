package com.niyora.Cert_Gen_Backend.Services.certificate.signing;

import org.apache.pdfbox.pdmodel.interactive.digitalsignature.SignatureInterface;
import org.bouncycastle.cert.jcajce.JcaCertStore;
import org.bouncycastle.cms.CMSProcessableByteArray;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.CMSSignedDataGenerator;
import org.bouncycastle.cms.jcajce.JcaSignerInfoGeneratorBuilder;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.operator.jcajce.JcaDigestCalculatorProviderBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.security.PrivateKey;
import java.security.Security;
import java.security.cert.X509Certificate;
import java.util.Arrays;

public class PdfBoxSignature implements SignatureInterface {

    private final PrivateKey privateKey;
    private final X509Certificate[] certificateChain;

    public PdfBoxSignature(
            PrivateKey privateKey,
            X509Certificate[] certificateChain
    ) {
        this.privateKey = privateKey;
        this.certificateChain = certificateChain;
        Security.addProvider(new BouncyCastleProvider());
    }

    @Override
    public byte[] sign(InputStream content) throws IOException {

        try {
            byte[] data = content.readAllBytes();

            CMSSignedDataGenerator generator = new CMSSignedDataGenerator();

            ContentSigner contentSigner =
                    new JcaContentSignerBuilder("SHA256withRSA")
                            .setProvider("BC")
                            .build(privateKey);

            generator.addSignerInfoGenerator(
                    new JcaSignerInfoGeneratorBuilder(
                            new JcaDigestCalculatorProviderBuilder()
                                    .setProvider("BC")
                                    .build()
                    ).build(contentSigner, certificateChain[0])
            );

            generator.addCertificates(
                    new JcaCertStore(Arrays.asList(certificateChain))
            );

            CMSSignedData signedData =
                    generator.generate(
                            new CMSProcessableByteArray(data),
                            false
                    );

            return signedData.getEncoded();

        } catch (Exception e) {
            throw new IOException("PDF signing failed", e);
        }
    }
}
