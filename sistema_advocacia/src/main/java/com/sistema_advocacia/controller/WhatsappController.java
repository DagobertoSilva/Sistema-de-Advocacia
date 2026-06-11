package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Mensagem;
import com.sistema_advocacia.service.MensagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsappController {

    @Autowired
    private MensagemService mensagemService;

    // Webhook: O robô do WhatsApp envia as mensagens recebidas para cá
    @PostMapping("/webhook")
    public ResponseEntity<?> receberMensagem(@RequestBody Map<String, String> payload) {
        String numeroWhatsapp = payload.get("numero");
        String nomeProvisorio = payload.get("nome");
        String conteudo = payload.get("conteudo");

        if (numeroWhatsapp == null || conteudo == null) {
            return ResponseEntity.badRequest().body("Dados incompletos no payload");
        }

        // Registra a mensagem e cria o cliente automaticamente se for um número novo
        Mensagem mensagemSalva = mensagemService.registrarMensagemWhats(numeroWhatsapp, nomeProvisorio, conteudo);
        return ResponseEntity.ok(mensagemSalva);
    }

    // Rota para o painel do advogado carregar o chat/histórico de conversas daquele cliente
    @GetMapping("/historico/{clienteId}")
    public List<Mensagem> obterHistorico(@PathVariable Long clienteId) {
        return mensagemService.buscarHistoricoPorCliente(clienteId);
    }
}