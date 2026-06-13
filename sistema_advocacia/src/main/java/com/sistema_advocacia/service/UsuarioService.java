package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Usuario;
import com.sistema_advocacia.repository.UsuarioRepository;
import com.sistema_advocacia.security.CryptoService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final CryptoService cryptoService;

    public UsuarioService(UsuarioRepository usuarioRepository, CryptoService cryptoService) {
        this.usuarioRepository = usuarioRepository;
        this.cryptoService = cryptoService;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> buscarPorLogin(String login) {
        return usuarioRepository.findByLogin(login);
    }

    public Usuario salvarUsuario(Usuario usuario) {
        if (usuario.getSenha() != null && !usuario.getSenha().isEmpty()) {
            usuario.setSenha(cryptoService.encrypt(usuario.getSenha()));
        }
        return usuarioRepository.save(usuario);
    }

    public void deletarUsuario(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado para o ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}