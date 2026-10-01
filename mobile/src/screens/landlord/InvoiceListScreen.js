import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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
      data={invoices}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: spacing.lg }}
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: 'Manrope_700Bold', fontSize: 11 },
});