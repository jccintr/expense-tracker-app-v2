import { createContext, useContext, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import { listAccounts } from '../api/accountsApi';
import { listCategories } from '../api/categoriesApi';

const DataContext = createContext(null);

// Contas e categorias são usadas em vários lugares (seletor no formulário
// de transação, filtros de busca, telas de gerenciamento) — em vez de cada
// tela buscar isso sozinha toda vez que monta, carregamos uma vez aqui
// (PreloadScreen chama refreshAll() depois do login) e cada tela só chama
// refreshAccounts()/refreshCategories() de novo quando algo muda (criar,
// editar, excluir).
export function DataProvider({ children }) {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const refreshAccounts = useCallback(async () => {
    const data = await listAccounts(token);
    setAccounts(data);
    return data;
  }, [token]);

  const refreshCategories = useCallback(async () => {
    const data = await listCategories(token);
    setCategories(data);
    return data;
  }, [token]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshAccounts(), refreshCategories()]);
  }, [refreshAccounts, refreshCategories]);

  return (
    <DataContext.Provider value={{ accounts, categories, refreshAccounts, refreshCategories, refreshAll }}>
      {children}
    </DataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useAppData precisa estar dentro de um DataProvider');
  }
  return ctx;
}
