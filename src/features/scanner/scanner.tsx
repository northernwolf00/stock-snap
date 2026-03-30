import { useInventoryStore } from "@/store";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Snackbar, Text } from "react-native-paper";

type Props = {
  onScanned?: (
    item: ReturnType<
      typeof useInventoryStore.getState
    >["findByBarcode"] extends (b: string) => infer R
      ? R
      : never,
  ) => void;
  onUnknownBarcode?: (barcode: string) => void;
};

export function BarcodeScanner({ onScanned, onUnknownBarcode }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const findByBarcode = useInventoryStore((s) => s.findByBarcode);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  if (!permission) return <ActivityIndicator style={styles.center} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge">
          Camera access is required to scan barcodes.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const item = findByBarcode(data);
    if (item) {
      onScanned?.(item);
    } else {
      setSnackMessage(`Unknown barcode: ${data}`);
      onUnknownBarcode?.(data);
    }

    cooldownRef.current = setTimeout(() => setScanned(false), 2000);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_a"],
        }}
        onBarcodeScanned={handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.hint}>Align barcode within the frame</Text>
      </View>
      <Snackbar
        visible={!!snackMessage}
        onDismiss={() => setSnackMessage("")}
        duration={2000}
      >
        {snackMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanArea: {
    width: 260,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  hint: {
    marginTop: 16,
    color: "#fff",
    fontSize: 14,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
