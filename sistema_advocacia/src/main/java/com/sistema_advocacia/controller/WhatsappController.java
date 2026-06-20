package com.sistema_advocacia.controller;

import com.sistema_advocacia.service.MensagemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsappController {

    private final MensagemService mensagemService;

    public WhatsappController(MensagemService mensagemService) {
        this.mensagemService = mensagemService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> obterStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("conectado", true);
        status.put("numero", "5588999999999");
        status.put("nivelBateria", 85);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/qrcode")
    public ResponseEntity<Map<String, String>> obterQrCode() {
        Map<String, String> response = new HashMap<>();
        response.put("qrcode", "base64_string_mock_do_qrcode_para_o_frontend");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/enviar")
    public ResponseEntity<Map<String, String>> enviarMensagem(@RequestBody Map<String, String> mensagemRequest) {
        String numero = mensagemRequest.get("numero");
        String texto = mensagemRequest.get("texto");

        Map<String, String> response = new HashMap<>();
        if (numero == null || texto == null) {
            response.put("erro", "Parâmetros 'numero' e 'texto' são obrigatórios.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        response.put("status", "enviado");
        response.put("mensagemId", "gBDEFghiJKLmNoPqRStU");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> receberDadosWebhook(@RequestBody Map<String, Object> payload) {
        mensagemService.processarMensagemEntrada(payload);
        return ResponseEntity.ok().build();
    }
}