#!/bin/bash

echo "====== TESTANDO ROTA DE LOGIN ======"
curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "advogado@teste.com",
       "senha": "123"
     }'
echo -e "\n===================================="