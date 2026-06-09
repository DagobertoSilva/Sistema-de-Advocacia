package com.sistema_advocacia.model;

import com.sistema_advocacia.model.Enum.StatusLead; 
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;

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

    @PrePersist
    protected void onCreate() {
        if (this.dataCadastro == null) {
            this.dataCadastro = LocalDateTime.now();
        }
    }
}