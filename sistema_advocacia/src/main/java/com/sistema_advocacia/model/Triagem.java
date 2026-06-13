package com.sistema_advocacia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "triagem")
public class Triagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_triagem")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(name = "descricao_caso", columnDefinition = "TEXT")
    private String descricaoCaso;

    @Column(name = "urgencia", length = 50)
    private String nivelUrgencia;

    @Column(name = "crime_destaque", length = 100)
    private String crimeDestaque;

    @Column(name = "data_triagem")
    private LocalDateTime dataTriagem;

    public Triagem() {
    }

    public Triagem(Integer id, Cliente cliente, String descricaoCaso, String nivelUrgencia, String crimeDestaque, LocalDateTime dataTriagem) {
        this.id = id;
        this.cliente = cliente;
        this.descricaoCaso = descricaoCaso;
        this.nivelUrgencia = nivelUrgencia;
        this.crimeDestaque = crimeDestaque;
        this.dataTriagem = dataTriagem;
    }

    @PrePersist
    protected void onCreate() {
        if (this.dataTriagem == null) {
            this.dataTriagem = LocalDateTime.now();
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

    public String getDescricaoCaso() {
        return descricaoCaso;
    }

    public void setDescricaoCaso(String descricaoCaso) {
        this.descricaoCaso = descricaoCaso;
    }

    public String getNivelUrgencia() {
        return nivelUrgencia;
    }

    public void setNivelUrgencia(String nivelUrgencia) {
        this.nivelUrgencia = nivelUrgencia;
    }

    public String getCrimeDestaque() {
        return crimeDestaque;
    }

    public void setCrimeDestaque(String crimeDestaque) {
        this.crimeDestaque = crimeDestaque;
    }

    public LocalDateTime getDataTriagem() {
        return dataTriagem;
    }

    public void setDataTriagem(LocalDateTime dataTriagem) {
        this.dataTriagem = dataTriagem;
    }
}