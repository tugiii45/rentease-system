import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import apiClient from "../../api/client";
import { colors, spacing, type } from "../../theme/theme";

export default function LandlordDashboardScreen({ navigation }) {
  const [financeSummary, setFinanceSummary] = useState(null);
  const [occupancySummary, setOccupancySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [financeRes, occupancyRes] = await Promise.all([
        apiClient.get("/dashboard-summary/"),
        apiClient.get("/occupancy-summary/"),
      ]);
      setFinanceSummary(financeRes.data);
      setOccupancySummary(occupancyRes.data);
    } catch (error) {
      console.log("Dashboard load error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const unpaidTenants = financeSummary?.unpaid_tenants ?? [];
  const occupancy = occupancySummary?.overall ?? {};

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
      <View style={styles.heroCard}>
        <Text style={type.label}>PORTFOLIO PERFORMANCE</Text>
        <Text style={type.huge}>{financeSummary?.collection_rate ?? 0}%</Text>
        <View style={styles.underline} />
        <Text style={[type.subtitle, { marginTop: spacing.xs }]}>
          KES {financeSummary?.total_collected ?? 0} collected of KES {financeSummary?.total_expected ?? 0} expected
        </Text>
      </View>

      <Text style={[type.title, styles.sectionTitle]}>Quick actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity style={[styles.actionCard, styles.primaryAction]} onPress={() => navigation.navigate('TenantList')} activeOpacity={0.85}>
          <Text style={[styles.actionText, styles.primaryText]}>Units & Tenants</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ManageNotices')} activeOpacity={0.85}>
          <Text style={styles.actionText}>Notices</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ManageIssues')} activeOpacity={0.85}>
          <Text style={styles.actionText}>Issues</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ThreadList')} activeOpacity={0.85}>
          <Text style={styles.actionText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('InvoiceList')} activeOpacity={0.85}>
          <Text style={styles.actionText}>Invoices</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={[type.title, { color: colors.success }]}>{financeSummary?.paid_count ?? 0}</Text>
          <Text style={type.label}>Paid</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[type.title, { color: colors.warning }]}>{financeSummary?.partial_count ?? 0}</Text>
          <Text style={type.label}>Partial</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[type.title, { color: colors.danger }]}>{financeSummary?.unpaid_count ?? 0}</Text>
          <Text style={type.label}>Unpaid</Text>
        </View>
      </View>

      <Text style={[type.title, styles.sectionTitle]}>Occupancy</Text>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={type.title}>{occupancy.occupied_count ?? 0}</Text>
          <Text style={type.label}>Occupied</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={type.title}>{occupancy.vacant_count ?? 0}</Text>
          <Text style={type.label}>Vacant</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={type.title}>{occupancy.occupancy_rate ?? 0}%</Text>
          <Text style={type.label}>Filled</Text>
        </View>
      </View>

      <Text style={[type.title, styles.sectionTitle]}>Tenants who haven't paid</Text>
      {unpaidTenants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={type.body}>Everyone has paid this month.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {unpaidTenants.map((tenant, index) => (
            <View
              key={index}
              style={[
                styles.listRow,
                index === unpaidTenants.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View>
                <Text style={type.body}>{tenant.tenant_name}</Text>
                <Text style={type.label}>Unit {tenant.unit_code}</Text>
              </View>
              <Text style={[type.title, { color: colors.danger, fontSize: 16 }]}>KES {tenant.amount_due}</Text>
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
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#081b15',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  underline: {
    width: 44,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginRight: '4%',
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 76,
    shadowColor: '#0b1d18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    width: '100%',
    marginRight: 0,
  },
  actionText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: colors.ink,
  },
  primaryText: {
    color: colors.surface,
  },
  statRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.border },
  list: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emptyState: {
    backgroundColor: colors.successBg,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#C7E5D0',
  },
});
