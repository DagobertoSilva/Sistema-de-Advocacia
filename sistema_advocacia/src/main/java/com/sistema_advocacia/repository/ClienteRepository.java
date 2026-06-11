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
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    Optional<Cliente> findByNumeroWhatsapp(String numeroWhatsapp);

    long countByStatusLead(StatusLead statusLead);

    long countByChatBotAtivoTrue();

    @Query("SELECT FUNCTION('DATE', c.dataCadastro) as data, COUNT(c) as quantidade FROM Cliente c GROUP BY FUNCTION('DATE', c.dataCadastro) ORDER BY FUNCTION('DATE', c.dataCadastro) ASC")
    List<Map<String, Object>> buscarEvolucaoLeads();
}