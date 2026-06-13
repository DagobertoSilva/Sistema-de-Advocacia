package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Usuario;
import com.sistema_advocacia.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> loginRequest) {
        String login = loginRequest.get("login");
        String senha = loginRequest.get("senha");

        try {
            String token = authService.autenticar(login, senha);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("tipo", "Bearer");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> erroResponse = new HashMap<>();
            erroResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erroResponse);
        }
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario novoUsuario = authService.registrar(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
        } catch (RuntimeException e) {
            Map<String, String> erroResponse = new HashMap<>();
            erroResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erroResponse);
        }
    }
}