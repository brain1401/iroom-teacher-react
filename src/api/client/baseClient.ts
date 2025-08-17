import type { AxiosInstance } from "axios";
import axios from "axios";
import { applyInterceptors } from "./interceptors";

// 공통 API 에러 클래스
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// 기본 Axios 인스턴스 생성 (인증 불필요)
const createBaseApiClient = (): AxiosInstance => {
  const client = axios.create({
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
