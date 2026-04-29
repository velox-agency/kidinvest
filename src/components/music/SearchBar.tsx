import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder }: Props) {
  const colorScheme = Colors[Platform.OS ? 'dark' : 'dark'];

  return (
    <View style={[styles.container, { backgroundColor: '#11121A' }]}> 
      <Ionicons name="search" size={18} color="#9CA3FF" style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3FF"
        value={value}
        onChangeText={onChange}
        style={styles.input}
        returnKeyType="search"
        accessible
        accessibilityLabel={placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    marginVertical: Spacing.two,
    width: '100%'
  },
  icon: {
    marginRight: 8,
    opacity: 0.9,
  },
  input: {
    flex: 1,
    color: '#E6E9FF',
    fontSize: 16,
  },
});
