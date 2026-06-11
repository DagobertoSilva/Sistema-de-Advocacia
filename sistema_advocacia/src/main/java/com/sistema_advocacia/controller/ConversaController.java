package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Conversa;
import com.sistema_advocacia.service.ConversaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversas")
public class ConversaController {

    private final ConversaService conversaService;

    public ConversaController(ConversaService conversaService) {
        this.conversaService = conversaService;
    }

    @GetMapping
    public ResponseEntity<List<Conversa>> listarTodas() {
        List<Conversa> lista = conversaService.listarTodas();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversa> buscarPorId(@PathVariable Long id) {
        return conversaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Conversa>> listarPorCliente(@PathVariable Integer clienteId) {
        List<Conversa> lista = conversaService.listarPorClienteId(clienteId);
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Conversa> criar(@RequestBody Conversa conversa) {
        Conversa novaConversa = conversaService.salvarConversa(conversa);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaConversa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Conversa> atualizar(@PathVariable Long id, @RequestBody Conversa conversa) {
        return conversaService.buscarPorId(id)
                .map(existente -> {
                    conversa.setId(id);
                    Conversa atualizada = conversaService.salvarConversa(conversa);
                    return ResponseEntity.ok(atualizada);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (conversaService.buscarPorId(id).isPresent()) {
            conversaService.deletarConversa(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}