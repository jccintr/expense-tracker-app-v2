import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeContext';
import PreloadScreen from '../screens/PreloadScreen';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import TabNavigator from './TabNavigator';
import BuscaScreen from '../screens/BuscaScreen';
import ContasScreen from '../screens/ContasScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import TransacaoFormScreen from '../screens/TransacaoFormScreen';
import ContaFormScreen from '../screens/ContaFormScreen';
import CategoriaFormScreen from '../screens/CategoriaFormScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="Preload"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Preload" component={PreloadScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="Home" component={TabNavigator} />

      <Stack.Screen name="Busca" component={BuscaScreen} />
      <Stack.Screen name="Contas" component={ContasScreen} />
      <Stack.Screen name="Categorias" component={CategoriasScreen} />

      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="TransacaoForm" component={TransacaoFormScreen} />
        <Stack.Screen name="ContaForm" component={ContaFormScreen} />
        <Stack.Screen name="CategoriaForm" component={CategoriaFormScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}