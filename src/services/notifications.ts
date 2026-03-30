import Constants from 'expo-constants';
import { Platform } from 'react-native';

// expo-notifications removed from Expo Go on Android (SDK 53+).
// Skip the require entirely when running inside Expo Go to avoid the runtime throw.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let Notifications: typeof import('expo-notifications') | null = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch {
    // Silently disabled — custom dev client or EAS Build needed for notifications
  }
}

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendLowStockAlert(
  itemName: string,
  currentQty: number,
  minQty: number
): Promise<string> {
  if (!Notifications) return '';
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Low Stock Alert',
      body: `${itemName} is running low (${currentQty}/${minQty})`,
      data: { type: 'low_stock', itemName, currentQty, minQty },
    },
    trigger: null,
  });
}

export async function sendSyncCompleteAlert(synced: number): Promise<string> {
  if (!Notifications) return '';
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Sync Complete',
      body: `${synced} item${synced !== 1 ? 's' : ''} synced successfully`,
      data: { type: 'sync_complete', synced },
    },
    trigger: null,
  });
}

export function addNotificationListener(
  handler: (notification: any) => void
) {
  if (!Notifications) return { remove: () => {} };
  return Notifications.addNotificationReceivedListener(handler);
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('stock-alerts', {
      name: 'Stock Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    // No EAS project configured yet — local notifications still work
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}
