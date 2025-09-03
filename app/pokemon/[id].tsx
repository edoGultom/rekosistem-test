import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TypeBadge } from '@/components/TypeBadge';
import { usePokemonStore } from '@/store/pokemonStore';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Ruler, Weight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pokemonId = parseInt(id!, 10);
  
  const { 
    pokemonDetails, 
    loadPokemonDetail, 
    checkIsFavorite, 
    toggleFavorite,
    error,
    clearError
  } = usePokemonStore();
  
  const [loading, setLoading] = useState(false);
  const pokemon = pokemonDetails[pokemonId];
  const isFavorite = checkIsFavorite(pokemonId);

  useEffect(() => {
    if (!pokemon) {
      setLoading(true);
      loadPokemonDetail(pokemonId).finally(() => setLoading(false));
    }
  }, [pokemonId, pokemon, loadPokemonDetail]);

  const handleFavoritePress = () => {
    if (pokemon) {
      toggleFavorite(pokemon);
    }
  };

  const handleRetry = () => {
    clearError();
    setLoading(true);
    loadPokemonDetail(pokemonId).finally(() => setLoading(false));
  };

  if (loading) {
    return <LoadingSpinner message="Loading Pokémon details..." />;
  }

  if (error && !pokemon) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  if (!pokemon) {
    return <ErrorMessage message="Pokémon not found" onRetry={handleRetry} />;
  }

  const mainImage = pokemon.sprites?.other?.['official-artwork']?.front_default || 
                   pokemon.sprites?.front_default;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{pokemon.name}</Text>
          <Text style={styles.headerSubtitle}>#{pokemon.id.toString().padStart(3, '0')}</Text>
        </View>

        <TouchableOpacity style={styles.favoriteHeaderButton} onPress={handleFavoritePress}>
          <Heart
            size={24}
            color={isFavorite ? '#EF4444' : '#FFFFFF'}
            fill={isFavorite ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Pokemon Image */}
      <View style={styles.imageSection}>
        {mainImage && (
          <Image
            source={{ uri: mainImage }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ruler size={16} color="#6B7280" />
            </View>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Weight size={16} color="#6B7280" />
            </View>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
          </View>
        </View>

        {/* Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types</Text>
          <View style={styles.typesContainer}>
            {pokemon.types.map((type, index) => (
              <TypeBadge key={index} type={type.type.name} />
            ))}
          </View>
        </View>

        {/* Abilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abilities</Text>
          <View style={styles.abilitiesContainer}>
            {pokemon.abilities.map((ability, index) => (
              <View key={index} style={styles.abilityItem}>
                <Text style={styles.abilityName}>{ability.ability.name}</Text>
                {ability.is_hidden && (
                  <View style={styles.hiddenBadge}>
                    <Text style={styles.hiddenText}>Hidden</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Sprites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sprites</Text>
          <View style={styles.spritesContainer}>
            {pokemon.sprites.front_default && (
              <Image
                source={{ uri: pokemon.sprites.front_default }}
                style={styles.sprite}
                resizeMode="contain"
              />
            )}
            {pokemon.sprites.back_default && (
              <Image
                source={{ uri: pokemon.sprites.back_default }}
                style={styles.sprite}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#DBEAFE',
    marginTop: 4,
  },
  favoriteHeaderButton: {
    padding: 8,
  },
  imageSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
  },
  mainImage: {
    width: 200,
    height: 200,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  basicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  abilitiesContainer: {
    gap: 12,
  },
  abilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  abilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  hiddenBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hiddenText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  spritesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  sprite: {
    width: 96,
    height: 96,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
});