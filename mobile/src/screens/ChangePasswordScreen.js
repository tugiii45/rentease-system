import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../api/client';
import { colors, spacing, type } from '../theme/theme';

export default function ChangePasswordScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing details', 'Please fill in every field.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords don\'t match', 'Please make sure both new password fields match.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/accounts/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      Alert.alert('Password changed', 'Your password has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message = error.response?.data?.error || 'Please try again.';
      Alert.alert('Couldn\'t change password', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={type.label}>CURRENT PASSWORD</Text>
      <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} secureTextEntry />

      <Text style={[type.label, { marginTop: spacing.md }]}>NEW PASSWORD</Text>
      <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry />

      <Text style={[type.label, { marginTop: spacing.md }]}>CONFIRM NEW PASSWORD</Text>
      <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Update password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 14,
    marginTop: spacing.xs, fontFamily: 'Manrope_500Medium', fontSize: 16,
    color: colors.ink, backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary, padding: 17, borderRadius: 10,
    alignItems: 'center', marginTop: spacing.xl,
  },
  buttonText: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: colors.surface },
});