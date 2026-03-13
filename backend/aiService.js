const OpenAI = require('openai');

const validCategories = ['Hoje', 'Semana', 'Estratégico'];

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Heurística de fallback quando não há chave da OpenAI configurada.
function classifyByHeuristic(text) {
  const normalized = text.toLowerCase();
  if (/(hoje|urgente|agora|imediat)/.test(normalized)) return { category: 'Hoje', priority: 5 };
  if (/(estrat|planej|visão|roadmap|longo prazo)/.test(normalized)) return { category: 'Estratégico', priority: 2 };
  return { category: 'Semana', priority: 3 };
}

async function classifyTask(text) {
  if (!client) return classifyByHeuristic(text);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você classifica tarefas de produtividade. Responda SOMENTE JSON com: category (Hoje|Semana|Estratégico) e priority (1-5).',
      },
      { role: 'user', content: `Tarefa: ${text}` },
    ],
  });

  const parsed = JSON.parse(response.choices[0].message.content || '{}');
  const category = validCategories.includes(parsed.category) ? parsed.category : 'Semana';
  const priority = Number(parsed.priority);

  return {
    category,
    priority: Number.isFinite(priority) ? Math.max(1, Math.min(5, priority)) : 3,
  };
}

async function generateDayPlan(tasks) {
  if (!tasks.length) return ['Sem tarefas abertas para hoje.'];

  if (!client) {
    return tasks
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5)
      .map((task, index) => `${index + 1}. ${task.title}`);
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você cria planos diários de execução. Responda JSON com a chave "steps" (array de strings numeradas).',
      },
      {
        role: 'user',
        content: `Crie um plano otimizado para hoje com base nessas tarefas: ${JSON.stringify(tasks)}`,
      },
    ],
  });

  const parsed = JSON.parse(response.choices[0].message.content || '{}');
  return Array.isArray(parsed.steps) && parsed.steps.length
    ? parsed.steps.map((s, i) => `${i + 1}. ${String(s).replace(/^\d+\.\s*/, '')}`)
    : ['1. Revisar tarefas abertas por prioridade.'];
}

async function generateProductivitySuggestions(tasks) {
  if (!tasks.length) return ['Adicione tarefas para receber sugestões de produtividade.'];

  if (!client) {
    return [
      'Agrupe tarefas similares para reduzir troca de contexto.',
      'Bloqueie 2 blocos de foco de 50 minutos para itens de alta prioridade.',
      'Revise no fim do dia o que foi concluído e ajuste o plano de amanhã.',
    ];
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.5,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você atua como coach de produtividade. Responda JSON com "suggestions" (array de até 5 dicas práticas e objetivas).',
      },
      {
        role: 'user',
        content: `Analise as tarefas a seguir e gere sugestões: ${JSON.stringify(tasks)}`,
      },
    ],
  });

  const parsed = JSON.parse(response.choices[0].message.content || '{}');
  return Array.isArray(parsed.suggestions) && parsed.suggestions.length
    ? parsed.suggestions
    : ['Defina 3 prioridades máximas por dia para aumentar foco.'];
}

module.exports = {
  classifyTask,
  generateDayPlan,
  generateProductivitySuggestions,
};
