import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import apiClient from "../../api/client";
import { colors, spacing, type } from "../../theme/theme";

const categories = [
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "THEFT", label: "Theft" },
  { value: "CCTV_REQUEST", label: "CCTV Footage" },
  { value: "INQUIRY", label: "General Inquiry" },
  { value: "OTHER", label: "Other" },
];

export default function ReportIssueScreen({ navigation }) {
  const [category, setCategory] = useState("MAINTENANCE");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to attach an image.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Missing details", "Please describe the issue.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description);
      if (photo) {
        formData.append("photo", {
          uri: photo.uri,
          name: "issue_photo.jpg",
          type: "image/jpeg",
        });
      }

      await apiClient.post("/issues/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Issue reported", "The landlord has been notified.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Couldn't submit", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <Text style={type.label}>CATEGORY</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.categoryChip,
              category === cat.value && styles.categoryChipSelected,
            ]}
            onPress={() => setCategory(cat.value)}
          >
            <Text
              style={[
                type.label,
                category === cat.value && { color: colors.surface },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[type.label, { marginTop: spacing.lg }]}>DESCRIPTION</Text>
      <TextInput
        style={styles.textArea}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe what's happening..."
        multiline
        numberOfLines={5}
      />

      <Text style={[type.label, { marginTop: spacing.lg }]}>
        PHOTO (OPTIONAL)
      </Text>
      {photo ? (
        <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
      ) : (
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>+ Add a photo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginTop: spacing.xs,
    fontFamily: "Manrope_500Medium",
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surface,
    textAlignVertical: "top",
    minHeight: 110,
  },
  photoButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  photoButtonText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 14,
    color: colors.inkMuted,
  },
  photoPreview: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 17,
    borderRadius: 10,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  buttonText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
    color: colors.surface,
  },
});
