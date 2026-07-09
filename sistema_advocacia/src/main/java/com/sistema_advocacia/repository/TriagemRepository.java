package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.Triagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface TriagemRepository extends JpaRepository<Triagem, Integer> {

    List<Triagem> findByNivelUrgencia(String nivelUrgencia);

    Optional<Triagem> findByClienteId(Integer clienteId);

    Integer countByNivelUrgencia(String nivelUrgencia);

    @Query(value = "SELECT COALESCE(t.crime_destaque, 'Outros') as tipo, COUNT(t.id_triagem) as quantidade " +
                   "FROM triagem t " +
                   "GROUP BY COALESCE(t.crime_destaque, 'Outros')", nativeQuery = true)
    List<Map<String, Object>> obterDistribuicaoPorCrimeOuServico();
}