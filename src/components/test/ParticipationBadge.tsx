import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * 참여율 뱃지 Props
 */
type ParticipationBadgeProps = {
  /** 실제 참여자 수 */
  actualParticipants: number;
  /** 총 참여 대상자 수 */
  totalParticipants: number;
  /** 추가 CSS 클래스 */
  className?: string;
};

/**
 * 참여율에 따른 뱃지 색상 반환
 */
function getParticipationBadgeVariant(actual: number, total: number) {
  if (total === 0) return "secondary";

  const participationRate = actual / total;

  if (participationRate === 1) {
    // 100% 참여 - 파란색 계열
    return "default";
  } else if (participationRate >= 0.8) {
    // 80% 이상 참여 - 초록색 계열
    return "default";
  } else if (participationRate >= 0.5) {
    // 50% 이상 참여 - 노란색 계열
    return "secondary";
  } else {
    // 50% 미만 참여 - 빨간색 계열
    return "destructive";
  }
}

/**
 * 참여율 뱃지 컴포넌트
 * @description 시험 참여율을 표시하는 뱃지
 *
 * 주요 기능:
 * - 참여자 수 / 총 대상자 수 표시
 * - 참여율에 따른 색상 변경
 * - 100% 참여 시 특별한 스타일 적용
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * 참여율 뱃지 컴포넌트 Props
 * @interface ParticipationBadgeProps
 */
type ParticipationBadgeProps = {
  /** 실제 참여한 학생 수 */
  actualParticipants: number;
  /** 총 참여 대상 학생 수 */
  totalParticipants: number;
  /** 추가 CSS 클래스명 */
  className?: string;
  /** 뱃지 크기 (기본값: default) */
  size?: "sm" | "default" | "lg";
  /** 퍼센티지 표시 여부 (기본값: false) */
  showPercentage?: boolean;
};

/**
 * 참여율에 따른 뱃지 색상 variant 반환 함수
 * @description 참여율 구간에 따라 적절한 shadcn/ui Badge variant를 결정
 *
 * 색상 구분 기준:
 * - 100%: default (파란색) - 완벽한 참여
 * - 80-99%: secondary (회색) - 높은 참여도  
 * - 50-79%: outline (테두리) - 보통 참여도
 * - 0-49%: destructive (빨간색) - 낮은 참여도
 *
 * @param actual 실제 참여자 수
 * @param total 총 대상자 수
 * @returns shadcn/ui Badge variant
 */
function getParticipationBadgeVariant(actual: number, total: number) {
  if (total === 0) return "secondary";

  const participationRate = actual / total;

  if (participationRate === 1) {
    return "default"; // 100% 참여 - 파란색
  } else if (participationRate >= 0.8) {
    return "secondary"; // 80% 이상 - 회색  
  } else if (participationRate >= 0.5) {
    return "outline"; // 50% 이상 - 테두리
  } else {
    return "destructive"; // 50% 미만 - 빨간색
  }
}

/**
 * 참여율 퍼센티지 계산 및 포맷팅 함수
 * @description 참여율을 백분율로 계산하고 소수점 첫째 자리까지 반환
 *
 * @param actual 실제 참여자 수
 * @param total 총 대상자 수
 * @returns 포맷팅된 퍼센티지 문자열 (예: "85.0%")
 */
function calculateParticipationRate(actual: number, total: number): string {
  if (total === 0) return "0.0%";
  const rate = (actual / total) * 100;
  return `${rate.toFixed(1)}%`;
}

/**
 * 시험 참여율 표시 뱃지 컴포넌트
 * @description 시험이나 활동의 학생 참여율을 시각적으로 표시하는 뱃지 컴포넌트
 *
 * 설계 원칙:
 * - 직관적 색상 시스템: 참여율에 따른 자동 색상 변경
 * - 유연한 표시 옵션: 숫자만 또는 퍼센티지 포함 표시 선택
 * - shadcn/ui 통합: Badge 컴포넌트 기반으로 일관된 스타일
 * - 접근성 고려: 색상뿐만 아니라 숫자로도 정보 전달
 *
 * 주요 기능:
 * - 참여자 수와 총 대상자 수 표시 ("5명 / 20명" 형식)
 * - 참여율에 따른 자동 색상 변경 (빨강-회색-파랑 그라데이션)
 * - 선택적 퍼센티지 표시 기능
 * - 다양한 크기 지원 (sm, default, lg)
 * - 100% 참여 시 특별 강조 표시
 *
 * 사용 사례:
 * - 시험 제출 현황 테이블
 * - 과제 참여율 대시보드  
 * - 수업 출석률 표시
 * - 설문조사 응답률 표시
 *
 * @example
 * ```tsx
 * // 기본 사용 (숫자만 표시)
 * <ParticipationBadge 
 *   actualParticipants={18} 
 *   totalParticipants={20} 
 * />
 * // 출력: "18명 / 20명" (초록색 뱃지)
 *
 * // 퍼센티지 포함 표시
 * <ParticipationBadge 
 *   actualParticipants={15}
 *   totalParticipants={20}
 *   showPercentage={true}
 * />
 * // 출력: "15명 / 20명 (75.0%)" (노란색 뱃지)
 *
 * // 작은 크기로 표시
 * <ParticipationBadge 
 *   actualParticipants={20}
 *   totalParticipants={20}
 *   size="sm"
 * />
 * // 출력: "20명 / 20명" (파란색 뱃지, 작은 크기)
 *
 * // 테이블 셀에서 사용
 * <TableCell className="text-center">
 *   <ParticipationBadge 
 *     actualParticipants={exam.submittedCount}
 *     totalParticipants={exam.totalStudents}
 *     showPercentage={true}
 *     className="mx-auto"
 *   />
 * </TableCell>
 * ```
 */
export function ParticipationBadge({
  actualParticipants,
  totalParticipants,
  className,
  size = "default",
  showPercentage = false,
}: ParticipationBadgeProps) {
  // 입력값 검증 및 방어적 프로그래밍
  const safeActual = Math.max(0, Math.floor(actualParticipants));
  const safeTotal = Math.max(0, Math.floor(totalParticipants));
  const safeCapped = Math.min(safeActual, safeTotal); // 참여자가 총원보다 많을 수 없음

  // 참여율 계산
  const participationRate = calculateParticipationRate(safeCapped, safeTotal);
  const isFullParticipation = safeTotal > 0 && safeCapped === safeTotal;

  // 표시 텍스트 구성
  const displayText = showPercentage 
    ? `${safeCapped}명 / ${safeTotal}명 (${participationRate})`
    : `${safeCapped}명 / ${safeTotal}명`;

  // 뱃지 variant 결정
  const variant = getParticipationBadgeVariant(safeCapped, safeTotal);

  // 크기에 따른 텍스트 스타일
  const sizeStyles = {
    sm: "text-xs",
    default: "text-sm", 
    lg: "text-base"
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "font-medium transition-all duration-200",
        sizeStyles[size],
        // 100% 참여 시 특별 강조
        isFullParticipation && [
          "bg-blue-500 hover:bg-blue-600 text-white border-blue-600",
          "shadow-sm ring-1 ring-blue-200"
        ],
        // 참여율별 커스텀 스타일
        variant === "destructive" && "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
        variant === "outline" && "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        variant === "secondary" && "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        className
      )}
      title={`참여율: ${participationRate} (${safeCapped}/${safeTotal}명)`}
    >
      {displayText}
    </Badge>
  );
}
