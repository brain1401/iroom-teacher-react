import type { ApiResponse } from "@/api/client/types";
import type { Grade } from "@/types/grade";

/**
 * 단원 엔티티 타입
 * @description 학년별 단원 식별자 및 표시 이름
 */
export type Unit = {
  /** 단원 ID */
  id: string;
  /** 단원명 */
  name: string;
  /** 소속 학년 */
  grade: Grade;
};

/**
 * 학년별 단원 조회 데이터
 * @description 단원 배열 (실제 데이터 부분)
 */
export type UnitsByGradeData = Unit[];

/**
 * 학년별 단원 조회 API 응답 타입
 * @description 백엔드 표준 ApiResponse<T> 형식으로 래핑된 단원 목록 응답
 *
 * 인터셉터에 의해 자동 처리:
 * - SUCCESS인 경우: UnitsByGradeData만 추출하여 반환
 * - ERROR인 경우: ApiResponseError 발생
 *
 * @example
 * ```typescript
 * // 백엔드 원본 응답 형식
 * const backendResponse: UnitsByGradeApiResponse = {
 *   result: "SUCCESS",
 *   message: "단원 목록 조회 성공",
 *   data: [
 *     { id: "unit1", name: "수와 연산", grade: "GRADE_1" },
 *     { id: "unit2", name: "도형", grade: "GRADE_1" }
 *   ]
 * };
 *
 * // 인터셉터 처리 후 API 함수에서 받는 형태: UnitsByGradeData
 * ```
 */
export type UnitsByGradeApiResponse = ApiResponse<UnitsByGradeData>;
