package com.sistema_advocacia.controller;

import com.sistema_advocacia.service.ChatApiService;
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

    public ChatController(ChatApiService chatApiService) {
        this.chatApiService = chatApiService;
    }

    @PostMapping("/triagem")
    public ResponseEntity<Map<String, Object>> triagem(@RequestBody Map<String, String> request) {
        String mensagem = request.get("mensagem");

        if (mensagem == null || mensagem.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "O campo 'mensagem' e obrigatorio."));
        }

        return chatApiService.enviarMensagemTriagem(mensagem);
    }

    @PostMapping("/texto")
    public ResponseEntity<Map<String, Object>> texto(@RequestBody Map<String, String> request) {
        String pergunta = request.get("pergunta");

        if (pergunta == null || pergunta.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "O campo 'pergunta' e obrigatorio."));
        }

        return chatApiService.enviarPerguntaTexto(pergunta);
    }

    @PostMapping("/limpar")
    public ResponseEntity<Map<String, Object>> limpar() {
        return chatApiService.limparHistorico();
    }
}
