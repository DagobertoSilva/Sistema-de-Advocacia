package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Contrato;
import com.sistema_advocacia.service.ContratoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contratos")
public class ContratoController {

    private final ContratoService contratoService;

    public ContratoController(ContratoService contratoService) {
        this.contratoService = contratoService;
    }

    @GetMapping
    public ResponseEntity<List<Contrato>> listarTodos() {
        List<Contrato> lista = contratoService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contrato> buscarPorId(@PathVariable Integer id) {
        return contratoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Contrato>> listarPorCliente(@PathVariable Integer clienteId) {
        List<Contrato> lista = contratoService.listarPorClienteId(clienteId);
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Contrato> criar(@RequestBody Contrato contrato) {
        Contrato novoContrato = contratoService.salvarContrato(contrato);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoContrato);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contrato> atualizar(@PathVariable Integer id, @RequestBody Contrato contrato) {
        return contratoService.buscarPorId(id)
                .map(existente -> {
                    contrato.setId(id);
                    Contrato atualizado = contratoService.salvarContrato(contrato);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (contratoService.buscarPorId(id).isPresent()) {
            contratoService.deletarContrato(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}