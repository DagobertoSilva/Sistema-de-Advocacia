package com.sistema_advocacia.controller;

import com.sistema_advocacia.model.Conversa;
import com.sistema_advocacia.service.ConversaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversas")
@CrossOrigin(origins = "http://localhost:5173") 
public class ConversaController {

    private final ConversaService conversaService;

    public ConversaController(ConversaService conversaService) {
        this.conversaService = conversaService;
    }

    @GetMapping
    public ResponseEntity<List<Conversa>> listarTodas() {
        List<Conversa> lista = conversaService.listarTodas();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversa> buscarPorId(@PathVariable Integer id) {
        return conversaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Conversa>> listarPorCliente(@PathVariable Integer clienteId) {
        List<Conversa> lista = conversaService.listarPorClienteId(clienteId);
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Conversa> criar(@RequestBody Conversa conversa) {
        Conversa novaConversa = conversaService.salvarConversa(conversa);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaConversa);
    }

    @GetMapping("/cliente/{idCliente}/resumo")
    public ResponseEntity<Map<String, Object>> obterResumoIACliente(@PathVariable Integer idCliente) {
        Map<String, Object> resumo = new HashMap<>();

        if (idCliente == 1) {
            resumo.put("contexto", "Cliente relata demissão sem justa causa e falta de pagamento de horas extras nos últimos 2 anos.");
            resumo.put("pontosChave", Arrays.asList("Trabalho noturno sem adicional", "Férias vencidas não pagas", "Testemunhas disponíveis"));
            resumo.put("documentos", "Contrato de trabalho, holerites (últimos 6 meses), registro de ponto.");
            resumo.put("proximaAcao", "Preparar petição inicial para reclamação trabalhista.");
        } else if (idCliente == 2) {
            resumo.put("contexto", "Processo de divórcio litigioso e disputa de guarda de menores.");
            resumo.put("pontosChave", Arrays.asList("Desacordo sobre pensão alimentícia", "Bens a partilhar (imóvel e carro)"));
            resumo.put("documentos", "Certidão de casamento, certidão de nascimento dos filhos, escritura do imóvel.");
            resumo.put("proximaAcao", "Agendar audiência de conciliação familiar.");
        } else {
            resumo.put("contexto", "Consulta inicial para análise de viabilidade de ação de reparação civil por danos materiais.");
            resumo.put("pontosChave", Arrays.asList("Contrato violado por prestador de serviços", "Notificações extrajudiciais já enviadas"));
            resumo.put("documentos", "Contrato de prestação de serviços, comprovantes de pagamento, conversas de WhatsApp salvas.");
            resumo.put("proximaAcao", "Emitir parecer jurídico sobre as chances de êxito.");
        }

        return ResponseEntity.ok(resumo);
    }
}