import { apiClient, ApiError } from "@/api/client";
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
import logger from "@/utils/logger";

/**
 * 학년별 최근 시험 제출 현황 조회
 * @description 특정 학년의 최근 시험들의 제출 현황을 조회하는 함수
 *
 * 주요 기능:
 * - grade 파라미터로 학년 (1, 2, 3) 지정
 * - limit 파라미터로 조회할 시험 개수 제한 (기본값: 10)
 * - 시험 제출률, 문제 개수, 생성일 등 포함
 * - 생성일 기준 내림차순 정렬
 *
 * @param params 요청 파라미터
 * @param params.grade 학년 (1, 2, 3)
 * @param params.limit 조회할 최근 시험 개수 (기본값: 10)
 * @returns 학년별 최근 시험 제출 현황 데이터
 * @throws {ApiError} API 요청 실패 시
 */
export async function fetchRecentExamsStatus(
  params: RecentExamsStatusParams,
): Promise<RecentExamsStatusResponse> {
  try {
    // 요청 파라미터 검증

    const response = await apiClient.get<RecentExamsStatusResponse>(
      "/teacher/dashboard/recent-exams-status",
      {
        params: {
          grade: params.grade,
          limit: params.limit || 10,
        },
      },
    );

    logger.info(
      `[Dashboard API] 최근 시험 제출 현황 조회 성공 - Grade: ${params.grade}`,
    );

    return response.data;
  } catch (error) {
    console.error(
      `[Dashboard API] 최근 시험 제출 현황 조회 실패 - Grade: ${params.grade}`,
      error,
    );
    throw error;
  }
}

/**
 * 학년별 성적 분포도 조회
 * @description 특정 학년 전체 학생들의 평균 성적을 구간별로 나누어 분포도를 조회하는 함수
 *
 * 주요 기능:
 * - 전체 학생 수와 평균 점수 제공
 * - 중앙값과 표준편차 포함
 * - 점수 구간별 분포 (0-39, 40-59, 60-69, 70-79, 80-89, 90-100점)
 * - 각 구간별 학생 수와 비율 계산
 * - 통계 요약 (최고/최저 점수, 합격률, 우수율)
 *
 * @param params 요청 파라미터
 * @param params.grade 학년 (1, 2, 3)
 * @returns 학년별 성적 분포도 데이터
 * @throws {ApiError} API 요청 실패 시
 *
 * @example
 * ```typescript
 * const scoreData = await fetchScoreDistribution({ grade: 2 });
 * console.log(scoreData.averageScore); // 평균 점수
 * console.log(scoreData.distributions); // 구간별 분포
 * ```
 */
export async function fetchScoreDistribution(
  params: ScoreDistributionParams,
): Promise<ScoreDistributionResponse> {
  try {
    // 요청 파라미터 검증

    const response = await apiClient.get<ScoreDistributionResponse>(
      "/teacher/dashboard/score-distribution",
      {
        params: {
          grade: params.grade,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      `[Dashboard API] 성적 분포도 조회 실패 - Grade: ${params.grade}`,
      error,
    );
    throw error;
  }
}

/**
 * 학생 답안 상세 정보 조회
 * @description 특정 학생의 특정 시험에 대한 상세 답안 정보를 조회하는 함수
 *
 * 주요 기능:
 * - examId와 studentId로 특정 학생의 답안 조회
 * - 시험 정보, 학생 정보, 제출 정보 포함
 * - 문항별 상세 답안 및 채점 결과 제공
 * - 총점, 정답률, 정답/오답 개수 등 점수 통계 포함
 * - 각 문항의 배점, 획득 점수, 정답 여부 상세 정보
 *
 * @param params 요청 파라미터
 * @param params.examId 시험 고유 ID (UUID 형태)
 * @param params.studentId 학생 고유 ID (정수)
 * @returns 학생 답안 상세 정보
 * @throws {ApiError} API 요청 실패 시 (404: 데이터 없음, 403: 권한 없음 등)
 *
 * @example
 * ```typescript
 * const answerDetail = await fetchStudentAnswerDetail({
 *   examId: "550e8400-e29b-41d4-a716-446655440000",
 *   studentId: 12345
 * });
 *
 * console.log(answerDetail.studentInfo.studentName); // 학생명
 * console.log(answerDetail.scoreInfo.totalScore); // 총점
 * console.log(answerDetail.questionAnswers); // 문항별 답안 배열
 * ```
 */
export async function fetchStudentAnswerDetail(
  params: StudentAnswerDetailParams,
): Promise<ServerStudentAnswerDetail> {
  try {
    // 기본적인 파라미터 검증
    if (!params.examId || !params.studentId) {
      throw new ApiError("examId와 studentId가 모두 필요합니다", 400);
    }

    if (
      typeof params.examId !== "string" ||
      params.examId.trim().length === 0
    ) {
      throw new ApiError("examId는 비어있지 않은 문자열이어야 합니다", 400);
    }

    if (typeof params.studentId !== "number" || params.studentId <= 0) {
      throw new ApiError("studentId는 양수여야 합니다", 400);
    }

    const response = await apiClient.get<ServerStudentAnswerDetail>(
      "/teacher/dashboard/student-answer-detail",
      {
        params: {
          examId: params.examId,
          studentId: params.studentId,
        },
      },
    );

    // 응답 데이터 기본 구조 검증
    const responseData = response.data;
    if (!responseData || typeof responseData !== "object") {
      throw new ApiError("유효하지 않은 응답 데이터 형식", 500);
    }

    // 필수 필드 존재 여부 검증
    if (!responseData.studentInfo || !responseData.examInfo) {
      throw new ApiError("응답 데이터에 필수 정보가 누락되었습니다", 500);
    }

    return responseData;
  } catch (error) {
    console.error(
      `[Dashboard API] 학생 답안 상세 조회 실패 - ExamId: ${params.examId}, StudentId: ${params.studentId}`,
      error,
    );
    throw error;
  }
}
