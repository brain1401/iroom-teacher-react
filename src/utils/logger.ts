/**
 * tslog 기반 구조화된 로깅 시스템
 * @description 시스템 로그를 구조화하여 관리하는 통합 로깅 유틸리티
 *
 * 주요 기능:
 * - 개발/프로덕션 환경별 로그 레벨 자동 조정
 * - 도메인별 서브 로거 제공 (성능, 보안, 사용자액션)
 * - 구조화된 메타데이터로 디버깅 효율성 향상
 * - 콘솔과 파일 출력 지원
 *
 * @example
 * ```typescript
 * import { logger, performanceLogger, securityLogger } from "@/utils/logger";
 *
 * // 일반 로깅
 * logger.info("애플리케이션 시작", { version: "1.0.0" });
 * logger.error("예상치 못한 오류", { error: errorObj });
 *
 * // 성능 로깅
 * performanceLogger.info("API 응답시간", { endpoint: "/users", duration: 250 });
 *
 * // 보안 로깅
 * securityLogger.warn("인증 실패", { userId: "123", reason: "invalid_token" });
 * ```
 */

import type { ILogObj } from "tslog";
import { Logger } from "tslog";

/**
 * 기본 로거 설정
 * @description 전역 애플리케이션 로깅을 담당하는 메인 로거
 *
 * 설정:
 * - 개발 환경: DEBUG 레벨, 예쁜 출력 형식
 * - 프로덕션 환경: INFO 레벨, JSON 형식
 * - 타임스탬프와 호출 위치 정보 포함
 */
export const logger = new Logger<ILogObj>({
  name: "",
  minLevel: import.meta.env.DEV ? 0 : 3, // DEV: SILLY(0), PROD: INFO(3)
  type: import.meta.env.DEV ? "pretty" : "json",
  hideLogPositionForProduction: !import.meta.env.DEV,
  prettyLogTemplate:
    "{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}.{{ms}} {{logLevelName}} [{{name}}]",
  prettyErrorTemplate:
    "\n{{errorName}} {{errorMessage}}\nCall Stack:\n{{errorStack}}",
  prettyLogStyles: {
    logLevelName: {
      "*": ["bold", "black", "bgWhiteBright", "dim"],
      SILLY: ["bold", "white"],
      TRACE: ["bold", "whiteBright"],
      DEBUG: ["bold", "green"],
      INFO: ["bold", "blue"],
      WARN: ["bold", "yellow"],
      ERROR: ["bold", "red"],
      FATAL: ["bold", "redBright"],
    },
    dateIsoStr: "white",
    filePathWithLine: "white",
    name: ["white", "bold"],
    nameWithDelimiterPrefix: ["white", "bold"],
    nameWithDelimiterSuffix: ["white", "bold"],
  },
  stylePrettyLogs: true,
  prettyLogTimeZone: "local",
});

/**
 * 시스템 성능 모니터링 로거
 * @description API 응답 시간과 시스템 메트릭 모니터링
 */
export const performanceLogger = logger.getSubLogger({
  name: "성능",
  prefix: ["⚡"],
});

/**
 * 보안 관련 로거
 * @description 인증 실패, 권한 오류 등 보안 이벤트 로깅
 */
export const securityLogger = logger.getSubLogger({
  name: "보안",
  prefix: ["🛡️"],
});

/**
 * 사용자 액션 추적 로거
 * @description 사용자의 주요 액션과 경로 추적
 */
export const userActionLogger = logger.getSubLogger({
  name: "사용자액션",
  prefix: ["👤"],
});

/**
 * API 응답 시간 로깅
 * @description API 응답 검증 실패 시 로깅할 정보의 표준 구조
 */

/**
 * API 성능 메트릭 로깅 헬퍼 함수
 * @description 일관된 형식으로 API 검증 실패를 로깅하는 유틸리티
 *
 * @param message 에러 메시지
 * @param metadata 검증 실패 관련 메타데이터
 *
 * @example
 * ```typescript
 * logApiValidationFailure(
 *   "포켓몬 상세 정보 검증 실패",
 *   {
 *     endpoint: "/pokemon/25",
 *     method: "GET",
 *     expectedSchema: "ServerPokemonDetailResponse",
 *     validationErrors: zodError.issues,
 *     receivedData: response.data,
 *     statusCode: 200
 *   }
 * );
 * ```
 */

/**
 * REMOVE_SUCCESS_BLOCK
 * @description API 응답 검증 성공을 로깅 (개발 환경에서만)
 *
 * @param message 성공 메시지
 * @param metadata 검증 성공 관련 메타데이터
 */

/**
 * API 응답 시간 로깅 헬퍼 함수
 * @description API 호출 성능 메트릭 로깅
 *
 * @param endpoint API 엔드포인트
 * @param method HTTP 메서드
 * @param duration 응답 시간 (ms)
 * @param statusCode 응답 상태 코드
 */
export function logApiPerformance(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
): void {
  const level = duration > 1000 ? "warn" : duration > 500 ? "info" : "debug";

  performanceLogger[level](`API 응답시간: ${duration}ms`, {
    endpoint,
    method,
    duration,
    statusCode,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 개발 환경 디버깅용 로거
 * @description 개발 시에만 활성화되는 상세 디버깅 로거
 */
export const debugLogger = logger.getSubLogger({
  name: "DEBUG",
  prefix: ["🐛"],
  minLevel: import.meta.env.DEV ? 0 : 6, // DEV: SILLY, PROD: 비활성화
});

export default logger;
