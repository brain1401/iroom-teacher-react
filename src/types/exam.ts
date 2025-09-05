/**
 * 시험 관련 타입 정의
 * @description 시험 관리 기능에 필요한 모든 타입 정의
 */

/**
 * 시험 난이도 타입
 */
export type ExamLevel = "기초" | "보통" | "심화";

/**
 * 시험 상태 타입
 */
export type ExamStatus = "승인완료" | "승인대기" | "승인거부";

/**
 * 학생 정보 타입
 */
export type Student = {
  /** 학생 고유 ID */
  id: string;
  /** 학생명 */
  name: string;
  /** 전화번호 */
  phoneNumber: string;
  /** 학년 */
  grade: string;
  /** 반 */
  class: string;
  /** 번호 */
  number: number;
  /** 등록일 */
  registeredAt: string;
};

/**
 * 시험 제출 상태 타입
 */
export type SubmissionStatus = "미제출" | "제출완료";

/**
 * 시험 제출 현황 상세 타입
 */
export type ExamSubmitStatusDetail = {
  /** 학생 정보 */
  student: Student;
  /** 시험명 */
  examName: string;
  /** 제출일자 */
  submissionDate: string;
  /** 제출 상태 */
  submissionStatus: SubmissionStatus;
  /** 총점 */
  totalScore?: number;
  /** 획득 점수 */
  earnedScore?: number;
  /** 제출 시간 (분) */
  submissionTime?: number;
  /** 오답 개수 */
  wrongAnswerCount?: number;
};

/**
 * 시험 데이터 타입
 */
export type Exam = {
  /** 시험 고유 ID */
  id: string;
  /** 단원명 */
  unitName: string;
  /** 시험명 */
  examName: string;
  /** 문항 수 */
  questionCount: number;
  /** 시험 난이도 */
  questionLevel: ExamLevel;
  /** 시험 상태 */
  status: ExamStatus;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
  /** 총 참여 대상자 수 */
  totalParticipants: number;
  /** 실제 참여자 수 */
  actualParticipants: number;
};

/**
 * 검색 범위 타입
 */
export type SearchScope = "all" | "examName" | "unitName";

/**
 * 시험 목록 필터 타입
 */
export type ExamListFilters = {
  /** 검색 키워드 */
  searchKeyword: string;
  /** 검색 범위 */
  searchScope: SearchScope;
  /** 선택된 학년 */
  selectedGrade: string;
};
