// 통합 API 클라이언트
export { apiClient, ApiError } from "./apiClient";

// 공통 인터셉터 유틸리티
export {
  createRequestInterceptor,
  createResponseInterceptor,
  applyInterceptors,
  type InterceptorOptions,
} from "./interceptors";

// 백엔드 표준 API 응답 타입
export {
  isSuccessResponse,
  isErrorResponse,
  extractResponseData,
  safeExtractResponseData,
  hasResponseData,
  ApiResponseError,
  type ApiResponse,
  type ResultStatus,
} from "./types";

// 클라이언트 타입
export type { AxiosInstance, AxiosRequestConfig } from "axios";
