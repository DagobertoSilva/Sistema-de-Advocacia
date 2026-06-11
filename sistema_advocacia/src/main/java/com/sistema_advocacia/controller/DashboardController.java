package com.sistema_advocacia.controller;

import com.sistema_advocacia.service.ClienteService;
import com.sistema_advocacia.service.ContratoService;
import com.sistema_advocacia.service.TriagemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ClienteService clienteService;
    private final ContratoService contratoService;
    private final TriagemService triagemService;

    public DashboardController(ClienteService clienteService, ContratoService contratoService, TriagemService triagemService) {
        this.clienteService = clienteService;
        this.contratoService = contratoService;
        this.triagemService = triagemService;
    }

    @GetMapping("/metricas")
    public ResponseEntity<Map<String, Object>> obterMetricas() {
        Map<String, Object> metricas = new HashMap<>();
        
        long totalClientes = clienteService.listarTodos().size();
        long totalContratos = contratoService.listarTodos().size();
        long totalTriagens = triagemService.listarTodas().size();

        metricas.put("totalClientes", totalClientes);
        metricas.put("totalContratos", totalContratos);
        metricas.put("totalTriagens", totalTriagens);
        metricas.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(metricas);
    }
}