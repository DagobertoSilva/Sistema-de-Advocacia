package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.RespostaPronta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RespostaProntaRepository extends JpaRepository<RespostaPronta, Integer> {
}