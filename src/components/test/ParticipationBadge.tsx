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
export function ParticipationBadge({
  actualParticipants,
  totalParticipants,
  className,
}: ParticipationBadgeProps) {
  const participationRate =
    totalParticipants > 0 ? actualParticipants / totalParticipants : 0;
  const isComplete = participationRate === 1;

  return (
    <div
    // variant={getParticipationBadgeVariant(
    //   actualParticipants,
    //   totalParticipants,
    // )}
    // className={cn(
    //   "text-xs font-medium",
    //   isComplete &&
    //     "bg-blue-500 hover:bg-blue-600 text-white border-blue-600",
    //   participationRate >= 0.8 &&
    //     participationRate < 1 &&
    //     "bg-green-100 text-green-800 border-green-200",
    //   participationRate >= 0.5 &&
    //     participationRate < 0.8 &&
    //     "bg-yellow-100 text-yellow-800 border-yellow-200",
    //   participationRate < 0.5 && "bg-red-100 text-red-800 border-red-200",
    //   className,
    // )}
    >
      {totalParticipants} 명 / {actualParticipants} 명
    </div>
  );
}
