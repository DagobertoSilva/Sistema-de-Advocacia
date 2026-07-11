package com.sistema_advocacia.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CryptoService {

    private final BCryptPasswordEncoder passwordEncoder;

    public CryptoService() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public String encrypt(String senhaPura) {
        return passwordEncoder.encode(senhaPura);
    }

    public boolean matches(String senhaPura, String senhaCriptografada) {
        return passwordEncoder.matches(senhaPura, senhaCriptografada);
    }

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("admin123"));
    }
}