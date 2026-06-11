package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Triagem;
import com.sistema_advocacia.service.TriagemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/triagens")
public class TriagemController {

    private final TriagemService triagemService;

    public TriagemController(TriagemService triagemService) {
        this.triagemService = triagemService;
    }

    @GetMapping
    public ResponseEntity<List<Triagem>> listarTodas() {
        List<Triagem> lista = triagemService.listarTodas();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Triagem> buscarPorId(@PathVariable Long id) {
        return triagemService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Triagem> criar(@RequestBody Triagem triagem) {
        Triagem novaTriagem = triagemService.salvarTriagem(triagem);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaTriagem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Triagem> atualizar(@PathVariable Long id, @RequestBody Triagem triagem) {
        return triagemService.buscarPorId(id)
                .map(existente -> {
                    triagem.setId(id);
                    Triagem atualizada = triagemService.salvarTriagem(triagem);
                    return ResponseEntity.ok(atualizada);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (triagemService.buscarPorId(id).isPresent()) {
            triagemService.deletarTriagem(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}