import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import HealthCheckStatus from "./HealthCheckStatus";
import { TbSmartHome } from "react-icons/tb";
import { RiFilePaperLine } from "react-icons/ri";
import { HiOutlineUserGroup } from "react-icons/hi";
import { LuNotebookPen } from "react-icons/lu";
import { VscGraph } from "react-icons/vsc";

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
 * - HealthCheckStatus: 개발 환경에서 백엔드 서버 상태 모니터링
 */
export default function NavigationBar() {
  return (
    <aside className="w-full lg:w-40 shrink-0 h-auto lg:h-full border-b lg:border-b-0 lg:border-r bg-white">
      <div className="h-full flex flex-col">
        {/* 브랜드 */}
        <div className="px-4 py-4 border-b text-xl font-bold text-violet-600">
          이룸클래스
        </div>

        {/* 메뉴 */}
        <div className="flex-1 px-3 py-4 grid grid-cols-5 lg:grid-cols-1 gap-3">
          <Button
            variant="ghost"
            className="w-full h-full justify-center"
            asChild
          >
            <Link to="/home">
              <span className="flex flex-col items-center gap-1 [&>svg]:h-28 [&>svg]:w-28 md:[&>svg]:h-32 md:[&>svg]:w-32 lg:[&>svg]:h-36 lg:[&>svg]:w-36">
                <TbSmartHome />
                <span className="text-sm md:text-base">홈</span>
              </span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="w-full h-full justify-center"
            asChild
          >
            <Link to="/exam-papers">
              <span className="flex flex-col items-center gap-1 [&>svg]:h-28 [&>svg]:w-28 md:[&>svg]:h-32 md:[&>svg]:w-32 lg:[&>svg]:h-36 lg:[&>svg]:w-36">
                <RiFilePaperLine />
                <span className="text-sm md:text-base">시험지 관리</span>
              </span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full h-full justify-center"
            asChild
          >
            <Link to="/class-students">
              <span className="flex flex-col items-center gap-1 [&>svg]:h-28 [&>svg]:w-28 md:[&>svg]:h-32 md:[&>svg]:w-32 lg:[&>svg]:h-36 lg:[&>svg]:w-36">
                <HiOutlineUserGroup />
                <span className="text-sm md:text-base">반 / 학생 관리</span>
              </span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full h-full justify-center"
            asChild
          >
            <Link to="/exams">
              <span className="flex flex-col items-center gap-1 [&>svg]:h-28 [&>svg]:w-28 md:[&>svg]:h-32 md:[&>svg]:w-32 lg:[&>svg]:h-36 lg:[&>svg]:w-36">
                <LuNotebookPen />
                <span className="text-sm md:text-base">시험 관리</span>
              </span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full h-full justify-center"
            asChild
          >
            <Link to="/reports">
              <span className="flex flex-col items-center gap-1 [&>svg]:h-28 [&>svg]:w-28 md:[&>svg]:h-32 md:[&>svg]:w-32 lg:[&>svg]:h-36 lg:[&>svg]:w-36">
                <VscGraph />
                <span className="text-sm md:text-base">통계 / 리포트</span>
              </span>
            </Link>
          </Button>
        </div>

        {/* 하단 상태 */}
        <div className="px-3 py-3 border-t">
          <HealthCheckStatus />
        </div>
      </div>
    </aside>
  );
}
