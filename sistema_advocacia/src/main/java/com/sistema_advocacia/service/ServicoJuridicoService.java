package com.sistema_advocacia.service;

import com.sistema_advocacia.model.ServicoJuridico;
import com.sistema_advocacia.repository.ServicoJuridicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServicoJuridicoService {

    private final ServicoJuridicoRepository servicoJuridicoRepository;

    public ServicoJuridicoService(ServicoJuridicoRepository servicoJuridicoRepository) {
        this.servicoJuridicoRepository = servicoJuridicoRepository;
    }

    public List<ServicoJuridico> listarTodos() {
        return servicoJuridicoRepository.findAll();
    }

    public Optional<ServicoJuridico> buscarPorId(Long id) {
        return servicoJuridicoRepository.findById(id);
    }

    public ServicoJuridico salvarServico(ServicoJuridico servicoJuridico) {
        return servicoJuridicoRepository.save(servicoJuridico);
    }

    public void deletarServico(Long id) {
        servicoJuridicoRepository.deleteById(id);
    }
}