import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

export default function ConfirmModal({ visible, title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.button, { borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[styles.button, { backgroundColor: colors.danger }]}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 14, padding: 20 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  message: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  button: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
});
