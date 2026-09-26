import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';
import TextField from '../components/inputs/TextField';
import PasswordField from '../components/inputs/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import { register } from '../api/authApi';

export default function CadastroScreen({ navigation }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Aviso', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      // POST /auth/register não retorna token — não loga automaticamente.
      // A API já cria 3 contas e 3 categorias padrão pro usuário novo.
      Alert.alert('Conta criada!', 'Sua conta foi criada com sucesso. Faça login para continuar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login', { prefillEmail: email.trim() }) },
      ]);
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
      <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Criar conta</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Informe os seus dados para criar a sua conta.
        </Text>

        <View style={styles.form}>
          <TextField label="Nome" placeholder="Seu nome" value={name} onChangeText={setName} />
          <TextField
            label="Email"
            placeholder="Informe o seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PasswordField label="Senha" placeholder="Crie uma senha" value={password} onChangeText={setPassword} />

          <PrimaryButton title="Criar conta" onPress={handleRegister} loading={loading} />

          <Pressable style={styles.loginLink} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.textSecondary }}>
              Já tem conta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Entrar</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 6, marginBottom: 28, lineHeight: 18 },
  form: { width: '100%' },
  loginLink: { marginTop: 18, alignItems: 'center' },
});
