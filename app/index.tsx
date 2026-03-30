import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MainScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'StockSnap' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>StockSnap</Text>
          <Text style={styles.subtitle}>Inventory management made simple and offline.</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>124</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="barcode.viewfinder" size={32} color="#fff" />
            <Text style={styles.actionText}>Scan Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <IconSymbol name="plus.circle.fill" size={32} color="#4A90E2" />
            <Text style={[styles.actionText, styles.secondaryActionText]}>Add Item</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <IconSymbol name="list.bullet" size={32} color="#4A90E2" />
            <Text style={[styles.actionText, styles.secondaryActionText]}>Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <IconSymbol name="chart.bar.fill" size={32} color="#4A90E2" />
            <Text style={[styles.actionText, styles.secondaryActionText]}>Reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="#666" />
          <Text style={styles.offlineText}>Offline Mode Active</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    flex: 0.48,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '100%',
    backgroundColor: '#4A90E2',
    padding: 25,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  actionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryActionText: {
    color: '#1A1A1A',
    fontSize: 14,
    marginLeft: 0,
    marginTop: 8,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  offlineText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
});
