import { createContext, useContext, useState, useCallback, useMemo } from 'react';
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
  //
  // useCallback com deps [] de propósito: setToken/setUser são setters de
  // useState, que o React garante serem estáveis (nunca mudam de
  // identidade) — então esta função pode ficar com a MESMA referência pra
  // sempre, em vez de ser recriada a cada render do AuthProvider. Sem
  // isso, qualquer componente que dependa de signIn (ex: o useEffect do
  // PreloadScreen) re-executa toda vez que o AuthProvider re-renderiza —
  // inclusive por causa do PRÓPRIO signIn chamando setToken/setUser, o que
  // causava um efeito cascata de re-execuções (ver PreloadScreen.js).
  const signIn = useCallback(async (newToken, newUser) => {
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
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // O objeto value também precisa de identidade estável — sem useMemo, um
  // objeto literal NOVO é criado a cada render do AuthProvider (mesmo que
  // token/user não tenham mudado), e todo consumidor de useAuth() em
  // qualquer lugar do app re-renderiza à toa.
  const value = useMemo(
    () => ({ token, user, setUser, signIn, signOut }),
    [token, user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider');
  }
  return ctx;
}

export { TOKEN_KEY };