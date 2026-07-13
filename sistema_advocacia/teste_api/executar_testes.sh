#!/usr/bin/env bash

BASE_URL="${BASE_URL:-http://localhost:8080}"
CHAT_API_URL="${CHAT_API_URL:-http://localhost:3000}"
# Combina tempo, PID e aleatoriedade para que cada execução crie dados novos.
TEST_ID="$(date +%s)-$$-$RANDOM"
TEST_NUM=$(( ( $(date +%s) + $$ + RANDOM ) % 100000000 ))
USUARIO_LOGIN="matheus.teste.${TEST_ID}@advocacia.com"
CLIENTE_CPF=$(printf "123%08d" "$TEST_NUM")
CLIENTE_WHATSAPP="5588$(printf '%08d' "$TEST_NUM")"

request() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local auth_header="${4:-}"
  local tmp_file

  tmp_file=$(mktemp)

  if [ -n "$body" ] && [ -n "$auth_header" ]; then
    HTTP_STATUS=$(curl -s -o "$tmp_file" -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "$auth_header" \
      -d "$body")
  elif [ -n "$body" ]; then
    HTTP_STATUS=$(curl -s -o "$tmp_file" -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$body")
  else
    HTTP_STATUS=$(curl -s -o "$tmp_file" -w "%{http_code}" -X "$method" "$url")
  fi

  HTTP_BODY=$(cat "$tmp_file")
  rm -f "$tmp_file"
}

extrair_id() {
  printf '%s' "$1" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' | head -1
}

echo "=================================================="
echo "1. VERIFICANDO API..."
echo "=================================================="
request GET "$BASE_URL/api/clientes"

if [ "$HTTP_STATUS" = "000" ]; then
  echo "Nao foi possivel conectar em $BASE_URL."
  echo "Suba a API antes de rodar os testes."
  echo "Exemplo: docker compose up -d"
  exit 1
fi

echo "API respondeu com HTTP $HTTP_STATUS."
echo ""

echo "=================================================="
echo "2. CADASTRANDO USUARIO DE TESTE..."
echo "=================================================="
CADASTRO_BODY=$(cat <<JSON
{
    "nome": "Matheus Teste",
    "login": "$USUARIO_LOGIN",
    "senha": "123",
    "telefone": "5588999999999",
    "perfilAcesso": { "id": 1 }
}
JSON
)

request POST "$BASE_URL/api/auth/cadastro" "$CADASTRO_BODY"
echo "HTTP: $HTTP_STATUS"
echo "Resposta: $HTTP_BODY"
echo ""

echo "=================================================="
echo "3. AUTENTICANDO E OBTENDO TOKEN JWT..."
echo "=================================================="
LOGIN_BODY=$(cat <<JSON
{
    "login": "$USUARIO_LOGIN",
    "senha": "123"
}
JSON
)

request POST "$BASE_URL/api/auth/login" "$LOGIN_BODY"
TOKEN=$(printf '%s' "$HTTP_BODY" | sed -n 's/.*"token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "Erro ao obter o token."
  echo "HTTP: $HTTP_STATUS"
  echo "Resposta recebida: $HTTP_BODY"
  echo "Abortando testes."
  exit 1
fi

echo "HTTP: $HTTP_STATUS"
echo "Token obtido com sucesso."
echo ""

echo "=================================================="
echo "4. TESTANDO ROTA PROTEGIDA: CRIAR CLIENTE..."
echo "=================================================="
CLIENTE_BODY=$(cat <<JSON
{
    "nome": "Cliente Teste",
    "cpf": "$CLIENTE_CPF",
    "numeroWhatsapp": "$CLIENTE_WHATSAPP",
    "grauEscolaridade": "Ensino Medio"
}
JSON
)

request POST "$BASE_URL/api/clientes" "$CLIENTE_BODY" "Authorization: Bearer $TOKEN"
echo "HTTP: $HTTP_STATUS"
echo "Resposta: $HTTP_BODY"
CLIENTE_ID=$(extrair_id "$HTTP_BODY")

if [ -z "$CLIENTE_ID" ]; then
  echo "Nao foi possivel identificar o id do cliente criado."
  exit 1
fi
echo ""

echo "=================================================="
echo "5. TESTANDO URGENCIA SEM HISTORICO..."
echo "=================================================="
request GET "$CHAT_API_URL/clientes/$CLIENTE_ID/urgencia"
echo "HTTP: $HTTP_STATUS"
echo "Resposta: $HTTP_BODY"

if [ "$HTTP_STATUS" != "200" ]; then
  echo "Aviso: esta etapa depende do api-chat em $CHAT_API_URL e do mesmo banco de dados da API principal."
fi
echo ""

echo "=================================================="
echo "6. TESTANDO INTEGRACAO EXISTENTE VIA BACKEND..."
echo "=================================================="
request POST "$BASE_URL/api/chat/triagem" "{
    \"idCliente\": $CLIENTE_ID,
    \"mensagem\": \"Meu nome e Matheus Teste e preciso de ajuda em um caso criminal.\"
}"
echo "HTTP: $HTTP_STATUS"
echo "Resposta: $HTTP_BODY"

