package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.Cliente;
import com.sistema_advocacia.model.Enum.StatusLead;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

 
    Optional<Cliente> findByNumeroWhatsapp(String numeroWhatsapp);

    Optional<Cliente> findByCpf(String cpf);

    List<Cliente> findByStatusLead(StatusLead statusLead);
    
    @Query(value = "SELECT TO_CHAR(data_cadastro, 'YYYY-MM') as mes, COUNT(id_cliente) as quantidade " +
                   "FROM cliente " +
                   "GROUP BY TO_CHAR(data_cadastro, 'YYYY-MM') " +
                   "ORDER BY mes ASC", nativeQuery = true)
    List<Map<String, Object>> obterContagemCadastrosPorMes();
}