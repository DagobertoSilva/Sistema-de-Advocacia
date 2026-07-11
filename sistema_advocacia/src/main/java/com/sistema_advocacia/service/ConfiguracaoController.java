package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Configuracao;
import com.sistema_advocacia.repository.ConfiguracaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracoes")
@CrossOrigin(origins = "*")
public class ConfiguracaoController {

    private final ConfiguracaoRepository repository;

    public ConfiguracaoController(ConfiguracaoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<Configuracao> obterConfiguracoes() {
        Configuracao config = repository.findAll().stream().findFirst().orElseGet(() -> {
            Configuracao novaConfig = new Configuracao();
            novaConfig.setNomeAdvogado("Dr. Alexandre Bezerra");
            novaConfig.setOab("OAB/CE 99.999");
            novaConfig.setPromptIA("Você é um assistente jurídico especialista em direito criminal.");
            novaConfig.setBotAtivo(true);
            return repository.save(novaConfig);
        });
        return ResponseEntity.ok(config);
    }

    @PutMapping
    public ResponseEntity<Configuracao> atualizarConfiguracoes(@RequestBody Configuracao novasConfiguracoes) {
        Configuracao configExistente = repository.findAll().stream().findFirst().orElse(new Configuracao());
        
        configExistente.setNomeAdvogado(novasConfiguracoes.getNomeAdvogado());
        configExistente.setOab(novasConfiguracoes.getOab());
        configExistente.setPromptIA(novasConfiguracoes.getPromptIA());
        configExistente.setBotAtivo(novasConfiguracoes.getBotAtivo());

        Configuracao atualizada = repository.save(configExistente);
        return ResponseEntity.ok(atualizada);
    }
}