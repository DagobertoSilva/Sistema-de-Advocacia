package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.RespostaPronta;
import com.sistema_advocacia.service.RespostaProntaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/respostas-prontas")
public class RespostaProntaController {

    private final RespostaProntaService respostaProntaService;

    public RespostaProntaController(RespostaProntaService respostaProntaService) {
        this.respostaProntaService = respostaProntaService;
    }

    @GetMapping
    public ResponseEntity<List<RespostaPronta>> listarTodas() {
        List<RespostaPronta> lista = respostaProntaService.listarTodas();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RespostaPronta> buscarPorId(@PathVariable Integer id) {
        return respostaProntaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RespostaPronta> criar(@RequestBody RespostaPronta respostaPronta) {
        RespostaPronta novaResposta = respostaProntaService.salvarRespostaPronta(respostaPronta);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaResposta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RespostaPronta> atualizar(@PathVariable Integer id, @RequestBody RespostaPronta respostaPronta) {
        return respostaProntaService.buscarPorId(id)
                .map(existente -> {
                    respostaPronta.setId(id);
                    RespostaPronta atualizada = respostaProntaService.salvarRespostaPronta(respostaPronta);
                    return ResponseEntity.ok(atualizada);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (respostaProntaService.buscarPorId(id).isPresent()) {
            respostaProntaService.deletarRespostaPronta(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}