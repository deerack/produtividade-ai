# Produtividade AI

Aplicação web completa para gestão de tarefas com IA, Kanban e dashboard de produtividade.

## Stack

- **Frontend:** React + Vite + hooks + drag and drop
- **Backend:** Node.js + Express + SQLite
- **IA:** OpenAI API (com fallback heurístico quando não há chave)

## Estrutura

```bash
/produtividade-ai
  /backend
    server.js
    aiService.js
    database.js
    /routes
      tasks.js
    package.json
  /frontend
    index.html
    package.json
    /src
      App.jsx
      main.jsx
      styles.css
      /components
      /pages
      /services
```

## Funcionalidades

### Tarefas
- Criar tarefa
- Editar tarefa
- Excluir tarefa
- Marcar como concluída/reabrir

### Kanban
- Colunas: **Hoje**, **Semana**, **Estratégico**
- Drag and drop entre colunas com persistência no backend

### Dashboard
- Total de tarefas
- Tarefas concluídas
- Progresso diário (%)

### IA
- Classificação automática ao criar tarefas: Hoje / Semana / Estratégico
- Sugestão de prioridade (1 a 5)
- Botão **Gerar plano do dia**
- Botão **Sugestões de produtividade**

## Como rodar

### 1) Backend
```bash
cd backend
npm install
node server.js
```

Backend sobe em: `http://localhost:3001`

> Opcional: crie um arquivo `.env` em `/backend` com:
>
> `OPENAI_API_KEY=sua_chave`

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend sobe em: `http://localhost:5173`

## Exemplo de uso

1. Crie uma tarefa: `Alinhar plano semanal com equipe`.
2. O backend envia o texto para IA e recebe classificação + prioridade.
3. A tarefa aparece automaticamente em uma coluna do Kanban.
4. Arraste a tarefa para outra coluna se necessário.
5. Clique em **Gerar plano do dia** para obter sequência de execução otimizada.
6. Clique em **Sugestões de produtividade** para receber recomendações práticas.

## Evolução para SaaS (próximos passos)

- Multiusuário com autenticação (JWT/OAuth)
- Organização por workspace/equipe
- Integração calendário e notificações
- Billing e planos por assinatura
- Logs, observabilidade e filas assíncronas
