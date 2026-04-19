package com.Learningsite.learningsite.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    // ------------------- SIGNING KEY -------------------
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }


    // ------------------- GENERATE TOKEN -------------------
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // EMAIL stored here
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    // ------------------- EXTRACT EMAIL -------------------
    public String extractEmail(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject(); // email
        } catch (ExpiredJwtException ex) {
            throw new RuntimeException("JWT expired");
        } catch (JwtException ex) {
            throw new RuntimeException("Invalid JWT");
        }
    }


    // ------------------- VALIDATE TOKEN -------------------
    public boolean validate(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException ex) {
            return false;
        }
    }


    // ------------------- extractUsername -------------------
    // SAME AS extractEmail (Spring Security calls this)
    public String extractUsername(String token) {
        return extractEmail(token);
    }
}
