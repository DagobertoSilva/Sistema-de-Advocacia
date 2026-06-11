package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Mensagem;
import com.sistema_advocacia.model.Conversa;
import com.sistema_advocacia.model.Cliente;
import com.sistema_advocacia.repository.MensagemRepository;
import com.sistema_advocacia.repository.ConversaRepository;
import com.sistema_advocacia.repository.ClienteRepository;
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

    public MensagemService(MensagemRepository mensagemRepository, ConversaRepository conversaRepository, ClienteRepository clienteRepository) {
        this.mensagemRepository = mensagemRepository;
        this.conversaRepository = conversaRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<Mensagem> buscarHistoricoPorConversaId(Integer conversaId) {
        return mensagemRepository.findByConversaIdOrderByDataEnvioAsc(conversaId);
    }

    public void processarMensagemEntrada(Map<String, Object> payload) {
        String numeroWhatsapp = (String) payload.get("numeroWhatsapp");
        String conteudo = (String) payload.get("conteudo");

        if (numeroWhatsapp == null || conteudo == null) {
            throw new IllegalArgumentException("Número do WhatsApp e conteúdo da mensagem são obrigatórios.");
        }

        enviarMensagemTexto(numeroWhatsapp, conteudo);
    }

    public Mensagem enviarMensagemTexto(String numeroWhatsapp, String conteudo) {
        Optional<Cliente> clienteOpt = clienteRepository.findByNumeroWhatsapp(numeroWhatsapp);
        if (clienteOpt.isEmpty()) {
            throw new IllegalArgumentException("Cliente não encontrado com o número fornecido.");
        }

        Cliente cliente = clienteOpt.get();
        List<Conversa> conversas = conversaRepository.findByClienteId(cliente.getId());
        Conversa conversa;

        if (conversas.isEmpty()) {
            conversa = new Conversa();
            conversa.setCliente(cliente);
            conversa.setStatus("Aberta");
            conversa.setCanal("WhatsApp");
            conversa.setDataInicio(LocalDateTime.now());
            conversa = conversaRepository.save(conversa);
        } else {
            conversa = conversas.get(0);
        }

        Mensagem mensagem = new Mensagem();
        mensagem.setConversa(conversa);
        mensagem.setConteudo(conteudo);
        mensagem.setRemetente("usuario");
        mensagem.setTipoMensagem("texto");
        mensagem.setDataEnvio(LocalDateTime.now());

        conversa.setUltimaInteracao(LocalDateTime.now());
        conversaRepository.save(conversa);

        return mensagemRepository.save(mensagem);
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

}