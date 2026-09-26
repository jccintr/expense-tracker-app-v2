import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

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
        style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.border, }]}
      >
        <Text style={{ color: selectedOption ? colors.text : colors.placeholder, fontSize: 15 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        {/*
          No Android, o Modal do RN abre numa janela nativa separada (um
          Dialog), fora da árvore de onde o SafeAreaProvider raiz (App.js)
          mede os insets. Num build compilado (APK), essa janela do modal
          fica sob a navigation bar do sistema, mas o insets.bottom lido do
          provider raiz não reflete essa janela nova — daí o modal aparecer
          por baixo da barra. No Expo Go isso "funciona por acidente" (o
          host do Expo Go já lida com a área do sistema de outro jeito), o
          que também explica por que usar insets.bottom ali criava padding
          duplicado só no Expo Go.
          A correção recomendada pela própria lib é aninhar um novo
          SafeAreaProvider dentro do Modal, e ler os insets com
          useSafeAreaInsets() a partir de um componente que é filho DESSE
          provider aninhado (não do raiz) — assim o valor é medido pra
          janela do modal em qualquer ambiente (Expo Go ou build nativo).
        */}
        <SafeAreaProvider>
          <SelectFieldSheet
            colors={colors}
            label={label}
            options={options}
            value={value}
            onChange={onChange}
            onClose={() => setOpen(false)}
          />
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

function SelectFieldSheet({ colors, label, options, value, onChange, onClose }) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable
        style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 24) }]}
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
                onClose();
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
  sheet: {
     borderTopLeftRadius: 16,
     borderTopRightRadius: 16,
     paddingTop: 16,
   //  paddingBottom: 24,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 8 },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
});