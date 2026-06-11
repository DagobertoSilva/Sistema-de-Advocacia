package com.sistema_advocacia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensagem") 
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensagem")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_conversa", nullable = false)
    private Conversa conversa;

    @Column(length = 20)
    private String remetente; 

    @Column(name = "tipo_mensagem", length = 20)
    private String tipoMensagem; 

    @Column(columnDefinition = "TEXT")
    private String conteudo;

    @Column(name = "transcricao_audio", columnDefinition = "TEXT")
    private String transcricaoAudio;

    @Column(name = "data_envio", updatable = false)
    private LocalDateTime dataEnvio;

    @Column(name = "status_processamento_ia", length = 30)
    private String statusProcessamentoIa;

    public Mensagem() {
    }

    public Mensagem(Long id, Conversa conversa, String remetente, String tipoMensagem, String conteudo, String transcricaoAudio, LocalDateTime dataEnvio, String statusProcessamentoIa) {
        this.id = id;
        this.conversa = conversa;
        this.remetente = remetente;
        this.tipoMensagem = tipoMensagem;
        this.conteudo = conteudo;
        this.transcricaoAudio = transcricaoAudio;
        this.dataEnvio = dataEnvio;
        this.statusProcessamentoIa = statusProcessamentoIa;
    }

    @PrePersist
    protected void onCreate() {
        if (this.dataEnvio == null) {
            this.dataEnvio = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Conversa getConversa() {
        return conversa;
    }

    public void setConversa(Conversa conversa) {
        this.conversa = conversa;
    }

    public String getRemetente() {
        return remetente;
    }

    public void setRemetente(String remetente) {
        this.remetente = remetente;
    }

    public String getTipoMensagem() {
        return tipoMensagem;
    }

    public void setTipoMensagem(String tipoMensagem) {
        this.tipoMensagem = tipoMensagem;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public String getTranscricaoAudio() {
        return transcricaoAudio;
    }

    public void setTranscricaoAudio(String transcricaoAudio) {
        this.transcricaoAudio = transcricaoAudio;
    }

    public LocalDateTime getDataEnvio() {
        return dataEnvio;
    }

    public void setDataEnvio(LocalDateTime dataEnvio) {
        this.dataEnvio = dataEnvio;
    }

    public String getStatusProcessamentoIa() {
        return statusProcessamentoIa;
    }

    public void setStatusProcessamentoIa(String statusProcessamentoIa) {
        this.statusProcessamentoIa = statusProcessamentoIa;
    }
}