import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import { useAppTheme } from '../theme/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import TextField from '../components/inputs/TextField';
import SelectField from '../components/inputs/SelectField';
import PrimaryButton from '../components/PrimaryButton';
import { createTransaction, updateTransaction } from '../api/transactionsApi';
import { parseAmountInput } from '../utils/money';


export default function TransacaoFormScreen({ route, navigation }) {
  const { mode, transaction, onSaved } = route.params;
  const isEdit = mode === 'edit';
  const { colors } = useAppTheme();
  const { token } = useAuth();
 
  const { accounts, categories } = useAppData();

  const [description, setDescription] = useState(transaction?.description ?? '');
  const [amountText, setAmountText] = useState(transaction ? String(transaction.amount).replace('.', ',') : '');
  const [categoryId, setCategoryId] = useState(transaction?.category?.id ?? null);
  const [accountId, setAccountId] = useState(transaction?.account?.id ?? null);
  const [loading, setLoading] = useState(false);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));

  const handleSave = async () => {
    const amount = parseAmountInput(amountText);

    if (!description.trim()) {
      Alert.alert('Aviso', 'Descreva a transação.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Aviso', 'Informe um valor maior que zero.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Aviso', 'Selecione uma categoria.');
      return;
    }
    if (!accountId) {
      Alert.alert('Aviso', 'Selecione uma conta.');
      return;
    }

    setLoading(true);
    try {
      const payload = { description: description.trim(), amount, categoryId, accountId };
      if (isEdit) {
        await updateTransaction(transaction.id, payload, token);
      } else {
        await createTransaction(payload, token);
      }
      navigation.goBack();
      onSaved?.();
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader icon="close"
        title={isEdit ? 'Editar transação' : 'Nova transação'}
        onPress={() => navigation.goBack()}
      />
      <View style={styles.container}>
        {!isEdit && (
          <Text style={[styles.notice, { color: colors.textSecondary, backgroundColor: colors.surfaceAlt }]}>
            A transação é sempre criada com a data/hora de agora, não é possível cadastrar com datas passadas.
          </Text>
        )}

        <TextField label="Descrição" placeholder="Ex: Almoço" value={description} onChangeText={setDescription} />

        <TextField
          label="Valor"
          placeholder="0,00"
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="decimal-pad"
        />

        <SelectField
          label="Categoria"
          placeholder="Selecione a categoria"
          value={categoryId}
          options={categoryOptions}
          onChange={setCategoryId}
        />

        <SelectField
          label="Conta"
          placeholder="Selecione a conta"
          value={accountId}
          options={accountOptions}
          onChange={setAccountId}
        />

        <PrimaryButton
          title={isEdit ? 'Salvar alterações' : 'Criar transação'}
          onPress={handleSave}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  notice: { fontSize: 12, padding: 10, borderRadius: 8, marginBottom: 16 },
});