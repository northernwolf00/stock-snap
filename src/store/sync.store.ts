import { create } from 'zustand';
import { subscribeToNetwork } from '@/services/network';
import { flushSyncQueue } from '@/services/sync.service';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

type SyncState = {
  isOnline: boolean;
  status: SyncStatus;
  lastSyncedAt: string | null;
  pendingCount: number;
  error: string | null;
  setOnline: (online: boolean) => void;
  sync: (baseUrl: string) => Promise<void>;
  setPendingCount: (count: number) => void;
};

const SYNC_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.stocksnap.app';

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: false,
  status: 'idle',
  lastSyncedAt: null,
  pendingCount: 0,
  error: null,

  setOnline: (isOnline) => {
    set({ isOnline });
    if (isOnline && get().pendingCount > 0) {
      get().sync(SYNC_BASE_URL);
    }
  },

  sync: async (baseUrl) => {
    if (get().status === 'syncing') return;
    set({ status: 'syncing', error: null });
    try {
      await flushSyncQueue(baseUrl);
      set({ status: 'success', lastSyncedAt: new Date().toISOString(), pendingCount: 0 });
    } catch (e) {
      set({ status: 'error', error: String(e) });
    }
  },

  setPendingCount: (count) => set({ pendingCount: count }),
}));

export function initNetworkListener() {
  return subscribeToNetwork((status) => {
    useSyncStore.getState().setOnline(status.isConnected && !!status.isInternetReachable);
  });
}
