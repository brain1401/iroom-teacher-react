import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMainBackground } from "@/hooks/ui/useMainBackground";
import { useHydrateAtoms } from "jotai-ssr";
import { z } from "zod";

import {
  pokemonPageAtom,
  pokemonListFiltersAtom,
  pokemonListQueryOptions,
  filteredPokemonListAtom,
} from "@/atoms/pokemon";
import {
  pokemonDefaultLimit,
  getPokemonImageUrl,
  extractPokemonId,
} from "@/utils/pokemon";
import {
  getErrorMessage,
  getErrorSeverity,
  logError,
} from "@/utils/errorHandling";
import { Card, CardContent } from "@/components/ui/card";
import {
  PokemonSearch,
  PokemonListError,
  PokemonListGrid,
  PokemonListHeader,
  PokemonListLoading,
  PokemonListPagination,
  PokemonSearchEmpty,
} from "@/components/pokemon";

const pokemonSearchSchema = z.object({
  page: z.number().default(1),
  keyword: z.string().optional(),
});

export const Route = createFileRoute("/examples/pokemon/")({
  validateSearch: pokemonSearchSchema,
  loaderDeps: ({ search: { page, keyword } }) => ({ page, keyword }),
  loader: async (ctx) => {
    const { queryClient } = ctx.context;
    const { page, keyword } = ctx.deps as { page: number; keyword?: string };
    // 목록 데이터 확보 및 첫 화면 이미지 프리로드 대상 URL 계산
    const limit = pokemonDefaultLimit;
    const offset = (page - 1) * limit;
    const filters = { limit, offset, search: keyword };

    const data = await queryClient.ensureQueryData(
      pokemonListQueryOptions(filters),
    );

    const preloadImages = data.results
      .slice(0, Math.min(12, limit))
      .map((p) => extractPokemonId(p.url))
      .filter((id): id is string => Boolean(id))
      .map((id) => getPokemonImageUrl(id));

    return { preloadImages };
  },
  head: ({ loaderData }) => ({
    links: (loaderData?.preloadImages || []).map((url: string) => ({
      rel: "preload",
      as: "image",
      href: url,
      fetchPriority: "high",
      crossOrigin: "anonymous",
    })),
  }),
  component: PokemonListPage,
});

function PokemonListPage() {
  const { page, keyword } = Route.useSearch();

  // 메인 배경 그라데이션 설정 (커스텀 훅 사용)
  useMainBackground("bg-gradient-to-br from-blue-50 via-white to-purple-50");

  /**
   * ✅ Jotai SSR 최적화: 초기 hydration과 runtime 상태 동기화 분리
   * @description SSR hydration은 한번만, URL 파라미터 동기화는 useEffect로 처리
   *
   * 🔑 무한 리렌더링 해결책:
   *
   * 1. **SSR 초기 hydration (한번만)**:
   *    - useHydrateAtoms는 초기 서버 상태 주입용으로만 사용
   *    - enableReHydrate 제거로 강제 재주입 방지
   *
   * 2. **Runtime 상태 동기화**:
   *    - URL 파라미터 변경은 useEffect + atom setter로 처리
   *    - 렌더링 사이클과 분리하여 무한 루프 방지
   *
   * 3. **성능 최적화 유지**:
   *    - SSR: 서버에서 렌더링된 초기 상태 유지
   *    - hydration: 깜빡임 없는 매끄러운 전환
   *    - 상태 동기화: 안전한 useEffect 패턴 사용
   */

  // SSR 초기 hydration (한번만 실행)
  useHydrateAtoms([
    [pokemonPageAtom, page],
    [pokemonListFiltersAtom, { search: keyword }],
  ]);

  /**
   * 📌 useSetAtom 사용 이유: setter 함수만 필요 (write-only)
   * - URL 파라미터 변경 시 atom 값을 설정하기만 하면 되고 현재 값은 읽을 필요 없음
   * - useAtom 대신 useSetAtom 사용으로 불필요한 값 구독 제거
   * - 렌더링 최적화: atom 값 변경 시 이 컴포넌트는 리렌더링되지 않음
   */
  const setPokemonPage = useSetAtom(pokemonPageAtom);
  const setPokemonFilters = useSetAtom(pokemonListFiltersAtom);

  useEffect(() => {
    setPokemonPage(page);
  }, [page, setPokemonPage]);

  useEffect(() => {
    setPokemonFilters({ search: keyword });
  }, [keyword, setPokemonFilters]);

  /**
   * 📌 useAtomValue 사용 이유: 값만 읽기 (read-only)
   * - filteredPokemonListAtom의 derived 결과만 필요하고 직접 변경할 필요 없음
   * - useAtom 대신 useAtomValue 사용으로 불필요한 setter 함수 제거
   * - 데이터 무결성: derived atom을 실수로 변경하는 것을 방지
   *
   * 📦 Jotai Derived Atom 사용 - Best Practice 적용
   * @description filteredPokemonListAtom에서 필터링된 결과와 상태를 한번에 가져옴
   *
   * 장점:
   * - 필터링 로직이 atom에서 처리되어 컴포넌트가 가벼워짐
   * - 상태 변화에 자동으로 반응하며 불필요한 리렌더링 최소화
   * - 비즈니스 로직과 UI 로직의 명확한 분리
   */
  const {
    results: filtered,
    isPending,
    isError,
  } = useAtomValue(filteredPokemonListAtom);

  // 로딩 상태 처리
  if (isPending) {
    return <PokemonListLoading />;
  }

  // 에러 상태 처리
  if (isError) {
    const errorMessage = getErrorMessage(isError);
    const errorSeverity = getErrorSeverity(isError);
    logError(isError, "PokemonListPage");
    return <PokemonListError message={errorMessage} severity={errorSeverity} />;
  }

  return (
    <div className="">
      <div className="container mx-auto p-4 max-w-7xl">
        <PokemonListHeader />

        {/* 검색 섹션 */}
        <Card className="mb-8 shadow-lg border-2 py-0">
          <CardContent className="p-6">
            <PokemonSearch keyword={keyword} />
          </CardContent>
        </Card>

        {/* 검색어가 있고 결과가 없을 때 빈 상태 표시 */}
        {keyword && filtered.length === 0 ? (
          <PokemonSearchEmpty searchKeyword={keyword} />
        ) : (
          <>
            <PokemonListGrid items={filtered} />
            <PokemonListPagination page={page} />
          </>
        )}
      </div>
    </div>
  );
}
