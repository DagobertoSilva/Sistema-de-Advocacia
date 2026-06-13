package com.sistema_advocacia.service;

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

    public ChatApiService(@Value("${chat.api.url}") String chatApiUrl) {
        this.chatApiUrl = chatApiUrl;
        this.restClient = RestClient.builder()
                .baseUrl(chatApiUrl)
                .build();
    }

    public ResponseEntity<Map<String, Object>> enviarMensagemTriagem(String mensagem) {
        return postJson("/chat/triagem", Map.of("mensagem", mensagem));
    }

    public ResponseEntity<Map<String, Object>> enviarPerguntaTexto(String pergunta) {
        return postJson("/chat/texto", Map.of("pergunta", pergunta));
    }

    public ResponseEntity<Map<String, Object>> limparHistorico() {
        return postJson("/chat/limpar", Map.<String, String>of());
    }

    private ResponseEntity<Map<String, Object>> postJson(String uri, Map<String, String> payload) {
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
