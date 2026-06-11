package com.sistema_advocacia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversa")
public class Conversa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conversa")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(length = 30)
    private String canal = "WhatsApp";

    @Column(name = "data_inicio")
    private LocalDateTime dataInicio;

    @Column(name = "ultima_interacao")
    private LocalDateTime ultimaInteracao;

    @Column(length = 30)
    private String status = "Aberta";

    public Conversa() {
    }

    public Conversa(Integer id, Cliente cliente, String canal, LocalDateTime dataInicio, LocalDateTime ultimaInteracao, String status) {
        this.id = id;
        this.cliente = cliente;
        this.canal = canal;
        this.dataInicio = dataInicio;
        this.ultimaInteracao = ultimaInteracao;
        this.status = status;
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

    public String getCanal() {
        return canal;
    }

    public void setCanal(String canal) {
        this.canal = canal;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getUltimaInteracao() {
        return ultimaInteracao;
    }

    public void setUltimaInteracao(LocalDateTime ultimaInteracao) {
        this.ultimaInteracao = ultimaInteracao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}