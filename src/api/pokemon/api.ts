import type { AxiosRequestConfig } from "axios";
import { baseApiClient } from "@/api/client";
import {
  buildPokemonListUrl,
  buildPokemonByNameOrIdUrl,
} from "@/utils/pokemon/urlBuilder";
import type { Pokemon, PokemonListResponse } from "./types";

/**
 * 포켓몬 전용 API 클라이언트
 * @description 기본 API 클라이언트를 확장하여 포켓몬 API 전용으로 설정
 */
const pokemonApiClient = baseApiClient.create({
  baseURL: "https://pokeapi.co/api/v2",
});

/**
 * 포켓몬 API 공통 요청 함수
 * @description 모든 포켓몬 API 호출에서 공통으로 사용하는 요청 처리 함수
 * @template T API 응답 데이터 타입
 * @param config Axios 요청 설정 객체
 * @returns API 응답 데이터
 */
async function pokemonApiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await pokemonApiClient.request<T>(config);
  return response.data;
}

/**
 * 포켓몬 목록을 조회하는 함수
 * @description useEffect에서 데이터를 직접 가져오는 대신 이 함수를 사용
 * @example
 * ```typescript
 * // 기본 사용법
 * const pokemonList = await fetchPokemonList();
 *
 * // 페이지네이션과 검색
 * const filteredList = await fetchPokemonList({
 *   limit: 20,
 *   offset: 0,
 *   search: "pikachu"
 * });
 * ```
 * @param params 조회 조건
 * @param params.limit 한 페이지에 가져올 포켓몬 수 (기본값: 24)
 * @param params.offset 건너뛸 포켓몬 수 (페이지네이션용)
 * @param params.search 검색할 포켓몬 이름
 * @param options 추가 옵션
 * @param options.signal 요청 취소를 위한 AbortSignal
 * @returns 포켓몬 목록과 페이지네이션 정보
 */
export async function fetchPokemonList(
  params?: {
    limit?: number;
    offset?: number;
    search?: string;
  },
  options?: { signal?: AbortSignal },
): Promise<PokemonListResponse> {
  return pokemonApiRequest<PokemonListResponse>({
    method: "GET",
    url: buildPokemonListUrl(params),
    signal: options?.signal,
  });
}

/**
 * 서버 사이드에서 포켓몬 검색을 수행하는 함수
 * @description SSR에서 keyword 검색을 지원하기 위해 서버에서 필터링 수행
 * @param params 조회 조건
 * @param params.limit 한 페이지에 가져올 포켓몬 수
 * @param params.offset 건너뛸 포켓몬 수
 * @param params.search 검색할 포켓몬 이름 (필수)
 * @param options 추가 옵션
 * @param options.signal 요청 취소를 위한 AbortSignal
 * @returns 서버에서 필터링된 포켓몬 목록
 */
export async function fetchPokemonListWithServerSearch(
  params: {
    limit?: number;
    offset?: number;
    search: string;
  },
  options?: { signal?: AbortSignal },
): Promise<PokemonListResponse> {
  // 검색어가 있으면 더 많은 포켓몬을 가져와서 서버에서 필터링
  // PokeAPI는 서버 사이드 검색을 지원하지 않으므로 클라이언트에서 처리
  const allPokemonResponse = await pokemonApiRequest<PokemonListResponse>({
    method: "GET",
    url: buildPokemonListUrl({ limit: 1000, offset: 0 }), // 전체 포켓몬 가져오기
    signal: options?.signal,
  });

  // 서버 사이드 필터링 수행
  const searchTerm = params.search.toLowerCase().trim();
  const filteredResults = allPokemonResponse.results.filter((pokemon) => {
    const pokemonName = pokemon.name.toLowerCase();

    // 포켓몬 ID로도 검색 가능하도록 URL에서 ID 추출
    const urlParts = pokemon.url.split("/");
    const pokemonId = urlParts[urlParts.length - 2] || "";

    // 이름 또는 ID로 검색
    return pokemonName.includes(searchTerm) || pokemonId.includes(searchTerm);
  });

  // 페이지네이션 적용
  const limit = params.limit || 24;
  const offset = params.offset || 0;
  const paginatedResults = filteredResults.slice(offset, offset + limit);

  return {
    count: filteredResults.length,
    next:
      offset + limit < filteredResults.length
        ? `?offset=${offset + limit}&limit=${limit}`
        : null,
    previous:
      offset > 0
        ? `?offset=${Math.max(0, offset - limit)}&limit=${limit}`
        : null,
    results: paginatedResults,
  };
}

/**
 * 포켓몬 상세 정보를 조회하는 함수
 * @description 특정 포켓몬의 모든 상세 정보를 가져오는 함수 (이미지, 능력치, 기술 등)
 * @example
 * ```typescript
 * // ID로 조회
 * const pikachu = await fetchPokemonDetail(25);
 *
 * // 이름으로 조회
 * const charizard = await fetchPokemonDetail("charizard");
 *
 * // 요청 취소 기능 포함
 * const controller = new AbortController();
 * const pokemon = await fetchPokemonDetail(1, { signal: controller.signal });
 * ```
 * @param idOrName 포켓몬 ID 번호 또는 이름
 * @param options 추가 옵션
 * @param options.signal 요청 취소를 위한 AbortSignal
 * @returns 포켓몬의 모든 상세 정보 (능력치, 이미지, 기술, 특성 등)
 */
export async function fetchPokemonDetail(
  idOrName: string | number,
  options?: { signal?: AbortSignal },
): Promise<Pokemon> {
  return pokemonApiRequest<Pokemon>({
    method: "GET",
    url: buildPokemonByNameOrIdUrl(idOrName),
    signal: options?.signal,
  });
}
