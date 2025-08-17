import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

/**
 * 네비게이션 바 컴포넌트
 *
 * 애플리케이션의 상단에 위치하는 메인 네비게이션 메뉴
 * TanStack Router의 Link 컴포넌트와 shadcn/ui의 Button 컴포넌트 조합으로
 * 타입 안전하고 접근성이 좋은 네비게이션 제공
 *
 * 주요 특징:
 * - Link: TanStack Router의 네비게이션 컴포넌트로 타입 안전한 라우팅 제공
 * - Button: shadcn/ui의 스타일이 적용된 버튼 컴포넌트
 * - asChild: Button의 스타일을 Link에 적용하는 컴포넌트 합성 패턴
 * - to: 타입 안전한 라우트 경로 지정 (자동완성과 타입 체크 지원)
 */
export default function NavigationBar() {
  return (
    <nav className="bg-white border-b shadow-sm p-4">
      <div className="mx-auto flex items-center gap-6">
        {/* 브랜드 로고/제목 */}
        <div className="text-xl font-bold text-violet-600">이룸클래스</div>

        {/* 네비게이션 메뉴 */}
        <div className="flex gap-2">
          {/* asChild를 사용하여 Button 스타일을 Link에 적용 */}
          <Button variant="ghost" asChild>
            <Link to="/">홈</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/examples/pokemon">포켓몬</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
