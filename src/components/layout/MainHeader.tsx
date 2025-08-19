import { Link } from "@tanstack/react-router";
import { BiBell } from "react-icons/bi";
import { LiaUserCircle } from "react-icons/lia";
import { cn } from "@/lib/utils";

type MainHeaderProps = {
  /** 추가 CSS 클래스 */
  className?: string;
  /** 학원명 텍스트 */
  academyName?: string;
  /** 교사명 텍스트 */
  teacherName?: string;
};

/**
 * 메인 헤더 컴포넌트
 * @description 사이드바 우측 컨텐츠 상단의 브랜딩/유틸 영역 고정 출력
 *
 * 구성 요소:
 * - 좌측: 학원명, 교사명
 * - 우측: 알림 아이콘, 마이페이지 아이콘
 */
export function MainHeader({
  className,
  academyName = "모모학원",
  teacherName = "모모 선생님",
}: MainHeaderProps) {
  return (
    <div className={cn("mt-6 flex-none", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-3 md:gap-4">
          <h1 className="text-4xl md:text-5xl font-bold">{academyName}</h1>
          <p className="text-2xl md:text-3xl font-semibold text-muted-foreground">{teacherName}</p>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            aria-label="알림"
            className="text-2xl md:text-3xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <BiBell />
          </button>
          <Link
            to="/mypage"
            aria-label="마이페이지"
            className="text-3xl md:text-4xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <LiaUserCircle />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MainHeader;


