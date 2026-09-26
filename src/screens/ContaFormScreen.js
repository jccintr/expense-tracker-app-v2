import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import ModalHeader from '../components/ModalHeader';
import TextField from '../components/inputs/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { createAccount, updateAccount } from '../api/accountsApi';

export default function ContaFormScreen({ route, navigation }) {
  const { mode, account } = route.params;
  const isEdit = mode === 'edit';
  const { colors } = useAppTheme();
  const { token } = useAuth();
  const { refreshAccounts } = useAppData();

  const [name, setName] = useState(account?.name ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (name.trim().length < 3) {
      Alert.alert('Aviso', 'Nome deve ter pelo menos 3 caracteres.');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateAccount(account.id, { name: name.trim() }, token);
      } else {
        await createAccount({ name: name.trim() }, token);
      }
      await refreshAccounts();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ModalHeader title={isEdit ? 'Editar conta' : 'Nova conta'} onClose={() => navigation.goBack()} />
      <View style={styles.container}>
        <TextField label="Nome da conta" placeholder="Ex: Cartão Nubank" value={name} onChangeText={setName} />
        <PrimaryButton
          title={isEdit ? 'Salvar alterações' : 'Criar conta'}
          onPress={handleSave}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});