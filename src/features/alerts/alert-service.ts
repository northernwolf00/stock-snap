import { useEffect } from 'react';
import {
  registerForPushNotifications,
  addNotificationListener,
} from '@/services/notifications';
import { setAuthToken } from '@/services/storage';

export async function initPushNotifications(): Promise<void> {
  const token = await registerForPushNotifications();
  if (token) {
    // Persist the push token to send to your backend during next sync
    await setAuthToken(token);
  }
}

export function useNotificationHandler(
  onStockAlert?: (data: { itemName: string; currentQty: number; minQty: number }) => void
) {
  useEffect(() => {
    const sub = addNotificationListener((notification) => {
      const { type, ...data } = notification.request.content.data as Record<string, unknown>;
      if (type === 'low_stock' && onStockAlert) {
        onStockAlert(data as { itemName: string; currentQty: number; minQty: number });
      }
    });
    return () => sub.remove();
  }, [onStockAlert]);
}
