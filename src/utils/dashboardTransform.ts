/**
 * 대시보드 데이터 변환 유틸리티
 * @description 서버 응답 데이터를 UI 컴포넌트에서 사용 가능한 형태로 변환
 *
 * 주요 기능:
 * - 서버 ExamSubmissionInfo를 UI DashboardExamSubmission 형태로 변환
 * - ScoreDistribution 데이터를 차트 및 통계용 형태로 변환
 * - 데이터 안전성 검증 및 기본값 처리
 * - 타입 안전성 보장
 */

import type { ExamSubmissionInfo, ScoreDistribution } from "@/api/dashboard/types";
import type { DashboardExamSubmission } from "@/data/exam-submission-dashboard";
import type { Exam } from "@/types/exam";

/**
 * 시험 제출 정보를 대시보드 형태로 변환
 * @description 서버의 ExamSubmissionInfo를 UI용 DashboardExamSubmission으로 변환
 *
 * 변환 규칙:
 * - examId → id 매핑
 * - examTitle은 그대로 유지
 * - unitName은 "단원 {examId}" 형태로 생성
 * - dueDate는 그대로 유지
 * - submissionCount, totalStudents는 그대로 유지
 * - status는 제출률 기반으로 계산 (70% 이상: complete, 30% 이상: partial, 그 외: pending)
 *
 * @example
 * ```typescript
 * const serverData = [
 *   {
 *     examId: "exam123",
 *     examTitle: "중간고사 1차",
 *     questionCount: 20,
 *     dueDate: "2024-01-15",
 *     submissionCount: 25,
 *     totalStudents: 30
 *   }
 * ];
 *
 * const uiData = transformExamSubmissions(serverData);
 * console.log(uiData[0].status); // "complete" (83% 제출률)
 * ```
 *
 * @param examSubmissions 서버에서 받은 시험 제출 정보 배열
 * @returns UI용 대시보드 시험 제출 정보 배열
 */
export function transformExamSubmissions(
  examSubmissions: ExamSubmissionInfo[],
): DashboardExamSubmission[] {
  if (!Array.isArray(examSubmissions)) {
    console.warn("[transformExamSubmissions] 유효하지 않은 입력 데이터:", examSubmissions);
    return [];
  }

  return examSubmissions.map((exam) => {
    // 제출률 계산 (0으로 나누기 방지)
    const submissionRate = exam.totalExpected > 0 
      ? exam.actualSubmissions / exam.totalExpected 
      : 0;

    // 제출률 기반 상태 결정
    let status: "complete" | "partial" | "pending";
    if (submissionRate >= 0.7) {
      status = "complete";
    } else if (submissionRate >= 0.3) {
      status = "partial";
    } else {
      status = "pending";
    }

    return {
      id: exam.examId,
      examTitle: exam.examName || "제목 없음", // examName -> examTitle
      unitName: `단원 ${exam.examId}`,
      createdAt: exam.createdAt || "",
      submissionCount: exam.actualSubmissions || 0, // actualSubmissions -> submissionCount
      totalStudents: exam.totalExpected || 0, // totalExpected -> totalStudents
      submissionRate: Math.round(submissionRate * 100 * 10) / 10, // 소수점 첫째 자리까지
      status: "승인완료" as Exam["status"], // status 타입 맞춤
    } satisfies DashboardExamSubmission;
  });
}

/**
 * 점수 분포 데이터를 차트용 형태로 변환
 * @description 서버의 ScoreDistribution을 차트 컴포넌트에서 사용할 수 있는 형태로 변환
 *
 * 변환 특징:
 * - 점수 구간별 학생 수를 차트 데이터로 매핑
 * - 빈 데이터나 null 처리
 * - 차트 라이브러리 호환 형태로 구조화
 *
 * @example
 * ```typescript
 * const serverData = {
 *   grade1: { "90-100": 5, "80-89": 8, "70-79": 12, "60-69": 3, "0-59": 2 },
 *   grade2: { "90-100": 3, "80-89": 6, "70-79": 10, "60-69": 8, "0-59": 3 }
 * };
 *
 * const chartData = transformScoreDistributionForChart(serverData);
 * // 결과: [
 * //   { scoreRange: "90-100", grade1: 5, grade2: 3, grade3: 0 },
 * //   { scoreRange: "80-89", grade1: 8, grade2: 6, grade3: 0 },
 * //   ...
 * // ]
 * ```
 *
 * @param scoreDistribution 서버에서 받은 점수 분포 데이터
 * @returns 차트용 점수 분포 데이터 배열
 */
