-- tabelas independentes

CREATE TABLE perfilAcesso (
    id_perfil SERIAL PRIMARY KEY,
    nome_perfil VARCHAR(50) NOT NULL,
    descricao TEXT
);

CREATE TABLE servicoJuridico (
    id_servico SERIAL PRIMARY KEY,
    nome_servico VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TYPE status_lead_enum AS ENUM ('Em_triagem', 'Emergencia_max', 'Aguardando_retorno', 'Contrato_fechado', 'Encerrado');

CREATE TABLE Cliente (
    id_cliente SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    numero_whatsapp VARCHAR(20) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    grau_escolaridade VARCHAR(50),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_lead status_lead_enum DEFAULT 'Em_triagem', 
    assunto_tipificado VARCHAR(150), 
    resumo_fatos TEXT
);

-- tabelas dependentes

CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    id_perfil INT REFERENCES perfilAcesso(id_perfil),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE triagem (
    id_triagem SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES Cliente(id_cliente) ON DELETE CASCADE,
    id_servico INT REFERENCES servicoJuridico(id_servico),
    resumo_ia TEXT,
    crime_imputado VARCHAR(100),
    situacao_atual VARCHAR(100),
    local_prisao VARCHAR(100),
    tempo_custodia VARCHAR(50),
    nivel_urgencia VARCHAR(20),
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_finalizacao TIMESTAMP,
    status_triagem VARCHAR(30) DEFAULT 'Em_Andamento'
);

CREATE TABLE contrato (
    id_contrato SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES Cliente(id_cliente) ON DELETE CASCADE,
    data_fechamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_contrato VARCHAR(30) DEFAULT 'Ativo',
    valor_honorarios NUMERIC(10, 2),
    observacoes TEXT
);

CREATE TABLE atualizacaoProcessual (
    id_atualizacao SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES Cliente(id_cliente) ON DELETE CASCADE,
    id_usuario INT REFERENCES Usuario(id_usuario),
    descricao TEXT NOT NULL,
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE respostaPronta (
    id_resposta SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario),
    titulo VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversa (
    id_conversa SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES Cliente(id_cliente) ON DELETE CASCADE,
    canal VARCHAR(30) DEFAULT 'WhatsApp',
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_interacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Aberta'
);

CREATE TABLE mensagem (
    id_mensagem SERIAL PRIMARY KEY,
    id_conversa INT REFERENCES conversa(id_conversa) ON DELETE CASCADE,
    remetente VARCHAR(20) CHECK (remetente IN ('Cliente', 'Chatbot', 'Advogado')),
    tipo_mensagem VARCHAR(20) CHECK (tipo_mensagem IN ('Texto', 'Audio', 'Documento')),
    conteudo TEXT,
    transcricao_audio TEXT,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_processamento_ia VARCHAR(30)
);

CREATE TABLE documento (
    id_documento SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES Cliente(id_cliente) ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(50),
    url_arquivo TEXT NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- populando o bd para testes

INSERT INTO perfilAcesso (nome_perfil, descricao) VALUES
('Administrador', 'Acesso total ao sistema e configurações'),
('Atendente', 'Acesso a conversas e andamentos processuais');


INSERT INTO perfilacesso (id_perfil, nome_perfil, descricao) VALUES (1, 'ADMIN', 'Administrador do Sistema') ON CONFLICT (id_perfil) DO NOTHING;
INSERT INTO Usuario (id_perfil, nome, email, senha_hash, telefone, ativo) VALUES
(1, 'Administrador', 'admin@admin.com', '$2a$10$y1IuYeLlyJRYTrGghr49LOuEuC8IXrUToVF4OehulxBWr3ZBfnmM2', '85999999999', TRUE);



INSERT INTO Usuario (id_perfil, nome, email, senha_hash, telefone, ativo) VALUES
(1, 'Dr. João Silva', 'joao.silva@advocacia.com', 'hash_senha_segura', '85999999999', TRUE);

INSERT INTO servicoJuridico (nome_servico, descricao) VALUES
('Prisão em Flagrante', 'Atendimento de urgência para flagrantes'),
('Habeas Corpus', 'Pedido de liberdade provisória'),
('Acompanhamento Processual', 'Acompanhamento de inquéritos e ações penais');

INSERT INTO Cliente (nome, numero_whatsapp, cpf, grau_escolaridade, status_lead, assunto_tipificado, resumo_fatos) VALUES
('Carlos Souza', '85988887777', '11122233344', 'Ensino Médio', 'Emergencia_max', 'Tráfico de Drogas', 'Irmão relata prisão em flagrante há 2 horas.'),
('Maria Silva', '85977776666', '55566677788', 'Ensino Fundamental', 'Aguardando_retorno', 'Triagem Chatbot', 'Aguardando retorno do advogado.');

INSERT INTO triagem (id_cliente, id_servico, resumo_ia, crime_imputado, situacao_atual, local_prisao, tempo_custodia, nivel_urgencia, status_triagem) VALUES
(1, 1, 'Cliente relata prisão do irmão por tráfico ocorrida há 2 horas. Solicita presença na delegacia.', 'Tráfico', 'Preso em flagrante', 'Delegacia de Capturas', '2 horas', 'ALTA', 'Finalizada');

INSERT INTO conversa (id_cliente, canal) VALUES (1, 'WhatsApp');

INSERT INTO mensagem (id_conversa, remetente, tipo_mensagem, conteudo, data_envio) VALUES
(1, 'Cliente', 'Texto', 'Doutor, meu irmão acabou de ser preso, me ajuda!', CURRENT_TIMESTAMP),
(1, 'Chatbot', 'Texto', 'Olá! Sou a assistente do Dr. João. Qual o local da prisão?', CURRENT_TIMESTAMP);
