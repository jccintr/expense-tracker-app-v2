import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import ModalHeader from '../components/ModalHeader';
import TextField from '../components/inputs/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { createCategory, updateCategory } from '../api/categoriesApi';

export default function CategoriaFormScreen({ route, navigation }) {
  const { mode, category } = route.params;
  const isEdit = mode === 'edit';
  const { colors } = useAppTheme();
  const { token } = useAuth();
  const { refreshCategories } = useAppData();

  const [name, setName] = useState(category?.name ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (name.trim().length < 3) {
      Alert.alert('Aviso', 'Nome deve ter pelo menos 3 caracteres.');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateCategory(category.id, { name: name.trim() }, token);
      } else {
        await createCategory({ name: name.trim() }, token);
      }
      await refreshCategories();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ModalHeader title={isEdit ? 'Editar categoria' : 'Nova categoria'} onClose={() => navigation.goBack()} />
      <View style={styles.container}>
        <TextField label="Nome da categoria" placeholder="Ex: Transporte" value={name} onChangeText={setName} />
        <PrimaryButton
          title={isEdit ? 'Salvar alterações' : 'Criar categoria'}
          onPress={handleSave}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});