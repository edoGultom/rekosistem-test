import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PokemonCard } from '@/components/PokemonCard';
import { SearchBar } from '@/components/SearchBar';
import { usePokemonStore } from '@/store/pokemonStore';
import { Pokemon } from '@/types/pokemon';
import { router } from 'expo-router';
import { Wifi, WifiOff } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function PokemonListScreen() {
  const {
    pokemon,
    loading,
    error,
    isOffline,
    hasNextPage,
    loadPokemon,
    clearError,
    searchPokemon,
  } = usePokemonStore();

  useEffect(() => {
    if (pokemon.length === 0) {
      loadPokemon(0);
    }
  }, [loadPokemon, pokemon.length]);

  const handleRefresh = () => {
    clearError();
    loadPokemon(0);
  };

  const handleLoadMore = () => {
    if (!loading && hasNextPage) {
      const nextPage = Math.floor(pokemon.length / 20);
      loadPokemon(nextPage);
    }
  };

  const handlePokemonPress = (selectedPokemon: Pokemon) => {
    router.push({
      pathname: '/pokemon/[id]',
      params: { id: selectedPokemon.id.toString() },
    });
  };

  const handleSearch = (query: string) => {
    searchPokemon(query);
  };

  if (loading && pokemon.length === 0) {
    return <LoadingSpinner message="Loading Pokémon..." />;
  }

  if (error && pokemon.length === 0) {
    return <ErrorMessage message={error} onRetry={handleRefresh} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pokémon</Text>
        <View style={styles.statusContainer}>
          {isOffline ? (
            <View style={styles.offlineIndicator}>
              <WifiOff size={16} color="#EF4444" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          ) : (
            <View style={styles.onlineIndicator}>
              <Wifi size={16} color="#10B981" />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search */}
      <SearchBar onSearch={handleSearch} />

      {/* Pokemon List */}
      <FlatList
        data={pokemon}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PokemonCard pokemon={item} onPress={handlePokemonPress} />
        )}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        ListFooterComponent={() => {
          if (loading && pokemon.length > 0) {
            return (
              <View style={styles.loadingFooter}>
                <LoadingSpinner size="small" message="Loading more..." />
              </View>
            );
          }
          return null;
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Pokémon found</Text>
            <Text style={styles.emptySubtext}>Try searching for a different Pokémon</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  offlineText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  onlineText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  listContent: {
    padding: 8,
  },
  loadingFooter: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});