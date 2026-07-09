package com.sistema_advocacia.controller;

import com.sistema_advocacia.repository.ClienteRepository;
import com.sistema_advocacia.repository.TriagemRepository;
import com.sistema_advocacia.repository.ConversaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173") 
public class DashboardController {

    private final ClienteRepository clienteRepository;
    private final TriagemRepository triagemRepository;
    private final ConversaRepository conversaRepository;

    public DashboardController(ClienteRepository clienteRepository, 
                               TriagemRepository triagemRepository, 
                               ConversaRepository conversaRepository) {
        this.clienteRepository = clienteRepository;
        this.triagemRepository = triagemRepository;
        this.conversaRepository = conversaRepository;
    }

    @GetMapping("/metricas")
    public ResponseEntity<Map<String, Object>> obterMetricas() {
        Map<String, Object> resposta = new HashMap<>();

        resposta.put("totalClientes", clienteRepository.count());
        resposta.put("totalTriagens", triagemRepository.count());
        resposta.put("conversasEmAndamento", conversaRepository.count());
        resposta.put("conversasEncerradas", 0);

        List<Map<String, Object>> dadosMensais = new ArrayList<>();
        dadosMensais.add(Map.of("mes", "Jan", "atendimentos", 45));
        dadosMensais.add(Map.of("mes", "Fev", "atendimentos", 52));
        dadosMensais.add(Map.of("mes", "Mar", "atendimentos", 48));
        dadosMensais.add(Map.of("mes", "Abr", "atendimentos", 62));
        dadosMensais.add(Map.of("mes", "Mai", "atendimentos", 74));
        resposta.put("dadosMensais", dadosMensais);

        List<Map<String, Object>> distribuicaoCrimes = new ArrayList<>();
        distribuicaoCrimes.add(Map.of("tipo", "Trabalhista", "quantidade", 36));
        distribuicaoCrimes.add(Map.of("tipo", "Civil", "quantidade", 28));
        distribuicaoCrimes.add(Map.of("tipo", "Empresarial", "quantidade", 20));
        distribuicaoCrimes.add(Map.of("tipo", "Família", "quantidade", 17));
        resposta.put("distribuicaoCrimes", distribuicaoCrimes);

        Map<String, Object> eficienciaBot = new HashMap<>();
        eficienciaBot.put("resolvidos", 68);
        eficienciaBot.put("encaminhados", 32);
        resposta.put("eficienciaBot", eficienciaBot);

        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/casos-prioridade")
    public ResponseEntity<List<Map<String, Object>>> obterCasosPrioridade() {
        List<Map<String, Object>> lista = new ArrayList<>();
        
        triagemRepository.findAll().forEach(triagem -> {
            Map<String, Object> caso = new HashMap<>();
            caso.put("cliente", triagem.getCliente() != null ? triagem.getCliente().getNome() : "Desconhecido");
            caso.put("assunto", "Triagem em Andamento");
            caso.put("urgencia", "ALTA");
            caso.put("data", "Recentemente"); 
            caso.put("status", "Em Andamento");
            lista.add(caso);
        });

        return ResponseEntity.ok(lista);
    }
}