import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { QueryClientAtomProvider } from "jotai-tanstack-query/react";

/**
 * TanStack Router가 자동 생성한 라우트 트리
 *
 * src/routes 디렉토리의 파일들을 기반으로 자동 생성되는 타입 안전한 라우트 트리
 * 파일 기반 라우팅 시스템이 모든 라우트를 스캔하여 생성
 */
import { routeTree } from "./routeTree.gen";
import { NotFound } from "@/components/errors/NotFound";

/**
 * TanStack Router 인스턴스 생성 함수
 *
 * 애플리케이션의 라우팅을 담당하는 라우터 설정 및 생성
 * React Query와의 통합, SSR 지원, 404 처리 등을 포함한 완전한 라우터 설정 제공
 *
 * @returns 설정이 완료된 TanStack Router 인스턴스
 */
export const createRouter = () => {
  // React Query 컨텍스트 가져오기 (QueryClient 포함)
  const rqContext = TanstackQuery.getContext();

  // TanStack Router 인스턴스 생성 및 설정
  const router = createTanstackRouter({
    // 자동 생성된 라우트 트리 사용
    routeTree,
    // 라우터 컨텍스트에 React Query 컨텍스트 전달
    context: { ...rqContext },
    // 프리로딩 전략: "intent"는 링크에 호버할 때 미리 로딩
    defaultPreload: "intent",
    // 라우트 이동 시 스크롤 복원 기능 활성화
    scrollRestoration: true,
    // 라우트 이동 시 스크롤 복원 기능 행동 방식
    scrollRestorationBehavior: "instant",
    // 404 페이지 처리를 위한 기본 컴포넌트
    defaultNotFoundComponent: () => <NotFound />,
    // 전체 애플리케이션을 감싸는 래퍼 컴포넌트
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        // Jotai와 React Query를 연결하는 프로바이더
        <QueryClientAtomProvider client={rqContext.queryClient}>
          {props.children}
        </QueryClientAtomProvider>
      );
    },
  });

  // SSR과 React Query의 통합 설정
  // 서버에서 프리페치된 데이터를 클라이언트에서 재사용할 수 있게 함
  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  });

  return router;
};

/**
 * TypeScript 타입 안전성을 위한 라우터 타입 등록
 *
 * TanStack Router의 타입 시스템에 생성한 라우터의 타입 등록
 * 라우트 경로, 파라미터, 검색 파라미터 등에 대한 완전한 타입 안전성 제공
 *
 * 등록된 타입의 활용 영역:
 * - Link 컴포넌트의 to 속성에서 자동완성과 타입 체크
 * - useNavigate, useParams, useSearch 등의 훅에서 타입 추론
 * - 라우트 파라미터와 검색 파라미터의 타입 안전성 보장
 */
declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
