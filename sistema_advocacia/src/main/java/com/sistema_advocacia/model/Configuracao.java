package com.sistema_advocacia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracao")
public class Configuracao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nome_advogado")
    private String nomeAdvogado;

    private String oab;

    @Column(name = "prompt_ia", columnDefinition = "TEXT")
    private String promptIA;

    @Column(name = "bot_ativo")
    private Boolean botAtivo;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNomeAdvogado() {
        return nomeAdvogado;
    }

    public void setNomeAdvogado(String nomeAdvogado) {
        this.nomeAdvogado = nomeAdvogado;
    }

    public String getOab() {
        return oab;
    }

    public void setOab(String oab) {
        this.oab = oab;
    }

    public String getPromptIA() {
        return promptIA;
    }

    public void setPromptIA(String promptIA) {
        this.promptIA = promptIA;
    }

    public Boolean getBotAtivo() {
        return botAtivo;
    }

    public void setBotAtivo(Boolean botAtivo) {
        this.botAtivo = botAtivo;
    }
}