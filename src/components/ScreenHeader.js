import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';

// Cabeçalho próprio, reaproveitado por TODAS as telas com título — não só
// os modais. Existe porque o header NATIVO do native-stack, no Android,
// não está calculando certo o espaço da status bar neste app (RN 0.81 +
// edge-to-edge por padrão): a princípio parecia um problema só de telas em
// presentation:'modal', mas se repetiu também em telas empilhadas normais
// (ex: Busca). Ou seja, o problema é mais amplo do que "só modal" nesse
// setup — por segurança, TODA tela com título usa este componente em vez
// do header nativo, com headerShown:false no RootNavigator inteiro.
//
// icon: 'close' (X, usado nos 3 formulários em modal) ou 'back' (chevron,
// usado nas telas empilhadas normais — Busca/Contas/Categorias).
export default function ScreenHeader({ title, onPress, icon = 'back' }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 10, backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      {icon === 'back' && (
        <Pressable onPress={onPress} hitSlop={12} style={styles.sideButton}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </Pressable>
      )}

      <Text
        style={[styles.title, { color: colors.text, textAlign: icon === 'back' ? 'left' : 'left' }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {icon === 'close' && (
        <Pressable onPress={onPress} hitSlop={12} style={styles.sideButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '700', flex: 1, marginHorizontal: 8 },
  sideButton: { padding: 6 },
});