// Paleta separada por tema. Nenhuma tela/componente deve usar cor "solta"
// — sempre importar via useAppTheme() (ThemeContext.js) e consumir daqui.

export const lightColors = {
  background: '#F5F7F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F0',
  border: '#E0E5E2',
  text: '#151A17',
  textSecondary: '#666F6A',
  placeholder: '#9AA39D',
  primary: '#0B6E4F',
  primaryText: '#FFFFFF',
  danger: '#D6483F',
  success: '#0B6E4F',
  income: '#0B6E4F', // reservado (a API só rastreia despesas, sem receita)
  expense: '#D6483F',
  chartPalette: ['#0B6E4F', '#2E9E5B', '#E0A62B', '#D6483F', '#5B5FEF', '#0EA5A4', '#B85C9E', '#8A6D3B'],
  statusBarStyle: 'dark',
};

export const darkColors = {
  background: '#0E1512',
  surface: '#171F1B',
  surfaceAlt: '#1F2822',
  border: '#2A3530',
  text: '#EFF3F0',
  textSecondary: '#9BA79F',
  placeholder: '#6C766F',
  primary: '#3FBE86',
  primaryText: '#0B1310',
  danger: '#F1746C',
  success: '#3FBE86',
  income: '#3FBE86',
  expense: '#F1746C',
  chartPalette: ['#3FBE86', '#6EDBA6', '#E8C260', '#F1746C', '#8B8FF2', '#4DD4D2', '#D18AC0', '#C2A570'],
  statusBarStyle: 'light',
};
