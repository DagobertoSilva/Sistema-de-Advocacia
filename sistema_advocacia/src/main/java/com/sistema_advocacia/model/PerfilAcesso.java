package com.sistema_advocacia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "perfilacesso")
public class PerfilAcesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfil")
    private Long id;

    @Column(name = "nome_perfil", nullable = false, length = 50)
    private String nomePerfil;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    public PerfilAcesso() {
    }

    public PerfilAcesso(Long id, String nomePerfil, String descricao) {
        this.id = id;
        this.nomePerfil = nomePerfil;
        this.descricao = descricao;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomePerfil() {
        return nomePerfil;
    }

    public void setNomePerfil(String nomePerfil) {
        this.nomePerfil = nomePerfil;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}