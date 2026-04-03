/**
 * LogContext.tsx
 *
 * Provides real-time access to in-app logs within the React tree.
 * Wrap the root of your app (or a sub-tree) with <LogProvider>.
 * Components can then useLogContext() to read logs or trigger export.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { logger, LogEntry } from '../lib/logger';

interface LogContextValue {
  logs: LogEntry[];
  clearLogs: () => Promise<void>;
  exportLogs: () => Promise<void>;
}

const LogContext = createContext<LogContextValue>({
  logs: [],
  clearLogs: async () => {},
  exportLogs: async () => {},
});

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const refresh = useCallback(async () => {
    const entries = await logger.getLogs();
    setLogs([...entries]);
  }, []);

  // Load logs on mount and subscribe to updates
  useEffect(() => {
    refresh();
    const unsub = logger.subscribe(refresh);
    return unsub;
  }, [refresh]);

  const clearLogs = useCallback(async () => {
    await logger.clearLogs();
    setLogs([]);
  }, []);

  /**
   * Export logs as a text file and share it via the OS share sheet
   * or expo-sharing (if Share API doesn't support files on the platform).
   */
  const exportLogs = useCallback(async () => {
    try {
      const text = await logger.exportAsText();

      // Write to a temp file so we can share it as an attachment
      const fileName = `nextsport-debug-${Date.now()}.txt`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, text, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/plain',
          dialogTitle: 'Export NextSport Debug Log',
          UTI: 'public.plain-text',
        });
      } else {
        // Fallback: share the raw text content (no attachment)
        await Share.share({
          title: 'NextSport Debug Log',
          message: text,
        });
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message ?? 'Could not export logs.');
    }
  }, []);

  return (
    <LogContext.Provider value={{ logs, clearLogs, exportLogs }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogContext(): LogContextValue {
  return useContext(LogContext);
}
