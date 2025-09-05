/**
 * 문제지 데이터 타입
 * @description 문제지의 기본 정보를 담는 타입
 */
/**
 * 문제지 데이터 타입 (서버 API 응답 구조와 일치)
 * @description 실제 서버에서 받아오는 문제지의 완전한 정보를 담는 타입
 */
export type ExamSheet = {
  /** 문제지 고유 ID */
  id: string;
  /** 문제지명 */
  examName: string;
  /** 학년 */
  grade: number;
  /** 총 문항 수 */
  totalQuestions: number;
  /** 객관식 문항 수 */
  multipleChoiceCount: number;
  /** 주관식 문항 수 */
  subjectiveCount: number;
  /** 총 배점 */
  totalPoints: number;
  /** 문항당 평균 배점 */
  averagePointsPerQuestion: number;
  /** 생성일시 */
  createdAt: string;
  /** 수정일시 */
  updatedAt: string;
  /** 문제 목록 (상세 조회 시에만 포함) */
  questions: Problem[] | null;
  /** 단원 요약 정보 */
  unitSummary: ExamSheetUnitSummary;
};
/**
 * 단원 요약 정보 타입
 * @description 문제지에 포함된 단원들의 종합 정보
 */
export type ExamSheetUnitSummary = {
  /** 총 단원 수 */
  totalUnits: number;
  /** 카테고리별 문항 분포 */
  categoryDistribution: CategoryDistribution[];
  /** 하위 카테고리별 문항 분포 */
  subcategoryDistribution: SubcategoryDistribution[];
  /** 단원 상세 정보 */
  unitDetails: UnitDetail[];
};

/**
 * 카테고리별 분포 타입
 */
export type CategoryDistribution = {
  /** 카테고리명 */
  categoryName: string;
  /** 문항 수 */
  questionCount: number;
};

/**
 * 하위 카테고리별 분포 타입
 */
export type SubcategoryDistribution = {
  /** 하위 카테고리명 */
  subcategoryName: string;
  /** 문항 수 */
  questionCount: number;
};

/**
 * 단원 상세 정보 타입
 * @description Badge 컴포넌트로 표시할 단원 정보
 */
export type UnitDetail = {
  /** 단원 고유 ID */
  unitId: string;
  /** 단원명 (Badge로 표시할 텍스트) */
  unitName: string;
  /** 단원 코드 */
  unitCode: string;
  /** 하위 카테고리명 */
  subcategoryName: string;
  /** 카테고리명 */
  categoryName: string;
  /** 해당 단원의 문항 수 */
  questionCount: number;
  /** 해당 단원의 총 배점 */
  totalPoints: number;
};

/**
 * 페이지네이션된 문제지 목록 응답 타입
 * @description 서버 API의 페이지네이션 응답 구조
 */
export type ExamSheetListResponse = {
  /** 문제지 목록 */
  content: ExamSheet[];
  /** 페이지네이션 정보 */
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  /** 마지막 페이지 여부 */
  last: boolean;
  /** 전체 요소 수 */
  totalElements: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 첫 페이지 여부 */
  first: boolean;
  /** 현재 페이지 크기 */
  size: number;
  /** 현재 페이지 번호 */
  number: number;
  /** 정렬 정보 */
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  /** 현재 페이지의 요소 수 */
  numberOfElements: number;
  /** 빈 페이지 여부 */
  empty: boolean;
};

/**
 * API 표준 응답 래퍼 타입
 * @description 백엔드의 모든 API 응답을 감싸는 표준 형식
 */
export type ApiResponse<T> = {
  /** 응답 결과 상태 */
  result: "SUCCESS" | "ERROR";
  /** 응답 메시지 */
  message: string;
  /** 실제 데이터 */
  data: T;
};

/**
 * 문제 데이터 타입
 * @description 문제지에 포함될 문제의 상세 정보
 */
export type Problem = {
  /** 문제 고유 ID */
  id: string;
  /** 문제 번호 */
  number: number;
  /** 문제 제목 */
  title: string;
  /** 문제 내용 */
  content: string;
  /** 문제 유형 */
  type: "objective" | "subjective";
  /** 단원명 */
  unitName: string;
  /** 난이도 */
  difficulty: "low" | "medium" | "high";
  /** 배점 */
  points: number;
  /** 객관식 보기 (객관식인 경우만) */
  options?: string[];
  /** 문제 이미지 URL */
  imageUrl?: string;
  /** 생성일시 */
  createdAt?: string;
};

/**
 * 문제지 생성 요청 타입
 * @description 문제지 생성에 필요한 정보
 */
export type ExamSheetCreateRequest = {
  /** 문제지명 */
  examName: string;
  /** 총 문항수 */
  totalQuestions: number;
  /** 객관식 문항수 */
  objectiveCount: number;
  /** 주관식 문항수 */
  subjectiveCount: number;
  /** 학년 */
  grade: string;
  /** 선택된 문제 ID 목록 */
  selectedProblemIds: string[];
};
