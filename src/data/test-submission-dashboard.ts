

import type { Test } from "@/types/test";
import { testSubmissionMockData } from "./student-mock-data";

/**
 * 대시보드용 시험 제출 현황 데이터 타입
 */
export type DashboardTestSubmission = {
  /** 시험 ID */
  id: string;
  /** 단원명 */
  unitName: string;
  /** 시험명 */
  testName: string;
  /** 제출 완료 인원 */
  submittedCount: number;
  /** 전체 대상 인원 */
  totalStudents: number;
  /** 제출률 (0-100) */
  submissionRate: number;
  /** 시험 상태 */
  status: Test["status"];
  /** 생성일 */
  createdAt: string;
};

/**
 * 대시보드용 시험 제출 현황 데이터
 * @description 메인 대시보드에서 표시할 시험별 제출 현황
 */
export const dashboardTestSubmissions: DashboardTestSubmission[] = [
  {
    id: "test-001",
    unitName: "1단원: 다항식의 연산",
    testName: "2025-1학기 중간고사 대비",
    submittedCount: 14,
    totalStudents: 30,
    submissionRate: 46.7,
    status: "승인완료",
    createdAt: "2025-01-15",
  },
  {
    id: "test-002",
    unitName: "2단원: 나머지정리와 인수분해",
    testName: "2025-1학기 중간고사 대비",
    submittedCount: 20,
    totalStudents: 30,
    submissionRate: 66.7,
    status: "승인완료",
    createdAt: "2025-01-15",
  },
  {
    id: "test-003",
    unitName: "3단원: 유리식과 무리식",
    testName: "2025-1학기 기말고사 대비",
    submittedCount: 10,
    totalStudents: 30,
    submissionRate: 33.3,
    status: "승인대기",
    createdAt: "2025-01-16",
  },
  {
    id: "test-004",
    unitName: "4단원: 이차방정식과 이차함수",
    testName: "단원 평가 (A)",
    submittedCount: 15,
    totalStudents: 30,
    submissionRate: 50.0,
    status: "승인완료",
    createdAt: "2025-01-17",
  },
  {
    id: "test-005",
    unitName: "5단원: 여러 가지 방정식",
    testName: "단원 평가 (B)",
    submittedCount: 8,
    totalStudents: 25,
    submissionRate: 32.0,
    status: "승인완료",
    createdAt: "2025-01-18",
  },
  {
    id: "test-006",
    unitName: "6단원: 도형의 방정식",
    testName: "기말 대비 모의고사",
    submittedCount: 42,
    totalStudents: 45,
    submissionRate: 93.3,
    status: "승인완료",
    createdAt: "2025-01-19",
  },
];

/**
 * 시험별 제출 현황 데이터 매핑
 * @description 각 시험 ID에 해당하는 실제 제출 현황 데이터
 */
export const testSubmissionDataMap: Record<string, typeof testSubmissionMockData> = {
  "test-001": testSubmissionMockData.slice(0, 30), // 30명 (14명 제출)
  "test-002": testSubmissionMockData.slice(5, 35), // 30명 (20명 제출)
  "test-003": testSubmissionMockData.slice(10, 40), // 30명 (10명 제출)
  "test-004": testSubmissionMockData.slice(15, 45), // 30명 (15명 제출)
  "test-005": testSubmissionMockData.slice(20, 45), // 25명 (8명 제출)
  "test-006": testSubmissionMockData.slice(25, 70), // 45명 (42명 제출)
};

/**
 * 특정 시험의 제출 현황 데이터 가져오기
 * @description 시험 ID에 해당하는 제출 현황 데이터 반환
 */
export function getTestSubmissionData(testId: string) {
  const data = testSubmissionDataMap[testId] || [];
  
  // 대시보드 데이터와 일치하도록 제출 상태 조정
  const dashboardTest = dashboardTestSubmissions.find(test => test.id === testId);
  if (dashboardTest) {
    const submittedCount = dashboardTest.submittedCount;
    const totalCount = dashboardTest.totalStudents;
    
    return data.slice(0, totalCount).map((submission, index) => ({
      ...submission,
      submissionStatus: index < submittedCount ? "제출완료" : "미제출" as const,
      submissionDate: index < submittedCount ? submission.submissionDate : "",
      earnedScore: index < submittedCount ? submission.earnedScore : undefined,
      submissionTime: index < submittedCount ? submission.submissionTime : undefined,
      wrongAnswerCount: index < submittedCount ? submission.wrongAnswerCount : undefined,
    }));
  }
  
  return data;
}

/**
 * 대시보드 통계 계산
 * @description 전체 시험 제출 현황 통계
 */
export function calculateDashboardStats() {
  const totalTests = dashboardTestSubmissions.length;
  const totalStudents = dashboardTestSubmissions.reduce(
    (sum, test) => sum + test.totalStudents,
    0
  );
  const totalSubmitted = dashboardTestSubmissions.reduce(
    (sum, test) => sum + test.submittedCount,
    0
  );
  const averageSubmissionRate = totalStudents > 0 
    ? (totalSubmitted / totalStudents) * 100 
    : 0;

  return {
    totalTests,
    totalStudents,
    totalSubmitted,
    averageSubmissionRate: Math.round(averageSubmissionRate * 10) / 10,
    completedTests: dashboardTestSubmissions.filter(test => test.status === "승인완료").length,
    pendingTests: dashboardTestSubmissions.filter(test => test.status === "승인대기").length,
  };
}

/**
 * 시험별 제출 현황 필터링
 * @description 상태별, 날짜별 필터링 지원
 */
export function filterDashboardTests(filters?: {
  status?: Test["status"];
  dateRange?: {
    start: string;
    end: string;
  };
  minSubmissionRate?: number;
}) {
  let filtered = [...dashboardTestSubmissions];

  // 상태별 필터링
  if (filters?.status) {
    filtered = filtered.filter(test => test.status === filters.status);
  }

  // 날짜 범위 필터링
  if (filters?.dateRange) {
    filtered = filtered.filter(test => {
      const testDate = new Date(test.createdAt);
      const startDate = new Date(filters.dateRange!.start);
      const endDate = new Date(filters.dateRange!.end);
      return testDate >= startDate && testDate <= endDate;
    });
  }

  // 최소 제출률 필터링
  if (filters?.minSubmissionRate !== undefined) {
    filtered = filtered.filter(test => test.submissionRate >= filters.minSubmissionRate!);
  }

  return filtered;
}

/**
 * 최근 시험 제출 현황 (최근 5개)
 */
export function getRecentTestSubmissions(limit: number = 5) {
  return dashboardTestSubmissions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * 제출률별 시험 분류
 */
export function getTestsBySubmissionRate() {
  const highRate = dashboardTestSubmissions.filter(test => test.submissionRate >= 80);
  const mediumRate = dashboardTestSubmissions.filter(test => 
    test.submissionRate >= 50 && test.submissionRate < 80
  );
  const lowRate = dashboardTestSubmissions.filter(test => test.submissionRate < 50);

  return {
    highRate,
    mediumRate,
    lowRate,
  };
}
