import type { Grade } from "@/types/grade";

/**
 * 학년 타입 재노출
 * @description API 레이어에서 사용되는 학년 타입
 */
export type { Grade };

/**
 * 시험 평균 응답 모델
 * @description 학년별 시험(시험지) 평균 점수 정보
 * 
 * 필드 설명:
 * - testName: 시험명 (예: "중간고사", "기말고사")
 * - average: 평균 점수 (0~100 가정)
 */
export type TestAverage = {
  /** 시험명 */
  testName: string;
  /** 평균 점수 */
  average: number;
};


