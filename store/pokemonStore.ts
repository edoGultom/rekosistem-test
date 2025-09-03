import { pokemonApi } from '@/services/api';
import { storageService } from '@/services/storage';
import { AppState, FavoritePokemon, Pokemon, PokemonDetail, SyncAction } from '@/types/pokemon';
import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface PokemonStore extends AppState {
  // Actions
  loadPokemon: (page?: number) => Promise<void>;
  loadPokemonDetail: (id: number) => Promise<void>;
  addToFavorites: (pokemon: Pokemon | PokemonDetail) => Promise<void>;
  removeFromFavorites: (id: number) => Promise<void>;
  toggleFavorite: (pokemon: Pokemon | PokemonDetail) => Promise<void>;
  checkIsFavorite: (id: number) => boolean;
  setOfflineStatus: (isOffline: boolean) => void;
  syncWhenOnline: () => Promise<void>;
  loadOfflineData: () => Promise<void>;
  clearError: () => void;
  searchPokemon: (query: string) => Promise<void>;
}

export const usePokemonStore = create<PokemonStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    pokemon: [],
    favorites: [],
    pokemonDetails: {},
    loading: false,
    error: null,
    isOffline: false,
    currentPage: 0,
    hasNextPage: true,
    syncQueue: [],

    // Actions
    loadPokemon: async (page = 0) => {
      const state = get();
      
      if (state.loading) return;
      
      set({ loading: true, error: null });

      try {
        const offset = page * 20;
        const cacheKey = `pokemon_list_${page}`;
        
        let data;
        
        if (state.isOffline) {
          // Try to load from cache when offline
          data = await storageService.getCachedPokemonData(cacheKey);
          if (!data) {
            throw new Error('No cached data available offline');
          }
        } else {
          // Load from API when online
          data = await pokemonApi.getPokemonList(offset);
          // Cache the response
          await storageService.cachePokemonData(cacheKey, data);
        }

        set((state) => ({
          pokemon: page === 0 ? data.results : [...state.pokemon, ...data.results],
          currentPage: page,
          hasNextPage: !!data.next,
          loading: false
        }));

      } catch (error) {
        console.error('Error loading Pokemon:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to load Pokemon',
          loading: false
        });
      }
    },

    loadPokemonDetail: async (id: number) => {
      const state = get();
      
      if (state.pokemonDetails[id]) {
        return; // Already loaded
      }

      try {
        const cacheKey = `pokemon_detail_${id}`;
        let data;
        
        if (state.isOffline) {
          data = await storageService.getCachedPokemonData(cacheKey);
          if (!data) {
            throw new Error('No cached detail available offline');
          }
        } else {
          data = await pokemonApi.getPokemonDetail(id);
          await storageService.cachePokemonData(cacheKey, data);
        }

        set((state) => ({
          pokemonDetails: {
            ...state.pokemonDetails,
            [id]: data
          }
        }));

      } catch (error) {
        console.error(`Error loading Pokemon detail ${id}:`, error);
        set({
          error: error instanceof Error ? error.message : 'Failed to load Pokemon details'
        });
      }
    },

    addToFavorites: async (pokemon: Pokemon | PokemonDetail) => {
      const state = get();
      
      const favoritePokemon: FavoritePokemon = {
        id: pokemon.id,
        name: pokemon.name,
        image: 'sprites' in pokemon
                    ? pokemon.sprites?.other?.['official-artwork']?.front_default || ''
                    : pokemon.image || '',
        addedAt: new Date().toISOString()
      };

      // Check if already in favorites
      if (state.favorites.some(fav => fav.id === pokemon.id)) {
        return;
      }

      const updatedFavorites = [...state.favorites, favoritePokemon];

      if (state.isOffline) {
        // Queue for sync when online
        const syncAction: SyncAction = {
          type: 'ADD_FAVORITE',
          payload: favoritePokemon,
          timestamp: new Date().toISOString()
        };
        
        const updatedQueue = [...state.syncQueue, syncAction];
        await storageService.saveSyncQueue(updatedQueue);
        
        set({
          favorites: updatedFavorites,
          syncQueue: updatedQueue
        });
      } else {
        set({ favorites: updatedFavorites });
      }

      // Save to local storage
      await storageService.saveFavorites(updatedFavorites);
    },

    removeFromFavorites: async (id: number) => {
      const state = get();
      const updatedFavorites = state.favorites.filter(fav => fav.id !== id);

      if (state.isOffline) {
        const syncAction: SyncAction = {
          type: 'REMOVE_FAVORITE',
          payload: { id },
          timestamp: new Date().toISOString()
        };
        
        const updatedQueue = [...state.syncQueue, syncAction];
        await storageService.saveSyncQueue(updatedQueue);
        
        set({
          favorites: updatedFavorites,
          syncQueue: updatedQueue
        });
      } else {
        set({ favorites: updatedFavorites });
      }

      await storageService.saveFavorites(updatedFavorites);
    },

    toggleFavorite: async (pokemon: Pokemon | PokemonDetail) => {
      const state = get();
      const isFavorite = state.favorites.some(fav => fav.id === pokemon.id);
      
      if (isFavorite) {
        await get().removeFromFavorites(pokemon.id);
      } else {
        await get().addToFavorites(pokemon);
      }
    },

    checkIsFavorite: (id: number) => {
      const state = get();
      return state.favorites.some(fav => fav.id === id);
    },

    setOfflineStatus: (isOffline: boolean) => {
      set({ isOffline });
      
      if (!isOffline) {
        // When coming back online, sync queued actions
        get().syncWhenOnline();
      }
    },

    syncWhenOnline: async () => {
      const state = get();
      
      if (state.isOffline || state.syncQueue.length === 0) {
        return;
      }

      try {
        // Process sync queue (in a real app, you might want to sync with a backend)
        console.log('Syncing queued actions:', state.syncQueue);
        
        // Clear the sync queue after successful sync
        await storageService.clearSyncQueue();
        set({ syncQueue: [] });
        
      } catch (error) {
        console.error('Error syncing data:', error);
      }
    },

    loadOfflineData: async () => {
      try {
        const [favorites, syncQueue] = await Promise.all([
          storageService.getFavorites(),
          storageService.getSyncQueue()
        ]);

        set({
          favorites,
          syncQueue
        });
      } catch (error) {
        console.error('Error loading offline data:', error);
      }
    },

    clearError: () => {
      set({ error: null });
    },

    searchPokemon: async (query: string) => {
      if (!query.trim()) {
        // Reset to original list
        await get().loadPokemon(0);
        return;
      }

      set({ loading: true, error: null });

      try {
        const results = await pokemonApi.searchPokemon(query);
        
        // Convert search results to Pokemon format
        const pokemon: Pokemon[] = results.map(detail => ({
          id: detail.id,
          name: detail.name,
          url: `https://pokeapi.co/api/v2/pokemon/${detail.id}/`,
          image: detail.sprites.other['official-artwork'].front_default
        }));

        set({
          pokemon,
          loading: false,
          hasNextPage: false
        });
      } catch (error) {
        console.error('Error searching Pokemon:', error);
        set({
          error: 'Failed to search Pokemon',
          loading: false
        });
      }
    }
  }))
);

// Initialize network listener
let netInfoUnsubscribe: (() => void) | null = null;

export const initializeNetworkListener = () => {
  if (netInfoUnsubscribe) {
    netInfoUnsubscribe();
  }
  
  netInfoUnsubscribe = NetInfo.addEventListener(state => {
    const isOffline = !(state.isConnected && state.isInternetReachable);
    usePokemonStore.getState().setOfflineStatus(isOffline);
  });
};

export const cleanupNetworkListener = () => {
  if (netInfoUnsubscribe) {
    netInfoUnsubscribe();
    netInfoUnsubscribe = null;
  }
};