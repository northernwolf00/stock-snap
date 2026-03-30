import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarcodeScanner } from '@/features/scanner';
import { ItemForm } from '@/features/inventory';
import type { Item } from '@/store';

type Tab = 'scan' | 'manual';

function TabPill({ active, onPress, icon, label }: {
  active: boolean;
  onPress: () => void;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <MaterialCommunityIcons name={icon} size={18} color={active ? '#fff' : '#94A3B8'} />
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ScannerScreen() {
  const [tab, setTab] = useState<Tab>('scan');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scannedItem, setScannedItem] = useState<Item | undefined>();
  const [snack, setSnack] = useState('');

  const handleScanned = (item: Item | undefined) => {
    setScannedItem(item);
    if (item) setSnack(`Found: ${item.name} — ${item.quantity} in stock`);
  };

  const handleUnknown = (barcode: string) => {
    setScannedBarcode(barcode);
    setSnack(`Barcode ${barcode} not found. Fill the form to add it.`);
    setTimeout(() => setTab('manual'), 800);
  };

  const handleFormSuccess = () => {
    setScannedBarcode('');
    setScannedItem(undefined);
    setSnack('Product added successfully!');
    setTab('scan');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Add Product</Text>
          <Text style={styles.subtitle}>Scan or enter manually</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="barcode-scan" size={24} color="#4F46E5" />
        </View>
      </View>

      <View style={styles.tabBar}>
        <TabPill active={tab === 'scan'} onPress={() => setTab('scan')} icon="camera" label="Scan Barcode" />
        <TabPill active={tab === 'manual'} onPress={() => setTab('manual')} icon="pencil-outline" label="Enter Manually" />
      </View>

      {tab === 'scan' ? (
        <View style={styles.scanContainer}>
          <BarcodeScanner onScanned={handleScanned} onUnknownBarcode={handleUnknown} />
          {scannedItem && (
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <View style={styles.resultIconWrap}>
                  <MaterialCommunityIcons name="check-circle" size={22} color="#059669" />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{scannedItem.name}</Text>
                  <Text style={styles.resultSku}>SKU: {scannedItem.sku}</Text>
                </View>
                <View style={styles.resultQtyBadge}>
                  <Text style={styles.resultQty}>{scannedItem.quantity}</Text>
                  <Text style={styles.resultQtyUnit}>units</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.formFlex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
          <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {scannedBarcode ? (
              <View style={styles.barcodeHint}>
                <MaterialCommunityIcons name="barcode" size={18} color="#4F46E5" />
                <Text style={styles.barcodeHintText}>
                  Barcode <Text style={styles.barcodeCode}>{scannedBarcode}</Text> pre-filled
                </Text>
                <TouchableOpacity onPress={() => setScannedBarcode('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ) : null}
            <View style={styles.formCard}>
              <ItemForm initialBarcode={scannedBarcode} onSuccess={handleFormSuccess} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000} style={styles.snack} action={{ label: 'OK', onPress: () => setSnack('') }}>
        {snack}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  headerIcon: { width: 48, height: 48, backgroundColor: '#EEF2FF', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4, marginBottom: 20, gap: 4 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 13 },
  pillActive: { backgroundColor: '#4F46E5', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  pillLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  pillLabelActive: { color: '#FFFFFF' },
  scanContainer: { flex: 1, marginHorizontal: 20, marginBottom: 16, borderRadius: 24, overflow: 'hidden', position: 'relative' },
  resultCard: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultIconWrap: { width: 40, height: 40, backgroundColor: '#D1FAE5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  resultSku: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  resultQtyBadge: { alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  resultQty: { fontSize: 20, fontWeight: '800', color: '#4F46E5' },
  resultQtyUnit: { fontSize: 10, color: '#94A3B8' },
  formFlex: { flex: 1 },
  formScroll: { flex: 1 },
  formContent: { paddingHorizontal: 20, paddingBottom: 40 },
  barcodeHint: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF2FF', padding: 12, borderRadius: 12, marginBottom: 16 },
  barcodeHintText: { flex: 1, fontSize: 13, color: '#4F46E5', fontWeight: '500' },
  barcodeCode: { fontWeight: '800' },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  snack: { backgroundColor: '#1E293B', borderRadius: 12 },
});
