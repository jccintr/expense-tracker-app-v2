import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';

// Cabeçalho próprio pras telas em modal (TransacaoForm/ContaForm/CategoriaForm).
// Existe por causa de um bug conhecido e em aberto do react-native-screens
// no Android: o header NATIVO do native-stack, em telas com
// presentation:'modal', não calcula certo o espaço da status bar desde a
// v4.10 (RN 0.81 / edge-to-edge por padrão) — headerStatusBarHeight não
// resolve de forma confiável nesse caso específico. Em vez de depender
// desse cálculo nativo problemático, essas 3 telas usam headerShown:false
// no Stack.Group e renderizam ESTE componente, que aplica o inset da
// status bar na mão (useSafeAreaInsets), sem depender da lib nativa.
export default function ModalHeader({ title, onClose }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 10, backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <Pressable onPress={onClose} hitSlop={12} style={styles.closeButton}>
        <Feather name="x" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '700', flex: 1, marginRight: 12 },
  closeButton: { padding: 2 },
});