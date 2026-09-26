import { apiClient } from './client';

export function listCategories(token) {
  return apiClient.get('/categories', token);
}

export function createCategory({ name }, token) {
  return apiClient.post('/categories', { name }, token);
}

export function updateCategory(id, { name }, token) {
  return apiClient.put(`/categories/${id}`, { name }, token);
}

// Mesmo bloqueio de 409 das contas quando há transações vinculadas.
export function deleteCategory(id, token) {
  return apiClient.delete(`/categories/${id}`, token);
}
