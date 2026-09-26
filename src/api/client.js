import { API_BASE_URL } from '../constants/api';

// Essa API (AdonisJS) não é consistente no formato de erro entre
// endpoints — testei ao vivo e achei 3 formatos diferentes:
//   1. Erro de validação (VineJS) / token inválido:
//      { errors: [ { message, field?, rule? } ] }
//   2. Exceções customizadas (403/404/409 de accounts/categories/transactions
//      via service, ex: "Access denied", conflito de referência):
//      { error: 'texto curto', message: 'texto mais específico' }
//   3. Erros simples direto no controller (404 de transaction, 400 de
//      validação manual em update, etc.):
//      { error: 'texto' }  — sem message
// Esta função tenta as 3 nessa ordem de prioridade, então funciona pra
// qualquer uma das formas acima.
function extractErrorMessage(data, fallback) {
  if (data?.errors?.[0]?.message) return data.errors[0].message;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return fallback;
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet.');
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, `Erro inesperado (${response.status}).`));
  }

  return data;
}

export const apiClient = {
  get: (path, token) => request(path, { method: 'GET', token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  // A API usa PUT pra update em accounts/categories/transactions — não tem
  // rota PATCH nenhuma (diferente do simple-todo-api). Não crie um método
  // patch aqui por engano/hábito dos outros apps.
  put: (path, body, token) => request(path, { method: 'PUT', body, token }),
  delete: (path, token) => request(path, { method: 'DELETE', token }),
};
