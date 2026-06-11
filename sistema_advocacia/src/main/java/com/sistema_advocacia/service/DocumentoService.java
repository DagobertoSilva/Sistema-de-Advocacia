package com.sistema_advocacia.service;

import com.sistema_advocacia.model.Documento;
import com.sistema_advocacia.repository.DocumentoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentoService {

    private final DocumentoRepository documentoRepository;

    public DocumentoService(DocumentoRepository documentoRepository) {
        this.documentoRepository = documentoRepository;
    }

    public List<Documento> listarTodos() {
        return documentoRepository.findAll();
    }

    public Optional<Documento> buscarPorId(Long id) {
        return documentoRepository.findById(id);
    }

    public List<Documento> listarPorClienteId(Long clienteId) {
        return documentoRepository.findByClienteId(clienteId);
    }

    public Documento salvarDocumento(Documento documento) {
        if (documento.getDataUpload() == null) {
            documento.setDataUpload(LocalDateTime.now());
        }
        return documentoRepository.save(documento);
    }

    public void deletarDocumento(Long id) {
        documentoRepository.deleteById(id);
    }
}