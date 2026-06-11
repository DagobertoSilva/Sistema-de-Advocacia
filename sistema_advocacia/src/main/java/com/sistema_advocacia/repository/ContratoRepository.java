package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ContratoRepository extends JpaRepository<Contrato, Long> {

    List<Contrato> findByClienteId(Long clienteId);

    @Query("SELECT COALESCE(SUM(c.valorHonorarios), 0) FROM Contrato c")
    BigDecimal calcularFaturamentoTotal();
}