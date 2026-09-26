import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';

export default function PerfilScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarInitial}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
      <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>

      <View style={styles.menu}>
        <Pressable
          style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Contas')}
        >
          <Feather name="credit-card" size={18} color={colors.text} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>Contas</Text>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Categorias')}
        >
          <Feather name="tag" size={18} color={colors.text} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>Categorias</Text>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Sair da conta" onPress={handleLogout} variant="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarInitial: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  name: { fontSize: 18, fontWeight: '700' },
  email: { fontSize: 14, marginTop: 4 },
  menu: { width: '100%', marginTop: 32, gap: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  footer: { width: '100%', marginTop: 'auto', marginBottom: 24 },
});
