package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.PerfilAcesso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilAcessoRepository extends JpaRepository<PerfilAcesso, Long> {

    Optional<PerfilAcesso> findByNomePerfil(String nomePerfil);
}