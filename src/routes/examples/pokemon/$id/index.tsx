import { createFileRoute, Link } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useMainBackground } from "@/hooks/ui/useMainBackground";
import { useHydrateAtoms } from "jotai-ssr";
import { useEffect } from "react";
import {
  pokemonIdOrNameAtom,
  pokemonDetailQueryAtom,
  pokemonDetailQueryOptions,
} from "@/atoms/pokemon";
import {
  getErrorMessage,
  getErrorSeverity,
  logError,
} from "@/utils/errorHandling";
import { Button } from "@/components/ui/button";
import {
  PokemonDetailSkeleton,
  PokemonDetailLayout,
  PokemonDetailImage,
  PokemonDetailHeader,
  PokemonDetailBodyInfo,
  PokemonDetailStats,
  PokemonDetailExperience,
} from "@/components/pokemon";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/examples/pokemon/$id/")({
  loader: ({ params: { id }, context: { queryClient } }) =>
    queryClient.prefetchQuery(pokemonDetailQueryOptions(id)),
  pendingMinMs: 300,
  pendingComponent: PokemonDetailSkeleton,
  component: PokemonDetailPage,
});

function PokemonDetailPage() {
  const { id } = Route.useParams();

  /**
   * 📌 SSR vs CSR 상태 동기화 비교 실험
   *
   * 🔍 차이점을 직접 확인하는 방법:
   * 1. 아래 useHydrateAtoms를 주석처리하고
   * 2. 바로 아래 useEffect 코드를 주석해제한 후
   * 3. http://localhost:3000/examples/pokemon/nidoran-m 에서 새로고침 해보세요
   * 4. 페이지 소스 보기(Ctrl+U)로 초기 HTML을 비교해보세요
   */

  // 🚫 기존 방식 (useEffect): 초기 HTML에 데이터 누락
  // const setPokemonIdOrName = useSetAtom(pokemonIdOrNameAtom);
  // useEffect(() => {
  //   setPokemonIdOrName(id);
  // }, [id]);

  /**
   * ✅ Jotai SSR 방식 (useHydrateAtoms): 초기 HTML에 데이터 포함
   * @description URL 파라미터의 포켓몬 ID를 atom에 주입하여 서버-클라이언트 상태 동기화
   *
   * 🔑 핵심 차이점:
   *
   * 1. **초기 HTML 렌더링**:
   *    - useEffect: 초기값("") → 클라이언트에서 변경 → 깜빡임 발생
   *    - useHydrateAtoms: 서버에서 이미 올바른 값 → 매끄러운 렌더링
   *
   * 2. **SEO & 성능**:
   *    - useEffect: 검색엔진이 빈 상태만 봄, CLS(누적 레이아웃 이동) 발생
   *    - useHydrateAtoms: 검색엔진이 완전한 데이터 봄, 안정적인 레이아웃
   *
   * 3. **사용자 경험**:
   *    - useEffect: 로딩 → 깜빡임 → 콘텐츠 (느림)
   *    - useHydrateAtoms: 즉시 콘텐츠 표시 (빠름)
   *
   * 🛠 작동 원리:
   * 1. 서버에서 URL 파라미터 (예: /pokemon/25) 감지
   * 2. pokemonIdOrNameAtom에 "25" 값을 서버 렌더링 시점에 주입
   * 3. pokemonDetailQueryAtom이 반응하여 API 호출 (prefetch된 데이터 사용)
   * 4. 완전한 HTML이 클라이언트로 전송됨
   * 5. 클라이언트에서 hydration 시 서버와 동일한 상태 유지
   */
  useHydrateAtoms([[pokemonIdOrNameAtom, id]]);

  /**
   * 📌 useSetAtom 사용 이유: setter 함수만 필요 (write-only)
   * - pokemonIdOrNameAtom의 값을 설정하기만 하면 되고 현재 값은 읽을 필요 없음
   * - useAtom 대신 useSetAtom 사용으로 불필요한 값 구독 제거
   * - 메모리 최적화: 값 변경 시에만 리렌더링되지 않도록 함
   */
  const setPokemonIdOrName = useSetAtom(pokemonIdOrNameAtom);

  useEffect(() => {
    // URL ID가 변경될 때만 atom 업데이트 (초기 hydration은 useHydrateAtoms에서 처리)
    setPokemonIdOrName(id);
  }, [id, setPokemonIdOrName]);

  /**
   * 📌 useAtomValue 사용 이유: 값만 읽기 (read-only)
   * - pokemonDetailQueryAtom의 쿼리 결과만 필요하고 직접 변경할 필요 없음
   * - useAtom 대신 useAtomValue 사용으로 불필요한 setter 함수 제거
   * - 데이터 안전성: 실수로 쿼리 상태를 변경하는 것을 방지
   */
  const {
    data: pokemon,
    isPending,
    isError,
  } = useAtomValue(pokemonDetailQueryAtom);

  // 빈 ID로 인한 에러는 로딩 상태로 처리 (useHydrateAtoms 대기)
  const isLoadingOrEmpty = isPending || (!pokemon && !isError);

  // 메인 배경 테마별 그라데이션 설정 (커스텀 훅 사용)
  useMainBackground({
    light: "bg-gradient-to-br from-blue-50 via-white to-purple-50",
    dark: "bg-gradient-to-br from-slate-800 via-slate-900 to-purple-900",
  });

  if (isLoadingOrEmpty) return <PokemonDetailSkeleton />;

  if (isError) {
    // 에러 로깅 및 메시지 추출
    const errorMessage = getErrorMessage(isError);
    const errorSeverity = getErrorSeverity(isError);
    logError(isError, "PokemonDetailPage");

    const errorStyles = {
      info: "text-blue-600",
      warning: "text-yellow-600",
      error: "text-red-600",
      critical: "text-red-800 font-bold",
    };

    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/examples/pokemon" search={true}>
              ← 목록으로
            </Link>
          </Button>
        </div>
        <div className={`text-center py-8 p-8 ${errorStyles[errorSeverity]}`}>
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="lg"
            asChild
            className="gap-2 hover:scale-105 transition-transform bg-zinc-100 dark:bg-zinc-900"
          >
            <Link to="/examples/pokemon" search={true}>
              <ChevronLeft className="w-5 h-5" />
              목록으로
            </Link>
          </Button>
        </div>

        <PokemonDetailLayout
          left={<PokemonDetailImage pokemon={pokemon} idParam={id} />}
          right={
            <div className="space-y-8">
              <PokemonDetailHeader pokemon={pokemon} />
              <PokemonDetailBodyInfo pokemon={pokemon} />
              <PokemonDetailStats pokemon={pokemon} />
              <PokemonDetailExperience pokemon={pokemon} />
            </div>
          }
        />
      </div>
    </div>
  );
}
