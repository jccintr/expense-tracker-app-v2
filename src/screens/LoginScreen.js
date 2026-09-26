import { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import TextField from '../components/inputs/TextField';
import PasswordField from '../components/inputs/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import { login, fetchCurrentUser } from '../api/authApi';

export default function LoginScreen({ navigation, route }) {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const { refreshAll } = useAppData();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState(route.params?.prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.prefillEmail) setEmail(route.params.prefillEmail);
  }, [route.params?.prefillEmail]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Aviso', 'Preencha email e senha.');
      return;
    }

    setLoading(true);
    try {
      const { token } = await login({ email: email.trim(), password });
      const user = await fetchCurrentUser(token);
      await signIn(token, user);
      await refreshAll();
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Expense Tracker</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Informe suas credenciais</Text>

        <View style={styles.form}>
          <TextField
            label="Email"
            placeholder="Informe o seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PasswordField
            label="Senha"
            placeholder="Informe a sua senha"
            value={password}
            onChangeText={setPassword}
          />

          <PrimaryButton title="Entrar" onPress={handleLogin} loading={loading} />

          <Pressable style={styles.registerLink} onPress={() => navigation.navigate('Cadastro')}>
            <Text style={{ color: colors.textSecondary }}>
              Não tem conta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Cadastre-se</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 32 },
  form: { width: '100%' },
  registerLink: { marginTop: 18, alignItems: 'center' },
});
