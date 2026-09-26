import { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { listTransactionsByDay, deleteTransaction } from '../api/transactionsApi';
import { formatDateSP, addDaysToDateString, formatDayLabel, formatDateBR, isTodayDateString, isFutureDateString } from '../utils/date';
import { formatMoney } from '../utils/money';
import TransactionRow from '../components/TransactionRow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TransacoesScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const [dateStr, setDateStr] = useState(() => formatDateSP(new Date()));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTransactionsByDay(dateStr, token);
      setTransactions(data);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }, [dateStr, token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const total = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const goToPreviousDay = useCallback(() => {
    setDateStr((d) => addDaysToDateString(d, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setDateStr((d) => {
      const next = addDaysToDateString(d, 1);
      // Mesma regra do botão "→" (que fica desabilitado nesse caso) — sem
      // isso, o gesto conseguiria navegar pra data futura livremente, já
      // que um Pan gesture não tem um estado "disabled" como o Pressable.
      return isFutureDateString(next) ? d : next;
    });
  }, []);

  // Arraste horizontal pra trocar de dia, sem atrapalhar o scroll vertical
  // da lista: activeOffsetX exige ~20px de movimento horizontal antes de
  // "ativar" este gesto, e failOffsetY cede pro scroll nativo da FlatList
  // se o movimento for majoritariamente vertical. Conta tanto um arraste
  // decidido (translationX) quanto um flick rápido (velocityX).
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      if (translationX < -50 || velocityX < -800) {
        goToNextDay();
      } else if (translationX > 50 || velocityX > 800) {
        goToPreviousDay();
      }
    });

  const handleCreate = () => {
    navigation.navigate('TransacaoForm', {
      mode: 'create',
      // A API cria a transação sempre com a data/hora atual do servidor —
      // não dá pra escolher retroagir. Se o usuário não está vendo "hoje",
      // avisamos aqui e trazemos a navegação de volta pra hoje depois de
      // salvar (ver TransacaoFormScreen -> onSaved).
      onSaved: () => {
        setDateStr(formatDateSP(new Date()));
        load();
      },
    });
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
            setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
          } catch (error) {
            Alert.alert('Erro', error.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={goToPreviousDay} hitSlop={10} style={styles.navButton}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </Pressable>

        <Pressable onPress={() => setPickerOpen(true)} style={styles.dateLabel}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{formatDayLabel(dateStr)}</Text>
          {!isTodayDateString(dateStr) && (
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{formatDateBR(dateStr)}</Text>
          )}
        </Pressable>

        <Pressable
          onPress={goToNextDay}
          hitSlop={10}
          style={styles.navButton}
          disabled={isFutureDateString(addDaysToDateString(dateStr, 1))}
        >
          <Feather
            name="chevron-right"
            size={24}
            color={isFutureDateString(addDaysToDateString(dateStr, 1)) ? colors.border : colors.text}
          />
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Busca')} hitSlop={10} style={styles.searchButton}>
          <Feather name="search" size={20} color={colors.text} />
        </Pressable>
      </View>

      <GestureDetector gesture={swipeGesture}>
        <View style={{ flex: 1 }}>
          <View style={[styles.totalBar, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Total do dia</Text>
            <Text style={{ color: colors.expense, fontSize: 18, fontWeight: '800' }}>{formatMoney(total)}</Text>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
                  Nenhuma transação nesse dia.
                </Text>
              }
              renderItem={({ item }) => (
                <TransactionRow
                  transaction={item}
                  onPress={() =>
                    navigation.navigate('TransacaoForm', { mode: 'edit', transaction: item, onSaved: load })
                  }
                  onDelete={() => handleDelete(item)}
                />
              )}
            />
          )}
        </View>
      </GestureDetector>

      <Pressable style={[styles.fab, { backgroundColor: colors.primary }]} onPress={handleCreate}>
        <Feather name="plus" size={26} color={colors.primaryText} />
      </Pressable>

      {pickerOpen && (
        <DateTimePicker
          value={new Date(`${dateStr}T12:00:00`)}
          mode="date"
          display="calendar"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setPickerOpen(false);
            if (event.type === 'set' && selectedDate) {
              setDateStr(formatDateSP(selectedDate));
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navButton: { padding: 8 },
  dateLabel: { flex: 1, alignItems: 'center' },
  searchButton: { padding: 8, marginLeft: 4 },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 90 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});