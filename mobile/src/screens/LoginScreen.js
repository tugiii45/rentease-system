import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { colors, spacing, type } from '../theme/theme';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Missing details', 'Enter your username and password to continue.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/token/', { username, password });
      const { access, refresh } = response.data;
      await AsyncStorage.setItem('accessToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);

      const userResponse = await apiClient.get('/accounts/me/');
      const user = userResponse.data;
      await AsyncStorage.setItem('userRole', user.role);

      if (user.role === 'LANDLORD') {
        navigation.replace('LandlordDashboard');
      } else {
        Alert.alert('Tenant screens coming soon');
      }
    } catch (error) {
      Alert.alert('Couldn\'t log in', 'Check your username and password and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.brandPanel}>
        <Text style={styles.wordmark}>Rentease</Text>
        <Text style={styles.tagline}>Manage your home, your way</Text>
      </View>

      <View style={styles.form}>
        <Text style={type.label}>USERNAME</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="e.g. johndoe"
          placeholderTextColor={colors.inkMuted}
        />

        <Text style={[type.label, { marginTop: spacing.md }]}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.inkMuted}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Log in</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  brandPanel: {
    backgroundColor: colors.primary,
    paddingTop: 90,
    paddingBottom: 48,
    paddingHorizontal: spacing.lg,
  },
  wordmark: { fontFamily: 'Manrope_800ExtraBold', fontSize: 34, color: colors.surface },
  tagline: { fontFamily: 'Manrope_500Medium', fontSize: 15, color: '#CFE0D6', marginTop: spacing.xs },
  form: { padding: spacing.lg, marginTop: spacing.lg },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginTop: spacing.xs,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 17,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonText: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: colors.surface },
});