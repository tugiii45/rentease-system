import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function CreateTenantScreen({ navigation }) {
  const [vacantUnits, setVacantUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get('/units/').then((res) => {
      setVacantUnits(res.data.filter((u) => !u.is_occupied));
    });
  }, []);

  const handleSubmit = async () => {
    if (!selectedUnitId || !firstName || !lastName || !email || !phoneNumber || !depositAmount) {
      Alert.alert('Missing details', 'Please fill in every field and select a unit.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/accounts/create-tenant/', {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        unit_id: selectedUnitId,
        move_in_date: new Date().toISOString().split('T')[0],
        deposit_amount: depositAmount,
      });
      Alert.alert('Tenant added', 'Their login details have been emailed to them.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message = error.response?.data?.email?.[0]
        || error.response?.data?.phone_number?.[0]
        || 'Something went wrong. Please check the details and try again.';
      Alert.alert('Couldn\'t add tenant', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.label}>SELECT VACANT UNIT</Text>
      <View style={styles.unitPicker}>
        {vacantUnits.length === 0 ? (
          <Text style={[type.body, { padding: spacing.md }]}>No vacant units available.</Text>
        ) : (
          vacantUnits.map((unit) => (
            <TouchableOpacity
              key={unit.id}
              style={[styles.unitOption, selectedUnitId === unit.id && styles.unitOptionSelected]}
              onPress={() => setSelectedUnitId(unit.id)}
            >
              <Text style={[type.body, selectedUnitId === unit.id && { color: colors.surface }]}>
                {unit.code} — {unit.property_name}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Text style={[type.label, { marginTop: spacing.lg }]}>FIRST NAME</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

      <Text style={[type.label, { marginTop: spacing.md }]}>LAST NAME</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

      <Text style={[type.label, { marginTop: spacing.md }]}>EMAIL</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

      <Text style={[type.label, { marginTop: spacing.md }]}>PHONE NUMBER</Text>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholder="07XXXXXXXX" />

      <Text style={[type.label, { marginTop: spacing.md }]}>DEPOSIT AMOUNT (KES)</Text>
      <TextInput style={styles.input} value={depositAmount} onChangeText={setDepositAmount} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
        {submitting ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Add tenant</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  unitPicker: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  unitOption: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  unitOptionSelected: { backgroundColor: colors.primary },
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