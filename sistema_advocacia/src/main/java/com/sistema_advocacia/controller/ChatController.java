package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Cliente;
import com.sistema_advocacia.service.ChatApiService;
import com.sistema_advocacia.service.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatApiService chatApiService;
    private final ClienteService clienteService;

    public ChatController(ChatApiService chatApiService, ClienteService clienteService) {
        this.chatApiService = chatApiService;
        this.clienteService = clienteService;
    }

    @PostMapping("/triagem")
    public ResponseEntity<Map<String, Object>> triagem(@RequestBody Map<String, Object> request) {
        Integer idCliente = obterIdCliente(request);
        String mensagem = obterTexto(request, "mensagem");

        if (idCliente == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "O campo 'idCliente' ou 'numero_whatsapp' e obrigatorio."));
        }

        if (mensagem == null || mensagem.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "O campo 'mensagem' e obrigatorio."));
        }

        return chatApiService.enviarMensagemTriagem(idCliente, mensagem);
    }

    @PostMapping("/texto")
    public ResponseEntity<Map<String, Object>> texto(@RequestBody Map<String, Object> request) {
        Integer idCliente = obterIdCliente(request);
        String pergunta = obterTexto(request, "pergunta");

        if (idCliente == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "O campo 'idCliente' ou 'numero_whatsapp' e obrigatorio."));
        }

        if (pergunta == null || pergunta.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "O campo 'pergunta' e obrigatorio."));
        }

        return chatApiService.enviarPerguntaTexto(idCliente, pergunta);
    }

    @PostMapping("/limpar")
    public ResponseEntity<Map<String, Object>> limpar(@RequestBody Map<String, Object> request) {
        Integer idCliente = obterIdCliente(request);

        if (idCliente == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "O campo 'idCliente' ou 'numero_whatsapp' e obrigatorio."));
        }

        return chatApiService.limparHistorico(idCliente);
    }

    private Integer obterIdCliente(Map<String, Object> request) {
        Object numeroWhatsappObj = request.get("numero_whatsapp");
        
        if (numeroWhatsappObj != null && !numeroWhatsappObj.toString().isBlank()) {
            String numeroWhatsapp = numeroWhatsappObj.toString();
            Cliente cliente = clienteService.buscarOuCriarPorNumero(numeroWhatsapp);
            return cliente.getId();
        }

        Object valor = request.get("idCliente");

        if (valor == null) {
            valor = request.get("id_cliente");
        }

        if (valor instanceof Number numero) {
            return numero.intValue();
        }

        if (valor instanceof String texto && !texto.isBlank()) {
            try {
                return Integer.parseInt(texto);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }

        return null;
    }

    private String obterTexto(Map<String, Object> request, String campo) {
        Object valor = request.get(campo);
        return valor == null ? null : valor.toString();
    }
}