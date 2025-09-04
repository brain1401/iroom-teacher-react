import type { AxiosInstance } from "axios";
import axios from "axios";
import { applyInterceptors } from "./interceptors";

// 공통 API 에러 클래스
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

// 기본 Axios 인스턴스 생성 (인증 불필요)
const createBaseApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3055/api",
    timeout: 10000, // 10초 타임아웃
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // 공통 인터셉터 적용 (인증 불필요 클라이언트)
  return applyInterceptors(client, {
    isAuthClient: false,
    enableLogging: true,
    logPrefix: "API Request",
  });
};

// 기본 API 클라이언트 싱글톤 (인증 불필요)
export const baseApiClient = createBaseApiClient();
