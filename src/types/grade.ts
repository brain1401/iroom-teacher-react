/**
 * 학년 관련 타입 정의
 * @description 교육과정에서 사용되는 학년 분류
 */

/**
 * 지원되는 학년 타입
 * @description 중학교 1-3학년을 나타내는 문자열 리터럴 유니온 타입
 */
export type Grade = "1" | "2" | "3";

/**
 * 학년 정보 타입
 * @description 학년과 관련된 메타데이터
 */
export type GradeInfo = {
  /** 학년 코드 */
  grade: Grade;
  /** 표시명 */
  displayName: string;
  /** 정렬 순서 */
  order: number;
};

/**
 * 지원되는 학년 목록
 */
export const SUPPORTED_GRADES: Grade[] = ["1", "2", "3"];

/**
 * 학년 정보 맵
 */
export const GRADE_INFO_MAP: Record<Grade, GradeInfo> = {
  "1": {
    grade: "1",
    displayName: "1학년",
    order: 1,
  },
  "2": {
    grade: "2",
    displayName: "2학년",
    order: 2,
  },
  "3": {
    grade: "3",
    displayName: "3학년",
    order: 3,
  },
};

/**
 * 학년 코드를 표시명으로 변환
 * @param grade 학년 코드
 * @returns 학년 표시명
 */
export function getGradeDisplayName(grade: Grade): string {
  return GRADE_INFO_MAP[grade].displayName;
}

/**
 * 학년 코드가 유효한지 검사
 * @param grade 검사할 학년 코드
 * @returns 유효한 학년 코드인지 여부
 */
export function isValidGrade(grade: string): grade is Grade {
  return SUPPORTED_GRADES.includes(grade as Grade);
}
