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
import {
  calculateParticipationRate,
  getParticipationBadgeVariant,
} from "@/utils/badge";

/**
 * 참여율 뱃지 컴포넌트 Props
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
  shouldShowPercentage?: boolean;
};

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
  shouldShowPercentage = false,
}: ParticipationBadgeProps) {
  // 입력값 검증 및 방어적 프로그래밍
  const safeActual = Math.max(0, Math.floor(actualParticipants));
  const safeTotal = Math.max(0, Math.floor(totalParticipants));
  const safeCapped = Math.min(safeActual, safeTotal); // 참여자가 총원보다 많을 수 없음

  // 참여율 계산
  const participationRate = calculateParticipationRate(safeCapped, safeTotal);
  const isFullParticipation = safeTotal > 0 && safeCapped === safeTotal;

  // 표시 텍스트 구성
  const displayText = shouldShowPercentage
    ? `${safeCapped}명 / ${safeTotal}명 (${participationRate})`
    : `${safeCapped}명 / ${safeTotal}명`;

  // 뱃지 variant 결정
  const variant = getParticipationBadgeVariant(safeCapped, safeTotal);

  // 크기에 따른 텍스트 스타일
  const sizeStyles = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
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
          "shadow-sm ring-1 ring-blue-200",
        ],
        // 참여율별 커스텀 스타일
        variant === "destructive" &&
          "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
        variant === "outline" &&
          "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        variant === "secondary" &&
          "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        className,
      )}
      title={`참여율: ${participationRate} (${safeCapped}/${safeTotal}명)`}
    >
      {displayText}
    </Badge>
  );
}
