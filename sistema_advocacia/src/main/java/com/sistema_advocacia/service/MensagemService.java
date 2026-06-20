package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Mensagem;
import com.sistema_advocacia.model.Conversa;
import com.sistema_advocacia.model.Cliente;
import com.sistema_advocacia.model.Enum.StatusLead;
import com.sistema_advocacia.repository.MensagemRepository;
import com.sistema_advocacia.repository.ConversaRepository;
import com.sistema_advocacia.repository.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MensagemService {

    private final MensagemRepository mensagemRepository;
    private final ConversaRepository conversaRepository;
    private final ClienteRepository clienteRepository;
    private final ClienteService clienteService;
    private final ChatApiService chatApiService;

    public MensagemService(MensagemRepository mensagemRepository, ConversaRepository conversaRepository, ClienteRepository clienteRepository, ClienteService clienteService, ChatApiService chatApiService) {
        this.mensagemRepository = mensagemRepository;
        this.conversaRepository = conversaRepository;
        this.clienteRepository = clienteRepository;
        this.clienteService = clienteService;
        this.chatApiService = chatApiService;
    }

    public List<Mensagem> buscarHistoricoPorConversaId(Integer conversaId) {
        return mensagemRepository.findByConversaIdOrderByDataEnvioAsc(conversaId);
    }

    public void processarMensagemEntrada(Map<String, Object> payload) {
        String numeroWhatsapp = (String) payload.get("numeroWhatsapp");
        String conteudoRecebido = (String) payload.get("conteudo");

        if (numeroWhatsapp == null || conteudoRecebido == null) {
            return;
        }

        Cliente cliente = clienteService.buscarOuCriarPorNumero(numeroWhatsapp);
        Conversa conversa = obterOuCriarConversaAtiva(cliente);

        salvarMensagemNoBanco(conversa, "Cliente", conteudoRecebido);

        String respostaDoBot = "";
        String conteudoLimpo = conteudoRecebido.trim();

        if (conteudoLimpo.equalsIgnoreCase("oi") || conteudoLimpo.equalsIgnoreCase("olá")) {
            respostaDoBot = "Olá! Bem-vindo ao escritório de Advocacia.\nComo posso ajudá-lo hoje? Escolha uma opção:\n\n1️⃣ Agendar consulta\n2️⃣ Acompanhamento de processo\n3️⃣ Prisão em flagrante (URGENTE)\n4️⃣ Digite seu problema para triagem";
            conversa.setStatus("MENU_PRINCIPAL");
        } 
        else if ("AGUARDANDO_CPF".equals(conversa.getStatus())) {
            
            respostaDoBot = "Localizamos o seu CPF no sistema! Seu processo está em andamento. Um atendente trará mais detalhes em breve.";
            conversa.setStatus("ATENDIMENTO_CONCLUIDO");
        } 
        else if ("AGUARDANDO_RELATO".equals(conversa.getStatus())) {
            try {
                ResponseEntity<Map<String, Object>> respostaIa = chatApiService.enviarMensagemTriagem(cliente.getId(), conteudoRecebido);
                Map<String, Object> corpoResposta = respostaIa.getBody();
                
                if (corpoResposta != null && corpoResposta.containsKey("resposta")) {
                    String respostaEfetiva = (String) corpoResposta.get("resposta");
                    
                    respostaDoBot = ""; 
                } else {
                    respostaDoBot = "Triagem concluída. O advogado analisará o caso em breve.";
                }
                conversa.setStatus("TRIAGEM_CONCLUIDA");
            } catch (Exception e) {
                respostaDoBot = "Desculpe, nosso sistema de triagem está indisponível no momento. Um advogado assumirá o atendimento.";
                conversa.setStatus("TRIAGEM_ERRO");
            }
        } 
        else if ("AGUARDANDO_DATA".equals(conversa.getStatus())) {
            respostaDoBot = "Agendamento pré-configurado para a data informada. Aguarde a confirmação de um secretário.";
            conversa.setStatus("AGENDAMENTO_CONCLUIDO");
        }
        else if (conteudoLimpo.equals("1")) {
            respostaDoBot = "Temos horários disponíveis nas terças e quintas à tarde. Digite a data que deseja.";
            conversa.setStatus("AGUARDANDO_DATA");
        } else if (conteudoLimpo.equals("2")) {
            respostaDoBot = "Por favor, digite o seu CPF (somente números) para buscarmos o seu processo.";
            conversa.setStatus("AGUARDANDO_CPF");
        } else if (conteudoLimpo.equals("3")) {
            respostaDoBot = "Sua solicitação foi marcada como URGENTE. Um advogado entrará em contato em instantes.";
            cliente.setStatusLead(StatusLead.Emergencia_max);
            clienteRepository.save(cliente);
            conversa.setStatus("EMERGENCIA_ACIONADA");
        } else if (conteudoLimpo.equals("4")) {
            respostaDoBot = "Por favor, descreva o seu caso de forma detalhada em uma única mensagem.";
            conversa.setStatus("AGUARDANDO_RELATO");
        } 
        
        else {
            respostaDoBot = "Desculpe, não entendi. Digite 'Oi' para ver as opções.";
        }

        conversa.setUltimaInteracao(LocalDateTime.now());
        conversaRepository.save(conversa);

        if (!respostaDoBot.isEmpty()) {
            salvarMensagemNoBanco(conversa, "Chatbot", respostaDoBot);
        }
    }

    public Mensagem enviarMensagemTexto(String numeroWhatsapp, String conteudo) {
        Optional<Cliente> clienteOpt = clienteRepository.findByNumeroWhatsapp(numeroWhatsapp);
        if (clienteOpt.isEmpty()) {
            throw new IllegalArgumentException("Cliente não encontrado com o número fornecido.");
        }

        Cliente cliente = clienteOpt.get();
        Conversa conversa = obterOuCriarConversaAtiva(cliente);

        Mensagem mensagem = salvarMensagemNoBanco(conversa, "Advogado", conteudo);
        conversa.setUltimaInteracao(LocalDateTime.now());
        conversaRepository.save(conversa);

        return mensagem;
    }

    public List<Mensagem> listarPorConversaId(Integer conversaId) {
        return buscarHistoricoPorConversaId(conversaId);
    }

    public Mensagem salvarMensagem(Mensagem mensagem) {
        if (mensagem.getDataEnvio() == null) {
            mensagem.setDataEnvio(LocalDateTime.now());
        }
        return mensagemRepository.save(mensagem);
    }

    public void deletarMensagem(Integer id) {
        if (!mensagemRepository.existsById(id)) {
            throw new RuntimeException("Mensagem não encontrada para o ID: " + id);
        }
        mensagemRepository.deleteById(id);
    }

    private Conversa obterOuCriarConversaAtiva(Cliente cliente) {
        List<Conversa> conversas = conversaRepository.findByClienteId(cliente.getId());
        if (!conversas.isEmpty()) {
            return conversas.get(0);
        }
        Conversa novaConversa = new Conversa();
        novaConversa.setCliente(cliente);
        novaConversa.setStatus("MENU_PRINCIPAL");
        novaConversa.setCanal("WhatsApp");
        novaConversa.setDataInicio(LocalDateTime.now());
        return conversaRepository.save(novaConversa);
    }

    private Mensagem salvarMensagemNoBanco(Conversa conversa, String remetente, String texto) {
        Mensagem mensagem = new Mensagem();
        mensagem.setConversa(conversa);
        mensagem.setConteudo(texto);
        mensagem.setRemetente(remetente);
        mensagem.setTipoMensagem("Texto");
        mensagem.setDataEnvio(LocalDateTime.now());
        return mensagemRepository.save(mensagem);
    }
}