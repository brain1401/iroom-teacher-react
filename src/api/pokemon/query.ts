import { queryOptions } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  fetchPokemonList,
  fetchPokemonDetail,
  fetchPokemonListWithServerSearch,
} from "./api";
import type { Pokemon, PokemonListResponse } from "./types";

/**
 * 포켓몬 쿼리 키 관리 객체
 * @description React Query에서 사용하는 캐시 키들을 체계적으로 관리
 *
 * React Query란?
 * - useEffect + useState로 데이터 가져오는 것을 대체하는 라이브러리
 * - 자동으로 로딩, 에러, 캐싱, 재시도 등을 처리해줌
 * - 같은 데이터를 여러 컴포넌트에서 사용해도 한 번만 요청함
 */
export const pokemonKeys = {
  /** 모든 포켓몬 관련 쿼리의 기본 키 */
  all: ["pokemon"] as const,
  /** 포켓몬 목록 쿼리들의 기본 키 */
  lists: () => [...pokemonKeys.all, "list"] as const,
  /** 특정 조건의 포켓몬 목록 쿼리 키 */
  list: (filters?: { limit?: number; offset?: number; search?: string }) =>
    [...pokemonKeys.lists(), filters] as const,
  /** 포켓몬 상세 정보 쿼리들의 기본 키 */
  details: () => [...pokemonKeys.all, "detail"] as const,
  /** 특정 포켓몬의 상세 정보 쿼리 키 */
  detail: (idOrName: string | number) =>
    [...pokemonKeys.details(), String(idOrName).toLowerCase()] as const,
} as const;

/**
 * 포켓몬 목록 조회를 위한 React Query 옵션 생성 함수
 * @description useQuery 훅에서 사용할 수 있는 쿼리 옵션을 생성
 *
 * 기존 useEffect와 비교:
 * ```typescript
 * // 기존 방식 (useEffect + useState)
 * const [data, setData] = useState(null);
 * const [loading, setLoading] = useState(true);
 * const [error, setError] = useState(null);
 *
 * useEffect(() => {
 *   fetchPokemonList().then(setData).catch(setError).finally(() => setLoading(false));
 * }, []);
 *
 * // React Query 방식
 * const { data, isLoading, error } = useQuery(pokemonListQueryOptions());
 * ```
 *
 * @param filters 포켓몬 목록 필터링 조건
 * @param filters.limit 한 페이지당 포켓몬 수
 * @param filters.offset 건너뛸 포켓몬 수 (페이지네이션)
 * @param filters.search 검색할 포켓몬 이름
 * @returns React Query에서 사용할 쿼리 옵션 객체
 */
export const pokemonListQueryOptions = (filters?: {
  limit?: number;
  offset?: number;
  search?: string;
}) => {
  return queryOptions({
    queryKey: pokemonKeys.list(filters),
    queryFn: async ({ signal }): Promise<PokemonListResponse> => {
      // 검색어가 있으면 서버 사이드 검색 함수 사용
      if (filters?.search && filters.search.trim() !== "") {
        return await fetchPokemonListWithServerSearch(
          { ...filters, search: filters.search },
          { signal },
        );
      }
      // 검색어가 없으면 기본 함수 사용
      return await fetchPokemonList(filters, { signal });
    },
    retry: (failureCount, error) => {
      // 404 에러는 재시도하지 않음 (존재하지 않는 데이터)
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      // 다른 에러는 최대 3번까지 재시도
      return failureCount < 3;
    },
  });
};

/**
 * 포켓몬 상세 정보 조회를 위한 React Query 옵션 생성 함수
 * @description 특정 포켓몬의 상세 정보를 가져오는 쿼리 옵션을 생성
 *
 * 사용 예시:
 * ```typescript
 * // useQuery 훅과 함께 사용
 * const { data: pokemon, isLoading, error } = useQuery(pokemonDetailQueryOptions("pikachu"));
 *
 * // Jotai atomWithQuery와 함께 사용
 * const detailAtom = atomWithQuery(() => pokemonDetailQueryOptions(pokemonId));
 * ```
 *
 * @param idOrName 조회할 포켓몬의 ID(숫자) 또는 이름(문자열)
 * @returns React Query에서 사용할 쿼리 옵션 객체
 */
export const pokemonDetailQueryOptions = (idOrName: string | number) => {
  // 빈 값이나 placeholder인 경우 쿼리 비활성화
  const isValidId = Boolean(
    idOrName && idOrName !== "placeholder" && idOrName !== "",
  );

  return queryOptions({
    queryKey: pokemonKeys.detail(idOrName),
    queryFn: async ({ signal }): Promise<Pokemon> => {
      // 유효하지 않은 ID인 경우 에러 발생
      if (!isValidId) {
        throw new Error("포켓몬 ID가 제공되지 않았습니다.");
      }
      return await fetchPokemonDetail(idOrName, { signal });
    },
    retry: (failureCount, error) => {
      // 404 에러는 재시도하지 않음 (존재하지 않는 포켓몬)
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      // 다른 에러는 최대 2번까지 재시도 (상세 정보는 재시도 횟수를 줄임)
      return failureCount < 2;
    },
    enabled: isValidId, // 유효한 ID가 있을 때만 쿼리 실행
  });
};
