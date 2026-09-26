import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { formatMoney } from '../utils/money';
import { formatDateTimeBR } from '../utils/date';

// Card específico pra resultados de busca — diferente do TransactionRow
// (usado na tela de Transações), aqui é IMPORTANTE mostrar data e hora,
// porque os resultados podem vir de dias bem diferentes. No dia-a-dia da
// TransacoesScreen isso seria redundante (a data já está na barra de
// navegação); na busca não tem esse contexto, então precisa vir no card.
export default function SearchResultRow({ transaction, onPress, onDelete }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.topLine}>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[styles.amount, { color: colors.expense }]}>{formatMoney(transaction.amount)}</Text>
      </View>

      <View style={styles.bottomLine}>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {transaction.category?.name} · {transaction.account?.name}
        </Text>
        <View style={styles.rightSide}>
          <Text style={[styles.dateTime, { color: colors.textSecondary }]}>
            {formatDateTimeBR(transaction.createdAt)}
          </Text>
          <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteButton}>
            <Feather name="trash-2" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: { flex: 1, fontSize: 14, fontWeight: '600', marginRight: 10 },
  amount: { fontSize: 14, fontWeight: '700' },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  meta: { flex: 1, fontSize: 12, marginRight: 10 },
  rightSide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateTime: { fontSize: 12 },
  deleteButton: { padding: 2 },
});