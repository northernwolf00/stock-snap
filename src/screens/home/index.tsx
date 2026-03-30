import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useInventoryStore, useSyncStore } from '@/store';
import { useItems, useLowStockItems } from '@/features/inventory';

type StatCardProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string | number;
  color: string;
  bg: string;
};

function StatCard({ icon, label, value, color, bg }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type QuickActionProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
};

function QuickAction({ icon, label, color, bg, onPress }: QuickActionProps) {
  const { TouchableRipple } = require('react-native-paper');
  return (
    <TouchableRipple onPress={onPress} borderless style={[styles.qaCard, { backgroundColor: bg }]}>
      <View style={styles.qaInner}>
        <View style={[styles.qaIcon, { backgroundColor: color + '22' }]}>
          <MaterialCommunityIcons name={icon} size={26} color={color} />
        </View>
        <Text style={[styles.qaLabel, { color }]}>{label}</Text>
      </View>
    </TouchableRipple>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const items = useInventoryStore((s) => s.items);
  const loadItems = useInventoryStore((s) => s.loadItems);
  const { isOnline, status, lastSyncedAt } = useSyncStore();
  const { data: lowStockItems = [] } = useLowStockItems();

  const totalItems = items.length;
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const outOfStock = items.filter((i) => i.quantity === 0).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const lastSync = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>StockSnap</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <Chip
            icon={isOnline ? 'wifi' : 'wifi-off'}
            style={[styles.statusChip, { backgroundColor: isOnline ? '#D1FAE5' : '#FEE2E2' }]}
            textStyle={{ color: isOnline ? '#065F46' : '#991B1B', fontSize: 12, fontWeight: '600' }}>
            {isOnline ? 'Online' : 'Offline'}
          </Chip>
        </View>

        {status === 'syncing' && (
          <View style={styles.syncBanner}>
            <MaterialCommunityIcons name="sync" size={14} color="#4F46E5" />
            <Text style={styles.syncText}>Syncing changes…</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="package-variant" label="Products" value={totalItems} color="#4F46E5" bg="#EEF2FF" />
          <StatCard icon="layers-triple" label="Total Units" value={totalQty} color="#0891B2" bg="#E0F2FE" />
          <StatCard icon="alert-circle" label="Low Stock" value={lowStockItems.length} color="#D97706" bg="#FEF3C7" />
          <StatCard icon="close-circle" label="Out of Stock" value={outOfStock} color="#DC2626" bg="#FEE2E2" />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.qaGrid}>
          <QuickAction icon="barcode-scan" label="Scan Item" color="#4F46E5" bg="#EEF2FF" onPress={() => router.push('/(tabs)/scanner')} />
          <QuickAction icon="plus-circle" label="Add Product" color="#059669" bg="#D1FAE5" onPress={() => router.push('/(tabs)/scanner')} />
          <QuickAction icon="package-variant-closed" label="Inventory" color="#0891B2" bg="#E0F2FE" onPress={() => router.push('/(tabs)/products')} />
          <QuickAction icon="chart-bar" label="Reports" color="#7C3AED" bg="#EDE9FE" onPress={() => {}} />
        </View>

        {lowStockItems.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
              <Text style={styles.seeAll} onPress={() => router.push('/(tabs)/products')}>See all</Text>
            </View>
            <View style={styles.alertList}>
              {lowStockItems.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.alertRow}>
                  <View style={styles.alertLeft}>
                    <View style={styles.alertDot} />
                    <View>
                      <Text style={styles.alertName}>{item.name}</Text>
                      <Text style={styles.alertSku}>SKU: {item.sku}</Text>
                    </View>
                  </View>
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertQty}>{item.quantity} left</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {items.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent Products</Text>
              <Text style={styles.seeAll} onPress={() => router.push('/(tabs)/products')}>See all</Text>
            </View>
            <View style={styles.recentList}>
              {items.slice(0, 5).map((item) => {
                const isLow = item.quantity <= item.min_quantity && item.min_quantity > 0;
                const isEmpty = item.quantity === 0;
                const badgeColor = isEmpty ? '#DC2626' : isLow ? '#D97706' : '#059669';
                const badgeBg = isEmpty ? '#FEE2E2' : isLow ? '#FEF3C7' : '#D1FAE5';
                return (
                  <View key={item.id} style={styles.recentRow}>
                    <View style={styles.recentIcon}>
                      <MaterialCommunityIcons name="package-variant" size={20} color="#4F46E5" />
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.recentSku}>{item.sku}</Text>
                    </View>
                    <View style={[styles.qtyBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.qtyText, { color: badgeColor }]}>{item.quantity}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {items.length === 0 && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>Tap Scan to add your first product</Text>
          </View>
        )}

        <View style={styles.footer}>
          <MaterialCommunityIcons name="clock-outline" size={13} color="#94A3B8" />
          <Text style={styles.footerText}>Last synced: {lastSync}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  date: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusChip: { height: 30 },
  syncBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', padding: 10, borderRadius: 10, marginBottom: 16 },
  syncText: { fontSize: 13, color: '#4F46E5', fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12, marginTop: 4 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  seeAll: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderLeftWidth: 4, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#0F172A', lineHeight: 32 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  qaCard: { flex: 1, minWidth: '45%', borderRadius: 16, overflow: 'hidden', minHeight: 90 },
  qaInner: { padding: 16, alignItems: 'flex-start', gap: 10 },
  qaIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 13, fontWeight: '700' },
  alertList: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', marginBottom: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  alertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
  alertName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  alertSku: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  alertBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  alertQty: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  recentList: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', marginBottom: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  recentIcon: { width: 40, height: 40, backgroundColor: '#EEF2FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  recentSku: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  qtyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  qtyText: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#475569' },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
  footerText: { fontSize: 12, color: '#94A3B8' },
});
