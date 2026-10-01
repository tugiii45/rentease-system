import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function AddChargesScreen({ route, navigation }) {
  const { invoiceId, tenantName, unitCode } = route.params;
  const [waterAmount, setWaterAmount] = useState('');
  const [garbageAmount, setGarbageAmount] = useState('');
  const [otherAmount, setOtherAmount] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {};
      if (waterAmount) payload.water_amount = waterAmount;
      if (garbageAmount) payload.garbage_amount = garbageAmount;
      if (otherAmount) payload.other_amount = otherAmount;
      if (otherDescription) payload.other_description = otherDescription;

      await apiClient.patch(`/invoices/${invoiceId}/charges/`, payload);
      Alert.alert('Charges added', 'The invoice total has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Couldn\'t save', 'Please check the amounts and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.card}>
        <Text style={type.label}>{tenantName} — UNIT {unitCode}</Text>

        <Text style={[type.label, { marginTop: spacing.lg }]}>WATER (KES)</Text>
        <TextInput style={styles.input} value={waterAmount} onChangeText={setWaterAmount} keyboardType="numeric" placeholder="0" />

        <Text style={[type.label, { marginTop: spacing.md }]}>GARBAGE (KES)</Text>
        <TextInput style={styles.input} value={garbageAmount} onChangeText={setGarbageAmount} keyboardType="numeric" placeholder="0" />

        <Text style={[type.label, { marginTop: spacing.md }]}>OTHER CHARGE (KES)</Text>
        <TextInput style={styles.input} value={otherAmount} onChangeText={setOtherAmount} keyboardType="numeric" placeholder="0" />

        <Text style={[type.label, { marginTop: spacing.md }]}>DESCRIPTION (IF OTHER CHARGE)</Text>
        <TextInput style={styles.input} value={otherDescription} onChangeText={setOtherDescription} placeholder="e.g. Late payment penalty" />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Save charges</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#0b1f18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
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
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonText: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: colors.surface },
});