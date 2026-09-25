import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function TenantListScreen({ navigation }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUnits = async () => {
    try {
      const response = await apiClient.get('/units/');
      setUnits(response.data);
    } catch (error) {
      console.log('Error loading units:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reload every time this screen comes into focus, so it's fresh after adding a tenant
  useFocusEffect(
    useCallback(() => {
      loadUnits();
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
    <View style={styles.container}>
      <FlatList
        data={units}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation.navigate('CreateProperty')}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionButtonText, styles.secondaryActionText]}>+ Property</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation.navigate('CreateUnit')}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionButtonText, styles.secondaryActionText]}>+ Unit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => navigation.navigate('CreateTenant')}
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>+ Tenant</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.unitRow}>
            <View style={styles.unitLeft}>
              <View style={[styles.dot, { backgroundColor: item.is_occupied ? colors.success : colors.border }]} />
              <View>
                <Text style={type.body}>{item.code} — {item.property_name}</Text>
                <Text style={type.label}>KES {item.monthly_rent} / month</Text>
              </View>
            </View>
            <Text style={[type.label, { color: item.is_occupied ? colors.success : colors.inkMuted }]}>
              {item.is_occupied ? 'Occupied' : 'Vacant'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: colors.surface,
  },
  secondaryActionText: {
    color: colors.ink,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  unitLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
});