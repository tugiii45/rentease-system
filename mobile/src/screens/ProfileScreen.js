import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/client";
import { colors, spacing, type } from "../theme/theme";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get("/accounts/me/").then((res) => {
      setUser(res.data);
      setFirstName(res.data.first_name);
      setLastName(res.data.last_name);
      setPhoneNumber(res.data.phone_number);
      setLoading(false);
    });
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to update your picture.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("phone_number", phoneNumber);
      if (photo) {
        formData.append("profile_picture", {
          uri: photo.uri,
          name: "profile.jpg",
          type: "image/jpeg",
        });
      }

      const response = await apiClient.patch("/accounts/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(response.data);
      setPhoto(null);
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (error) {
      Alert.alert("Couldn't save", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "accessToken",
            "refreshToken",
            "userRole",
          ]);
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
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

  const displayPhoto = photo?.uri || user?.profile_picture;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={pickImage}>
          {displayPhoto ? (
            <Image source={{ uri: displayPhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {firstName?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        </TouchableOpacity>
        <Text style={[type.label, { marginTop: spacing.sm }]}>
          {user?.role}
        </Text>
      </View>

      <Text style={[type.label, { marginTop: spacing.lg }]}>FIRST NAME</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text style={[type.label, { marginTop: spacing.md }]}>LAST NAME</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={[type.label, { marginTop: spacing.md }]}>PHONE NUMBER</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <Text style={[type.label, { marginTop: spacing.md }]}>EMAIL</Text>
      <View style={[styles.input, styles.disabledInput]}>
        <Text style={type.body}>{user?.email}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.buttonText}>Save changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.changePasswordLink}
        onPress={() => navigation.navigate("ChangePassword")}
      >
        <Text style={styles.changePasswordText}>Change password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>
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
  photoSection: { alignItems: "center", marginBottom: spacing.md },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 36,
    color: colors.surface,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editBadgeText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 10,
    color: colors.surface,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginTop: spacing.xs,
    fontFamily: "Manrope_500Medium",
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  disabledInput: { backgroundColor: colors.background },
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
  changePasswordLink: { alignItems: "center", marginTop: spacing.lg },
  changePasswordText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  logoutButtonText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 15,
    color: colors.danger,
  },
});
