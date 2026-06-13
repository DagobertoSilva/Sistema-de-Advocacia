package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.ServicoJuridico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServicoJuridicoRepository extends JpaRepository<ServicoJuridico, Integer> {
}