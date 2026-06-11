package com.sistema_advocacia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "atualizacaoprocessual")
public class AtualizacaoProcessual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_atualizacao")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_contrato", nullable = false)
    private Contrato contrato;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    public AtualizacaoProcessual() {
    }

    public AtualizacaoProcessual(Long id, Contrato contrato, String descricao, LocalDateTime dataAtualizacao) {
        this.id = id;
        this.contrato = contrato;
        this.descricao = descricao;
        this.dataAtualizacao = dataAtualizacao;
    }

    @PrePersist
    protected void onCreate() {
        if (this.dataAtualizacao == null) {
            this.dataAtualizacao = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Contrato getContrato() {
        return contrato;
    }

    public void setContrato(Contrato contrato) {
        this.contrato = contrato;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
}