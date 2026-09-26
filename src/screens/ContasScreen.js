import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import { deleteAccount } from '../api/accountsApi';
import ScreenHeader from '../components/ScreenHeader';
import ConfirmModal from '../components/ConfirmModal';

export default function ContasScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { token } = useAuth();
  const { accounts, refreshAccounts } = useAppData();
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          await refreshAccounts();
        } catch (error) {
          Alert.alert('Erro', error.message);
        } finally {
          setLoading(false);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleDelete = async () => {
    try {
      await deleteAccount(deleteTarget.id, token);
      setDeleteTarget(null);
      await refreshAccounts();
    } catch (error) {
      // 409 quando a conta tem transações vinculadas — mensagem própria,
      // mais clara que o texto técnico que a API manda.
      setDeleteError('Não é possível excluir: existem transações vinculadas a esta conta.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Contas" onPress={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
              Nenhuma conta ainda.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{item.name}</Text>
              <Pressable
                onPress={() => navigation.navigate('ContaForm', { mode: 'edit', account: item })}
                hitSlop={10}
                style={{ padding: 6 }}
              >
                <Feather name="edit-2" size={16} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                onPress={() => {
                  setDeleteError('');
                  setDeleteTarget(item);
                }}
                hitSlop={10}
                style={{ padding: 6 }}
              >
                <Feather name="trash-2" size={16} color={colors.danger} />
              </Pressable>
            </View>
          )}
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('ContaForm', { mode: 'create' })}
      >
        <Feather name="plus" size={26} color={colors.primaryText} />
      </Pressable>

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        title="Excluir conta"
        message={deleteError || `Excluir "${deleteTarget?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 90 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 6,
  },
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
  },
});