import axios from 'axios';

jest.mock('axios'); // <-- aktifkan mock dulu

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

// pastikan create() return mock instance
mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

let pokemonApi: typeof import('@/services/api')['pokemonApi'];

beforeAll(() => {
  // isolateModules supaya api.ts di-load setelah mock aktif
  jest.isolateModules(() => {
    const module = require('@/services/api');
    pokemonApi = module.pokemonApi;
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('pokemonApi', () => {
  it('should fetch pokemon list with correct parameters', async () => {
    const mockResponse = {
      data: {
        count: 1302,
        next: 'https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20',
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      },
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const result = await pokemonApi.getPokemonList(0);

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pokemon?limit=20&offset=0');
    expect(result.results[0]).toMatchObject({
      name: 'bulbasaur',
      id: 1,
      image: expect.stringContaining('official-artwork/1.png'),
    });
  });
});
