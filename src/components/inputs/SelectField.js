import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeContext';

// Seletor tipo "select" — mostra o valor escolhido numa caixa com a mesma
// cara do TextField, e abre uma lista em modal pra escolher. Usado pra
// categoria/conta no formulário de transação e pros filtros de busca.
// Construído do zero (em vez de @react-native-picker/picker) pra ficar
// visualmente consistente com os outros inputs e não depender de mais um
// módulo nativo pra travar em versão.
export default function SelectField({ label, value, options, onChange, placeholder = 'Selecione' }) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={{ color: selectedOption ? colors.text : colors.placeholder, fontSize: 15 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{label || 'Selecione'}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              style={{ maxHeight: 360 }}
              ListEmptyComponent={
                <Text style={{ color: colors.textSecondary, padding: 16 }}>Nenhuma opção disponível.</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[styles.option, { borderBottomColor: colors.border }]}
                >
                  <Text style={{ color: colors.text, fontSize: 15 }}>{item.label}</Text>
                  {item.value === value && <Feather name="check" size={18} color={colors.primary} />}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  field: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: 16, paddingBottom: 24 },
  sheetTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 20, marginBottom: 8 },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
});
