/**
 * 제출 상태에 따른 배지 variant 반환
 */
/**
 * 제출 상태에 따른 Badge variant 결정 함수
 * @description 학생의 시험 제출 상태 문자열을 기반으로 적절한 shadcn/ui Badge variant를 반환
 *
 * 상태별 색상 매핑:
 * - "미제출": destructive variant (빨간색) - 긴급하고 중요한 상태 표시
 * - "제출완료": default variant (파란색) - 정상적인 완료 상태 표시
 * - 기타 상태: outline variant (회색 테두리) - 중립적인 상태 표시
 *
 * 설계 특징:
 * - 직관적 색상 시스템: 빨간색(미완료), 파란색(완료), 회색(기타)
 * - shadcn/ui Badge 컴포넌트와 완전 호환
 * - 확장 가능한 구조: 새로운 상태 추가 시 쉬운 확장
 * - 타입 안전성: string 입력에 대한 안전한 처리
 *
 * @param status 학생의 시험 제출 상태 문자열
 * @returns shadcn/ui Badge 컴포넌트에서 사용할 variant 문자열
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * const variant = GetStatusBadgeVariant("제출완료");
 * // 결과: "default"
 *
 * <Badge variant={GetStatusBadgeVariant(submission.submissionStatus)}>
 *   {submission.submissionStatus}
 * </Badge>
 *
 * // 다양한 상태들
 * GetStatusBadgeVariant("미제출")    // "destructive" (빨간색)
 * GetStatusBadgeVariant("제출완료")   // "default" (파란색)
 * GetStatusBadgeVariant("채점중")    // "outline" (회색 테두리)
 * GetStatusBadgeVariant("재시험")    // "outline" (회색 테두리)
 * ```
 *
 * 향후 확장 가능한 상태들:
 * - "채점중": secondary variant (노란색) - 진행 중 상태
 * - "재시험": outline variant - 특별 처리 필요 상태
 * - "지각제출": destructive variant - 경고 상태
 * - "부정행위": destructive variant - 문제 상태
 */
export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "미제출":
      return "destructive";
    case "제출완료":
      return "default";
    default:
      return "outline";
  }
}
