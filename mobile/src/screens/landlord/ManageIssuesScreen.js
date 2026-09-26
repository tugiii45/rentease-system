import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

const statusColors = {
  OPEN: { bg: colors.dangerBg, text: colors.danger },
  IN_PROGRESS: { bg: colors.warningBg, text: colors.warning },
  RESOLVED: { bg: colors.successBg, text: colors.success },
};

const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

export default function ManageIssuesScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [saving, setSaving] = useState(false);

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

  const openIssue = (issue) => {
    setSelectedIssue(issue);
    setNotes(issue.landlord_notes || '');
    setStatus(issue.status);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/issues/${selectedIssue.id}/`, {
        status,
        landlord_notes: notes,
      });
      setSelectedIssue(null);
      loadIssues();
    } catch (error) {
      Alert.alert('Couldn\'t update', 'Please try again.');
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
    <View style={styles.container}>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          <Text style={[type.body, { textAlign: 'center', marginTop: spacing.lg }]}>No issues reported yet.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openIssue(item)}>
            <View style={styles.cardTop}>
              <Text style={type.body}>{item.tenant_name} — {item.unit_code}</Text>
              <View style={[styles.badge, { backgroundColor: statusColors[item.status]?.bg }]}>
                <Text style={[styles.badgeText, { color: statusColors[item.status]?.text }]}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text style={[type.label, { marginTop: spacing.xs }]}>{item.category.replace('_', ' ')}</Text>
            <Text style={[type.body, { marginTop: spacing.xs }]} numberOfLines={2}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedIssue} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={type.title}>{selectedIssue?.tenant_name} — {selectedIssue?.unit_code}</Text>
            <Text style={[type.body, { marginTop: spacing.sm }]}>{selectedIssue?.description}</Text>

            <Text style={[type.label, { marginTop: spacing.lg }]}>STATUS</Text>
            <View style={styles.statusRow}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.statusChip, status === option && styles.statusChipSelected]}
                  onPress={() => setStatus(option)}
                >
                  <Text style={[type.label, status === option && { color: colors.surface }]}>
                    {option.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[type.label, { marginTop: spacing.lg }]}>NOTES FOR TENANT</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Plumber scheduled for tomorrow"
              multiline
            />

            <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Save update</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedIssue(null)} style={{ marginTop: spacing.md, alignItems: 'center' }}>
              <Text style={[type.body, { color: colors.inkMuted }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: 'Manrope_700Bold', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, maxHeight: '85%' },
  statusRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap' },
  statusChip: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  statusChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  textArea: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 14,
    marginTop: spacing.xs, fontFamily: 'Manrope_500Medium', fontSize: 15,
    color: colors.ink, backgroundColor: colors.background, textAlignVertical: 'top', minHeight: 80,
  },
  button: {
    backgroundColor: colors.primary, padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: spacing.lg,
  },
  buttonText: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: colors.surface },
});