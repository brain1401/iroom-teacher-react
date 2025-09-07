import { queryOptions } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  fetchRecentExamsStatus,
  fetchScoreDistribution,
  fetchStudentAnswerDetail,
} from "./api";
import type {
  RecentExamsStatusResponse,
  RecentExamsStatusParams,
  ScoreDistributionResponse,
  ScoreDistributionParams,
} from "./types";
import type {
  ServerStudentAnswerDetail,
  StudentAnswerDetailParams,
} from "@/types/server-exam";

/**
 * Dashboard 쿼리 키 관리 객체
 * @description React Query에서 사용하는 대시보드 관련 캐시 키들을 체계적으로 관리
 */
export const dashboardKeys = {
  /** 모든 대시보드 관련 쿼리의 기본 키 */
  all: ["dashboard"] as const,
  /** 시험 제출 현황 쿼리들의 기본 키 */
  recentExams: () => [...dashboardKeys.all, "recent-exams"] as const,
  /** 특정 조건의 시험 제출 현황 쿼리 키 */
  recentExamsStatus: (params: RecentExamsStatusParams) =>
    [...dashboardKeys.recentExams(), params] as const,
  /** 성적 분포도 쿼리들의 기본 키 */
  scoreDistributions: () =>
    [...dashboardKeys.all, "score-distribution"] as const,
  /** 특정 학년의 성적 분포도 쿼리 키 */
  scoreDistribution: (params: ScoreDistributionParams) =>
    [...dashboardKeys.scoreDistributions(), params] as const,
  /** 학생 답안 상세 쿼리들의 기본 키 */
  studentAnswers: () => [...dashboardKeys.all, "student-answer"] as const,
  /** 특정 학생의 시험 답안 상세 쿼리 키 */
  studentAnswerDetail: (params: StudentAnswerDetailParams) =>
    [...dashboardKeys.studentAnswers(), params] as const,
} as const;

/**
 * 최근 시험 제출 현황 조회를 위한 React Query 옵션 생성 함수
 * @description useQuery 훅에서 사용할 수 있는 쿼리 옵션을 생성
 *
 * 주요 기능:
 * - 학년별 최근 시험 제출 현황 조회
 * - 자동 캐싱 및 재시도 처리
 * - 에러 상태 관리
 * - 백그라운드 업데이트
 *
 * @param params 요청 파라미터
 * @param params.grade 학년 (1, 2, 3)
 * @param params.limit 조회할 최근 시험 개수 (기본값: 10)
 * @returns React Query에서 사용할 쿼리 옵션 객체
 *
 * @example
 * ```typescript
 * // useQuery 훅과 함께 사용
 * const { data, isLoading, error } = useQuery(
 *   recentExamsStatusQueryOptions({ grade: 2, limit: 5 })
 * );
 *
 * // Jotai atomWithQuery와 함께 사용
 * const recentExamsAtom = atomWithQuery((get) =>
 *   recentExamsStatusQueryOptions({ grade: get(gradeAtom) })
 * );
 * ```
 */
export const recentExamsStatusQueryOptions = (
  params: RecentExamsStatusParams,
) => {
  return queryOptions({
    queryKey: dashboardKeys.recentExamsStatus(params),
    queryFn: async ({ signal }): Promise<RecentExamsStatusResponse> => {
      try {
        return await fetchRecentExamsStatus(params);
      } catch (error) {
        // API 레이어에서 이미 검증되었으므로 여기서는 사용자 친화적 에러 처리
        if (error instanceof ApiError) {
          // 학년별 특화된 에러 메시지
          if (error.status === 404) {
            throw new Error(
              `${params.grade}학년의 시험 제출 현황 데이터를 찾을 수 없습니다.`,
            );
          }
          if (error.status === 401 || error.status === 403) {
            throw new Error(
              "시험 제출 현황 조회 권한이 없습니다. 로그인을 확인해주세요.",
            );
          }
          throw new Error(
            `시험 제출 현황 조회 중 오류가 발생했습니다: ${error.message}`,
          );
        }

        // 네트워크 오류 등
        throw new Error(
          `${params.grade}학년 시험 제출 현황을 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.`,
        );
      }
    },
    retry: (failureCount, error) => {
      // 권한 에러나 404는 재시도하지 않음
      if (
        error instanceof ApiError &&
        [401, 403, 404].includes(error.status || 0)
      ) {
        return false;
      }
      // 다른 에러는 최대 2번까지 재시도
      return failureCount < 2;
    },
    // 학년이 유효한 경우에만 쿼리 실행
    enabled: params.grade >= 1 && params.grade <= 3,
    // 5분마다 백그라운드에서 자동 갱신
    refetchInterval: 5 * 60 * 1000,
    // 요청 취소 처리 추가
    throwOnError: true, // jotai-tanstack-query에서 Error Boundary 활용
  });
};

/**
 * 성적 분포도 조회를 위한 React Query 옵션 생성 함수
 * @description 학년별 성적 분포도 데이터를 가져오는 쿼리 옵션을 생성
 *
 * 주요 기능:
 * - 점수 구간별 학생 분포 조회
 * - 통계 정보 (평균, 중앙값, 표준편차) 제공
 * - 합격률, 우수율 계산
 * - 캐싱을 통한 성능 최적화
 *
 * @param params 요청 파라미터
 * @param params.grade 학년 (1, 2, 3)
 * @returns React Query에서 사용할 쿼리 옵션 객체
 *
 * @example
 * ```typescript
 * // useQuery 훅과 함께 사용
 * const { data: scoreData, isLoading, error } = useQuery(
 *   scoreDistributionQueryOptions({ grade: 1 })
 * );
 *
 * // 성적 분포 차트에서 사용
 * const chartData = scoreData?.distributions.map(dist => ({
 *   range: dist.scoreRange,
 *   count: dist.studentCount,
 *   percentage: dist.percentage
 * }));
 * ```
 */
