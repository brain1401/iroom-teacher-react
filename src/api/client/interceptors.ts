import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { isAxiosError } from "axios";
import { ApiError } from "./apiClient";
import { isSuccessResponse, isErrorResponse, ApiResponseError } from "./types";
import type { ApiResponse } from "./types";
import logger from "@/utils/logger";

/**
 * 에러 객체를 안전하게 로깅하기 위한 정보 생성 함수
 * @description AbortSignal 등 직렬화 불가능한 객체를 안전하게 처리
 * @param error 원본 에러 객체
 * @returns 로깅 안전한 에러 정보 객체
 */
function createSafeErrorInfo(error: unknown): Record<string, unknown> {
  try {
    if (!error) {
      return { type: "null_or_undefined", value: error };
    }

    if (error instanceof Error) {
      return {
        type: "Error",
        name: error.name,
        message: error.message,
        stack: error.stack,
        // AbortController 관련 속성은 제외하고 기본 Error 속성만 포함
        ...(isAxiosError(error) && {
          isAxiosError: true,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
        }),
      };
    }

    if (typeof error === "string") {
      return { type: "string", message: error };
    }

    if (typeof error === "object") {
      // 객체인 경우 안전한 속성만 추출
      const safeObject: Record<string, unknown> = { type: "object" };
      
      for (const [key, value] of Object.entries(error)) {
        try {
          // AbortSignal이나 기타 직렬화 불가능한 객체는 건너뛰기
          if (value?.constructor?.name === "AbortSignal") {
            safeObject[key] = "[AbortSignal - 직렬화 불가]";
          } else if (typeof value === "function") {
            safeObject[key] = "[Function]";
          } else if (value && typeof value === "object" && value.constructor?.name === "AbortController") {
            safeObject[key] = "[AbortController - 직렬화 불가]";
          } else {
            // 기본 타입이거나 안전한 객체인 경우만 포함
            safeObject[key] = value;
          }
        } catch {
          safeObject[key] = "[직렬화 불가능한 값]";
        }
      }
      
      return safeObject;
    }

    return { type: typeof error, value: String(error) };
  } catch (safeError) {
    // 최종 fallback - 모든 처리가 실패하면 기본 정보만 반환
    return {
      type: "safe_error_processing_failed",
      originalType: typeof error,
      safeErrorMessage: safeError instanceof Error ? safeError.message : String(safeError),
    };
  }
}

/**
 * 백엔드 표준 ApiResponse 형식인지 확인하는 타입 가드
 * @description 응답 데이터가 { result, message, data } 구조인지 확인
 * @param data 응답 데이터
 * @returns 표준 ApiResponse 형식 여부
 */
function isStandardApiResponse(data: unknown): data is ApiResponse<unknown> {
  return (
    typeof data === "object" &&
    data !== null &&
    "result" in data &&
    "message" in data &&
    "data" in data &&
    typeof data.result === "string" &&
    typeof data.message === "string" &&
    (data.result === "SUCCESS" || data.result === "ERROR")
  );
}

/**
 * 인터셉터 설정 옵션
 */
export type InterceptorOptions = {
  /** 개발 환경에서 로깅 활성화 여부 */
  enableLogging?: boolean;
  /** 로그 메시지 접두사 */
  logPrefix?: string;
};

/**
 * 요청 인터셉터 로직 생성 함수
 * @description 공통 요청 인터셉터 로직을 생성하여 중복을 제거
 * @param options 인터셉터 설정 옵션
 * @returns 요청 인터셉터 설정 객체
 */
export function createRequestInterceptor(options: InterceptorOptions = {}) {
  const { enableLogging = true, logPrefix = "API Request" } = options;

  return {
    onFulfilled: (config: InternalAxiosRequestConfig) => {
      // 요청 로깅 (개발 환경에서만)
      if (enableLogging && import.meta.env.DEV) {
        const emoji = "🚀";
        logger.info(
          `${emoji} [${logPrefix}] ${config.method?.toUpperCase()} ${config.url}`,
        );
      }
      return config;
    },
    onRejected: (error: unknown) => {
      logger.error(`❌ [${logPrefix} Error]`, error);
      return Promise.reject(error);
    },
  };
}

