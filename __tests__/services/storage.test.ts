import { storageService } from '@/services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('storageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('should return favorites from storage', async () => {
      const mockFavorites = [
        {
          id: 1,
          name: 'bulbasaur',
          image: 'https://example.com/image.png',
          addedAt: '2023-01-01T00:00:00.000Z'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockFavorites));

      const result = await storageService.getFavorites();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@pokemon_favorites');
      expect(result).toEqual(mockFavorites);
    });

    it('should return empty array if no favorites stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await storageService.getFavorites();

      expect(result).toEqual([]);
    });

    it('should handle storage errors gracefully', async () => {
        mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
        // Mock console.log hanya sementara
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
        const result = await storageService.getFavorites();
      
        expect(result).toEqual([]);
      
        logSpy.mockRestore();
      });
  });

  describe('saveFavorites', () => {
    it('should save favorites to storage', async () => {
      const favorites = [
        {
          id: 1,
          name: 'bulbasaur',
          image: 'https://example.com/image.png',
          addedAt: '2023-01-01T00:00:00.000Z'
        }
      ];

      mockAsyncStorage.setItem.mockResolvedValue();

      await storageService.saveFavorites(favorites);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@pokemon_favorites',
        JSON.stringify(favorites)
      );
    });

    it('should handle save errors gracefully', async () => {
        const favorites: any[] = [];
        mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

        // Mock console.log hanya sementara
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
        await expect(storageService.saveFavorites(favorites)).resolves.not.toThrow();
      
        logSpy.mockRestore();
      });
  });

  describe('sync queue management', () => {
    it('should save and retrieve sync queue', async () => {
      const syncQueue = [
        {
          type: 'ADD_FAVORITE' as const,
          payload: { id: 1, name: 'bulbasaur' },
          timestamp: '2023-01-01T00:00:00.000Z'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(syncQueue));
      mockAsyncStorage.setItem.mockResolvedValue();

      await storageService.saveSyncQueue(syncQueue);
      const result = await storageService.getSyncQueue();

      expect(result).toEqual(syncQueue);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@pokemon_sync_queue',
        JSON.stringify(syncQueue)
      );
    });

    it('should clear sync queue', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await storageService.clearSyncQueue();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@pokemon_sync_queue');
    });
  });

  describe('cache management', () => {
    it('should cache and retrieve data', async () => {
      const testData = { name: 'bulbasaur', id: 1 };
      const cacheKey = 'test_key';
      
      mockAsyncStorage.setItem.mockResolvedValue();
      
      // Cache data
      await storageService.cachePokemonData(cacheKey, testData);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `@pokemon_cache_${cacheKey}`,
        expect.stringContaining(JSON.stringify(testData))
      );

      // Mock retrieval
      const cachedData = {
        data: testData,
        timestamp: Date.now()
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const result = await storageService.getCachedPokemonData(cacheKey);

      expect(result).toEqual(testData);
    });

    it('should return null for expired cache', async () => {
      const cacheKey = 'test_key';
      const expiredData = {
        data: { name: 'bulbasaur' },
        timestamp: Date.now() - (6 * 60 * 1000) // 6 minutes ago (expired)
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(expiredData));

      const result = await storageService.getCachedPokemonData(cacheKey);

      expect(result).toBeNull();
    });

    it('should return null for non-existent cache', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await storageService.getCachedPokemonData('nonexistent');

      expect(result).toBeNull();
    });
  });
});