package com.niyora.Cert_Gen_Backend.Services.certificate.signing;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.PrivateKey;

@Service
public class KeyStoreService {

    @Value("${director.keystore.path}")
    private String keystorePath;

    @Value("${director.keystore.password}")
    private String keystorePassword;

    @Value("${director.keystore.alias}")
    private String keyAlias;

    private KeyStore keyStore;

    @PostConstruct
    public void init() {
        try (InputStream is = new FileInputStream(keystorePath)) {
            keyStore = KeyStore.getInstance("PKCS12");
            keyStore.load(is, keystorePassword.toCharArray());

            if (!keyStore.containsAlias(keyAlias)) {
                throw new IllegalStateException("Keystore alias not found: " + keyAlias);
            }

            if (!keyStore.isKeyEntry(keyAlias)) {
                throw new IllegalStateException("Alias is not a private key entry: " + keyAlias);
            }

        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize keystore", e);
        }
    }

    public PrivateKey getPrivateKey() {
        try {
            return (PrivateKey) keyStore.getKey(
                    keyAlias,
                    keystorePassword.toCharArray()
            );
        } catch (Exception e) {
            throw new IllegalStateException("Unable to retrieve private key", e);
        }
    }

    public java.security.cert.Certificate[] getCertificateChain() throws Exception {
        java.security.cert.Certificate[] chain =
                keyStore.getCertificateChain(keyAlias);

        if (chain == null || chain.length == 0) {
            throw new IllegalStateException("Certificate chain is missing for alias: " + keyAlias);
        }

        return chain;
    }
}
