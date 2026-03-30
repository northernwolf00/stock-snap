import { initNetworkListener, useSyncStore } from "@/store";
import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

const SYNC_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://api.stocksnap.app";

export function useSyncManager() {
  const { isOnline, sync } = useSyncStore();

  useEffect(() => {
    const unsubscribe = initNetworkListener();
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active" && isOnline) {
        sync(SYNC_BASE_URL);
      }
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [isOnline, sync]);
}