export function transformScoreDistributionForChart(
  distributions: ScoreDistribution[],
  selectedGrade: 1 | 2 | 3 = 1,
): Array<{
  scoreRange: string;
  grade1: number;
  grade2: number;
  grade3: number;
}> {
  console.log("[transformScoreDistributionForChart] 입력 데이터:", { distributions, selectedGrade });
  
  if (!Array.isArray(distributions)) {
    console.warn("[transformScoreDistributionForChart] 유효하지 않은 점수 분포 데이터:", distributions);
    return [];
  }

  // 서버에서 실제로 보내오는 distributions 내용 상세 확인
  console.log("[transformScoreDistributionForChart] distributions 배열 상세:", distributions.map(d => ({
    scoreRange: d.scoreRange,
    studentCount: d.studentCount,
    percentage: d.percentage
  })));

  // 점수 구간별 학생 수 계산 (서버 형식에 맞춤)
  const getStudentCountForRange = (targetRange: string): number => {
    if (targetRange === "0-59") {
      // 0-39점과 40-59점을 합침
      const range1 = distributions.find(d => d.scoreRange === "0-39점");
      const range2 = distributions.find(d => d.scoreRange === "40-59점");
      return (range1?.studentCount || 0) + (range2?.studentCount || 0);
    } else {
      // 다른 구간들은 "점" 문자를 추가해서 찾기
      const serverFormat = targetRange + "점";
      const distribution = distributions.find(d => d.scoreRange === serverFormat);
      return distribution?.studentCount || 0;
    }
  };

  // UI용 점수 구간 정의 (높은 점수부터)
  const scoreRanges = ["90-100", "80-89", "70-79", "60-69", "0-59"];

  const result = scoreRanges.map((range) => {
    const studentCount = getStudentCountForRange(range);
    
    console.log(`[transformScoreDistributionForChart] ${range} 구간:`, { 
      찾는형식: range,
      서버형식: range === "0-59" ? "0-39점 + 40-59점" : range + "점",
      학생수: studentCount
    });
    
    // 선택된 학년에 따라 올바른 속성에 데이터 할당
    const gradeData = {
      scoreRange: range,
      grade1: selectedGrade === 1 ? studentCount : 0,
      grade2: selectedGrade === 2 ? studentCount : 0,
      grade3: selectedGrade === 3 ? studentCount : 0,
    };
    
    return gradeData;
  });
  
  console.log("[transformScoreDistributionForChart] 최종 결과:", result);
  return result;
}

/**
 * 점수 분포에서 통계 정보 추출
 * @description 점수 분포 데이터에서 평균, 최고점, 최저점 등의 통계를 계산
 *
 * 계산 방식:
 * - 각 구간의 중간값을 사용하여 평균 점수 추정
 * - 구간별 학생 수를 가중치로 활용
 * - 합격률 (60점 이상) 계산
 *
 * @example
 * ```typescript
 * const scoreDistribution = {
 *   grade1: { "90-100": 5, "80-89": 8, "70-79": 12, "60-69": 3, "0-59": 2 }
 * };
 *
 * const stats = extractScoreStatistics(scoreDistribution.grade1);
 * console.log(stats); // { averageScore: 78.3, passRate: 0.93, totalStudents: 30 }
 * ```
 *
 * @param gradeDistribution 특정 학년의 점수 분포 데이터
 * @returns 추출된 통계 정보
 */
export function extractScoreStatistics(
  gradeDistribution: Record<string, number> | undefined,
): {
  averageScore: number;
  passRate: number;
  totalStudents: number;
} {
  if (!gradeDistribution || typeof gradeDistribution !== "object") {
    return {
      averageScore: 0,
      passRate: 0,
      totalStudents: 0,
    };
  }

  // 점수 구간별 중간값
  const scoreRangeMidpoints: Record<string, number> = {
    "90-100": 95,
    "80-89": 84.5,
    "70-79": 74.5,
    "60-69": 64.5,
    "0-59": 29.5, // 낮은 구간의 중간값은 보수적으로 설정
  };

  let totalScore = 0;
  let totalStudents = 0;
  let passedStudents = 0; // 60점 이상 학생 수

  Object.entries(gradeDistribution).forEach(([range, count]) => {
    const studentCount = count || 0;
    const midpoint = scoreRangeMidpoints[range] || 0;

    totalScore += midpoint * studentCount;
    totalStudents += studentCount;

    // 60점 이상인 구간들 (0-59 제외)
    if (range !== "0-59") {
      passedStudents += studentCount;
    }
  });

  return {
    averageScore: totalStudents > 0 ? Math.round((totalScore / totalStudents) * 10) / 10 : 0,
    passRate: totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) / 100 : 0,
    totalStudents,
  };
}

/**
 * 안전한 숫자 변환 유틸리티
 * @description null, undefined, NaN을 안전하게 처리하여 기본값 반환
 *
 * @param value 변환할 값
 * @param defaultValue 기본값 (기본: 0)
 * @returns 안전한 숫자값
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed : defaultValue;
  }

  return defaultValue;
}

/**
 * 안전한 문자열 변환 유틸리티
 * @description null, undefined를 안전하게 처리하여 기본값 반환
 *
 * @param value 변환할 값
 * @param defaultValue 기본값 (기본: 빈 문자열)
 * @returns 안전한 문자열값
 */
export function safeString(value: unknown, defaultValue = ""): string {
  if (typeof value === "string") {
    return value;
  }

  if (value !== null && value !== undefined) {
    return String(value);
  }

  return defaultValue;
}

/**
 * 제출률 계산 유틸리티
 * @description 제출 수와 전체 학생 수로부터 안전하게 제출률 계산
 *
 * @param submissionCount 제출한 학생 수
 * @param totalStudents 전체 학생 수
 * @returns 0-1 사이의 제출률 (소수점 둘째 자리까지)
 */
export function calculateSubmissionRate(
  submissionCount: number,
  totalStudents: number,
): number {
  if (totalStudents <= 0) {
    return 0;
  }

  const rate = submissionCount / totalStudents;
  return Math.round(rate * 100) / 100; // 소수점 둘째 자리까지
}