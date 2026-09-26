import { apiClient } from './client';

// GET /transactions?data=AAAA-MM-DD — lista as transações de UM dia
// específico (a API filtra em horário de São Paulo — use formatDateSP()
// de utils/date.js pra montar essa string, nunca um Date bruto). Sem o
// parâmetro `data`, a API devolveria TODAS as transações do usuário — por
// isso essa função sempre exige um dateStr, pra não puxar a base inteira
// por engano.
export function listTransactionsByDay(dateStr, token) {
  return apiClient.get(`/transactions?data=${dateStr}`, token);
}

// POST /transactions — cria SEMPRE com a data/hora atual do servidor. Não
// existe campo de data no validator (createTransactionValidator só aceita
// description/amount/category_id/account_id) — ou seja, NÃO dá pra
// cadastrar uma transação retroativa/futura por essa API. Se o usuário
// estiver navegando um dia diferente de hoje e criar uma transação, ela
// nasce em HOJE mesmo assim — quem chama isso é responsável por levar a
// navegação de volta pro dia atual depois (ver TransacoesScreen).
export function createTransaction({ description, amount, categoryId, accountId }, token) {
  return apiClient.post(
    '/transactions',
    { description, amount, category_id: categoryId, account_id: accountId },
    token
  );
}

// PUT /transactions/:id — edita em cima (não move de dia; createdAt não é
// alterado por esse endpoint).
export function updateTransaction(id, { description, amount, categoryId, accountId }, token) {
  return apiClient.put(
    `/transactions/${id}`,
    { description, amount, category_id: categoryId, account_id: accountId },
    token
  );
}

export function deleteTransaction(id, token) {
  return apiClient.delete(`/transactions/${id}`, token);
}

// GET /transactions/search — filtros todos opcionais. minDate/maxDate no
// formato AAAA-MM-DD; sem eles a API usa o ano corrente inteiro por
// padrão. categoryId/accountId filtram por id exato.
export function searchTransactions({ description, minDate, maxDate, categoryId, accountId }, token) {
  const params = new URLSearchParams();
  if (description) params.set('description', description);
  if (minDate) params.set('minDate', minDate);
  if (maxDate) params.set('maxDate', maxDate);
  if (categoryId) params.set('category', categoryId);
  if (accountId) params.set('account', accountId);
  const qs = params.toString();
  return apiClient.get(`/transactions/search${qs ? `?${qs}` : ''}`, token);
}

// GET /transactions/summary/week?week_number=N — SEMPRE passe week_number
// explícito (calculado com getCurrentServerWeekNumber()/±1 de utils/date.js).
// O default do servidor (omitir o parâmetro) tem um bug confirmado: ele
// calcula a semana ERRADA (a que vem, não a atual). Ver utils/date.js pro
// motivo completo.
export function fetchWeekSummary(weekNumber, token) {
  return apiClient.get(`/transactions/summary/week?week_number=${weekNumber}`, token);
}

// GET /transactions/summary/category?month=M&year=Y — total gasto por
// categoria no mês. month é 1-12.
export function fetchCategorySummary(month, year, token) {
  return apiClient.get(`/transactions/summary/category?month=${month}&year=${year}`, token);
}
