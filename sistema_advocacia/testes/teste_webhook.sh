#!/bin/bash

echo "====== SIMULANDO MENSAGEM DO WHATSAPP ======"
curl -X POST http://localhost:8080/api/whatsapp/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "numero": "5585999999999",
       "nome": "Cliente Teste",
       "conteudo": "Olá, gostaria de tirar uma dúvida sobre um processo comercial."
     }'
echo -e "\n============================================"