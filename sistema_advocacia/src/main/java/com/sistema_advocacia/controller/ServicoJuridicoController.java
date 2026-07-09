package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.ServicoJuridico;
import com.sistema_advocacia.service.ServicoJuridicoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicos-juridicos")
public class ServicoJuridicoController {

    private final ServicoJuridicoService servicoJuridicoService;

    public ServicoJuridicoController(ServicoJuridicoService servicoJuridicoService) {
        this.servicoJuridicoService = servicoJuridicoService;
    }

    @GetMapping
    public ResponseEntity<List<ServicoJuridico>> listarTodos() {
        List<ServicoJuridico> lista = servicoJuridicoService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicoJuridico> buscarPorId(@PathVariable Integer id) {
        return servicoJuridicoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ServicoJuridico> criar(@RequestBody ServicoJuridico servicoJuridico) {
        ServicoJuridico novoServico = servicoJuridicoService.salvarServico(servicoJuridico);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoServico);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicoJuridico> atualizar(@PathVariable Integer id, @RequestBody ServicoJuridico servicoJuridico) {
        return servicoJuridicoService.buscarPorId(id)
                .map(existente -> {
                    servicoJuridico.setId(id);
                    ServicoJuridico atualizado = servicoJuridicoService.salvarServico(servicoJuridico);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (servicoJuridicoService.buscarPorId(id).isPresent()) {
            servicoJuridicoService.deletarServico(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}