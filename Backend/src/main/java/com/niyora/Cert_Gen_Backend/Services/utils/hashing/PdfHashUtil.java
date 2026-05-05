package com.niyora.Cert_Gen_Backend.Services.utils.hashing;

import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;

@Component
public class PdfHashUtil {

    public String sha256(Path filePath) throws Exception {
        byte[] bytes = Files.readAllBytes(filePath);
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(bytes);

        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
