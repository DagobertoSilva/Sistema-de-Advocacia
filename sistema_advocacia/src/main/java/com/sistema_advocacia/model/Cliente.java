package com.sistema_advocacia.model;

import com.sistema_advocacia.model.Enum.StatusLead; 
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "numero_whatsapp", nullable = false, unique = true, length = 20)
    private String numeroWhatsapp;

    @Column(unique = true, length = 14)
    private String cpf;

    @Column(name = "grau_escolaridade", length = 50)
    private String grauEscolaridade;

    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_lead")
    private StatusLead statusLead = StatusLead.Em_triagem;

    @Column(name = "chatbot_ativo", nullable = true)
    private Boolean chatBotAtivo = true;

    public Cliente() {
    }

    
    public Cliente(Integer id, String nome, String numeroWhatsapp, String cpf, String grauEscolaridade, LocalDateTime dataCadastro, StatusLead statusLead, Boolean chatBotAtivo) {
        this.id = id;
        this.nome = nome;
        this.numeroWhatsapp = numeroWhatsapp;
        this.cpf = cpf;
        this.grauEscolaridade = grauEscolaridade;
        this.dataCadastro = dataCadastro;
        this.statusLead = statusLead;
        this.chatBotAtivo = chatBotAtivo;
    }

    @PrePersist
    protected void onCreate() {
        if (this.dataCadastro == null) {
            this.dataCadastro = LocalDateTime.now();
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getNumeroWhatsapp() {
        return numeroWhatsapp;
    }

    public void setNumeroWhatsapp(String numeroWhatsapp) {
        this.numeroWhatsapp = numeroWhatsapp;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getGrauEscolaridade() {
        return grauEscolaridade;
    }

    public void setGrauEscolaridade(String grauEscolaridade) {
        this.grauEscolaridade = grauEscolaridade;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public StatusLead getStatusLead() {
        return statusLead;
    }

    public void setStatusLead(StatusLead statusLead) {
        this.statusLead = statusLead;
    }

    public Boolean getChatBotAtivo() {
        return chatBotAtivo;
    }

    public void setChatBotAtivo(Boolean chatBotAtivo) {
        this.chatBotAtivo = chatBotAtivo;
    }
}