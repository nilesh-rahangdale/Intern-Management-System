package com.niyora.Cert_Gen_Backend.Services.certificate.signing;

import org.apache.pdfbox.pdmodel.interactive.digitalsignature.SignatureInterface;
import org.bouncycastle.asn1.*;
import org.bouncycastle.asn1.cms.*;
import org.bouncycastle.asn1.pkcs.PKCSObjectIdentifiers;
import org.bouncycastle.cert.jcajce.JcaCertStore;
import org.bouncycastle.cms.*;
import org.bouncycastle.cms.jcajce.*;
import org.bouncycastle.operator.*;
import org.bouncycastle.operator.jcajce.*;
import org.bouncycastle.tsp.*;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.Store;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.*;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.*;

public class PdfBoxSignatureWithTSA implements SignatureInterface {

    private final PrivateKey privateKey;
    private final Certificate[] chain;

    private static final String TSA_URL = "http://timestamp.digicert.com";

    static {
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    public PdfBoxSignatureWithTSA(PrivateKey privateKey, Certificate[] chain) {
        this.privateKey = privateKey;
        this.chain = chain;
    }

    @Override
    public byte[] sign(InputStream content) throws IOException {
        try {
            CMSSignedData signedData = createSignature(content);

            return addTimestamp(signedData);

        } catch (Exception e) {
            throw new IOException("Error while signing PDF", e);
        }
    }

    // ================= SIGNATURE =================

    private CMSSignedData createSignature(InputStream content) throws Exception {

        List<Certificate> certList = Arrays.asList(chain);
        Store<?> certStore = new JcaCertStore(certList);

        CMSSignedDataGenerator generator = new CMSSignedDataGenerator();

        X509Certificate cert = (X509Certificate) chain[0];

        ContentSigner contentSigner = new JcaContentSignerBuilder("SHA256withRSA")
                .build(privateKey);

        DigestCalculatorProvider digestProvider =
                new JcaDigestCalculatorProviderBuilder().build();

        SignerInfoGenerator signerInfoGenerator =
                new JcaSignerInfoGeneratorBuilder(digestProvider)
                        .build(contentSigner, cert);

        generator.addSignerInfoGenerator(signerInfoGenerator);
        generator.addCertificates(certStore);

        CMSTypedData cmsData = new CMSProcessableByteArray(content.readAllBytes());

        return generator.generate(cmsData, false);
    }

    // ================= TSA =================

    private byte[] addTimestamp(CMSSignedData signedData) throws Exception {

        // 1. Create timestamp request
        TimeStampRequestGenerator tsReqGen = new TimeStampRequestGenerator();
        tsReqGen.setCertReq(true);

        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(signedData.getEncoded());

        TimeStampRequest request =
                tsReqGen.generate(TSPAlgorithms.SHA256, digest);

        // 2. Call TSA
        byte[] responseBytes = callTSA(request.getEncoded());

        TimeStampResponse response = new TimeStampResponse(responseBytes);
        response.validate(request);

        TimeStampToken tsToken = response.getTimeStampToken();

        if (tsToken == null) {
            throw new IllegalStateException("TSA token is null");
        }

        // 3. Attach timestamp token
        SignerInformation signerInfo =
                signedData.getSignerInfos().getSigners().iterator().next();

        AttributeTable unsignedAttrs = signerInfo.getUnsignedAttributes();

        ASN1EncodableVector vector =
                unsignedAttrs != null
                        ? unsignedAttrs.toASN1EncodableVector()
                        : new ASN1EncodableVector();

        Attribute timeStampAttr = new Attribute(
                PKCSObjectIdentifiers.id_aa_signatureTimeStampToken,
                new DERSet(ASN1Primitive.fromByteArray(tsToken.getEncoded()))
        );

        vector.add(timeStampAttr);

        SignerInformation newSignerInfo =
                SignerInformation.replaceUnsignedAttributes(
                        signerInfo,
                        new AttributeTable(vector)
                );

        CMSSignedData newSignedData =
                CMSSignedData.replaceSigners(
                        signedData,
                        new SignerInformationStore(newSignerInfo)
                );

        return newSignedData.getEncoded();
    }

    // ================= TSA CALL =================

    private byte[] callTSA(byte[] requestBytes) throws IOException {

        URL url = new URL(TSA_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/timestamp-query");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(10000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBytes);
        }

        if (conn.getResponseCode() != 200) {
            throw new IOException("TSA Error: HTTP " + conn.getResponseCode());
        }

        try (InputStream is = conn.getInputStream()) {
            return is.readAllBytes();
        }
    }
}