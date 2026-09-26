import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function ManageNoticesScreen({ navigation }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotices = async () => {
    try {
      const response = await apiClient.get('/notices/');
      setNotices(response.data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotices();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert('Delete notice', 'Are you sure you want to remove this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await apiClient.delete(`/notices/${id}/`);
          loadNotices();
        },
      },
    ]);
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
        data={notices}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('PostNotice')}>
            <Text style={styles.addButtonText}>+ Post a notice</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <Text style={[type.body, { textAlign: 'center', marginTop: spacing.lg }]}>No notices posted yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={type.body}>{item.title}</Text>
              {item.is_pinned && (
                <View style={styles.pinBadge}>
                  <Text style={styles.pinBadgeText}>Pinned</Text>
                </View>
              )}
            </View>
            <Text style={[type.label, { marginTop: spacing.xs }]}>{item.body}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteLink}>
              <Text style={styles.deleteLinkText}>Delete</Text>
            </TouchableOpacity>
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
  pinBadge: { backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  pinBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10, color: colors.surface },
  deleteLink: { marginTop: spacing.sm },
  deleteLinkText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: colors.danger },
});