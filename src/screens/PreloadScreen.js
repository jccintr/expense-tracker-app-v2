import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth, TOKEN_KEY } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import { fetchCurrentUser } from '../api/authApi';

export default function PreloadScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const { refreshAll } = useAppData();

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      try {
        const user = await fetchCurrentUser(token);
        await signIn(token, user);
        // Pré-carrega contas/categorias agora — assim, quando o usuário
        // abrir o formulário de nova transação, os seletores já estão
        // prontos, sem esperar mais uma chamada de rede.
        await refreshAll();
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Expense Tracker</Text>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
});
