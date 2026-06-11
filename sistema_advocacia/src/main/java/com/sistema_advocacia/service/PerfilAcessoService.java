package com.sistema_advocacia.service;

import com.sistema_advocacia.model.PerfilAcesso;
import com.sistema_advocacia.repository.PerfilAcessoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PerfilAcessoService {

    private final PerfilAcessoRepository perfilAcessoRepository;

    public PerfilAcessoService(PerfilAcessoRepository perfilAcessoRepository) {
        this.perfilAcessoRepository = perfilAcessoRepository;
    }

    public List<PerfilAcesso> listarTodos() {
        return perfilAcessoRepository.findAll();
    }

    public Optional<PerfilAcesso> buscarPorId(Long id) {
        return perfilAcessoRepository.findById(id);
    }

    public Optional<PerfilAcesso> buscarPorNomePerfil(String nomePerfil) {
        return perfilAcessoRepository.findByNomePerfil(nomePerfil);
    }

    public PerfilAcesso salvarPerfil(PerfilAcesso perfilAcesso) {
        return perfilAcessoRepository.save(perfilAcesso);
    }

    public void deletarPerfil(Long id) {
        perfilAcessoRepository.deleteById(id);
    }
}