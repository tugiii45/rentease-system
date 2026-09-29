import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function NewThreadScreen({ navigation }) {
  const [tenants, setTenants] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/occupancy-summary/').then((res) => {
      const allOccupied = res.data.properties.flatMap((p) => p.occupied_units);
      setTenants(allOccupied.filter((u) => u.tenant_id));
      setLoading(false);
    });
  }, []);

  const toggleTenant = (tenantId) => {
    setSelectedIds((prev) =>
      prev.includes(tenantId) ? prev.filter((id) => id !== tenantId) : [...prev, tenantId]
    );
  };

  const isGroup = selectedIds.length > 1;

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('Select at least one tenant');
      return;
    }
    if (isGroup && !groupName.trim()) {
      Alert.alert('Group name needed', 'Please name this group conversation.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/threads/', {
        thread_type: isGroup ? 'GROUP' : 'DIRECT',
        name: isGroup ? groupName : '',
        participants: selectedIds,
      });
      Alert.alert('Conversation started', '', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Couldn\'t start conversation', 'Please try again.');
    } finally {
      setSubmitting(false);
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
      <Text style={type.label}>SELECT TENANT(S)</Text>
      <Text style={[type.label, { marginBottom: spacing.sm }]}>Select more than one to start a group</Text>
      <View style={styles.list}>
        {tenants.map((tenant) => (
          <TouchableOpacity
            key={tenant.tenant_id}
            style={styles.tenantRow}
            onPress={() => toggleTenant(tenant.tenant_id)}
          >
            <View style={[styles.checkbox, selectedIds.includes(tenant.tenant_id) && styles.checkboxSelected]} />
            <Text style={type.body}>{tenant.tenant_name} — Unit {tenant.code}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isGroup && (
        <>
          <Text style={[type.label, { marginTop: spacing.lg }]}>GROUP NAME</Text>
          <TextInput style={styles.input} value={groupName} onChangeText={setGroupName} placeholder="e.g. Block A Tenants" />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Start conversation</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  list: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  tenantRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: colors.border },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
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