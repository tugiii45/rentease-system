import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { colors, spacing, type } from '../theme/theme';

export default function ThreadListScreen({ navigation }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const loadThreads = async () => {
    try {
      const response = await apiClient.get('/threads/');
      setThreads(response.data);
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadThreads();
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
        data={threads}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          userRole === 'LANDLORD' ? (
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NewThread')}>
              <Text style={styles.addButtonText}>+ Start a conversation</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <Text style={[type.body, { textAlign: 'center', marginTop: spacing.lg }]}>No conversations yet.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.threadRow}
            onPress={() => navigation.navigate('Chat', { threadId: item.id, threadName: item.thread_type === 'GROUP' ? item.name : item.participant_names.join(', ') })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.thread_type === 'GROUP' ? item.name : item.participant_names[0])?.[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.body}>{item.thread_type === 'GROUP' ? item.name : item.participant_names.join(', ')}</Text>
              <Text style={type.label} numberOfLines={1}>
                {item.last_message ? `${item.last_message.sender_name}: ${item.last_message.content}` : 'No messages yet'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#0b1f18',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  addButtonText: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: colors.surface },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: colors.surface },
});