if [ "$HTTP_STATUS" != "200" ]; then
  echo "Aviso: esta etapa depende do api-chat, do container correspondente e da GROQ_API_KEY."
fi
echo ""

echo "=================================================="
echo "7. TESTANDO URGENCIA ALTA DIRETAMENTE NO API-CHAT..."
echo "=================================================="
CHAT_BODY=$(cat <<JSON
{
    "numeroWhatsapp": "$CLIENTE_WHATSAPP",
    "mensagem": "Meu nome e Matheus Teste. Meu irmao acabou de ser preso em flagrante e esta na delegacia."
}
JSON
)

request POST "$CHAT_API_URL/chat/triagem" "$CHAT_BODY"
echo "HTTP: $HTTP_STATUS"
echo "Resposta: $HTTP_BODY"

if [ "$HTTP_STATUS" != "200" ]; then
  echo "Aviso: a etapa depende do api-chat e da GROQ_API_KEY."
else
  request GET "$CHAT_API_URL/clientes/$CLIENTE_ID/urgencia"
  echo "HTTP urgencia: $HTTP_STATUS"
  echo "Resposta urgencia: $HTTP_BODY"
fi
echo ""

echo ""
echo "=================================================="
echo "8. TESTANDO ISOLAMENTO DE CONVERSAS COM MULTIPLOS CLIENTES"
echo "=================================================="

criar_cliente() {
  local nome="$1"
  local cpf="$2"
  local whatsapp="$3"

  BODY=$(cat <<JSON
{
  "nome": "$nome",
  "cpf": "$cpf",
  "numeroWhatsapp": "$whatsapp",
  "grauEscolaridade": "Ensino Medio"
}
JSON
)

  request POST "$BASE_URL/api/clientes" "$BODY" "Authorization: Bearer $TOKEN"

  if [ "$HTTP_STATUS" != "201" ]; then
    echo "ERRO ao criar cliente $nome"
    echo "HTTP: $HTTP_STATUS"
    echo "BODY: $HTTP_BODY"
    return 1
  fi

  echo "$HTTP_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2
}

BASE_TESTE=$TEST_NUM

ID_JOAO=$(criar_cliente \
  "Joao Silva" \
  "111${BASE_TESTE: -8}" \
  "5588111${BASE_TESTE: -6}")

ID_MARIA=$(criar_cliente \
  "Maria Oliveira" \
  "222${BASE_TESTE: -8}" \
  "5588222${BASE_TESTE: -6}")

ID_CARLOS=$(criar_cliente \
  "Carlos Pereira" \
  "333${BASE_TESTE: -8}" \
  "5588333${BASE_TESTE: -6}")

echo ""
echo "Clientes criados:"
echo "Joao   -> $ID_JOAO"
echo "Maria  -> $ID_MARIA"
echo "Carlos -> $ID_CARLOS"

if [ -z "$ID_JOAO" ] || [ -z "$ID_MARIA" ] || [ -z "$ID_CARLOS" ]; then
  echo ""
  echo "Falha ao criar clientes de teste."
  exit 1
fi

echo ""
echo "========== JOAO =========="

request POST "$BASE_URL/api/chat/triagem" "{
  \"idCliente\": $ID_JOAO,
  \"mensagem\": \"Meu nome e Joao Silva e fui preso por porte ilegal de arma.\"
}"

echo "Pergunta 1:"
echo "$HTTP_BODY"

request POST "$BASE_URL/api/chat/triagem" "{
  \"idCliente\": $ID_JOAO,
  \"mensagem\": \"Qual e o meu nome e qual foi meu problema?\"
}"

echo "Pergunta 2:"
echo "$HTTP_BODY"

echo ""
echo "========== MARIA =========="

request POST "$BASE_URL/api/chat/triagem" "{
  \"idCliente\": $ID_MARIA,
  \"mensagem\": \"Meu nome e Maria Oliveira e estou sendo investigada por estelionato.\"
}"

echo "Pergunta 1:"
echo "$HTTP_BODY"

request POST "$BASE_URL/api/chat/triagem" "{
  \"idCliente\": $ID_MARIA,
  \"mensagem\": \"Qual e o meu nome e qual investigacao mencionei?\"
}"

echo "Pergunta 2:"
echo "$HTTP_BODY"

echo ""
echo "========== CARLOS =========="

request POST "$BASE_URL/api/chat/triagem" "{
  \"idCliente\": $ID_CARLOS,
  \"mensagem\": \"Meu nome e Carlos Pereira e fui acusado de violencia domestica.\"
}"

echo "Pergunta 1:"
echo "$HTTP_BODY"

request POST "$BASE_URL/api/chat/triagem" "{
  \"idCliente\": $ID_CARLOS,
  \"mensagem\": \"Qual acusacao eu mencionei?\"
}"

echo "Pergunta 2:"
echo "$HTTP_BODY"

echo ""
echo "========== TESTE DE VAZAMENTO =========="

request POST "$BASE_URL/api/chat/triagem" "{
  \"idCliente\": $ID_JOAO,
  \"mensagem\": \"Quem e Maria Oliveira?\"
}"

echo "$HTTP_BODY"

echo ""
echo "=================================================="
echo "FIM DOS TESTES"
echo "=================================================="
