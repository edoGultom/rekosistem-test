export interface Pokemon {
  id: number;
  name: string;
  url: string;
  image?: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  types: PokemonType[];
  abilities: PokemonAbility[];
  sprites: {
    back_default:string;
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  height: number;
  weight: number;
}

export interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}

export interface FavoritePokemon {
  id: number;
  name: string;
  image: string;
  addedAt: string;
}

export interface AppState {
  pokemon: Pokemon[];
  favorites: FavoritePokemon[];
  pokemonDetails: Record<number, PokemonDetail>;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  currentPage: number;
  hasNextPage: boolean;
  syncQueue: SyncAction[];
}

export interface SyncAction {
  type: 'ADD_FAVORITE' | 'REMOVE_FAVORITE';
  payload: any;
  timestamp: string;
}