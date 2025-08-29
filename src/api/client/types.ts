/**
 * 백엔드 표준 API 응답 타입 정의
 * @description 백엔드의 ApiResponse<T> 구조와 일치하는 TypeScript 타입
 */

/**
 * API 응답 결과 상태
 * @description 백엔드 ResultStatus enum과 일치
 */
export type ResultStatus = "SUCCESS" | "ERROR";

/**
 * 백엔드 표준 API 응답 래퍼 타입
 * @description 모든 API 응답이 이 형태로 래핑됨
 * 
 * 구조:
 * - result: 응답 결과 상태 (필수)
 * - message: 응답 메시지 (필수, 빈 문자열 가능)  
 * - data: 실제 응답 데이터 (선택적, null 가능)
 *
 * @example
 * ```typescript
 * // 성공 응답 (데이터 포함)
 * const successResponse: ApiResponse<User[]> = {
 *   result: "SUCCESS",
 *   message: "사용자 목록 조회 성공",
 *   data: [{ id: 1, name: "홍길동" }]
 * };
 *
 * // 성공 응답 (데이터 없음)
 * const successNoData: ApiResponse<void> = {
 *   result: "SUCCESS", 
 *   message: "삭제 완료",
 *   data: null
 * };
 *
 * // 에러 응답
 * const errorResponse: ApiResponse<void> = {
 *   result: "ERROR",
 *   message: "권한이 없습니다", 
 *   data: null
 * };
 * ```
 *
 * @template T 응답 데이터의 타입 (기본값: unknown)
 */
export type ApiResponse<T = unknown> = {
  /** 응답 결과 상태 (SUCCESS | ERROR) */
  result: ResultStatus;
  /** 응답 메시지 (에러 메시지 또는 성공 메시지) */
  message: string;
  /** 실제 응답 데이터 (성공 시 데이터, 실패 시 null) */
  data: T;
};

/**
 * API 성공 응답 타입 가드
 * @description 응답이 성공인지 확인하는 타입 가드 함수
 * @param response API 응답 객체
 * @returns 성공 응답 여부
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { result: "SUCCESS" } {
  return response.result === "SUCCESS";
}

/**
 * API 에러 응답 타입 가드  
 * @description 응답이 에러인지 확인하는 타입 가드 함수
 * @param response API 응답 객체
 * @returns 에러 응답 여부
 */
export function isErrorResponse<T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { result: "ERROR" } {
  return response.result === "ERROR";
}

/**
 * 백엔드 표준 응답에서 데이터 추출
 * @description ApiResponse에서 안전하게 데이터를 추출하는 유틸리티 함수
 * @param response API 응답 객체
 * @returns 성공 시 데이터, 실패 시 에러 발생
 * @throws {ApiResponseError} 응답이 에러인 경우
 */
export function extractResponseData<T>(response: ApiResponse<T>): T {
  if (isSuccessResponse(response)) {
    return response.data;
  }
  
  throw new ApiResponseError(response.message, response.result);
}

/**
 * API 응답 에러 클래스
 * @description 백엔드 표준 응답의 에러를 나타내는 전용 에러 클래스
 */
export class ApiResponseError extends Error {
  constructor(
    message: string,
    public readonly result: ResultStatus,
  ) {
    super(message);
    this.name = "ApiResponseError";
  }
}

/**
 * 응답 데이터가 존재하는지 확인하는 타입 가드
 * @description data가 null이 아닌지 확인
 * @param response API 응답 객체
 * @returns 데이터 존재 여부
 */
export function hasResponseData<T>(
  response: ApiResponse<T>,
): response is ApiResponse<NonNullable<T>> {
  return response.data != null;
}

/**
 * 안전한 응답 데이터 추출 (기본값 지원)
 * @description 실패하거나 데이터가 없어도 기본값을 반환하는 안전한 추출 함수
 * @param response API 응답 객체
 * @param defaultValue 기본값
 * @returns 성공 시 데이터, 실패하거나 데이터 없으면 기본값
 */
export function safeExtractResponseData<T>(
  response: ApiResponse<T>,
  defaultValue: T,
): T {
  if (isSuccessResponse(response) && hasResponseData(response)) {
    return response.data;
  }
  
  return defaultValue;
}