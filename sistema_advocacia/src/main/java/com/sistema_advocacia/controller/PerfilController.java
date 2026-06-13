package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.PerfilAcesso;
import com.sistema_advocacia.service.PerfilAcessoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/perfis")
public class PerfilController {

    private final PerfilAcessoService perfilAcessoService;

    public PerfilController(PerfilAcessoService perfilAcessoService) {
        this.perfilAcessoService = perfilAcessoService;
    }

    @GetMapping
    public ResponseEntity<List<PerfilAcesso>> listarTodos() {
        List<PerfilAcesso> lista = perfilAcessoService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerfilAcesso> buscarPorId(@PathVariable Integer id) {
        return perfilAcessoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PerfilAcesso> criar(@RequestBody PerfilAcesso perfilAcesso) {
        PerfilAcesso novoPerfil = perfilAcessoService.salvarPerfil(perfilAcesso);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoPerfil);
    }
}