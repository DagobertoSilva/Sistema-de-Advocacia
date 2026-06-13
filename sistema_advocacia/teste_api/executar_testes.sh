#!/usr/bin/env bash

BASE_URL="${BASE_URL:-http://localhost:8080}"
TEST_ID=$(date +%s)
USUARIO_LOGIN="matheus.teste.${TEST_ID}@advocacia.com"
CLIENTE_CPF=$(printf "123%08d" "${TEST_ID: -8}")
CLIENTE_WHATSAPP="5588${TEST_ID: -8}"

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
echo ""

echo "=================================================="
echo "5. TESTANDO INTEGRACAO COM API-CHAT..."
echo "=================================================="
CHAT_BODY='{
    "mensagem": "Meu nome e Matheus e preciso de ajuda em um caso criminal."
  }'

request POST "$BASE_URL/api/chat/triagem" "$CHAT_BODY"
echo "HTTP: $HTTP_STATUS"
echo "Resposta: $HTTP_BODY"

if [ "$HTTP_STATUS" != "200" ]; then
  echo "Aviso: a etapa do chat depende da API atualizada, do container api-chat e da GROQ_API_KEY."
fi
echo ""

echo "=================================================="
echo "TESTES FINALIZADOS"
echo "=================================================="
