import { create } from 'zustand';
import { getDatabase } from '@/services/database';
import { enqueueSyncOperation } from '@/services/sync.service';
import { sendLowStockAlert } from '@/services/notifications';
import { queryClient, queryKeys } from '@/services/sync.service';

export type Item = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  min_quantity: number;
  location_id?: string;
  barcode?: string;
  created_at: string;
  updated_at: string;
  synced_at?: string;
};

type InventoryState = {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'synced_at'>) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  findByBarcode: (barcode: string) => Item | undefined;
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  loadItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      const items = await db.getAllAsync<Item>('SELECT * FROM items ORDER BY name ASC');
      set({ items, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addItem: async (data) => {
    const id = `item_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    const item: Item = { ...data, id, created_at: now, updated_at: now };
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO items (id, sku, name, description, quantity, min_quantity, location_id, barcode, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.sku, item.name, item.description ?? null, item.quantity,
       item.min_quantity, item.location_id ?? null, item.barcode ?? null, now, now]
    );
    await enqueueSyncOperation('item', id, 'create', item);
    set((s) => ({ items: [...s.items, item] }));
    queryClient.invalidateQueries({ queryKey: queryKeys.items });
  },

  updateQuantity: async (id, delta) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + delta);
    const now = new Date().toISOString();
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE items SET quantity = ?, updated_at = ? WHERE id = ?',
      [newQty, now, id]
    );
    const updated = { ...item, quantity: newQty, updated_at: now };
    await enqueueSyncOperation('item', id, 'update', { id, quantity: newQty });
    set((s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }));
    if (newQty <= item.min_quantity && item.min_quantity > 0) {
      sendLowStockAlert(item.name, newQty, item.min_quantity);
    }
  },

  deleteItem: async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
    await enqueueSyncOperation('item', id, 'delete', { id });
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    queryClient.invalidateQueries({ queryKey: queryKeys.items });
  },

  findByBarcode: (barcode) => get().items.find((i) => i.barcode === barcode),
}));