export const scoreDistributionQueryOptions = (
  params: ScoreDistributionParams,
) => {
  return queryOptions({
    queryKey: dashboardKeys.scoreDistribution(params),
    queryFn: async ({ signal }): Promise<ScoreDistributionResponse> => {
      try {
        return await fetchScoreDistribution(params);
      } catch (error) {
        // API 레이어에서 이미 검증되었으므로 여기서는 사용자 친화적 에러 처리
        if (error instanceof ApiError) {
          if (error.status === 404) {
            throw new Error(
              `${params.grade}학년의 성적 분포 데이터가 없습니다. 아직 제출된 시험이 없는 것 같습니다.`,
            );
          }
          if (error.status === 401 || error.status === 403) {
            throw new Error(
              "성적 분포 조회 권한이 없습니다. 로그인을 확인해주세요.",
            );
          }
          throw new Error(
            `성적 분포 조회 중 오류가 발생했습니다: ${error.message}`,
          );
        }

        // 네트워크 오류 등
        throw new Error(
          `${params.grade}학년 성적 분포를 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.`,
        );
      }
    },
    retry: (failureCount, error) => {
      // 권한 에러나 404는 재시도하지 않음
      if (
        error instanceof ApiError &&
        [401, 403, 404].includes(error.status || 0)
      ) {
        return false;
      }
      // 다른 에러는 최대 2번까지 재시도
      return failureCount < 2;
    },
    // 학년이 유효한 경우에만 쿼리 실행
    enabled: params.grade >= 1 && params.grade <= 3,
    // 성적 분포는 자주 변하지 않으므로 자동 갱신 비활성화
    refetchOnWindowFocus: false,
    throwOnError: true, // jotai-tanstack-query에서 Error Boundary 활용
  });
};

/**
 * 학생 답안 상세 조회를 위한 React Query 옵션 생성 함수
 * @description 특정 학생의 특정 시험에 대한 상세 답안 정보를 가져오는 쿼리 옵션을 생성
 *
 * 주요 기능:
 * - examId와 studentId로 특정 학생의 답안 조회
 * - 문항별 상세 답안 및 채점 결과 제공
 * - 점수 통계와 시험/학생 정보 포함
 * - 캐싱을 통한 성능 최적화
 * - 조건부 쿼리 실행 (examId와 studentId가 모두 있을 때만)
 *
 * @param params 요청 파라미터
 * @param params.examId 시험 고유 ID (UUID 형태)
 * @param params.studentId 학생 고유 ID (정수)
 * @returns React Query에서 사용할 쿼리 옵션 객체
 *
 * @example
 * ```typescript
 * // useQuery 훅과 함께 사용
 * const { data: answerDetail, isLoading, error } = useQuery(
 *   studentAnswerDetailQueryOptions({
 *     examId: "550e8400-e29b-41d4-a716-446655440000",
 *     studentId: 12345
 *   })
 * );
 *
 * // Jotai atomWithQuery와 함께 사용
 * const studentAnswerAtom = atomWithQuery((get) =>
 *   studentAnswerDetailQueryOptions({
 *     examId: get(selectedExamIdAtom),
 *     studentId: get(selectedStudentIdAtom)
 *   })
 * );
 *
 * // 답안 모달에서 사용
 * const modalData = {
 *   studentName: answerDetail?.studentInfo.studentName,
 *   totalScore: answerDetail?.scoreInfo.totalScore,
 *   questionAnswers: answerDetail?.questionAnswers
 * };
 * ```
 */
export const studentAnswerDetailQueryOptions = (
  params: StudentAnswerDetailParams,
) => {
  return queryOptions({
    queryKey: dashboardKeys.studentAnswerDetail(params),
    queryFn: async ({ signal }): Promise<ServerStudentAnswerDetail> => {
      try {
        return await fetchStudentAnswerDetail(params);
      } catch (error) {
        // API 레이어에서 이미 검증되었으므로 여기서는 사용자 친화적 에러 처리
        if (error instanceof ApiError) {
          if (error.status === 404) {
            throw new Error(
              `해당 학생의 시험 답안을 찾을 수 없습니다. (시험ID: ${params.examId}, 학생ID: ${params.studentId})`,
            );
          }
          if (error.status === 401 || error.status === 403) {
            throw new Error(
              "학생 답안 조회 권한이 없습니다. 로그인을 확인해주세요.",
            );
          }
          if (error.status === 400) {
            throw new Error(
              "잘못된 요청입니다. 시험ID나 학생ID를 확인해주세요.",
            );
          }
          throw new Error(
            `학생 답안 조회 중 오류가 발생했습니다: ${error.message}`,
          );
        }

        // 네트워크 오류 등
        throw new Error(
          "학생 답안을 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.",
        );
      }
    },
    retry: (failureCount, error) => {
      // 권한 에러, 404, 400은 재시도하지 않음
      if (
        error instanceof ApiError &&
        [400, 401, 403, 404].includes(error.status || 0)
      ) {
        return false;
      }
      // 다른 에러는 최대 1번까지 재시도 (상세 데이터는 즉시 실패하는 것이 좋음)
      return failureCount < 1;
    },
    // examId와 studentId가 모두 유효한 경우에만 쿼리 실행
    enabled: Boolean(
      params.examId &&
        params.studentId &&
        params.examId.trim().length > 0 &&
        params.studentId > 0,
    ),
    // 답안 상세는 정적 데이터이므로 자동 갱신 비활성화
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    throwOnError: true, // jotai-tanstack-query에서 Error Boundary 활용
  });
};
