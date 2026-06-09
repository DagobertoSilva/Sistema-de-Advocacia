package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Cliente;
import com.sistema_advocacia.model.Mensagem;
import com.sistema_advocacia.repository.MensagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MensagemService {

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private ClienteService clienteService;

    // Registra a mensagem vinda do WhatsApp ligando ela ao cliente correto (novo ou existente)
    public Mensagem registrarMensagemWhats(String numeroWhatsapp, String nomeProvisorio, String conteudo) {
        // Usa o ClienteService para achar o dono do número ou criar um lead em triagem
        Cliente cliente = clienteService.obterOuCriarClienteMensagem(numeroWhatsapp, nomeProvisorio);
        Mensagem novaMensagem = new Mensagem();
        novaMensagem.setConteudo(conteudo);
        novaMensagem.setCliente(cliente);

        return mensagemRepository.save(novaMensagem);
    }

    // O Advogado usa isso para puxar o histórico de mensagens na tela web
    public List<Mensagem> buscarHistoricoPorCliente(Long clienteId) {
        return mensagemRepository.findByClienteId(clienteId);
    }
}