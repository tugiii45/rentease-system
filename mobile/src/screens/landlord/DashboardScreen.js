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
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          borderRadius: 10,
          padding: 14,
          alignItems: "center",
          marginBottom: spacing.lg,
        }}
        onPress={() => navigation.navigate("TenantList")}
      >
        <Text
          style={{
            fontFamily: "Manrope_700Bold",
            color: colors.surface,
            fontSize: 15,
          }}
        >
          Manage Units & Tenants
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderRadius: 10,
            padding: 14,
            alignItems: "center",
            marginBottom: spacing.sm,
          }}
          onPress={() => navigation.navigate("ManageNotices")}
        >
          <Text
            style={{
              fontFamily: "Manrope_700Bold",
              color: colors.primary,
              fontSize: 15,
            }}
          >
            Notices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderRadius: 10,
            padding: 14,
            alignItems: "center",
            marginBottom: spacing.lg,
          }}
          onPress={() => navigation.navigate("ManageIssues")}
        >
          <Text
            style={{
              fontFamily: "Manrope_700Bold",
              color: colors.primary,
              fontSize: 15,
            }}
          >
            Manage Issues
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <Text style={type.label}>{financeSummary?.month?.toUpperCase()}</Text>
      <Text style={type.label}>{financeSummary?.month?.toUpperCase()}</Text>
      <Text style={type.huge}>{financeSummary?.collection_rate}%</Text>
      <View style={styles.underline} />
      <Text style={[type.subtitle, { marginTop: spacing.xs }]}>
        KES {financeSummary?.total_collected} collected of KES{" "}
        {financeSummary?.total_expected} expected
      </Text>

      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={[type.title, { color: colors.success }]}>
            {financeSummary?.paid_count}
          </Text>
          <Text style={type.label}>Paid</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[type.title, { color: colors.warning }]}>
            {financeSummary?.partial_count}
          </Text>
          <Text style={type.label}>Partial</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[type.title, { color: colors.danger }]}>
            {financeSummary?.unpaid_count}
          </Text>
          <Text style={type.label}>Unpaid</Text>
        </View>
      </View>

      <Text style={[type.title, styles.sectionTitle]}>Occupancy</Text>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={type.title}>
            {occupancySummary?.overall.occupied_count}
          </Text>
          <Text style={type.label}>Occupied</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={type.title}>
            {occupancySummary?.overall.vacant_count}
          </Text>
          <Text style={type.label}>Vacant</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={type.title}>
            {occupancySummary?.overall.occupancy_rate}%
          </Text>
          <Text style={type.label}>Filled</Text>
        </View>
      </View>

      <Text style={[type.title, styles.sectionTitle]}>
        Tenants who haven't paid
      </Text>
      {financeSummary?.unpaid_tenants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={type.body}>Everyone has paid this month.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {financeSummary?.unpaid_tenants.map((tenant, index) => (
            <View
              key={index}
              style={[
                styles.listRow,
                index === financeSummary.unpaid_tenants.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
            >
              <View>
                <Text style={type.body}>{tenant.tenant_name}</Text>
                <Text style={type.label}>Unit {tenant.unit_code}</Text>
              </View>
              <Text
                style={[type.title, { color: colors.danger, fontSize: 16 }]}
              >
                KES {tenant.amount_due}
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
  underline: {
    width: 40,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  statRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: colors.border },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  list: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emptyState: {
    backgroundColor: colors.successBg,
    borderRadius: 12,
    padding: spacing.lg,
  },
});
