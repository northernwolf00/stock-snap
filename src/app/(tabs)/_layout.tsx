import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSyncStore } from '@/store';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IconName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <MaterialCommunityIcons name={name} size={24} color={color} />
    </View>
  );
}

function ScannerTabIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <View style={styles.scannerOuter}>
      <View style={[styles.scannerInner, focused && styles.scannerInnerActive]}>
        <MaterialCommunityIcons name="barcode-scan" size={26} color="#fff" />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const isOnline = useSyncStore((s) => s.isOnline);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="view-dashboard" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="package-variant" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <ScannerTabIcon color={color} focused={focused} />
          ),
          tabBarLabelStyle: [styles.label, { color: '#4F46E5' }],
        }}
      />
      {/* Hide the old explore tab */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 24,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#EEF2FF',
  },
  scannerOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  scannerInner: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scannerInnerActive: {
    backgroundColor: '#4F46E5',
  },
});
