package com.sistema_advocacia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "servicojuridico")
public class ServicoJuridico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servico")
    private Integer id;

    @Column(name = "nome_servico", nullable = false, length = 100)
    private String nomeServico;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    public ServicoJuridico() {
    }

    public ServicoJuridico(Integer id, String nomeServico, String descricao) {
        this.id = id;
        this.nomeServico = nomeServico;
        this.descricao = descricao;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNomeServico() {
        return nomeServico;
    }

    public void setNomeServico(String nomeServico) {
        this.nomeServico = nomeServico;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}