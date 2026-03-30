import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getDatabase } from '@/services/database';
import { queryClient, queryKeys } from '@/services/sync.service';
import { useInventoryStore, Item } from '@/store';

export function useItems() {
  return useQuery({
    queryKey: queryKeys.items,
    queryFn: async () => {
      const db = await getDatabase();
      return db.getAllAsync<Item>('SELECT * FROM items ORDER BY name ASC');
    },
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: queryKeys.item(id),
    queryFn: async () => {
      const db = await getDatabase();
      return db.getFirstAsync<Item>('SELECT * FROM items WHERE id = ?', [id]);
    },
    enabled: !!id,
  });
}

export function useAddItem() {
  const addItem = useInventoryStore((s) => s.addItem);
  return useMutation({
    mutationFn: addItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.items }),
  });
}

export function useUpdateQuantity() {
  const updateQuantity = useInventoryStore((s) => s.updateQuantity);
  return useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) =>
      updateQuantity(id, delta),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.items }),
  });
}

export function useDeleteItem() {
  const deleteItem = useInventoryStore((s) => s.deleteItem);
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.items }),
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: [...queryKeys.items, 'low_stock'],
    queryFn: async () => {
      const db = await getDatabase();
      return db.getAllAsync<Item>(
        'SELECT * FROM items WHERE quantity <= min_quantity AND min_quantity > 0 ORDER BY quantity ASC'
      );
    },
  });
}

export function useInventoryBootstrap() {
  const loadItems = useInventoryStore((s) => s.loadItems);
  useEffect(() => {
    loadItems();
  }, [loadItems]);
}
