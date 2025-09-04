import { PokemonDetail, PokemonListResponse } from '@/types/pokemon';
import axios from 'axios';

// const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_URL = 'https://pokeapi.co/api/v2';
const LIMIT = 20;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const pokemonApi = {
  async getPokemonList(offset: number = 0): Promise<PokemonListResponse> {
    try {
      const response = await api.get(`/pokemon?limit=${LIMIT}&offset=${offset}`);
      
      // Add image URLs to each Pokemon
      const pokemonWithImages = response.data.results.map((pokemon: any, index: number) => ({
        ...pokemon,
        id: offset + index + 1,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${offset + index + 1}.png`
      }));

      return {
        ...response.data,
        results: pokemonWithImages
      };
    } catch (error) {
      console.log('Error fetching Pokemon list:', error);
      throw error;
    }
  },

  async getPokemonDetail(search: number|string): Promise<PokemonDetail> {
    try {
      const response = await api.get(`/pokemon/${search}`);
      return response.data;
    } catch (error) {
      console.log(`Error fetching Pokemon detail for ID ${search}:`, error);
      throw error;
    }
  },

  async searchPokemon(query: string): Promise<PokemonDetail[]> {
    try {
      const searchResults: PokemonDetail[] = [];
      const lowerQuery = query.toLowerCase();
      
      // Simple search by trying to fetch the Pokemon directly
      try {
        const pokemon = await this.getPokemonDetail(lowerQuery as string);
        searchResults.push(pokemon);
      } catch {
        // If direct search fails, we could implement more complex search logic
      }
      
      return searchResults;
    } catch (error) {
      console.log('Error searching Pokemon:', error);
      throw error;
    }
  }
};