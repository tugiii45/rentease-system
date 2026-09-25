import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

const statusColors = {
  OPEN: { bg: colors.dangerBg, text: colors.danger },
  IN_PROGRESS: { bg: colors.warningBg, text: colors.warning },
  RESOLVED: { bg: colors.successBg, text: colors.success },
};

export default function MyIssuesScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadIssues = async () => {
    try {
      const response = await apiClient.get('/issues/');
      setIssues(response.data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIssues();
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
        data={issues}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ReportIssue')}
          >
            <Text style={styles.addButtonText}>+ Report an issue</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <Text style={[type.body, { textAlign: 'center', marginTop: spacing.lg }]}>No issues reported yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={type.body}>{item.category.replace('_', ' ')}</Text>
              <View style={[styles.badge, { backgroundColor: statusColors[item.status]?.bg }]}>
                <Text style={[styles.badgeText, { color: statusColors[item.status]?.text }]}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text style={[type.label, { marginTop: spacing.xs }]}>{item.description}</Text>
            {item.landlord_notes ? (
              <View style={styles.notesBox}>
                <Text style={type.label}>LANDLORD'S UPDATE</Text>
                <Text style={type.body}>{item.landlord_notes}</Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  addButton: { backgroundColor: colors.primary, borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: spacing.lg },
  addButtonText: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: colors.surface },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: 'Manrope_700Bold', fontSize: 11 },
  notesBox: { backgroundColor: colors.background, borderRadius: 8, padding: spacing.sm, marginTop: spacing.sm },
});