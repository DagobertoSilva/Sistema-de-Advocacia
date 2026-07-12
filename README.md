# Sistema de Advocacia

Sistema web desenvolvido para auxiliar escritórios de advocacia no gerenciamento de atendimentos, utilizando Inteligência Artificial para realizar a triagem inicial dos clientes, classificar a prioridade dos casos e auxiliar os advogados durante o fluxo de atendimento.

---

# Objetivo

O projeto tem como objetivo automatizar a etapa inicial do atendimento jurídico, reduzindo o tempo de resposta ao cliente e facilitando o gerenciamento dos casos pelos advogados através de uma plataforma centralizada.

## Objetivos específicos

- Automatizar a triagem inicial dos clientes;
- Classificar casos por nível de urgência;
- Gerenciar atendimentos jurídicos;
- Permitir que advogados assumam casos em andamento;
- Registrar o histórico das conversas;
- Integrar canais de comunicação com o sistema.

---

# Funcionalidades

## Implementadas

- Login de usuários;
- Cadastro e gerenciamento de usuários;
- Triagem inicial utilizando Inteligência Artificial;
- Classificação automática de prioridade;
- Gerenciamento de casos;
- Painel administrativo;
- Tela de configurações;
- Dashboard com informações dos atendimentos.

## Em desenvolvimento

- Integração com WhatsApp;
- Geração de QR Code para autenticação do WhatsApp;
- Notificações automáticas para casos pendentes;
- Melhorias na gestão de conversas encerradas;
- Otimizações de desempenho do sistema.

---

# Fluxo do Sistema

```text
Cliente
      │
      ▼
WhatsApp / Plataforma Web
      │
      ▼
IA realiza a triagem inicial
      │
      ▼
Classificação de prioridade
      │
      ▼
Fila de atendimento
      │
      ▼
Advogado assume o caso
      │
      ▼
Acompanhamento do atendimento
      │
      ▼
Caso concluído
```

---

# Tecnologias Utilizadas

## Backend

- Java

## Frontend

- JavaScript
- HTML

## Banco de Dados

- 

## Documentação

- 

## Scripts / Automação

- Shell

## Infraestrutura / DevOps:

- Dockerfile

---

# Arquitetura do Projeto

```
backend:
  sistema_advocacia
frontend/
docs/
slides/
```

---

# Integração com WhatsApp

A integração com o WhatsApp faz parte das funcionalidades previstas para o sistema e tem como objetivo permitir que o cliente inicie o atendimento diretamente pelo aplicativo.

O fluxo previsto é:

1. Cliente envia uma mensagem pelo WhatsApp;
2. O sistema recebe a mensagem;
3. A Inteligência Artificial realiza a triagem inicial;
4. O caso é classificado automaticamente;
5. O atendimento é encaminhado para um advogado;
6. O advogado pode assumir a conversa a qualquer momento.

Também está prevista a autenticação da sessão do WhatsApp através da geração de um QR Code disponível na tela de configurações do sistema.

> **Status:** Funcionalidade em fase de implementação.

---

# Como executar o projeto

## Backend

```bash
mvn spring-boot:run
```

## Frontend

```bash
npm install

npm run dev
```

---

# Documentação

A documentação completa do projeto está disponível na pasta `docs/`.

Inclui:

- Documentação técnica;
- Diagramas;
- Casos de uso;
- Arquitetura do sistema;
- *Manual de utilização.

---

# Apresentação

Os slides utilizados para apresentação do projeto encontram-se na pasta:

```
slides/
```

---

# Melhorias Futuras

- Finalização da integração com WhatsApp;
- Envio automático de notificações;
- Melhorias na Inteligência Artificial;
- Dashboard analítico;
- Histórico completo dos atendimentos;
- Integração com novos canais de comunicação.

---

# Equipe

| Integrante | Responsabilidade |
|------------|------------------|
| Diogo Ditorres Alexandre | Banco de Dados |
| Francisco Dagoberto Silva Dos Santos | Documentação |
| Francisco Guilherme De Sousa Martins | Frontend |
| Gisele Gomes Costa | Documentação |
| Leticia De Castro Silva | Frontend |
| Luiz Matheus Sales Souza | Backend |
| Nivea Hayane Gomes Miranda | Modelagem Banco de Dados |
| Rafael Alves Rodrigues | Backend |

---
---

# Licença

Projeto desenvolvido para fins acadêmicos - Projeto Integrador III.
