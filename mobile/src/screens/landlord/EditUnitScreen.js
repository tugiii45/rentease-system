import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function EditUnitScreen({ route, navigation }) {
  const { unitId } = route?.params || {};
  const [unit, setUnit] = useState(null);
  const [code, setCode] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [isOccupied, setIsOccupied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!unitId) {
    return (
      <View style={styles.centered}>
        <Text style={type.body}>No unit selected.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const loadUnit = async () => {
    if (!unitId) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`/units/${unitId}/`);
      const data = response.data;
      setUnit(data);
      setCode(data.code || '');
      setMonthlyRent(String(data.monthly_rent ?? ''));
      setIsOccupied(Boolean(data.is_occupied));
    } catch (error) {
      Alert.alert('Error', 'Could not load this unit.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUnit();
    }, [unitId])
  );

  const handleSave = async () => {
    if (!unitId) return;

    setSaving(true);
    try {
      await apiClient.patch(`/units/${unitId}/`, {
        code,
        monthly_rent: monthlyRent,
        is_occupied: isOccupied,
      });
      Alert.alert('Saved', 'Unit updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message = error.response?.data?.non_field_errors?.[0] || 'Please try again.';
      Alert.alert("Couldn't save unit", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.card}>
        <Text style={type.label}>UNIT CODE</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="e.g. G5, 3A, 4G"
          autoCapitalize="characters"
        />

        <Text style={[type.label, { marginTop: spacing.md }]}>MONTHLY RENT (KES)</Text>
        <TextInput
          style={styles.input}
          value={monthlyRent}
          onChangeText={setMonthlyRent}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setIsOccupied((prev) => !prev)}
          activeOpacity={0.85}
        >
          <Text style={type.body}>Marked as occupied</Text>
          <View style={[styles.switch, isOccupied && styles.switchOn]}>
            <View style={[styles.switchThumb, isOccupied && styles.switchThumbOn]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Save changes</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 16,
    backgroundColor: colors.border,
    padding: 3,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
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
