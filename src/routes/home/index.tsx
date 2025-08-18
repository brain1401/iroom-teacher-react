import { createFileRoute } from "@tanstack/react-router";
import { MainHome } from "@/components/MainHome";

/**
 * 홈 라우트
 * @description 로그인 후 진입하는 대시보드 홈 페이지 라우트 정의
 */
export const Route = createFileRoute("/home/")({
  component: HomePage,
});

function HomePage() {
  return <MainHome />;
}


