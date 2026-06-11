package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Conversa;
import com.sistema_advocacia.repository.ConversaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConversaService {

    private final ConversaRepository conversaRepository;

    public ConversaService(ConversaRepository conversaRepository) {
        this.conversaRepository = conversaRepository;
    }

    public List<Conversa> listarTodas() {
        return conversaRepository.findAll();
    }

    public Optional<Conversa> buscarPorId(Integer id) {
        return conversaRepository.findById(id);
    }

    public List<Conversa> listarPorClienteId(Integer clienteId) {
        return conversaRepository.findByClienteId(clienteId);
    }

    public Conversa salvarConversa(Conversa conversa) {
        return conversaRepository.save(conversa);
    }

    public void deletarConversa(Integer id) {
        if (!conversaRepository.existsById(id)) {
            throw new RuntimeException("Conversa não encontrada para o ID: " + id);
        }
        conversaRepository.deleteById(id);
    }
}