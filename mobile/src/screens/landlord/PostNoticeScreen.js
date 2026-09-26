import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Switch } from 'react-native';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function PostNoticeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Please fill in both title and message.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/notices/', { title, body, is_pinned: isPinned });
      Alert.alert('Notice posted', 'All tenants will see this on their home screen.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Couldn\'t post notice', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={type.label}>TITLE</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Water Interruption" />

      <Text style={[type.label, { marginTop: spacing.md }]}>MESSAGE</Text>
      <TextInput
        style={styles.textArea}
        value={body}
        onChangeText={setBody}
        placeholder="Write the details tenants need to know..."
        multiline
        numberOfLines={6}
      />

      <View style={styles.switchRow}>
        <Text style={type.body}>Pin to top</Text>
        <Switch
          value={isPinned}
          onValueChange={setIsPinned}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Post notice</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 14,
    marginTop: spacing.xs, fontFamily: 'Manrope_500Medium', fontSize: 16,
    color: colors.ink, backgroundColor: colors.surface,
  },
  textArea: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 14,
    marginTop: spacing.xs, fontFamily: 'Manrope_500Medium', fontSize: 15,
    color: colors.ink, backgroundColor: colors.surface, textAlignVertical: 'top', minHeight: 130,
  },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  button: {
    backgroundColor: colors.primary, padding: 17, borderRadius: 10,
    alignItems: 'center', marginTop: spacing.xl,
  },
  buttonText: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: colors.surface },
});