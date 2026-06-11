package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Triagem;
import com.sistema_advocacia.repository.TriagemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TriagemService {

    private final TriagemRepository triagemRepository;

    public TriagemService(TriagemRepository triagemRepository) {
        this.triagemRepository = triagemRepository;
    }

    public List<Triagem> listarTodas() {
        return triagemRepository.findAll();
    }

    public Optional<Triagem> buscarPorId(Long id) {
        return triagemRepository.findById(id);
    }

    public Triagem salvarTriagem(Triagem triagem) {
        if (triagem.getDataTriagem() == null) {
            triagem.setDataTriagem(LocalDateTime.now());
        }
        return triagemRepository.save(triagem);
    }

    public void deletarTriagem(Long id) {
        triagemRepository.deleteById(id);
    }
}