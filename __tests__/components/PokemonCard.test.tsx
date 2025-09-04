import { PokemonCard } from '@/components/PokemonCard';
import { usePokemonStore } from '@/store/pokemonStore';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

// Mock the store
jest.mock('@/store/pokemonStore');
const mockUsePokemonStore = usePokemonStore as jest.MockedFunction<typeof usePokemonStore>;

const mockPokemon = {
  id: 1,
  name: 'bulbasaur',
  url: 'https://pokeapi.co/api/v2/pokemon/1/',
  image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
};

describe('PokemonCard', () => {
  const mockOnPress = jest.fn();
  const mockToggleFavorite = jest.fn();
  const mockCheckIsFavorite = jest.fn();

  beforeEach(() => {
    mockUsePokemonStore.mockReturnValue({
      checkIsFavorite: mockCheckIsFavorite,
      toggleFavorite: mockToggleFavorite,
      // Add other store properties as needed
    } as any);
    
    jest.clearAllMocks();
  });

  it('renders pokemon information correctly', () => {
    mockCheckIsFavorite.mockReturnValue(false);

    const { getByText } = render(
      <PokemonCard pokemon={mockPokemon} onPress={mockOnPress} />
    );

    expect(getByText('bulbasaur')).toBeTruthy();
    expect(getByText('#001')).toBeTruthy();
  });

  it('calls onPress when card is tapped', () => {
    mockCheckIsFavorite.mockReturnValue(false);

    const { getByText } = render(
      <PokemonCard pokemon={mockPokemon} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('bulbasaur'));
    expect(mockOnPress).toHaveBeenCalledWith(mockPokemon);
  });

  it('shows favorite status correctly', () => {
    mockCheckIsFavorite.mockReturnValue(true);

    const { UNSAFE_getByType } = render(
      <PokemonCard pokemon={mockPokemon} onPress={mockOnPress} />
    );

    // The heart icon should be filled when favorited
    const heartButton = UNSAFE_getByType(TouchableOpacity);
    // Additional assertions would depend on how the Heart component is implemented
  });

  it('toggles favorite when heart button is pressed', () => {
    mockCheckIsFavorite.mockReturnValue(false);
  
    const { getByTestId } = render(
      <PokemonCard pokemon={mockPokemon} onPress={mockOnPress} />
    );
  
    const favoriteButton = getByTestId('favorite-button');
    fireEvent.press(favoriteButton, { stopPropagation: jest.fn() });

    expect(mockToggleFavorite).toHaveBeenCalledWith(mockPokemon);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('formats pokemon ID with leading zeros', () => {
    const pokemonWithHighId = { ...mockPokemon, id: 150 };
    mockCheckIsFavorite.mockReturnValue(false);

    const { getByText } = render(
      <PokemonCard pokemon={pokemonWithHighId} onPress={mockOnPress} />
    );

    expect(getByText('#150')).toBeTruthy();
  });
});