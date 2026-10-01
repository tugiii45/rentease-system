import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

const statusColors = {
  PAID: { bg: colors.successBg, text: colors.success },
  PARTIAL: { bg: colors.warningBg, text: colors.warning },
  UNPAID: { bg: colors.dangerBg, text: colors.danger },
};

export default function InvoiceListScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadInvoices = async () => {
    try {
      const response = await apiClient.get('/invoices/');
      setInvoices(response.data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [])
  );

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.tenant_name.toLowerCase().includes(searchText.toLowerCase()) ||
      inv.unit_code.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={filteredInvoices}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: spacing.lg }}
      ListHeaderComponent={
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by tenant or unit..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={colors.inkMuted}
          />
          <View style={styles.filterRow}>
            {['ALL', 'PAID', 'PARTIAL', 'UNPAID'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, statusFilter === f && styles.filterChipSelected]}
                onPress={() => setStatusFilter(f)}
              >
                <Text style={[type.label, statusFilter === f && { color: colors.surface }]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      }
      ListEmptyComponent={
        <Text style={[type.body, { textAlign: 'center', marginTop: spacing.lg }]}>No invoices match your search.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('AddCharges', {
            invoiceId: item.id,
            tenantName: item.tenant_name,
            unitCode: item.unit_code,
          })}
        >
          <View style={styles.cardTop}>
            <Text style={type.body}>{item.tenant_name} — {item.unit_code}</Text>
            <View style={[styles.badge, { backgroundColor: statusColors[item.status]?.bg }]}>
              <Text style={[styles.badgeText, { color: statusColors[item.status]?.text }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={[type.label, { marginTop: spacing.xs }]}>KES {item.amount_due} · {item.month}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  searchInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 12,
    marginBottom: spacing.sm, fontFamily: 'Manrope_500Medium', fontSize: 15,
    color: colors.ink, backgroundColor: colors.surface,
  },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, flexWrap: 'wrap' },
  filterChip: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  filterChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: 'Manrope_700Bold', fontSize: 11 },
});