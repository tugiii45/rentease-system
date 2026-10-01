import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function PropertyDetailScreen({ route, navigation }) {
  const propertyId = route?.params?.propertyId;
  const [property, setProperty] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!propertyId) {
    return (
      <View style={styles.centered}>
        <Text style={type.body}>No property selected.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const loadProperty = async () => {
    try {
      const response = await apiClient.get(`/properties/${propertyId}/`);
      setProperty(response.data);
      setName(response.data.name);
      setAddress(response.data.address || '');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProperty();
    }, [propertyId])
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/properties/${propertyId}/`, { name, address });
      Alert.alert('Saved', 'Property details updated.');
      loadProperty();
    } catch (error) {
      Alert.alert('Couldn\'t save', 'Please try again.');
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
      <Text style={type.label}>PROPERTY NAME</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={[type.label, { marginTop: spacing.md }]}>ADDRESS</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Save changes</Text>}
      </TouchableOpacity>

      <Text style={[type.title, styles.sectionTitle]}>Units ({property?.units?.length || 0})</Text>
      {property?.units?.map((unit) => (
        <TouchableOpacity
          key={unit.id}
          style={styles.unitRow}
          onPress={() => navigation.navigate('EditUnit', { unitId: unit.id })}
        >
          <View>
            <Text style={type.body}>{unit.code}</Text>
            <Text style={type.label}>KES {unit.monthly_rent}/month</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: unit.is_occupied ? colors.success : colors.border }]} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
  sectionTitle: { marginTop: spacing.xxl, marginBottom: spacing.sm },
  unitRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});