
BASE_URL="http://localhost:8080"

echo "=================================================="
echo "1. CRIANDO PERFIL DE ACESSO (ADMIN)..."
echo "=================================================="
PERFIL_RES=$(curl -s -X POST "$BASE_URL/perfil" \
  -H "Content-Type: application/json" \
  -d '{"nomePerfil": "ADMIN"}')
echo "Resposta: $PERFIL_RES"
echo ""

echo "=================================================="
echo "2. REGISTRANDO USUÁRIO (matheus)..."
echo "=================================================="
REGISTRO_RES=$(curl -s -X POST "$BASE_URL/auth/registrar" \
  -H "Content-Type: application/json" \
  -d '{"login": "matheus", "senha": "123", "perfilAcesso": {"id": 1}}')
echo "Resposta: $REGISTRO_RES"
echo ""

echo "=================================================="
echo "3. AUTENTICANDO E OBTENDO TOKEN JWT..."
echo "=================================================="
TOKEN=$(curl -s -X POST "$BASE_URL/auth/autenticar" \
  -H "Content-Type: application/json" \
  -d '{"login": "matheus", "senha": "123"}')

if [ -z "$TOKEN" ] || [[ "$TOKEN" == *"error"* ]] || [[ "$TOKEN" == *"html"* ]]; then
  echo "Erro ao obter o token. Resposta recebida: $TOKEN"
  echo "Abortando testes."
  exit 1
fi

echo "Token obtido com sucesso!"
echo "JWT: $TOKEN"
echo ""

echo "=================================================="
echo "4. TESTANDO ROTA PROTEGIDA: CRIAR CLIENTE..."
echo "=================================================="
CLIENTE_RES=$(curl -s -X POST "$BASE_URL/clientes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nome": "Cliente Teste", "cpf": "12345678901", "email": "cliente@teste.com", "numeroWhatsapp": "5588999999999"}')
echo "Resposta: $CLIENTE_RES"
echo ""