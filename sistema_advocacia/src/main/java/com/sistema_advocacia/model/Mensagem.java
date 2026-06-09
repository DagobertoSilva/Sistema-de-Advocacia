package com.sistema_advocacia.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "mensagem") 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensagem")
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String conteudo;

    @Column(name = "data_envio", updatable = false)
    private LocalDateTime dataEnvio;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @PrePersist
    protected void onCreate() {
        if (this.dataEnvio == null) {
            this.dataEnvio = LocalDateTime.now();
        }
    }
}