import { cn } from "@/lib/utils";
import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";

export const Route = createFileRoute("/examples/pokemon")({
  component: PokemonLayoutComponent,
});

/**
 * 포켓몬 페이지 공통 레이아웃 컴포넌트
 * @description 포켓몬 목록과 상세 페이지에서 사용되는 공통 컨테이너 레이아웃 제공
 *
 * 🔑 핵심 기능:
 * - 반응형 컨테이너 (모바일/데스크톱 대응)
 * - 동적 최대 너비 조절 (목록: 60rem, 상세: 80rem)
 * - 일관된 패딩 및 여백 설정
 * - 자식 컴포넌트 렌더링 영역 제공
 */
function PokemonLayoutComponent() {
  // 현재 라우터 상태를 통해 URL 경로 확인
  const routerState = useRouterState();
  const isDetailPage = routerState.location.pathname.includes("/$id");

  // 상세 페이지는 더 넓은 최대 너비 사용 (80rem), 목록 페이지는 60rem
  const maxWidthClass = isDetailPage ? "max-w-[80rem]" : "max-w-[60rem]";

  return (
    <div className={cn("w-full mx-auto p-4 lg:p-8", maxWidthClass)}>
      {/* 자식 컴포넌트 렌더링 영역 */}
      <Outlet />
    </div>
  );
}
