import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, variant = 'primary' }) {
  const { colors } = useAppTheme();
  const isDanger = variant === 'danger';
  const bg = isDanger ? colors.danger : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryText} />
      ) : (
        <Text style={[styles.text, { color: colors.primaryText }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 15, fontWeight: '700' },
});
