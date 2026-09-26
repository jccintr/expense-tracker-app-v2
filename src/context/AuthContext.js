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
