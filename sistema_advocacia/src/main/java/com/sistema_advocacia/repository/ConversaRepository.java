package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.Conversa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ConversaRepository extends JpaRepository<Conversa, Long> {

    List<Conversa> findByStatus(String status);

    List<Conversa> findByClienteId(Integer clienteId);

    long countByStatus(String status);

    @Query("SELECT new map(" +
           "SUM(CASE WHEN c.status = 'Fechada' THEN 1 ELSE 0 END) as resolvidos, " +
           "SUM(CASE WHEN c.status = 'Encaminhada' THEN 1 ELSE 0 END) as encaminhados) " +
           "FROM Conversa c")
    Map<String, Object> obterMetricasEficienciaChatbot();
}