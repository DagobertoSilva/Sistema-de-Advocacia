package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Cliente;
import com.sistema_advocacia.model.Enum.StatusLead;
import com.sistema_advocacia.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // Rota que lista todos os leads/clientes no painel do advogado
    @GetMapping
    public List<Cliente> listarTodos() {
        return clienteService.listarTodos();
    }

    // Rota para buscar os detalhes de um cliente específico pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Rota para mudar o status do lead (Ex: Mudar de 'Em triagem' para 'Agendado')
    @PutMapping("/{id}/status")
    public ResponseEntity<Cliente> atualizarStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        StatusLead novoStatus = StatusLead.valueOf(body.get("status"));
        Cliente atualizado = clienteService.atualizarStatus(id, novoStatus);
        return ResponseEntity.ok(atualizado);
    }

    // Rota para o advogado ativar ou desativar o robô para aquele cliente específico
    @PutMapping("/{id}/chatbot")
    public ResponseEntity<Cliente> alternarChatBot(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean ativo = body.get("ativo");
        Cliente atualizado = clienteService.alternarChatBot(id, ativo);
        return ResponseEntity.ok(atualizado);
    }
}