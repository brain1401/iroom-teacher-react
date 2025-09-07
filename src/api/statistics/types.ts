/**
 * 통계 API 관련 타입 정의
 * @description 선생님 대시보드 통계 API 응답 타입들
 */

/**
 * 단원별 오답률 통계 단원 정보
 */
export type UnitWrongAnswerStatistic = {
  /** 단원 고유 ID */
  unitId: string;
  /** 단원명 */
  unitName: string;
  /** 대분류명 */
  categoryName: string;
  /** 중분류명 */
  subcategoryName: string;
  /** 해당 단원 문제 수 */
  questionCount: number;
  /** 제출 수 */
  submissionCount: number;
  /** 오답 수 */
  wrongAnswerCount: number;
  /** 오답률 (퍼센트) */
  wrongAnswerRate: number;
  /** 오답률 순위 */
  rank: number;
};

/**
 * 단원별 오답률 통계 응답
 */
export type UnitWrongAnswerRatesResponse = {
  /** 학년 */
  grade: number;
  /** 전체 문제 수 */
  totalQuestionCount: number;
  /** 전체 제출 수 */
  totalSubmissionCount: number;
  /** 전체 오답률 */
  overallWrongAnswerRate: number;
  /** 단원별 통계 목록 */
  unitStatistics: UnitWrongAnswerStatistic[];
};

/**
 * 성적 분포도 점수 범위별 통계
 */
export type ScoreDistribution = {
  /** 점수 범위 텍스트 */
  scoreRange: string;
  /** 범위 최솟값 */
  rangeMin: number;
  /** 범위 최댓값 */
  rangeMax: number;
  /** 해당 범위 학생 수 */
  studentCount: number;
  /** 해당 범위 비율 (퍼센트) */
  percentage: number;
};

/**
 * 성적 분포도 통계 정보
 */
export type ScoreStatistics = {
  /** 최고점 */
  maxScore: number;
  /** 최저점 */
  minScore: number;
  /** 합격률 */
  passingRate: number;
  /** 우수율 (90점 이상) */
  excellentRate: number;
};

/**
 * 성적 분포도 응답
 */
export type ScoreDistributionResponse = {
  /** 학년 */
  grade: number;
  /** 총 학생 수 */
  totalStudentCount: number;
  /** 평균 점수 */
  averageScore: number;
  /** 표준편차 */
  standardDeviation: number;
  /** 중간값 */
  medianScore: number;
  /** 점수 범위별 분포 */
  distributions: ScoreDistribution[];
  /** 통계 정보 */
  statistics: ScoreStatistics;
};

/**
 * 통계 API 요청 파라미터
 */
export type StatisticsParams = {
  /** 학년 (1, 2, 3) */
  grade: 1 | 2 | 3;
};
