import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function CreateUnitScreen({ navigation }) {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [code, setCode] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get('/properties/').then((res) => setProperties(res.data));
  }, []);

  const handleSubmit = async () => {
    if (!selectedPropertyId || !code || !monthlyRent) {
      Alert.alert('Missing details', 'Please select a property and fill in every field.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/units/', {
        property: selectedPropertyId,
        code,
        monthly_rent: monthlyRent,
      });
      Alert.alert('Unit added', `Unit ${code} has been created.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message = error.response?.data?.non_field_errors?.[0] || 'Please check the details and try again.';
      Alert.alert('Couldn\'t add unit', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.card}>
        <Text style={type.label}>SELECT PROPERTY</Text>
        <View style={styles.picker}>
          {properties.length === 0 ? (
            <Text style={[type.body, { padding: spacing.md }]}>No properties yet. Add one first.</Text>
          ) : (
            properties.map((property) => (
              <TouchableOpacity
                key={property.id}
                style={[styles.option, selectedPropertyId === property.id && styles.optionSelected]}
                onPress={() => setSelectedPropertyId(property.id)}
              >
                <Text style={[type.body, selectedPropertyId === property.id && { color: colors.surface }]}>
                  {property.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Text style={[type.label, { marginTop: spacing.lg }]}>UNIT CODE</Text>
        <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="e.g. G5, 3A, 4G" autoCapitalize="characters" />

        <Text style={[type.label, { marginTop: spacing.md }]}>MONTHLY RENT (KES)</Text>
        <TextInput style={styles.input} value={monthlyRent} onChangeText={setMonthlyRent} keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
          {submitting ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Add unit</Text>}
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
  picker: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: spacing.xs },
  option: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionSelected: { backgroundColor: colors.primary },
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