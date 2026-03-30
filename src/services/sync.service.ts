import { QueryClient } from '@tanstack/react-query';
import { getDatabase } from './database';
import { getAuthToken } from './storage';
import { sendSyncCompleteAlert } from './notifications';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

export const queryKeys = {
  items: ['items'] as const,
  item: (id: string) => ['items', id] as const,
  locations: ['locations'] as const,
  syncQueue: ['sync_queue'] as const,
};

type SyncOperation = {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  payload: string;
};

export async function flushSyncQueue(baseUrl: string): Promise<void> {
  const db = await getDatabase();
  const token = await getAuthToken();

  const ops = await db.getAllAsync<SyncOperation>(
    'SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 100'
  );

  if (ops.length === 0) return;

  const response = await fetch(`${baseUrl}/api/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ operations: ops }),
  });

  if (!response.ok) throw new Error(`Sync failed: ${response.status}`);

  const ids = ops.map((op) => `'${op.id}'`).join(',');
  await db.execAsync(`DELETE FROM sync_queue WHERE id IN (${ids})`);

  await queryClient.invalidateQueries({ queryKey: queryKeys.items });
  await sendSyncCompleteAlert(ops.length);
}

export async function enqueueSyncOperation(
  entityType: string,
  entityId: string,
  operation: 'create' | 'update' | 'delete',
  payload: object
): Promise<void> {
  const db = await getDatabase();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, entityType, entityId, operation, JSON.stringify(payload), now]
  );
}
