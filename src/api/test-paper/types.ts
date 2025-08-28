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
 * 학년별 단원 조회 응답
 * @description 단원 배열 반환
 */
export type UnitsByGradeResponse = Unit[];
