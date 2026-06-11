package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.Triagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface TriagemRepository extends JpaRepository<Triagem, Long> {

    List<Triagem> findByNivelUrgencia(String nivelUrgencia);

    Optional<Triagem> findByClienteId(Integer clienteId);

    long countByNivelUrgencia(String nivelUrgencia);

    @Query(value = "SELECT COALESCE(s.nome_servico, t.crime_imputado, 'Outros') as tipo, COUNT(t.id_triagem) as quantidade " +
                   "FROM triagem t " +
                   "LEFT JOIN servicojuridico s ON t.id_servico = s.id_servico " +
                   "GROUP BY COALESCE(s.nome_servico, t.crime_imputado, 'Outros')", nativeQuery = true)
    List<Map<String, Object>> obterDistribuicaoPorCrimeOuServico();
}