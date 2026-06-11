package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Usuario;
import com.sistema_advocacia.repository.UsuarioRepository;
import com.sistema_advocacia.security.CryptoService;
import com.sistema_advocacia.security.JwtService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final CryptoService cryptoService;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, CryptoService cryptoService, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.cryptoService = cryptoService;
        this.jwtService = jwtService;
    }

    public String autenticar(String login, String senha) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByLogin(login);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (cryptoService.matches(senha, usuario.getSenha())) {
                return jwtService.generateToken(usuario.getLogin());
            }
        }
        
        throw new RuntimeException("Credenciais inválidas");
    }

    public Usuario registrar(Usuario usuario) {
        if (usuarioRepository.existsByLogin(usuario.getLogin())) {
            throw new RuntimeException("Login já está em uso");
        }

        if (usuario.getPerfilAcesso() == null) {
            throw new RuntimeException("É necessário associar um perfil de acesso ao usuário.");
        }

        usuario.setSenha(cryptoService.encrypt(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }
}