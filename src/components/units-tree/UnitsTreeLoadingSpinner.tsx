import { Loader2, TreePine } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * 단원 트리 로딩 스피너 컴포넌트 Props
 */
type UnitsTreeLoadingSpinnerProps = {
  /** 로딩 메시지 */
  message?: string;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 컴팩트 모드 (작은 크기) */
  isCompact?: boolean;
};

/**
 * 단원 트리 로딩 스피너 컴포넌트
 * @description 문제 포함 단원 트리 데이터를 CSR 방식으로 로딩할 때 표시하는 전용 스피너
 *
 * 주요 기능:
 * - 사용자 친화적인 로딩 메시지
 * - 단원 트리 아이콘으로 맥락 제공
 * - shadcn/ui 디자인 시스템 일관성
 * - 접근성 고려 (aria-label, screen reader 지원)
 * - 컴팩트 모드 지원
 *
 * 사용 사례:
 * - ExamSheetRegistrationTab에서 단원 트리 로딩 시
 * - 대용량 문제 데이터 포함 단원 트리 조회 시
 * - 네트워크 지연 상황에서 사용자 대기 경험 개선
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * <UnitsTreeLoadingSpinner />
 *
 * // 커스텀 메시지
 * <UnitsTreeLoadingSpinner
 *   message="2 학년 문제 포함 단원 트리를 불러오는 중..."
 * />
 *
 * // 컴팩트 모드
 * <UnitsTreeLoadingSpinner isCompact />
 *
 * // 조건부 렌더링
 * {isLoading && (
 *   <UnitsTreeLoadingSpinner
 *     message="문제 데이터를 포함하여 로딩 중입니다..."
 *   />
 * )}
 * ```
 */
export function UnitsTreeLoadingSpinner({
  message = "단원 트리를 불러오는 중입니다...",
  className,
  isCompact = false,
}: UnitsTreeLoadingSpinnerProps) {
  if (isCompact) {
    return (
      <div
        className={`flex items-center justify-center gap-2 py-4 ${className || ""}`}
        aria-label="단원 트리 로딩 중"
        role="status"
      >
        <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    );
  }

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-center gap-3">
          <TreePine className="h-6 w-6 text-sky-600" />
          <h3 className="text-lg font-semibold text-sky-600">단원 구조 로딩</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 로딩 스피너 */}
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div
            className="relative"
            aria-label="단원 트리 로딩 중"
            role="status"
          >
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            {/* 추가 시각적 효과 - 동심원 */}
            <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-sky-200 animate-pulse" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-base font-medium text-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">
              문제 데이터가 포함된 대용량 정보를 처리하고 있습니다
            </p>
          </div>
        </div>

        {/* 프로그레스 바 효과 */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-sky-600 h-2 rounded-full animate-pulse origin-left transform transition-transform duration-1000"
            style={{
              width: "60%",
              animation: "loading-progress 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* 도움말 텍스트 */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• 교육과정의 계층적 단원 구조를 구성하고 있습니다</p>
          <p>• 각 단원별 문제 데이터를 포함하여 로딩합니다</p>
          <p>• 네트워크 상황에 따라 시간이 소요될 수 있습니다</p>
        </div>
      </CardContent>

      {/* Tailwind CSS를 사용한 애니메이션으로 대체 */}
    </Card>
  );
}
