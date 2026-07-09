package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Mensagem;
import com.sistema_advocacia.service.MensagemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mensagens")
public class MensagemController {

    private final MensagemService mensagemService;

    public MensagemController(MensagemService mensagemService) {
        this.mensagemService = mensagemService;
    }

    @GetMapping("/conversa/{conversaId}")
    public ResponseEntity<List<Mensagem>> listarPorConversa(@PathVariable Integer conversaId) {
        List<Mensagem> lista = mensagemService.listarPorConversaId(conversaId);
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Mensagem> enviar(@RequestBody Mensagem mensagem) {
        Mensagem novaMensagem = mensagemService.salvarMensagem(mensagem);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaMensagem);
    }
}