package com.sistema_advocacia.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Registra o módulo necessário para dar suporte a Java 8 Date/Time (LocalDateTime)
        objectMapper.registerModule(new JavaTimeModule());
        
        // Impede que o Jackson envie datas como timestamps numéricos (ex: [2026,6,11,...])
        // Força o envio no formato legível de string ISO-8601 (ex: "2026-06-11T13:30:00")
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return objectMapper;
    }
}