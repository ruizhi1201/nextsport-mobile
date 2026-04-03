import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { LogProvider } from './src/context/LogContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <LogProvider>
        <StatusBar style="light" backgroundColor="#0a0f1e" />
        <AppNavigator />
      </LogProvider>
    </SafeAreaProvider>
  );
}
