import type { AxiosInstance } from "axios";
import axios from "axios";
import { applyInterceptors } from "./interceptors";

/**
 * 공통 API 에러 클래스
 */
export class ApiError extends Error {
  /** 에러 타입 식별자 (TypeScript discriminant property) */
  readonly type = "api-error" as const;

  constructor(
    message: string,
    /** HTTP 상태 코드 (네트워크 에러 등에서는 undefined) */
    public status?: number,
    /** 서버 응답 데이터 */
    public data?: unknown,
    /** 원본 에러 객체 (디버깅용) */
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiBaseUrl = "https://iroomclass.com/api";

/**
 * 통합 API 클라이언트 생성 함수
 * @description 기존 authClient와 baseClient를 통합한 단일 클라이언트
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: apiBaseUrl,
    timeout: 10000, // 10초 타임아웃
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // 공통 인터셉터 적용
  return applyInterceptors(client, {
    enableLogging: true,
    logPrefix: "API Request",
  });
};

/**
 * 통합 API 클라이언트 싱글톤
 * @description 모든 API 호출에 사용하는 단일 클라이언트
 */
export const apiClient = createApiClient();
