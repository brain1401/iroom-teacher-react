import type { Exam } from "@/types/exam";
import { examSubmissionMockData } from "./student-mock-data";

/**
 * 대시보드용 시험 제출 현황 데이터 타입
 */
export type DashboardExamSubmission = {
  /** 시험 ID */
  id: string;
  /** 단원명 */
  unitName: string;
  /** 시험명 */
  examName: string;
  /** 제출 완료 인원 */
  submittedCount: number;
  /** 전체 대상 인원 */
  totalStudents: number;
  /** 제출률 (0-100) */
  submissionRate: number;
  /** 시험 상태 */
  status: Exam["status"];
  /** 생성일 */
  createdAt: string;
};

/**
 * 대시보드용 시험 제출 현황 데이터
 * @description 메인 대시보드에서 표시할 시험별 제출 현황
 */
export const dashboardExamSubmissions: DashboardExamSubmission[] = [
  {
    id: "exam-001",
    unitName: "1단원: 다항식의 연산",
    examName: "2025-1학기 중간고사 대비",
    submittedCount: 14,
    totalStudents: 30,
    submissionRate: 46.7,
    status: "승인완료",
    createdAt: "2025-01-15",
  },
  {
    id: "exam-002",
    unitName: "2단원: 나머지정리와 인수분해",
    examName: "2025-1학기 중간고사 대비",
    submittedCount: 20,
    totalStudents: 30,
    submissionRate: 66.7,
    status: "승인완료",
    createdAt: "2025-01-15",
  },
  {
    id: "exam-003",
    unitName: "3단원: 유리식과 무리식",
    examName: "2025-1학기 기말고사 대비",
    submittedCount: 10,
    totalStudents: 30,
    submissionRate: 33.3,
    status: "승인완료",
    createdAt: "2025-01-16",
  },
  {
    id: "exam-004",
    unitName: "4단원: 이차방정식과 이차함수",
    examName: "단원 평가 (A)",
    submittedCount: 15,
    totalStudents: 30,
    submissionRate: 50.0,
    status: "승인완료",
    createdAt: "2025-01-17",
  },
  {
    id: "exam-005",
    unitName: "5단원: 여러 가지 방정식",
    examName: "단원 평가 (B)",
    submittedCount: 8,
    totalStudents: 25,
    submissionRate: 32.0,
    status: "승인완료",
    createdAt: "2025-01-18",
  },
  {
    id: "exam-006",
    unitName: "6단원: 도형의 방정식",
    examName: "기말 대비 모의고사",
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
export const examSubmissionDataMap: Record<
  string,
  typeof examSubmissionMockData
> = {
  "exam-001": examSubmissionMockData.slice(0, 30), // 30명 (14명 제출)
  "exam-002": examSubmissionMockData.slice(5, 35), // 30명 (20명 제출)
  "exam-003": examSubmissionMockData.slice(10, 40), // 30명 (10명 제출)
  "exam-004": examSubmissionMockData.slice(15, 45), // 30명 (15명 제출)
  "exam-005": examSubmissionMockData.slice(20, 45), // 25명 (8명 제출)
  "exam-006": examSubmissionMockData.slice(25, 70), // 45명 (42명 제출)
};

/**
 * 특정 시험의 제출 현황 데이터 가져오기
 * @description 시험 ID에 해당하는 제출 현황 데이터 반환
 */
export function getExamSubmissionData(examId: string) {
  const data = examSubmissionDataMap[examId] || [];

  // 대시보드 데이터와 일치하도록 제출 상태 조정
  const dashboardExam = dashboardExamSubmissions.find(
    (exam) => exam.id === examId,
  );
  if (dashboardExam) {
    const submittedCount = dashboardExam.submittedCount;
    const totalCount = dashboardExam.totalStudents;

    return data.slice(0, totalCount).map((submission, index) => ({
      ...submission,
      submissionStatus:
        index < submittedCount ? "제출완료" : ("미제출" as const),
      submissionDate: index < submittedCount ? submission.submissionDate : "",
      earnedScore: index < submittedCount ? submission.earnedScore : undefined,
      submissionTime:
        index < submittedCount ? submission.submissionTime : undefined,
      wrongAnswerCount:
        index < submittedCount ? submission.wrongAnswerCount : undefined,
    }));
  }

  return data;
}

/**
 * 대시보드 통계 계산
 * @description 전체 시험 제출 현황 통계
 */
export function calculateDashboardStats() {
  const totalExams = dashboardExamSubmissions.length;
  const totalStudents = dashboardExamSubmissions.reduce(
    (sum, exam) => sum + exam.totalStudents,
    0,
  );
  const totalSubmitted = dashboardExamSubmissions.reduce(
    (sum, exam) => sum + exam.submittedCount,
    0,
  );
  const averageSubmissionRate =
    totalStudents > 0 ? (totalSubmitted / totalStudents) * 100 : 0;

  return {
    totalExams,
    totalStudents,
    totalSubmitted,
    averageSubmissionRate: Math.round(averageSubmissionRate * 10) / 10,
    completedExams: dashboardExamSubmissions.filter(
      (exam) => exam.status === "승인완료",
    ).length,
    pendingExams: 0, // 승인대기 상태 제거로 항상 0
  };
}

/**
 * 시험별 제출 현황 필터링
 * @description 상태별, 날짜별 필터링 지원
 */
export function filterDashboardExams(filters?: {
  status?: Exam["status"];
  dateRange?: {
    start: string;
    end: string;
  };
  minSubmissionRate?: number;
}) {
  let filtered = [...dashboardExamSubmissions];

  // 상태별 필터링
  if (filters?.status) {
    filtered = filtered.filter((exam) => exam.status === filters.status);
  }

  // 날짜 범위 필터링
  if (filters?.dateRange) {
    filtered = filtered.filter((exam) => {
      const examDate = new Date(exam.createdAt);
      const startDate = new Date(filters.dateRange!.start);
      const endDate = new Date(filters.dateRange!.end);
      return examDate >= startDate && examDate <= endDate;
    });
  }

  // 최소 제출률 필터링
  if (filters?.minSubmissionRate !== undefined) {
    filtered = filtered.filter(
      (exam) => exam.submissionRate >= filters.minSubmissionRate!,
    );
  }

  return filtered;
}

/**
 * 최근 시험 제출 현황 (최근 5개)
 */
export function getRecentExamSubmissions(limit: number = 5) {
  return dashboardExamSubmissions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

/**
 * 제출률별 시험 분류
 */
export function getExamsBySubmissionRate() {
  const highRate = dashboardExamSubmissions.filter(
    (exam) => exam.submissionRate >= 80,
  );
  const mediumRate = dashboardExamSubmissions.filter(
    (exam) => exam.submissionRate >= 50 && exam.submissionRate < 80,
  );
  const lowRate = dashboardExamSubmissions.filter(
    (exam) => exam.submissionRate < 50,
  );

  return {
    highRate,
    mediumRate,
    lowRate,
  };
}
