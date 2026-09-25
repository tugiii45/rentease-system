import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function CreatePropertyScreen({ navigation }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Missing details', 'Please enter a name for this property.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/properties/', { name, address });
      Alert.alert('Property added', `${name} has been created.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Couldn\'t add property', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={type.label}>PROPERTY NAME</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Sunrise Apartments" />

      <Text style={[type.label, { marginTop: spacing.md }]}>ADDRESS (OPTIONAL)</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="e.g. Ngong Road, Nairobi" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
        {submitting ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Add property</Text>}
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