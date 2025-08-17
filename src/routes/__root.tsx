import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import type { QueryClient } from "@tanstack/react-query";
import appCss from "@/css/root.css?url";
import NavigationBar from "@/components/layout/NavigationBar";
import { useAtomValue } from "jotai";
import { mainBgExtraCombinedClassAtom } from "@/atoms/ui";
import { cn } from "@/lib/utils";

/**
 * 라우터 컨텍스트 타입 정의
 *
 * TanStack Router의 모든 라우트에서 공유하는 타입 안전한 컨텍스트
 * QueryClient를 포함하여 서버 상태 관리를 위한 React Query 통합 제공
 *
 * @property queryClient - React Query의 QueryClient 인스턴스로 데이터 캐싱과 서버 상태 관리 담당
 */
type MyRouterContext = {
  queryClient: QueryClient;
};

/**
 * TanStack Router 루트 라우트 정의
 *
 * createRootRouteWithContext를 사용하여 타입 안전한 컨텍스트가 있는 루트 라우트 생성
 * 애플리케이션의 최상위 라우트로서 모든 하위 라우트의 부모 역할
 *
 * - head: HTML head 영역의 메타데이터, 스타일시트, 폰트 등 설정
 * - component: 메인 레이아웃을 담당하는 RootComponent 지정
 * - shellComponent: HTML 문서 전체 구조를 담당하는 RootDocument 지정
 */
export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    // HTML 메타데이터 설정 (charset, viewport, title, description)
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "이룸 클래스",
      },
      {
        name: "description",
        content: "이룸 클래스",
      },
    ],
    // 스타일시트와 폰트 로딩을 위한 링크 설정
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap",
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
});

/**
 * 루트 컴포넌트 - 애플리케이션 메인 레이아웃
 *
 * 모든 페이지에서 공통으로 보이는 레이아웃 정의
 * 내비게이션 바와 메인 콘텐츠 영역으로 구성
 *
 * - NavigationBar: 상단 네비게이션 메뉴
 * - main: 메인 콘텐츠 영역으로 Outlet을 통해 하위 라우트 렌더링
 * - Outlet: TanStack Router의 핵심 컴포넌트로 현재 활성화된 자식 라우트 렌더링 위치
 */
function RootComponent() {
  // Jotai atom에서 추가 배경 스타일 클래스를 가져옴
  const extra = useAtomValue(mainBgExtraCombinedClassAtom);
  return (
    <>
      <NavigationBar />
      <main
        className={cn(
          "flex flex-1 bg-background-400 dark:bg-background-900",
          extra,
        )}
      >
        {/* 하위 라우트가 렌더링되는 위치 */}
        <Outlet />
      </main>
    </>
  );
}

/**
 * 루트 문서 컴포넌트 - HTML 문서 전체 구조
 *
 * TanStack Start의 shellComponent로 사용되어 HTML 문서의 전체 구조 정의
 * SSR(Server-Side Rendering) 환경에서 초기 HTML 문서 생성 시 사용
 *
 * @param children - 애플리케이션의 메인 콘텐츠 (RootComponent 전달)
 *
 * 구성 요소:
 * - html: 한국어 설정, 전체 높이 클래스, 하이드레이션 경고 억제
 * - head: HeadContent를 통해 메타데이터와 스타일시트 삽입
 * - body: 전체 높이, flex 레이아웃, Noto Sans KR 폰트 적용
 * - TanStackDevtools: 개발 환경에서 라우터와 쿼리 상태 모니터링 도구
 * - Scripts: TanStack Start에서 필요한 클라이언트 스크립트 삽입
 */
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        {/* RouteOptions.head에서 설정된 메타데이터와 링크를 렌더링 */}
        <HeadContent />
      </head>
      <body className="h-full w-full flex flex-col font-noto-sans-kr">
        {/* 메인 애플리케이션 콘텐츠 */}
        {children}

        {/* 개발 도구 - 라우터와 쿼리 상태 모니터링 */}
        <TanStackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        {/* 클라이언트 사이드 스크립트 (하이드레이션, 이벤트 핸들러 등) */}
        <Scripts />
      </body>
    </html>
  );
}
