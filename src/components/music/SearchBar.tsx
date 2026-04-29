import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder }: Props) {
    return (
      <LinearGradient
        colors={["#5C4326", "#8B6B3B"]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.banner}
      >
        <Ionicons name="search" size={18} color="#FFF8EA" style={styles.icon} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#FFF1D9"
          value={value}
          onChangeText={onChange}
          style={styles.input}
          returnKeyType="search"
          accessible
          accessibilityLabel={placeholder}
        />
      </LinearGradient>
    );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    marginVertical: Spacing.two,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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
