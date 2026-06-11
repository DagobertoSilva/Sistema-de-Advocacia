package com.sistema_advocacia.service;

import com.sistema_advocacia.model.AtualizacaoProcessual;
import com.sistema_advocacia.repository.AtualizacaoProcessualRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AtualizacaoProcessualService {

    private final AtualizacaoProcessualRepository atualizacaoProcessualRepository;

    public AtualizacaoProcessualService(AtualizacaoProcessualRepository atualizacaoProcessualRepository) {
        this.atualizacaoProcessualRepository = atualizacaoProcessualRepository;
    }

    public List<AtualizacaoProcessual> listarTodas() {
        return atualizacaoProcessualRepository.findAll();
    }

    public Optional<AtualizacaoProcessual> buscarPorId(Long id) {
        return atualizacaoProcessualRepository.findById(id);
    }

    public List<AtualizacaoProcessual> listarPorContratoId(Long contratoId) {
        return atualizacaoProcessualRepository.findByContratoId(contratoId);
    }

    public AtualizacaoProcessual salvarAtualizacao(AtualizacaoProcessual atualizacaoProcessual) {
        if (atualizacaoProcessual.getDataAtualizacao() == null) {
            atualizacaoProcessual.setDataAtualizacao(LocalDateTime.now());
        }
        return atualizacaoProcessualRepository.save(atualizacaoProcessual);
    }

    public void deletarAtualizacao(Long id) {
        atualizacaoProcessualRepository.deleteById(id);
    }
}