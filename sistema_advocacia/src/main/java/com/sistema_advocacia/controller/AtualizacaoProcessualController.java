package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.AtualizacaoProcessual;
import com.sistema_advocacia.service.AtualizacaoProcessualService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atualizacoes-processuais")
public class AtualizacaoProcessualController {

    private final AtualizacaoProcessualService atualizacaoProcessualService;

    public AtualizacaoProcessualController(AtualizacaoProcessualService atualizacaoProcessualService) {
        this.atualizacaoProcessualService = atualizacaoProcessualService;
    }

    @GetMapping
    public ResponseEntity<List<AtualizacaoProcessual>> listarTodas() {
        List<AtualizacaoProcessual> lista = atualizacaoProcessualService.listarTodas();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtualizacaoProcessual> buscarPorId(@PathVariable Integer id) {
        return atualizacaoProcessualService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/contrato/{contratoId}")
    public ResponseEntity<List<AtualizacaoProcessual>> listarPorContrato(@PathVariable Integer contratoId) {
        List<AtualizacaoProcessual> lista = atualizacaoProcessualService.listarPorContratoId(contratoId);
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<AtualizacaoProcessual> criar(@RequestBody AtualizacaoProcessual atualizacaoProcessual) {
        AtualizacaoProcessual novaAtualizacao = atualizacaoProcessualService.salvarAtualizacao(atualizacaoProcessual);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaAtualizacao);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtualizacaoProcessual> atualizar(@PathVariable Integer id, @RequestBody AtualizacaoProcessual atualizacaoProcessual) {
        return atualizacaoProcessualService.buscarPorId(id)
                .map(existente -> {
                    atualizacaoProcessual.setId(id);
                    AtualizacaoProcessual atualizada = atualizacaoProcessualService.salvarAtualizacao(atualizacaoProcessual);
                    return ResponseEntity.ok(atualizada);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (atualizacaoProcessualService.buscarPorId(id).isPresent()) {
            atualizacaoProcessualService.deletarAtualizacao(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}