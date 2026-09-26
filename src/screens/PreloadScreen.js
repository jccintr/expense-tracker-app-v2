import { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth, TOKEN_KEY } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import { fetchCurrentUser } from '../api/authApi';

export default function PreloadScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const { refreshAll } = useAppData();

  // Só usado quando dá pra tentar de novo (ver check() abaixo) — nunca pra
  // token inválido de verdade, aí a gente já manda pro Login direto.
  const [retryError, setRetryError] = useState(null);

  const check = useCallback(async () => {
    setRetryError(null);
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (!token) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    try {
      const user = await fetchCurrentUser(token);
      await signIn(token, user);
      // Pré-carrega contas/categorias agora — assim, quando o usuário abrir
      // o formulário de nova transação, os seletores já estão prontos.
      await refreshAll();
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      // status === 401 é a API dizendo de verdade "esse token não vale
      // mais" — aí sim faz sentido apagar e pedir login de novo.
      //
      // Qualquer outro caso (status === null é falha de rede/fetch; 500,
      // 502, 503 são erro do servidor — inclusive o "acordando" do Railway
      // depois de dormir por inatividade no plano gratuito) NÃO significa
      // que o token é inválido. Apagar o token nesses casos era exatamente
      // o motivo do app pedir login toda vez que abria: qualquer soluço de
      // rede ou cold start do servidor destruía uma sessão perfeitamente
      // válida. Agora só oferecemos tentar de novo, mantendo o token.
      if (error.status === 401) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      setRetryError(
        error.status
          ? 'O servidor não respondeu como esperado. Tente novamente em alguns segundos.'
          : 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
      );
    }
  }, [navigation, signIn, refreshAll]);

  useEffect(() => {
    check();
  }, [check]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Expense Tracker</Text>

      {retryError ? (
        <View style={styles.retryBox}>
          <Text style={[styles.retryText, { color: colors.textSecondary }]}>{retryError}</Text>
          <Pressable onPress={check} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
            <Text style={{ color: colors.primaryText, fontWeight: '700' }}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 24, fontWeight: '800' },
  retryBox: { marginTop: 24, alignItems: 'center', gap: 16 },
  retryText: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
});