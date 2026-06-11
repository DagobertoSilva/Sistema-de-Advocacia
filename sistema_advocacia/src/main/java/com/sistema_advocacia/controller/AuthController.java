package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Usuario;
import com.sistema_advocacia.repository.UsuarioRepository;
import com.sistema_advocacia.security.CryptoService;
import com.sistema_advocacia.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CryptoService cryptoService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String senate = loginData.get("senha");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByLogin(email);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            if (cryptoService.validarSenha(senate, usuario.getSenha())) {
                
                String token = jwtService.gerarToken(usuario.getLogin());

                Map<String, Object> resposta = new HashMap<>();
                resposta.put("token", token);
                resposta.put("login", usuario.getLogin());

                return ResponseEntity.ok(resposta);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("erro", "E-mail ou senha inválidos"));
    }
}