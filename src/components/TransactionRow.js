import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { formatMoney } from '../utils/money';
import { formatTimeBR } from '../utils/date';

export default function TransactionRow({ transaction, onPress, onDelete }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.info}>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {formatTimeBR(transaction.createdAt)} · {transaction.category?.name} · {transaction.account?.name}
        </Text>
      </View>

      <Text style={[styles.amount, { color: colors.expense }]}>{formatMoney(transaction.amount)}</Text>

      <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteButton}>
        <Feather name="trash-2" size={16} color={colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  info: { flex: 1, marginRight: 10 },
  description: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700', marginRight: 10 },
  deleteButton: { padding: 4 },
});