import { pokemonDefaultLimit, pokemonDefaultOffset } from "./constants";

// Pokemon 목록 URL 빌드
export function buildPokemonListUrl(params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): string {
  const limit = params?.limit ?? pokemonDefaultLimit;
  const offset = params?.offset ?? pokemonDefaultOffset;

  const url = new URL("/pokemon", "https://pokeapi.co/api/v2");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  return url.pathname + url.search;
}

// Pokemon 상세 URL 빌드
export function buildPokemonByNameOrIdUrl(idOrName: string | number): string {
  return `/pokemon/${idOrName}`;
}
