package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Cliente; 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ChatApiService {

    private static final ParameterizedTypeReference<Map<String, Object>> MAP_RESPONSE =
            new ParameterizedTypeReference<>() {
            };

    private final RestClient restClient;
    private final String chatApiUrl;
    private final ClienteService clienteService;

    public ChatApiService(@Value("${chat.api.url}") String chatApiUrl, ClienteService clienteService) {
        this.chatApiUrl = chatApiUrl;
        this.clienteService = clienteService;
        this.restClient = RestClient.builder()
                .baseUrl(chatApiUrl)
                .build();
    }

    public ResponseEntity<Map<String, Object>> enviarMensagemTriagem(Integer idCliente, String mensagem) {
        if (mensagem != null && !mensagem.isBlank()) {
            String msgMinuscula = mensagem.toLowerCase();
            String nomeExtraido = null;

            if (msgMinuscula.contains("meu nome é")) {
                nomeExtraido = mensagem.substring(msgMinuscula.indexOf("meu nome é") + 10).trim();
            } else if (msgMinuscula.contains("meu nome e")) {
                nomeExtraido = mensagem.substring(msgMinuscula.indexOf("meu nome e") + 10).trim();
            } else if (msgMinuscula.contains("me chamo")) {
                nomeExtraido = mensagem.substring(msgMinuscula.indexOf("me chamo") + 8).trim();
            }

            if (nomeExtraido != null && !nomeExtraido.isBlank()) {
                if (nomeExtraido.contains(".")) {
                    nomeExtraido = nomeExtraido.substring(0, nomeExtraido.indexOf(".")).trim();
                }
                if (nomeExtraido.contains(",")) {
                    nomeExtraido = nomeExtraido.substring(0, nomeExtraido.indexOf(",")).trim();
                }

                String[] palavras = nomeExtraido.split("\\s+");
                if (palavras.length > 0) {
                    String nomeFinal = palavras[0];
                    if (palavras.length > 1) {
                        nomeFinal += " " + palavras[1];
                    }

                    final String nomeSalvar = nomeFinal;
                    clienteService.buscarPorId(idCliente).ifPresent(cliente -> {
                        cliente.setNome(nomeSalvar);
                        clienteService.salvarCliente(cliente);
                    });
                }
            }
        }

        // 1. Faz a chamada original para obter a resposta do Chatbot (IA)
        ResponseEntity<Map<String, Object>> response = postJson("/chat/triagem", Map.of(
                "idCliente", idCliente,
                "mensagem", mensagem
        ));

        // 2. Analisa a RESPOSTA DO BOT que está voltando da API externa
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> body = response.getBody();
            
            // Pega o texto gerado pelo bot (ajuste a chave "resposta" ou "conteudo" se o json da IA usar outro nome)
            Object conteudoBot = body.get("resposta"); 
            if (conteudoBot == null) {
                conteudoBot = body.get("conteudo");
            }
            if (conteudoBot == null) {
                conteudoBot = body.get("texto");
            }

            if (conteudoBot != null) {
                String textoBotMinusculo = conteudoBot.toString().toLowerCase();

                if (textoBotMinusculo.contains("triagem foi concluída") || 
                    textoBotMinusculo.contains("triagem foi concluida") || 
                    textoBotMinusculo.contains("aguardar o retorno")) {
                    
                    clienteService.buscarPorId(idCliente).ifPresent(cliente -> {
                        cliente.setStatusLead(com.sistema_advocacia.model.Enum.StatusLead.Aguardando_retorno);
                        clienteService.salvarCliente(cliente);
                        System.out.println("Status do cliente atualizado com sucesso para Aguardando Retorno!");
                    });
                }
            }
        }

        return response;
    }

    public ResponseEntity<Map<String, Object>> enviarPerguntaTexto(Integer idCliente, String pergunta) {
        return postJson("/chat/texto", Map.of(
                "idCliente", idCliente,
                "pergunta", pergunta
        ));
    }

    public ResponseEntity<Map<String, Object>> limparHistorico(Integer idCliente) {
        return postJson("/chat/limpar", Map.of("idCliente", idCliente));
    }

    private ResponseEntity<Map<String, Object>> postJson(String uri, Map<String, Object> payload) {
        try {
            ResponseEntity<Map<String, Object>> response = restClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toEntity(MAP_RESPONSE);

            return ResponseEntity
                    .status(response.getStatusCode())
                    .body(normalizarResposta(response.getBody()));
        } catch (RestClientResponseException erro) {
            return ResponseEntity
                    .status(erro.getStatusCode())
                    .body(criarErro("api-chat retornou erro.", erro.getStatusCode().value(), erro.getResponseBodyAsString()));
        } catch (ResourceAccessException erro) {
            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(criarErro("Nao foi possivel conectar ao api-chat.", HttpStatus.BAD_GATEWAY.value(), erro.getMessage()));
        }
    }

    private Map<String, Object> normalizarResposta(Map<String, Object> body) {
        Map<String, Object> resposta = new LinkedHashMap<>();

        if (body != null) {
            resposta.putAll(body);
        }

        resposta.putIfAbsent("origem", "api-chat");
        resposta.putIfAbsent("chatApiUrl", chatApiUrl);
        return resposta;
    }

    private Map<String, Object> criarErro(String mensagem, int status, String detalhes) {
        Map<String, Object> erro = new LinkedHashMap<>();
        erro.put("erro", mensagem);
        erro.put("status", status);
        erro.put("chatApiUrl", chatApiUrl);

        if (detalhes != null && !detalhes.isBlank()) {
            erro.put("detalhes", detalhes);
        }

        return erro;
    }
}