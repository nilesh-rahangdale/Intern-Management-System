package com.niyora.Cert_Gen_Backend.Services.auth;

import com.niyora.Cert_Gen_Backend.Entities.users.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${SECRET_KEY}")
    private String secretKey;

    // Generate the signing key from the Base64-encoded string
    public Key getKey() {
        byte[] decodedKey = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(decodedKey);
    }

    // ✅ Token Generation
    public String generateToken(User user) {
        if (user.getId() == null) {
            throw new RuntimeException("User ID is null in generateToken()");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());

        String token = Jwts.builder()
                .setClaims(claims)                           // set custom claims first
                .setSubject(user.getId().toString())         // set sub (subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hour
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();

        return token;
    }

    // ✅ Extract User ID (Subject) from Token
    public String extractUserId(String token) {
        try {
            String subject = extractClaim(token, Claims::getSubject);
            if (subject == null) {
                System.err.println("⚠️ Subject (userId) is null in token: " + token);
                throw new RuntimeException("Subject is null");
            }
            return subject;
        } catch (Exception e) {
            System.err.println("❌ Error extracting userId: " + e.getMessage());
            throw new RuntimeException("Error extracting userId", e);
        }
    }

    // ✅ Generic claim extractor
    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    // ✅ Parse all claims from token
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            System.err.println("❌ JWT parsing error: " + e.getMessage());
            throw new RuntimeException("Failed to extract claims from token", e);
        }
    }

    // ✅ Extract Expiration
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // ✅ Check Token Expiration
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ✅ Validate token matches the user's ID and is not expired
    public boolean isTokenValid(String token, User userDetails) {
        String userIdStr = extractUserId(token);
        Long tokenUserId = Long.parseLong(userIdStr);
        Long actualUserId = userDetails.getId();

        return actualUserId != null && tokenUserId != null &&
                actualUserId.equals(tokenUserId) && !isTokenExpired(token);
    }
}
