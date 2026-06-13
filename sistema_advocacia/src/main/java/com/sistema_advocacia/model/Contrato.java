package com.sistema_advocacia.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "contrato")
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contrato")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(name = "data_fechamento")
    private LocalDateTime dataFechamento;

    @Column(name = "status_contrato", length = 30)
    private String statusContrato = "Ativo";

    @Column(name = "valor_honorarios", precision = 10, scale = 2)
    private BigDecimal valorHonorarios;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    public Contrato() {
    }

    public Contrato(Integer id, Cliente cliente, LocalDateTime dataFechamento, String statusContrato, BigDecimal valorHonorarios, String observacoes) {
        this.id = id;
        this.cliente = cliente;
        this.dataFechamento = dataFechamento;
        this.statusContrato = statusContrato;
        this.valorHonorarios = valorHonorarios;
        this.observacoes = observacoes;
    }

    @PrePersist
    protected void onCreate() {
        if (this.dataFechamento == null) {
            this.dataFechamento = LocalDateTime.now();
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public LocalDateTime getDataFechamento() {
        return dataFechamento;
    }

    public void setDataFechamento(LocalDateTime dataFechamento) {
        this.dataFechamento = dataFechamento;
    }

    public String getStatusContrato() {
        return statusContrato;
    }

    public void setStatusContrato(String statusContrato) {
        this.statusContrato = statusContrato;
    }

    public BigDecimal getValorHonorarios() {
        return valorHonorarios;
    }

    public void setValorHonorarios(BigDecimal valorHonorarios) {
        this.valorHonorarios = valorHonorarios;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}