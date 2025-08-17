import type { AxiosInstance } from "axios";
import axios from "axios";
import { applyInterceptors } from "./interceptors";

// 인증이 필요한 Axios 인스턴스 생성
const createAuthApiClient = (): AxiosInstance => {
  const client = axios.create({
    timeout: 10000, // 10초 타임아웃
    withCredentials: true, // httpOnly 쿠키 포함
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // 공통 인터셉터 적용 (인증 클라이언트)
  return applyInterceptors(client, {
    isAuthClient: true,
    enableLogging: true,
    logPrefix: "API Request",
  });
};

// 인증용 API 클라이언트 싱글톤 (httpOnly 쿠키 포함)
export const authApiClient = createAuthApiClient();
