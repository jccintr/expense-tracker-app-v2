import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import { searchTransactions, deleteTransaction } from '../api/transactionsApi';
import { formatDateSP } from '../utils/date';
import TextField from '../components/inputs/TextField';
import SelectField from '../components/inputs/SelectField';
import PrimaryButton from '../components/PrimaryButton';
import TransactionRow from '../components/TransactionRow';

export default function BuscaScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { token } = useAuth();
  const { accounts, categories } = useAppData();

  const [description, setDescription] = useState('');
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [pickerFor, setPickerFor] = useState(null); // 'min' | 'max' | null

  const [results, setResults] = useState(null); // null = ainda não buscou
  const [loading, setLoading] = useState(false);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchTransactions({ description, minDate, maxDate, categoryId, accountId }, token);
      setResults(data);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (transaction) => {
    Alert.alert('Excluir transação', `Excluir "${transaction.description}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(transaction.id, token);
            setResults((prev) => prev.filter((t) => t.id !== transaction.id));
          } catch (error) {
            Alert.alert('Erro', error.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filters}>
        <TextField
          label="Descrição"
          placeholder="Buscar por descrição"
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.dateRow}>
          <Pressable
            style={[styles.dateField, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setPickerFor('min')}
          >
            <Text style={{ color: minDate ? colors.text : colors.placeholder, fontSize: 14 }}>
              {minDate || 'Data inicial'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.dateField, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setPickerFor('max')}
          >
            <Text style={{ color: maxDate ? colors.text : colors.placeholder, fontSize: 14 }}>
              {maxDate || 'Data final'}
            </Text>
          </Pressable>
        </View>

        <SelectField
          label="Categoria"
          placeholder="Todas as categorias"
          value={categoryId}
          options={categoryOptions}
          onChange={setCategoryId}
        />
        <SelectField
          label="Conta"
          placeholder="Todas as contas"
          value={accountId}
          options={accountOptions}
          onChange={setAccountId}
        />

        <PrimaryButton title="Buscar" onPress={handleSearch} loading={loading} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : results === null ? (
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 30 }}>
          Defina os filtros e toque em "Buscar".
        </Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
              Nenhuma transação encontrada.
            </Text>
          }
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              onPress={() =>
                navigation.navigate('TransacaoForm', { mode: 'edit', transaction: item, onSaved: handleSearch })
              }
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      {pickerFor && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="calendar"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            const forWhich = pickerFor;
            setPickerFor(null);
            if (event.type === 'set' && selectedDate) {
              const str = formatDateSP(selectedDate);
              if (forWhich === 'min') setMinDate(str);
              else setMaxDate(str);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { padding: 16 },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  dateField: { flex: 1, height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  list: { padding: 16, paddingTop: 0 },
});
