import { authApiClient } from "@/api/client";

/**
 * 로그아웃 API 응답 타입
 * @description 로그아웃 성공 시 서버에서 반환하는 응답 구조
 */
type LogoutResponse = {
  /** 로그아웃 성공 여부 */
  success: boolean;
  /** 로그아웃 메시지 */
  message: string;
};

/**
 * 로그아웃 API 함수
 * @description 사용자 세션을 종료하고 인증 쿠키를 제거하는 함수
 *
 * 주요 기능:
 * - 서버에 로그아웃 요청 전송
 * - httpOnly 쿠키 자동 제거 (서버에서 처리)
 * - 클라이언트 상태 초기화 필요
 *
 * @returns 로그아웃 성공 여부와 메시지
 * @throws {ApiResponseError} 로그아웃 실패 시
 * @throws {ApiError} 네트워크 에러 시
 *
 * @example
 * ```typescript
 * try {
 *   const result = await logout();
 *   console.log(result.message); // "로그아웃되었습니다."
 *   // 로그인 페이지로 리다이렉트
 * } catch (error) {
 *   console.error("로그아웃 실패:", error);
 * }
 * ```
 */
export async function logout(): Promise<LogoutResponse> {
  const response = await authApiClient.post<LogoutResponse>("/api/auth/logout");
  return response.data;
}

/**
 * 현재 사용자 정보 조회 API 함수
 * @description 현재 로그인된 사용자의 정보를 가져오는 함수
 *
 * @returns 사용자 정보
 * @throws {ApiResponseError} 인증되지 않은 사용자 또는 서버 에러 시
 * @throws {ApiError} 네트워크 에러 시
 */
export async function getCurrentUser(): Promise<{
  id: number;
  username: string;
  email: string;
  role: string;
}> {
  const response = await authApiClient.get("/api/auth/me");
  return response.data;
}

/**
 * 로그인 API 함수
 * @description 사용자 인증을 처리하는 함수
 *
 * @param credentials 로그인 정보
 * @param credentials.username 사용자명
 * @param credentials.password 비밀번호
 * @returns 로그인 성공 시 사용자 정보
 * @throws {ApiResponseError} 잘못된 인증 정보 또는 서버 에러 시
 * @throws {ApiError} 네트워크 에러 시
 */
export async function login(credentials: {
  username: string;
  password: string;
}): Promise<{
  id: number;
  username: string;
  email: string;
  role: string;
}> {
  const response = await authApiClient.post("/api/auth/login", credentials);
  return response.data;
}
