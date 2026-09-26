import { apiClient } from './client';

// POST /auth/register — NÃO retorna token (confirmei testando ao vivo: só
// { id, name, email, createdAt, updatedAt }). A API já cria 3 contas
// padrão (Cash, PicPay, Nubank) e 3 categorias padrão (Alimentação,
// Mat. Higiêne, Mat. Limpeza) pro usuário novo.
export function register({ name, email, password }) {
  return apiClient.post('/auth/register', { name, email, password });
}

// POST /auth/login — retorna só { token }, sem dados do usuário. Chame
// fetchCurrentUser() logo em seguida.
export function login({ email, password }) {
  return apiClient.post('/auth/login', { email, password });
}

// GET /users/me — valida o token e retorna { id, name, email, ... }.
export function fetchCurrentUser(token) {
  return apiClient.get('/users/me', token);
}
