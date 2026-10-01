import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import apiClient from "../../api/client";
import { colors, spacing, type } from "../../theme/theme";

const statusColors = {
  PAID: { bg: colors.successBg, text: colors.success },
  PARTIAL: { bg: colors.warningBg, text: colors.warning },
  UNPAID: { bg: colors.dangerBg, text: colors.danger },
};

export default function TenantHomeScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [invoicesRes, noticesRes] = await Promise.all([
        apiClient.get("/invoices/"),
        apiClient.get("/notices/"),
      ]);
      setInvoices(invoicesRes.data);
      setNotices(noticesRes.data);
    } catch (error) {
      console.log("Tenant home load error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentInvoice = invoices[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={type.label}>THIS MONTH'S RENT</Text>

      {currentInvoice ? (
        <TouchableOpacity
          style={styles.invoiceCard}
          onPress={() => navigation.navigate("PayRent", { invoiceId: currentInvoice.id })}
          activeOpacity={0.85}
        >
          <View style={styles.invoiceTop}>
            <Text style={type.huge}>KES {currentInvoice.amount_due}</Text>
            <View style={[styles.badge, { backgroundColor: statusColors[currentInvoice.status]?.bg }]}> 
              <Text style={[styles.badgeText, { color: statusColors[currentInvoice.status]?.text }]}>{currentInvoice.status}</Text>
            </View>
          </View>
          <Text style={type.subtitle}>Unit {currentInvoice.unit_code} · Due {currentInvoice.due_date}</Text>

          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={type.label}>Rent</Text>
              <Text style={type.body}>KES {currentInvoice.rent_amount}</Text>
            </View>
            {parseFloat(currentInvoice.water_amount) > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={type.label}>Water</Text>
                <Text style={type.body}>KES {currentInvoice.water_amount}</Text>
              </View>
            )}
            {parseFloat(currentInvoice.garbage_amount) > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={type.label}>Garbage</Text>
                <Text style={type.body}>KES {currentInvoice.garbage_amount}</Text>
              </View>
            )}
            {parseFloat(currentInvoice.other_amount) > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={type.label}>{currentInvoice.other_description || 'Other'}</Text>
                <Text style={type.body}>KES {currentInvoice.other_amount}</Text>
              </View>
            )}
            {parseFloat(currentInvoice.balance_brought_forward) > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={[type.label, { color: colors.danger }]}>Balance b/f</Text>
                <Text style={[type.body, { color: colors.danger }]}>KES {currentInvoice.balance_brought_forward}</Text>
              </View>
            )}
          </View>

          {currentInvoice.status !== 'PAID' && (
            <View style={styles.payButton}>
              <Text style={styles.payButtonText}>Pay now</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyState}>
          <Text style={type.body}>No invoice yet for this month.</Text>
        </View>
      )}

      <Text style={[type.title, styles.sectionTitle]}>Quick actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyIssues')} activeOpacity={0.85}>
          <Text style={styles.actionText}>Report or view issues</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, styles.primaryAction]} onPress={() => navigation.navigate('ThreadList')} activeOpacity={0.85}>
          <Text style={[styles.actionText, styles.primaryText]}>Messages</Text>
        </TouchableOpacity>
      </View>

      <Text style={[type.title, styles.sectionTitle]}>Notices</Text>
      {notices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={type.body}>No notices yet.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {notices.map((notice, index) => (
            <View key={notice.id} style={[styles.noticeRow, index === notices.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.noticeHeader}>
                {notice.is_pinned && <View style={styles.pinDot} />}
                <Text style={type.body}>{notice.title}</Text>
              </View>
              <Text style={[type.label, { marginTop: spacing.xs }]}>{notice.body}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.xs,
    shadowColor: '#0a1815',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  invoiceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
  breakdown: { marginTop: spacing.md },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  payButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: colors.surface,
  },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: '#0a1815',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: colors.ink,
  },
  primaryText: {
    color: colors.surface,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.xs,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  noticeRow: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
});
