package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Contrato;
import com.sistema_advocacia.repository.ContratoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ContratoService {

    private final ContratoRepository contratoRepository;

    public ContratoService(ContratoRepository contratoRepository) {
        this.contratoRepository = contratoRepository;
    }

    public List<Contrato> listarTodos() {
        return contratoRepository.findAll();
    }

    public Optional<Contrato> buscarPorId(Integer id) {
        return contratoRepository.findById(id);
    }

    public List<Contrato> listarPorClienteId(Integer clienteId) {
        return contratoRepository.findByClienteId(clienteId);
    }

    public Contrato salvarContrato(Contrato contrato) {
        if (contrato.getDataFechamento() == null) {
            contrato.setDataFechamento(LocalDateTime.now());
        }
        return contratoRepository.save(contrato);
    }

    public void deletarContrato(Integer id) {
        if (!contratoRepository.existsById(id)) {
            throw new RuntimeException("Contrato não encontrado para o ID: " + id);
        }
        contratoRepository.deleteById(id);
    }

    public BigDecimal calcularFaturamentoTotal() {
        return contratoRepository.calcularFaturamentoTotal();
    }
}