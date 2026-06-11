package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.AtualizacaoProcessual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtualizacaoProcessualRepository extends JpaRepository<AtualizacaoProcessual, Integer> {

    List<AtualizacaoProcessual> findByContratoId(Integer contratoId);
}