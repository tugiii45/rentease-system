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

  const currentInvoice = invoices[0]; // most recent, since backend orders by -month

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
          onPress={() =>
            navigation.navigate("PayRent", { invoiceId: currentInvoice.id })
          }
          activeOpacity={0.85}
        >
          <View style={styles.invoiceTop}>
            <Text style={type.huge}>KES {currentInvoice.amount_due}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: statusColors[currentInvoice.status]?.bg },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: statusColors[currentInvoice.status]?.text },
                ]}
              >
                {currentInvoice.status}
              </Text>
            </View>
          </View>
          <Text style={type.subtitle}>
            Unit {currentInvoice.unit_code} · Due {currentInvoice.due_date}
          </Text>

          {currentInvoice.status !== "PAID" && (
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

      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.primary,
          borderRadius: 10,
          padding: 14,
          alignItems: "center",
          marginTop: spacing.lg,
        }}
        onPress={() => navigation.navigate("MyIssues")}
      >
        <Text
          style={{
            fontFamily: "Manrope_700Bold",
            fontSize: 15,
            color: colors.primary,
          }}
        >
          Report or view issues
        </Text>
      </TouchableOpacity>

      <Text style={[type.title, styles.sectionTitle]}>Notices</Text>
      {notices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={type.body}>No notices yet.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {notices.map((notice, index) => (
            <View
              key={notice.id}
              style={[
                styles.noticeRow,
                index === notices.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.noticeHeader}>
                {notice.is_pinned && <View style={styles.pinDot} />}
                <Text style={type.body}>{notice.title}</Text>
              </View>
              <Text style={[type.label, { marginTop: spacing.xs }]}>
                {notice.body}
              </Text>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.xs,
  },
  invoiceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontFamily: "Manrope_700Bold", fontSize: 12 },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: spacing.md,
  },
  payButtonText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 15,
    color: colors.surface,
  },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.xs,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeRow: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  noticeHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
