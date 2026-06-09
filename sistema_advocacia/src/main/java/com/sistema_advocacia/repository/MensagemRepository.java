package com.sistema_advocacia.repository;

import com.sistema_advocacia.model.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensagemRepository extends JpaRepository<Mensagem, Long> {
    
    List<Mensagem> findByClienteId(Long clienteId);

}