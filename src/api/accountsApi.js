import { apiClient } from './client';

export function listAccounts(token) {
  return apiClient.get('/accounts', token);
}

export function createAccount({ name }, token) {
  return apiClient.post('/accounts', { name }, token);
}

export function updateAccount(id, { name }, token) {
  return apiClient.put(`/accounts/${id}`, { name }, token);
}

// Pode dar 409 se a conta ainda tiver transações vinculadas — a API
// bloqueia de propósito (constraint de FK no banco). A mensagem que ela
// manda ("Account with ID X is referenced in other table") é meio técnica;
// a tela mostra um texto próprio mais amigável nesse caso específico.
export function deleteAccount(id, token) {
  return apiClient.delete(`/accounts/${id}`, token);
}
