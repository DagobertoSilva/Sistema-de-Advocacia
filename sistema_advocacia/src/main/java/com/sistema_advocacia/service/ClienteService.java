package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Cliente;
import com.sistema_advocacia.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarPorId(Integer id) {
        return clienteRepository.findById(id);
    }

    public Cliente buscarPorNumeroWhatsapp(String numeroWhatsapp) {
        return clienteRepository.findByNumeroWhatsapp(numeroWhatsapp).orElse(null);
    }

    public Cliente salvarCliente(Cliente cliente) {
        if (cliente.getDataCadastro() == null) {
            cliente.setDataCadastro(LocalDateTime.now());
        }
        return clienteRepository.save(cliente);
    }

    public void deletarCliente(Integer id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente não encontrado para o ID: " + id);
        }
        clienteRepository.deleteById(id);
    }

    public long contarTotalClientes() {
        return clienteRepository.count();
    }

    public Map<String, Object> obterDadosAtendimentosPorMes() {
        List<Map<String, Object>> dadosRaw = clienteRepository.obterContagemCadastrosPorMes();
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("dados", dadosRaw);
        
        return resultado;
    }
}