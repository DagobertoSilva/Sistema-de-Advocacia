package com.sistema_advocacia.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CryptoService {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public String criptografar(String senhaPura) {
        return encoder.encode(senhaPura);
    }

    public boolean validarSenha(String senhaPura, String senhaCriptografada) {
        return encoder.matches(senhaPura, senhaCriptografada);
    }
}