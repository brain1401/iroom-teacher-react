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
export function getParticipationBadgeVariant(actual: number, total: number) {
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
export function calculateParticipationRate(
  actual: number,
  total: number,
): string {
  if (total === 0) return "0.0%";
  const rate = (actual / total) * 100;
  return `${rate.toFixed(1)}%`;
}
