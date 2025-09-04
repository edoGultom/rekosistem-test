import { pokemonApi } from '@/services/api';
import { storageService } from '@/services/storage';
import { usePokemonStore } from '@/store/pokemonStore';

// Mock dependencies
jest.mock('@/services/api');
jest.mock('@/services/storage');
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
}));

const mockPokemonApi = pokemonApi as jest.Mocked<typeof pokemonApi>;
const mockStorageService = storageService as jest.Mocked<typeof storageService>;

describe('PokemonStore', () => {
  beforeEach(() => {
    // Reset store state
    usePokemonStore.getState().pokemon = [];
    usePokemonStore.getState().favorites = [];
    usePokemonStore.getState().pokemonDetails = {};
    usePokemonStore.getState().loading = false;
    usePokemonStore.getState().error = null;
    usePokemonStore.getState().isOffline = false;
    usePokemonStore.getState().syncQueue = [];

    jest.clearAllMocks();
  });

  describe('loadPokemon', () => {
    it('should load pokemon successfully when online', async () => {
      const mockResponse = {
        count: 1302,
        next: 'https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20',
        previous: null,
        results: [
          {
            id: 1,
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon/1/',
            image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
          }
        ]
      };

      mockPokemonApi.getPokemonList.mockResolvedValue(mockResponse);
      mockStorageService.cachePokemonData.mockResolvedValue();

      const { loadPokemon } = usePokemonStore.getState();
      await loadPokemon(0);

      const state = usePokemonStore.getState();

      expect(state.pokemon).toEqual(mockResponse.results);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.hasNextPage).toBe(true);
      expect(mockPokemonApi.getPokemonList).toHaveBeenCalledWith(0);
      expect(mockStorageService.cachePokemonData).toHaveBeenCalled();
    });

    it('should handle errors when loading pokemon', async () => {
      const errorMessage = 'Network error';
      mockPokemonApi.getPokemonList.mockRejectedValue(new Error(errorMessage));
      // Mock console.log hanya sementara
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      
      const { loadPokemon } = usePokemonStore.getState();
      await loadPokemon(0);

      const state = usePokemonStore.getState();

      expect(state.pokemon).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      logSpy.mockRestore();

    });

    it('should load from cache when offline', async () => {
      const cachedData = {
        results: [
          {
            id: 1,
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon/1/',
            image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
          }
        ],
        next: null
      };

      usePokemonStore.getState().isOffline = true;
      mockStorageService.getCachedPokemonData.mockResolvedValue(cachedData);

      const { loadPokemon } = usePokemonStore.getState();
      await loadPokemon(0);

      const state = usePokemonStore.getState();

      expect(state.pokemon).toEqual(cachedData.results);
      expect(mockStorageService.getCachedPokemonData).toHaveBeenCalledWith('pokemon_list_0');
      expect(mockPokemonApi.getPokemonList).not.toHaveBeenCalled();
    });
  });

  describe('favorites management', () => {
    const mockPokemon = {
      id: 1,
      name: 'bulbasaur',
      url: 'https://pokeapi.co/api/v2/pokemon/1/',
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
    };

    it('should add pokemon to favorites when online', async () => {
      mockStorageService.saveFavorites.mockResolvedValue();

      const { addToFavorites, checkIsFavorite } = usePokemonStore.getState();

      expect(checkIsFavorite(1)).toBe(false);

      await addToFavorites(mockPokemon);

      expect(checkIsFavorite(1)).toBe(true);
      expect(mockStorageService.saveFavorites).toHaveBeenCalled();
    });

    it('should queue favorite action when offline', async () => {
      usePokemonStore.getState().isOffline = true;
      mockStorageService.saveFavorites.mockResolvedValue();
      mockStorageService.saveSyncQueue.mockResolvedValue();

      const { addToFavorites } = usePokemonStore.getState();
      await addToFavorites(mockPokemon);

      const state = usePokemonStore.getState();

      expect(state.favorites).toHaveLength(1);
      expect(state.syncQueue).toHaveLength(1);
      expect(state.syncQueue[0].type).toBe('ADD_FAVORITE');
      expect(mockStorageService.saveSyncQueue).toHaveBeenCalled();
    });

    it('should remove pokemon from favorites', async () => {
      // Add pokemon first
      const { addToFavorites, removeFromFavorites, checkIsFavorite } = usePokemonStore.getState();
      await addToFavorites(mockPokemon);

      expect(checkIsFavorite(1)).toBe(true);

      await removeFromFavorites(1);

      expect(checkIsFavorite(1)).toBe(false);
    });

    it('should toggle favorite status', async () => {
      const { toggleFavorite, checkIsFavorite } = usePokemonStore.getState();

      expect(checkIsFavorite(1)).toBe(false);

      await toggleFavorite(mockPokemon);
      expect(checkIsFavorite(1)).toBe(true);

      await toggleFavorite(mockPokemon);
      expect(checkIsFavorite(1)).toBe(false);
    });
  });

  describe('offline functionality', () => {
    it('should load offline data on initialization', async () => {
      const mockFavorites = [
        {
          id: 1,
          name: 'bulbasaur',
          image: 'https://example.com/image.png',
          addedAt: '2023-01-01T00:00:00.000Z'
        }
      ];
      const mockSyncQueue = [
        {
          type: 'ADD_FAVORITE' as const,
          payload: mockFavorites[0],
          timestamp: '2023-01-01T00:00:00.000Z'
        }
      ];

      mockStorageService.getFavorites.mockResolvedValue(mockFavorites);
      mockStorageService.getSyncQueue.mockResolvedValue(mockSyncQueue);

      const { loadOfflineData } = usePokemonStore.getState();
      await loadOfflineData();

      const state = usePokemonStore.getState();

      expect(state.favorites).toEqual(mockFavorites);
      expect(state.syncQueue).toEqual(mockSyncQueue);
    });

    it('should sync queued actions when coming online', async () => {
      const mockSyncQueue = [
        {
          type: 'ADD_FAVORITE' as const,
          payload: {
            id: 1,
            name: 'bulbasaur',
            image: 'https://example.com/image.png',
            addedAt: '2023-01-01T00:00:00.000Z'
          },
          timestamp: '2023-01-01T00:00:00.000Z'
        }
      ];

      usePokemonStore.getState().syncQueue = mockSyncQueue;
      mockStorageService.clearSyncQueue.mockResolvedValue();

      const { syncWhenOnline } = usePokemonStore.getState();
      await syncWhenOnline();

      const state = usePokemonStore.getState();

      expect(state.syncQueue).toEqual([]);
      expect(mockStorageService.clearSyncQueue).toHaveBeenCalled();
    });
  });
});