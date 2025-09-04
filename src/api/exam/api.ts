/**
 * 시험 관리 API 함수들
 * @description 실제 백엔드 API와 통신하는 함수들
 * 
 * API 기본 URL: http://localhost:3055/api
 * 모든 응답은 ApiResponse<T> 형태로 래핑됨 (인터셉터에서 자동 처리)
 */

import { baseApiClient } from "@/api/client";
import type {
  ServerExamListResponse,
  ServerExamDetailResponse, 
  ServerSubmissionStatusResponse,
  ServerExamStatisticsResponse,
  ExamListFilters,
  ExamStatisticsParams,
  ServerExam,
  ServerSubmissionStatus,
  ServerExamStatistics,
  PageResponse,
} from "@/types/server-exam";

/**
 * 시험 목록 조회
 * @description 페이지네이션과 필터링을 지원하는 시험 목록 API
 * 
 * 지원 필터:
 * - grade: 학년별 필터 (1, 2, 3)
 * - search: 시험명 검색 (부분 일치)
 * - recent: 최근 시험만 조회
 * - page: 페이지 번호 (0부터 시작)
 * - size: 페이지 크기 (기본값: 20)
 * 
 * @param filters 필터링 및 페이지네이션 옵션
 * @returns 페이지네이션된 시험 목록 데이터 (ApiResponse는 인터셉터에서 자동 처리)
 * 
 * @example
 * ```typescript
 * // 전체 조회
 * const allExams = await fetchExamList({});
 * 
 * // 1학년 시험만 조회
 * const grade1Exams = await fetchExamList({ grade: 1 });
 * 
 * // 검색 + 페이지네이션
 * const searchResults = await fetchExamList({ 
 *   search: "중간고사", 
 *   page: 0, 
 *   size: 10 
 * });
 * ```
 */
export async function fetchExamList(
  filters: ExamListFilters = {},
): Promise<PageResponse<ServerExam>> {
  const params = new URLSearchParams();

  // 필터 파라미터 추가
  if (filters.grade !== undefined) {
    params.append("grade", filters.grade.toString());
  }
  
  if (filters.search) {
    params.append("search", filters.search);
  }
  
  if (filters.recent) {
    params.append("recent", "true");
  }
  
  if (filters.page !== undefined) {
    params.append("page", filters.page.toString());
  }
  
  if (filters.size !== undefined) {
    params.append("size", filters.size.toString());
  }
  
  if (filters.sort) {
    params.append("sort", filters.sort);
  }

  const queryString = params.toString();
  const url = `/exams${queryString ? `?${queryString}` : ""}`;

  try {
    // baseApiClient가 ApiResponse<T>를 자동으로 언래핑해서 data만 반환
    const response = await baseApiClient.get<PageResponse<ServerExam>>(url);
    return response.data;
  } catch (error) {
    console.error("시험 목록 조회 실패:", error);
    throw error;
  }
}

/**
 * 시험 상세 정보 조회
 * @description 특정 시험의 상세 정보 및 연관된 시험지 정보 조회
 * 
 * @param examId 시험 고유 ID
 * @returns 시험 상세 정보 (ApiResponse는 인터셉터에서 자동 처리)
 * 
 * @example
 * ```typescript
 * const examDetail = await fetchExamDetail("01990dea-1349-7dc7-b63e-05b8b5041785");
 * console.log(examDetail.examName); // "2학년 1학기 중간고사 - 4차"
 * console.log(examDetail.examSheetInfo?.totalQuestions); // 17
 * ```
 */
export async function fetchExamDetail(examId: string): Promise<ServerExam> {
  try {
    const response = await baseApiClient.get<ServerExam>(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error(`시험 상세 조회 실패 (ID: ${examId}):`, error);
    throw error;
  }
}

/**
 * 시험 제출 현황 상세 조회
 * @description 특정 시험의 제출 현황, 통계, 최근 제출 목록 조회
 * 
 * 포함 정보:
 * - 시험 기본 정보
 * - 제출 통계 (전체 학생 수, 제출 수, 제출률)
 * - 최근 제출 목록
 * - 시간별 제출 현황
 * 
 * @param examId 시험 고유 ID
 * @returns 제출 현황 상세 정보 (ApiResponse는 인터셉터에서 자동 처리)
 * 
 * @example
 * ```typescript
 * const submissionStatus = await fetchSubmissionStatus("01990dea-1349-7dc7-b63e-05b8b5041785");
 * console.log(submissionStatus.submissionStats.submissionRate); // 72.5
 * console.log(submissionStatus.recentSubmissions.length); // 5
 * ```
 */
export async function fetchSubmissionStatus(
  examId: string,
): Promise<ServerSubmissionStatus> {
  try {
    const response = await baseApiClient.get<ServerSubmissionStatus>(
      `/exams/${examId}/submission-status`,
    );
    return response.data;
  } catch (error) {
    console.error(`제출 현황 조회 실패 (ID: ${examId}):`, error);
    throw error;
  }
}

/**
 * 시험 통계 조회
 * @description 다양한 타입의 시험 통계 정보 조회
 * 
 * 지원 통계 타입:
 * - by-grade: 학년별 시험 개수 및 비율 통계
 * 
 * @param params 통계 조회 파라미터
 * @returns 통계 정보 (ApiResponse는 인터셉터에서 자동 처리)
 * 
 * @example
 * ```typescript
 * const statistics = await fetchExamStatistics({ type: "by-grade" });
 * console.log(statistics.total); // 31
 * console.log(statistics.grade1); // 11
 * console.log(statistics.percentages.grade1Percentage); // 35.48
 * ```
 */
export async function fetchExamStatistics(
  params: ExamStatisticsParams,
): Promise<ServerExamStatistics> {
  const queryParams = new URLSearchParams();
  queryParams.append("type", params.type);

  try {
    const response = await baseApiClient.get<ServerExamStatistics>(
      `/exams/statistics?${queryParams.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error("시험 통계 조회 실패:", error);
    throw error;
  }
}