package com.sistema_advocacia.service;

import com.sistema_advocacia.model.RespostaPronta;
import com.sistema_advocacia.repository.RespostaProntaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RespostaProntaService {

    private final RespostaProntaRepository respostaProntaRepository;

    public RespostaProntaService(RespostaProntaRepository respostaProntaRepository) {
        this.respostaProntaRepository = respostaProntaRepository;
    }

    public List<RespostaPronta> listarTodas() {
        return respostaProntaRepository.findAll();
    }

    public Optional<RespostaPronta> buscarPorId(Integer id) {
        return respostaProntaRepository.findById(id);
    }

    public RespostaPronta salvarRespostaPronta(RespostaPronta respostaPronta) {
        return respostaProntaRepository.save(respostaPronta);
    }

    public void deletarRespostaPronta(Integer id) {
        if (!respostaProntaRepository.existsById(id)) {
            throw new RuntimeException("Resposta pronta não encontrada para o ID: " + id);
        }
        respostaProntaRepository.deleteById(id);
    }
}