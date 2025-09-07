/**
 * Dashboard API 응답 타입 정의
 * @description 서버에서 반환하는 대시보드 관련 데이터 타입들
 */

/** 시험 제출 정보 */
export type ExamSubmissionInfo = {
  /** 시험 ID */
  examId: string;
  /** 시험명 */
  examName: string;
  /** 생성일 */
  createdAt: string;
  /** 전체 예상 제출 인원 */
  totalExpected: number;
  /** 실제 제출 인원 */
  actualSubmissions: number;
  /** 제출률 (%) */
  submissionRate: number;
  /** 문제 개수 */
  questionCount: number;
};

/** 최근 시험 제출 현황 응답 */
export type RecentExamsStatusResponse = {
  /** 학년 */
  grade: number;
  /** 시험 개수 */
  examCount: number;
  /** 평균 제출률 */
  averageSubmissionRate: number;
  /** 시험 제출 정보 목록 */
  examSubmissions: ExamSubmissionInfo[];
};

/** 성적 분포 정보 */
export type ScoreDistribution = {
  /** 점수 구간 (예: "0-39점") */
  scoreRange: string;
  /** 구간 최솟값 */
  rangeMin: number;
  /** 구간 최댓값 */
  rangeMax: number;
  /** 해당 구간 학생 수 */
  studentCount: number;
  /** 해당 구간 비율 (%) */
  percentage: number;
};

/** 성적 통계 정보 */
export type ScoreStatistics = {
  /** 최고 점수 */
  maxScore: number;
  /** 최저 점수 */
  minScore: number;
  /** 합격률 (60점 이상) */
  passingRate: number;
  /** 우수율 (80점 이상) */
  excellentRate: number;
};

/** 성적 분포도 응답 */
export type ScoreDistributionResponse = {
  /** 학년 */
  grade: number;
  /** 전체 학생 수 */
  totalStudentCount: number;
  /** 평균 점수 */
  averageScore: number;
  /** 표준편차 */
  standardDeviation: number;
  /** 중앙값 */
  medianScore: number;
  /** 점수 구간별 분포 */
  distributions: ScoreDistribution[];
  /** 통계 요약 */
  statistics: ScoreStatistics;
};

/** API 요청 파라미터 타입 */
export type RecentExamsStatusParams = {
  /** 학년 (1, 2, 3) */
  grade: 1 | 2 | 3;
  /** 조회할 최근 시험 개수 (기본값: 10) */
  limit?: number;
};

export type ScoreDistributionParams = {
  /** 학년 (1, 2, 3) */
  grade: 1 | 2 | 3;
};