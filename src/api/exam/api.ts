/**
 * 시험 관리 API 함수들
 * @description 실제 백엔드 API와 통신하는 함수들
 *
 * API 기본 URL: http://localhost:3055/api
 * 모든 응답은 ApiResponse<T> 형태로 래핑됨 (인터셉터에서 자동 처리)
 */

import { apiClient } from "@/api/client";
import type {
  CreateExamRequest,
  CreateExamResponse,
  ExamAttendeesParams,
  ExamAttendeesResponse,
} from "./types";
import type { ExamQuestionsData } from "./exam-questions-types";
import type {
  ServerExam,
  ServerExamSheetInfo,
  ServerSubmissionStatus,
  ServerExamStatistics,
  PageResponse,
  ExamListFilters,
  ExamStatisticsParams,
  ServerStudentAnswerDetail,
} from "@/types/server-exam";
import logger from "@/utils/logger";

/**
 * 시험 생성 API
 * @description 새로운 시험을 생성하는 API
 *
 * @param data 시험 생성 요청 데이터
 * @returns 생성된 시험 정보
 *
 * @example
 * ```typescript
 * const newExam = await createExam({
 *   examName: "2025년 1학기 중간고사",
 *   examSheetId: "01990de9-efc4-75a4-8077-45bb51771722",
 *   description: "1학년 수학 중간고사입니다",
 *   startDate: "2025-10-15T09:00:00",
 *   endDate: "2025-10-15T11:00:00",
 *   duration: 120
 * });
 * ```
 */
export async function createExam(
  data: CreateExamRequest,
): Promise<CreateExamResponse> {
  try {
    const response = await apiClient.post<CreateExamResponse>("/exams", data);
    return response.data;
  } catch (error) {
    console.error("시험 생성 실패:", error);
    throw error;
  }
}

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

  if (filters.includeUnits) {
    params.append("includeUnits", "true");
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
    // apiClient가 ApiResponse<T>를 자동으로 언래핑해서 data만 반환
    const response = await apiClient.get<PageResponse<ServerExam>>(url);
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
    const response = await apiClient.get<ServerExam>(`/exams/${examId}`);
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
    const response = await apiClient.get<ServerSubmissionStatus>(
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
    const response = await apiClient.get<ServerExamStatistics>(
      `/exams/statistics?${queryParams.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error("시험 통계 조회 실패:", error);
    throw error;
  }
}

/**
 * 시험 응시자 목록 조회
 * @description 특정 시험의 응시자 목록을 페이지네이션하여 조회
 *
 * 지원 정렬:
 * - submittedAt,desc: 제출 시간 최신순 (기본값)
 * - submittedAt,asc: 제출 시간 오래된순
 * - studentName,asc: 학생 이름 가나다순
 * - studentName,desc: 학생 이름 가나다 역순
 *
 * @param examId 시험 고유 ID
 * @param params 페이지네이션 및 정렬 파라미터
 * @returns 페이지네이션된 응시자 목록
 *
 * @example
 * ```typescript
 * // 기본 조회 (최신순, 20개)
 * const attendees = await fetchExamAttendees("01990dea-1349-7dc7");
 *
 * // 이름순 정렬, 50개씩 조회
 * const attendees = await fetchExamAttendees("01990dea-1349-7dc7", {
 *   page: 0,
 *   size: 50,
 *   sort: "studentName,asc"
 * });
 * ```
 */
/**
 * 학생 답안지 및 채점 결과 조회
 * @description 특정 제출 ID의 학생 답안지와 채점 결과를 상세히 조회
 *
 * 포함 정보:
 * - 학생 정보 (이름, 전화번호, 학번 등)
 * - 시험 정보 (시험명, 학년, 생성일 등)
 * - 제출 정보 (제출 시간, 답변 수 등)
 * - 채점 결과 (총점, 정답수, 오답수 등) - 채점 완료 시에만
 * - 문항별 답안 상세 (학생 답안, 정답, 점수, 피드백 등)
 *
 * @param submissionId 제출 ID (UUID)
 * @returns 학생 답안지 상세 정보
 *
 * @example
 * ```typescript
 * const answerSheet = await fetchStudentAnswerSheet("01990dea-1349-7dc7-b63e-05b8b5041785");
 * console.log(answerSheet.studentInfo.studentName); // "홍길동"
 * console.log(answerSheet.gradingResult?.totalScore); // 85
 * console.log(answerSheet.questionAnswers[0].studentAnswer); // "4"
 * ```
 */
export async function fetchStudentAnswerSheet(
  submissionId: string,
): Promise<ServerStudentAnswerDetail> {
  try {
    const response = await apiClient.get<ServerStudentAnswerDetail>(
      `/exams/submissions/${submissionId}/answer-sheet`,
    );
    return response.data;
  } catch (error) {
    console.error(
      `학생 답안지 조회 실패 (submissionId: ${submissionId}):`,
      error,
    );
    throw error;
  }
}

export async function fetchExamAttendees(
  examId: string,
  params: ExamAttendeesParams = {},
): Promise<ExamAttendeesResponse> {
  const queryParams = new URLSearchParams();

  // 기본값 설정
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const sort = params.sort ?? "submittedAt,desc";

  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  try {
    const response = await apiClient.get<ExamAttendeesResponse>(
      `/exams/${examId}/attendees?${queryParams.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error(`응시자 목록 조회 실패 (Exam ID: ${examId}):`, error);
    throw error;
  }
}

/**
 * 시험 문제 목록 조회
 * @description 특정 시험에 포함된 모든 문제 정보를 조회
 *
 * 제공 정보:
 * - 시험 기본 정보 (시험명, 학년)
 * - 문제 통계 (총 문제 수, 객관식/주관식 개수, 총 배점)
 * - 문제별 상세 정보 (순서, 유형, 내용, 배점, 선택지, 이미지)
 * - 문제 유형별 비율 정보
 *
 * @param examId 시험 고유 ID
 * @returns 시험 문제 목록 데이터
 *
 * @example
 * ```typescript
 * const examQuestions = await fetchExamQuestions("01990dea-12fe-75c5-9edd-e4ed42386748");
 * console.log(examQuestions.examName); // "1학년 1학기 중간고사 - 1차"
 * console.log(examQuestions.totalQuestions); // 18
 * console.log(examQuestions.questions[0].questionText); // 문제 내용
 * ```
 */
export async function fetchExamQuestions(
  examId: string,
): Promise<ExamQuestionsData> {
  logger.debug("fetchExamQuestions", examId);
  try {
    const response = await apiClient.get<ExamQuestionsData>(
      `/exams/${examId}/questions`,
    );
    return response.data;
  } catch (error) {
    console.error(`시험 문제 조회 실패 (ID: ${examId}):`, error);
    throw error;
  }
}
