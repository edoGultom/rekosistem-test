import { jest } from '@jest/globals';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
}));

// Mock Lucide React Native icons
jest.mock('lucide-react-native', () => ({
  Home: 'Home',
  Heart: 'Heart',
  Settings: 'Settings',
  Search: 'Search',
  X: 'X',
  ArrowLeft: 'ArrowLeft',
  Wifi: 'Wifi',
  WifiOff: 'WifiOff',
  AlertCircle: 'AlertCircle',
  RefreshCw: 'RefreshCw',
  Ruler: 'Ruler',
  Weight: 'Weight',
  Database: 'Database',
  Trash2: 'Trash2',
  Info: 'Info',
}));

// Mock Expo modules
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ id: '1' })),
  Stack: ({ children }) => children,
  Tabs: ({ children }) => children,
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

