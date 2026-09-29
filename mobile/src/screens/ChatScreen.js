import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { getWebSocketUrl } from '../api/client';
import { colors, spacing, type } from '../theme/theme';

export default function ChatScreen({ route, navigation }) {
  const { threadId, threadName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [myUserId, setMyUserId] = useState(null);
  const ws = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: threadName || 'Chat' });
  }, [threadName]);

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      // Load message history first
      const historyRes = await apiClient.get('/messages/', { params: { thread: threadId } });
      if (isMounted) setMessages(historyRes.data);

      const userRes = await apiClient.get('/accounts/me/');
      if (isMounted) setMyUserId(userRes.data.id);

      // Then connect the live WebSocket
      const token = await AsyncStorage.getItem('accessToken');
      const socket = new WebSocket(getWebSocketUrl(threadId, token));

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          {
            id: data.message_id,
            content: data.message,
            sender: data.sender_id,
            sender_name: data.sender_name,
            sent_at: data.sent_at,
          },
        ]);
      };

      socket.onerror = (error) => {
        console.log('WebSocket error:', error.message);
      };

      ws.current = socket;
    };

    setup();

    return () => {
      isMounted = false;
      ws.current?.close();
    };
  }, [threadId]);

  const sendMessage = () => {
    if (!inputText.trim() || !ws.current) return;
    ws.current.send(JSON.stringify({ message: inputText.trim() }));
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={{ padding: spacing.md }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMine = item.sender === myUserId;
          return (
            <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                {!isMine && <Text style={styles.senderName}>{item.sender_name}</Text>}
                <Text style={[type.body, isMine && { color: colors.surface }]}>{item.content}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  bubbleRow: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 14, padding: spacing.sm, paddingHorizontal: spacing.md },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleMine: { backgroundColor: colors.primary },
  senderName: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: colors.primary, marginBottom: 2 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    padding: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 20,
    paddingHorizontal: spacing.md, paddingVertical: 10, fontFamily: 'Manrope_500Medium',
    fontSize: 15, maxHeight: 100, backgroundColor: colors.background,
  },
  sendButton: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12 },
  sendButtonText: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: colors.surface },
});