/**
 * 응답 인터셉터 로직 생성 함수
 * @description 공통 응답 인터셉터 로직을 생성하여 중복을 제거
 * @param options 인터셉터 설정 옵션
 * @returns 응답 인터셉터 설정 객체
 */
export function createResponseInterceptor(options: InterceptorOptions = {}) {
  const { enableLogging = true, logPrefix = "API Response" } = options;

  return {
    onFulfilled: (response: AxiosResponse) => {
      // 응답 로깅 (개발 환경에서만)
      if (enableLogging && import.meta.env.DEV) {
        logger.info(
          `✅ [${logPrefix}] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
        );
      }

      // 백엔드 표준 ApiResponse<T> 형식인지 확인하고 처리
      const responseData = response.data;
      if (isStandardApiResponse(responseData)) {
        if (isSuccessResponse(responseData)) {
          // SUCCESS인 경우: data만 추출하여 반환 (기존 코드와 호환성 유지)
          if (enableLogging && import.meta.env.DEV) {
            logger.info(
              `📦 [${logPrefix} 데이터 추출] SUCCESS:`,
              responseData.message,
            );
          }
          response.data = responseData.data;
        } else if (isErrorResponse(responseData)) {
          // ERROR인 경우: ApiResponseError 발생
          if (enableLogging && import.meta.env.DEV) {
            logger.error(
              `🚨 [${logPrefix} API 에러] ERROR:`,
              responseData.message,
            );
          }
          throw new ApiResponseError(responseData.message, responseData.result);
        }
      }

      return response;
    },
    onRejected: (error: unknown) => {
      // 에러 로깅 - AbortSignal 안전 처리
      const safeErrorInfo = createSafeErrorInfo(error);
      logger.error(`❌ [${logPrefix} Error]`, safeErrorInfo);

      // Axios 에러인지 확인
      if (isAxiosError(error)) {
        const { response, request } = error;

        if (response) {
          // 인증 클라이언트에서 401 에러 처리
          if (response.status === 401) {
            logger.warn("🔓 인증이 필요합니다. 로그인을 확인해주세요.");
          }

          // 서버가 응답했지만 2xx 범위를 벗어난 상태 코드
          const message = `API 요청 실패: ${response.status} ${response.statusText}`;
          throw new ApiError(message, response.status, response.data, error);
        } else if (request) {
          // 요청이 전송되었지만 응답을 받지 못함
          throw new ApiError(
            "API 서버에 연결할 수 없습니다",
            undefined,
            undefined,
            error,
          );
        } else {
          // 요청 설정 중 에러 발생
          throw new ApiError(
            `API 요청 설정 에러: ${error.message}`,
            undefined,
            undefined,
            error,
          );
        }
      }

      // 기타 에러
      throw new ApiError(
        "알 수 없는 에러가 발생했습니다",
        undefined,
        undefined,
        error,
      );
    },
  };
}

/**
 * Axios 인스턴스에 공통 인터셉터를 적용하는 함수
 * @description 생성된 인터셉터를 Axios 인스턴스에 등록
 * @param client Axios 인스턴스
 * @param options 인터셉터 설정 옵션
 * @returns 인터셉터가 적용된 Axios 인스턴스
 */
export function applyInterceptors(
  client: AxiosInstance,
  options: InterceptorOptions = {},
): AxiosInstance {
  const requestInterceptor = createRequestInterceptor(options);
  const responseInterceptor = createResponseInterceptor(options);

  // 요청 인터셉터 적용
  client.interceptors.request.use(
    requestInterceptor.onFulfilled,
    requestInterceptor.onRejected,
  );

  // 응답 인터셉터 적용
  client.interceptors.response.use(
    responseInterceptor.onFulfilled,
    responseInterceptor.onRejected,
  );

  return client;
}
