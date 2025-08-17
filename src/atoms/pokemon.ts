import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";
import {
  pokemonKeys,
  pokemonListQueryOptions,
  pokemonDetailQueryOptions,
} from "@/api/pokemon/query";
import { pokemonDefaultLimit } from "@/utils/pokemon";
import { ApiError } from "@/api/client";

/**
 * Jotai란?
 * - 전역 상태 관리 라이브러리 (Redux, Zustand와 비슷한 역할)
 * - useState와 비슷하지만 여러 컴포넌트에서 공유 가능
 * - atom이라는 작은 상태 단위로 관리
 * - React Query와 연동하여 서버 데이터도 전역에서 관리 가능
 */

// 편의를 위한 재Export
export {
  pokemonKeys,
  pokemonListQueryOptions,
  pokemonDetailQueryOptions,
} from "@/api/pokemon/query";

/**
 * 포켓몬 목록 조회를 위한 필터링 옵션
 * @interface PokemonListFilters
 */
/**
 * 포켓몬 목록 조회 시 표시할 개수를 관리하는 atom
 * @description 사용자별 개인화된 설정으로 localStorage에 저장
 *
 * 설계 원칙:
 * - page: URL 파라미터로 관리 (북마크/공유 가능)
 * - limit: atom으로 관리 (개인 설정, 영구 저장)
 *
 * 장점:
 * - 사용자별 선호 페이지 크기 영구 저장
 * - URL 간소화 (limit 제거로 더 깔끔한 URL)
 * - 페이지 히스토리 최적화 (limit 변경이 히스토리에 영향 없음)
 */
export const pokemonLimitAtom = atomWithStorage(
  "pokemon-limit",
  pokemonDefaultLimit,
);

/**
 * 현재 페이지 번호를 관리하는 atom
 * @description URL의 page 파라미터와 동기화되는 상태
 */
export const pokemonPageAtom = atom<number>(1);

type PokemonListFilters = {
  /** 포켓몬 이름 검색어 */
  search?: string;
};

/**
 * 포켓몬 목록 검색 조건을 관리하는 atom
 * @description 포켓몬 이름 검색어만 관리 (limit은 별도 atom, page도 별도 atom)
 *
 * 기존 useState와 비교:
 * ```typescript
 * // 기존 방식 (각 컴포넌트마다 따로 관리)
 * const [search, setSearch] = useState("");
 *
 * // Jotai 방식 (전역에서 공유)
 * const [filters, setFilters] = useAtom(pokemonListFiltersAtom);
 * ```
 */
export const pokemonListFiltersAtom = atom<PokemonListFilters>({});

/**
 * 포켓몬 목록 데이터를 관리하는 쿼리 atom
 * @description React Query + Jotai를 조합하여 포켓몬 목록을 전역에서 관리
 *
 * 작동 방식:
 * 1. page, limit, search atom의 값이 변경되면 자동으로 새로운 쿼리 실행
 * 2. 검색어가 있으면 서버 사이드에서 필터링된 결과를 페이지네이션과 함께 반환
 * 3. 검색어가 없으면 page와 limit으로 offset을 계산하여 페이지네이션
 * 4. 로딩, 에러, 데이터 상태를 모든 컴포넌트에서 공유
 * 5. 동일한 조건의 요청은 캐시에서 바로 반환
 *
 * 사용 예시:
 * ```typescript
 * const [{ data, isLoading, error }] = useAtom(pokemonListQueryAtom);
 * ```
 */
export const pokemonListQueryAtom = atomWithQuery((get) => {
  const page = get(pokemonPageAtom);
  const limit = get(pokemonLimitAtom);
  const { search } = get(pokemonListFiltersAtom);

  // 검색어가 있든 없든 동일한 방식으로 처리 (서버에서 필터링 수행)
  const offset = (page - 1) * limit;
  const filters = { limit, offset, search };
  return pokemonListQueryOptions(filters);
});

/**
 * 조회할 포켓몬의 ID 또는 이름을 관리하는 atom
 * @description 포켓몬 상세 정보를 조회할 때 사용할 식별자를 전역에서 관리
 *
 * 사용 예시:
 * ```typescript
 * const [pokemonId, setPokemonId] = useAtom(pokemonIdOrNameAtom);
 * setPokemonId("pikachu"); // 이름으로 설정
 * setPokemonId(25);        // ID로 설정
 * ```
 */
export const pokemonIdOrNameAtom = atom<string | number>("");

/**
 * 포켓몬 상세 정보 데이터를 관리하는 쿼리 atom
 * @description 특정 포켓몬의 상세 정보를 전역에서 관리하는 atom
 *
 * 작동 방식:
 * 1. pokemonIdOrNameAtom의 값이 있을 때만 쿼리 실행
 * 2. 값이 변경되면 자동으로 해당 포켓몬의 상세 정보 조회
 * 3. 빈 값이면 쿼리를 비활성화하여 불필요한 요청 방지
 *
 * 사용 예시:
 * ```typescript
 * // 1단계: 조회할 포켓몬 설정
 * const [, setPokemonId] = useAtom(pokemonIdOrNameAtom);
 * setPokemonId("charizard");
 *
 * // 2단계: 상세 정보 가져오기
 * const [{ data: pokemon, isLoading, error }] = useAtom(pokemonDetailQueryAtom);
 * ```
 */
export const pokemonDetailQueryAtom = atomWithQuery((get) => {
  const idOrName = get(pokemonIdOrNameAtom);

  // idOrName이 없으면 쿼리를 비활성화
  if (!idOrName) {
    return {
      queryKey: pokemonKeys.detail("disabled"),
      queryFn: undefined as any,
      enabled: false,
    };
  }

  return pokemonDetailQueryOptions(idOrName);
});

/**
 * 필터링된 포켓몬 목록을 관리하는 derived atom
 * @description 서버에서 이미 필터링된 포켓몬 목록을 반환하는 단순한 패스스루 atom
 *
 * Jotai Best Practice 적용:
 * - 컴포넌트의 useMemo 대신 derived atom 사용
 * - 비즈니스 로직을 atom 레벨에서 처리
 * - 서버 사이드 필터링 결과를 그대로 반환
 *
 * 작동 방식:
 * 1. pokemonListQueryAtom에서 포켓몬 목록 데이터 가져오기
 * 2. 서버에서 이미 검색어에 따른 필터링이 완료되었으므로 그대로 반환
 * 3. 로딩/에러 상태도 함께 반환하여 UI에서 활용
 *
 * 개선사항:
 * - 서버 사이드 검색으로 성능 향상
 * - 검색 결과의 SSR 지원
 * - 클라이언트 사이드 중복 필터링 제거
 *
 * 사용 예시:
 * ```typescript
 * const [filteredResults] = useAtom(filteredPokemonListAtom);
 * // filteredResults: { results: Pokemon[], isPending: boolean, isError: any }
 * ```
 */
export const filteredPokemonListAtom = atom((get) => {
  const { data, isPending, isError } = get(pokemonListQueryAtom);

  // 로딩 중이거나 에러인 경우 빈 배열 반환
  if (isPending || isError) {
    return {
      results: [],
      isPending,
      isError,
    };
  }

  // 서버에서 이미 필터링된 결과를 그대로 반환
  return {
    results: data.results,
    isPending,
    isError,
  };
});

/**
 * API 에러 클래스 재export
 * @description 호환성을 위한 ApiError 클래스 export
 */
export { ApiError };
