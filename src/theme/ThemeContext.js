import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';

const ThemeContext = createContext(null);

// Tema 100% derivado do useColorScheme() do sistema, sem toggle manual no
// app — mesmo comportamento do Simple Todo (app irmão). Se quiser um
// seletor manual (como na versão web do Simple Todo), dá pra evoluir isso
// pra um estado + AsyncStorage sem mudar a API do hook useAppTheme().
export function ThemeProvider({ children }) {
  const scheme = useColorScheme(); // 'light' | 'dark' | null

  const value = useMemo(() => {
    const isDark = scheme === 'dark';
    const colors = isDark ? darkColors : lightColors;
    return { isDark, colors };
  }, [scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme precisa estar dentro de um ThemeProvider');
  }
  return ctx;
}
