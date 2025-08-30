import { LogOut } from "lucide-react";
import { useAtomValue } from "jotai";
import { isShowHeaderAtom } from "@/atoms/ui";
import { SelectGrade } from "./SelectGrade";
import { useLogout } from "@/hooks/auth";
import { cn } from "@/lib/utils";

/**
 * 헤더 타이틀 컴포넌트
 * @description 애플리케이션 상단의 제목과 로그아웃 버튼을 포함하는 헤더 컴포넌트
 *
 * 주요 기능:
 * - 애플리케이션 제목 표시
 * - 조건부 학년 선택 컴포넌트 표시
 * - 로그아웃 기능 (LogOut 아이콘 클릭)
 * - 로그아웃 중 로딩 상태 표시
 */
export function HeaderTitle() {
  const isShowHeader = useAtomValue(isShowHeaderAtom);
  const { handleLogout, isLoggingOut } = useLogout();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-5xl font-bold">러브버그 중등수학</h1>
        <div className="ml-6 mr-2.5">{isShowHeader && <SelectGrade />}</div>
      </div>

      {/* 로그아웃 아이콘 */}
      <div
        className={cn("cursor-pointer", isLoggingOut && "cursor-not-allowed")}
        onClick={isLoggingOut ? undefined : handleLogout}
        title={isLoggingOut ? "로그아웃 중..." : "로그아웃"}
      >
        <LogOut
          className={cn(
            "w-12 h-12",
            "hover:text-red-600 transition-colors duration-200",
            isLoggingOut && "animate-spin opacity-50",
          )}
        />
      </div>
    </div>
  );
}
