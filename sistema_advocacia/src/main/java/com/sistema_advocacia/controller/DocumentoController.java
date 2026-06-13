package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Documento;
import com.sistema_advocacia.service.DocumentoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @GetMapping
    public ResponseEntity<List<Documento>> listarTodos() {
        List<Documento> lista = documentoService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Documento> buscarPorId(@PathVariable Integer id) {
        return documentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Documento>> listarPorCliente(@PathVariable Integer clienteId) {
        List<Documento> lista = documentoService.listarPorClienteId(clienteId);
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Documento> criar(@RequestBody Documento documento) {
        Documento novoDocumento = documentoService.salvarDocumento(documento);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoDocumento);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Documento> atualizar(@PathVariable Integer id, @RequestBody Documento documento) {
        return documentoService.buscarPorId(id)
                .map(existente -> {
                    documento.setId(id);
                    Documento atualizado = documentoService.salvarDocumento(documento);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (documentoService.buscarPorId(id).isPresent()) {
            documentoService.deletarDocumento(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}