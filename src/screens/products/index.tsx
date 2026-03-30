import { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Searchbar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInventoryStore } from '@/store';
import { useUpdateQuantity, useDeleteItem } from '@/features/inventory';
import type { Item } from '@/store';

type Filter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

function getStockStatus(item: Item): { label: string; color: string; bg: string } {
  if (item.quantity === 0) return { label: 'Out of Stock', color: '#DC2626', bg: '#FEE2E2' };
  if (item.min_quantity > 0 && item.quantity <= item.min_quantity)
    return { label: 'Low Stock', color: '#D97706', bg: '#FEF3C7' };
  return { label: 'In Stock', color: '#059669', bg: '#D1FAE5' };
}

function ProductCard({ item, onIncrement, onDecrement, onDelete }: {
  item: Item;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
}) {
  const status = getStockStatus(item);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIconWrap}>
          <MaterialCommunityIcons name="package-variant" size={22} color="#4F46E5" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardSku}>SKU: {item.sku}</Text>
          {item.barcode ? <Text style={styles.cardBarcode}>#{item.barcode}</Text> : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBottom}>
        <View style={styles.qtyControl}>
          <TouchableOpacity onPress={onDecrement} style={styles.qtyBtn}>
            <MaterialCommunityIcons name="minus" size={16} color="#4F46E5" />
          </TouchableOpacity>
          <View style={styles.qtyDisplay}>
            <Text style={styles.qtyNumber}>{item.quantity}</Text>
            <Text style={styles.qtyUnit}>units</Text>
          </View>
          <TouchableOpacity onPress={onIncrement} style={styles.qtyBtn}>
            <MaterialCommunityIcons name="plus" size={16} color="#4F46E5" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardActions}>
          {item.min_quantity > 0 && (
            <View style={styles.minQtyChip}>
              <MaterialCommunityIcons name="arrow-down-circle-outline" size={13} color="#94A3B8" />
              <Text style={styles.minQtyText}>Min: {item.min_quantity}</Text>
            </View>
          )}
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function ProductsScreen() {
  const router = useRouter();
  const items = useInventoryStore((s) => s.items);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const { mutate: updateQty } = useUpdateQuantity();
  const { mutate: deleteItem } = useDeleteItem();

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.barcode?.toLowerCase().includes(q)
      );
    }
    if (filter === 'in_stock') list = list.filter((i) => i.quantity > i.min_quantity);
    if (filter === 'low_stock') list = list.filter((i) => i.quantity > 0 && i.quantity <= i.min_quantity && i.min_quantity > 0);
    if (filter === 'out_of_stock') list = list.filter((i) => i.quantity === 0);
    return list;
  }, [items, search, filter]);

  const counts = useMemo(() => ({
    all: items.length,
    in_stock: items.filter((i) => i.quantity > i.min_quantity).length,
    low_stock: items.filter((i) => i.quantity > 0 && i.quantity <= i.min_quantity && i.min_quantity > 0).length,
    out_of_stock: items.filter((i) => i.quantity === 0).length,
  }), [items]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subtitle}>{items.length} items total</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(tabs)/scanner')}>
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Searchbar
          placeholder="Search name, SKU or barcode…"
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor="#94A3B8"
        />
      </View>

      <View style={styles.filters}>
        {([
          ['all', 'All'],
          ['in_stock', 'In Stock'],
          ['low_stock', 'Low'],
          ['out_of_stock', 'Out'],
        ] as [Filter, string][]).map(([key, label]) => (
          <Chip
            key={key}
            selected={filter === key}
            onPress={() => setFilter(key)}
            style={[styles.filterChip, filter === key && styles.filterChipActive]}
            textStyle={[styles.filterText, filter === key && styles.filterTextActive]}
            showSelectedCheck={false}>
            {label} {counts[key] > 0 ? `(${counts[key]})` : ''}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onIncrement={() => updateQty({ id: item.id, delta: 1 })}
            onDecrement={() => updateQty({ id: item.id, delta: -1 })}
            onDelete={() => deleteItem(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="package-variant-closed-remove" size={72} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>{search ? 'No results found' : 'No products yet'}</Text>
            <Text style={styles.emptyText}>{search ? 'Try a different search term' : 'Tap + to add your first product'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  searchWrap: { paddingHorizontal: 20, marginBottom: 12 },
  searchbar: { backgroundColor: '#FFFFFF', borderRadius: 14, elevation: 0, height: 48, borderWidth: 1.5, borderColor: '#E2E8F0' },
  searchInput: { fontSize: 14 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  filterChip: { backgroundColor: '#F1F5F9', borderRadius: 10 },
  filterChipActive: { backgroundColor: '#EEF2FF' },
  filterText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filterTextActive: { color: '#4F46E5' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIconWrap: { width: 44, height: 44, backgroundColor: '#EEF2FF', borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  cardSku: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  cardBarcode: { fontSize: 11, color: '#CBD5E1', marginTop: 1 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 4 },
  qtyBtn: { width: 32, height: 32, backgroundColor: '#EEF2FF', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  qtyDisplay: { alignItems: 'center', paddingHorizontal: 14 },
  qtyNumber: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  qtyUnit: { fontSize: 10, color: '#94A3B8', marginTop: -2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  minQtyChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 },
  minQtyText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  deleteBtn: { width: 34, height: 34, backgroundColor: '#FEF2F2', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#475569' },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
});
