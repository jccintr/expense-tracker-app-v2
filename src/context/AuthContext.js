import { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Chamado pelo PreloadScreen e pelo LoginScreen depois de uma resposta de
  // sucesso da API — guarda o token no AsyncStorage (sobrevive a fechar o
  // app) e atualiza o estado em memória usado pra montar o header
  // Authorization das próximas chamadas.
  const signIn = async (newToken, newUser) => {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);

    // Não confia cegamente em setItem() ter resolvido sem erro — relê na
    // hora e compara. Existem relatos conhecidos (GitHub issues do próprio
    // AsyncStorage) de escritas que resolvem a Promise mas, em cenários
    // específicos de Android, não persistem de fato. Se isso acontecer,
    // preferimos falhar ALTO e NA HORA (erro explícito aqui, mostrado pelo
    // catch do LoginScreen) do que descobrir só quando o app reabrir e a
    // sessão sumiu sem nenhuma pista do motivo.
    const verify = await AsyncStorage.getItem(TOKEN_KEY);
    if (verify !== newToken) {
      throw new Error('Não foi possível salvar sua sessão neste aparelho. Tente fazer login novamente.');
    }

    setToken(newToken);
    setUser(newUser);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, setUser, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider');
  }
  return ctx;
}

export { TOKEN_KEY };