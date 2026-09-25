import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import apiClient from '../../api/client';
import { colors, spacing, type } from '../../theme/theme';

export default function PayRentScreen({ route, navigation }) {
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    apiClient.get(`/invoices/`).then((res) => {
      const found = res.data.find((inv) => inv.id === invoiceId);
      setInvoice(found);
      setLoading(false);
    });
  }, [invoiceId]);

  const handlePay = async () => {
    if (!phoneNumber) {
      Alert.alert('Phone number needed', 'Enter the M-Pesa number to pay from.');
      return;
    }
    setPaying(true);
    try {
      await apiClient.post('/payments/initiate-payment/', {
        invoice_id: invoiceId,
        phone_number: phoneNumber,
      });
      Alert.alert(
        'Check your phone',
        'Enter your M-Pesa PIN to complete the payment. This screen will update once confirmed.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const message = error.response?.data?.error || 'Something went wrong. Please try again.';
      Alert.alert('Payment failed', message);
    } finally {
      setPaying(false);
    }
  };

  const handleBarcodeScanned = async ({ data }) => {
    setScanning(false);
    try {
      const response = await apiClient.get(`/invoices/lookup/`, { params: { code: data } });
      Alert.alert('Invoice found', `KES ${response.data.amount_due} for Unit ${response.data.unit_code}`);
    } catch (error) {
      Alert.alert('Invalid QR code', 'This code does not match a valid invoice.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (scanning) {
    if (!permission?.granted) {
      return (
        <View style={styles.centered}>
          <Text style={[type.body, { marginBottom: spacing.md, textAlign: 'center', paddingHorizontal: spacing.lg }]}>
            Camera access is needed to scan the invoice QR code.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant permission</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.flex}>
        <CameraView
          style={styles.flex}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <TouchableOpacity style={styles.cancelScan} onPress={() => setScanning(false)}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const remaining = invoice ? (parseFloat(invoice.amount_due) - parseFloat(invoice.amount_paid)) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.label}>UNIT {invoice?.unit_code}</Text>
      <Text style={type.huge}>KES {remaining.toFixed(2)}</Text>
      <Text style={[type.subtitle, { marginTop: spacing.xs }]}>Remaining balance</Text>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setScanning(true)}
      >
        <Text style={styles.scanButtonText}>Scan invoice QR code</Text>
      </TouchableOpacity>

      <Text style={[type.label, { marginTop: spacing.xl }]}>M-PESA PHONE NUMBER</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="07XXXXXXXX"
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handlePay} disabled={paying} activeOpacity={0.85}>
        {paying ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Pay KES {remaining.toFixed(2)}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.lg },
  scanButton: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 10, padding: 16, alignItems: 'center', marginTop: spacing.lg,
  },
  scanButtonText: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: colors.primary },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 14,
    marginTop: spacing.xs, fontFamily: 'Manrope_500Medium', fontSize: 16,
    color: colors.ink, backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary, padding: 17, borderRadius: 10,
    alignItems: 'center', marginTop: spacing.xl,
  },
  buttonText: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: colors.surface },
  cancelScan: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    backgroundColor: colors.danger, borderRadius: 10, padding: 14, paddingHorizontal: 24,
  },
});