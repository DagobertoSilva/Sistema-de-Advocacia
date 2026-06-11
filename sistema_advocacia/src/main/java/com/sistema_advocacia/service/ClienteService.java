package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Cliente;
import com.sistema_advocacia.model.Enum.StatusLead;
import com.sistema_advocacia.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente obterOuCriarClienteMensagem(String numeroWhatsapp, String nomeProvisorio) {
        return clienteRepository.findByNumeroWhatsapp(numeroWhatsapp)
                .orElseGet(() -> {
                    // Se não encontrar o número, cria um cliente novo "Em triagem"
                    Cliente novoCliente = new Cliente();
                    novoCliente.setNome(nomeProvisorio != null ? nomeProvisorio : "Novo Contato WhatsApp");
                    novoCliente.setNumeroWhatsapp(numeroWhatsapp);
                    novoCliente.setStatusLead(StatusLead.Em_triagem);
                    return clienteRepository.save(novoCliente);
                });
    }

    // Atualiza o status do cliente 
    public Cliente atualizarStatus(Long id, StatusLead novoStatus) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Cliente não encontrado"));
        cliente.setStatusLead(novoStatus);
        return clienteRepository.save(cliente);
    }

    // O Advogado clica no botão da tela e o backend desliga o robô para esse cliente
    public Cliente alternarChatBot(Long id, Boolean ativo) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Cliente não encontrado"));
        cliente.setChatBotAtivo(ativo);
        return clienteRepository.save(cliente);
    }
}