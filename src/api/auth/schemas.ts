import { z } from "zod";
import {
  createApiResponseSchema,
} from "@/api/client/validation";

/**
 * 사용자 역할 스키마
 * @description 시스템에서 사용하는 사용자 역할 타입
 */
export const UserRoleSchema = z.enum(["ADMIN", "TEACHER", "STUDENT"], {
  message: "유효하지 않은 사용자 역할입니다",
});

/**
 * 사용자 정보 스키마
 * @description 로그인된 사용자의 기본 정보
 */
export const UserInfoSchema = z.object(
  {
    /** 사용자 고유 ID */
    id: z
      .number()
      .int()
      .positive({ message: "사용자 ID는 양의 정수여야 합니다" }),
    /** 사용자명 */
    username: z
      .string()
      .min(1, "사용자명은 필수입니다")
      .max(50, "사용자명은 50자를 초과할 수 없습니다")
      .regex(/^[a-zA-Z0-9_-]+$/, "사용자명은 영문, 숫자, _, -만 허용됩니다"),
    /** 이메일 주소 */
    email: z
      .string()
      .email("유효한 이메일 주소를 입력해주세요")
      .max(100, "이메일은 100자를 초과할 수 없습니다"),
    /** 사용자 역할 */
    role: UserRoleSchema,
  },
  {
    message: "사용자 정보가 누락되었거나 형식이 올바르지 않습니다",
  },
);

/**
 * 로그아웃 응답 스키마
 * @description 로그아웃 API의 응답 구조
 */
export const LogoutResponseSchema = z.object(
  {
    /** 로그아웃 성공 여부 */
    success: z.boolean({
      message: "로그아웃 성공 여부가 누락되었거나 불린 타입이 아닙니다",
    }),
    /** 로그아웃 메시지 */
    message: z
      .string()
      .min(1, "로그아웃 메시지는 필수입니다")
      .max(200, "로그아웃 메시지는 200자를 초과할 수 없습니다"),
  },
  {
    message: "로그아웃 응답이 누락되었거나 형식이 올바르지 않습니다",
  },
);

/**
 * 로그인 요청 스키마
 * @description 로그인 API의 요청 구조
 */
export const LoginRequestSchema = z.object(
  {
    /** 사용자명 */
    username: z
      .string()
      .min(1, "사용자명은 필수입니다")
      .max(50, "사용자명은 50자를 초과할 수 없습니다")
      .regex(/^[a-zA-Z0-9_-]+$/, "사용자명은 영문, 숫자, _, -만 허용됩니다"),
    /** 비밀번호 */
    password: z
      .string()
      .min(1, "비밀번호는 필수입니다")
      .max(200, "비밀번호는 200자를 초과할 수 없습니다"),
  },
  {
    message: "로그인 정보가 누락되었거나 형식이 올바르지 않습니다",
  },
);

/**
 * 인증 토큰 정보 스키마 (확장 가능)
 * @description JWT 토큰 관련 정보 (향후 토큰 기반 인증 시 사용)
 */
export const AuthTokenSchema = z.object(
  {
    /** 액세스 토큰 */
    accessToken: z.string().min(1, "액세스 토큰이 필요합니다"),
    /** 토큰 타입 (Bearer 등) */
    tokenType: z
      .string()
      .default("Bearer")
      .refine((val) => val === "Bearer", "토큰 타입은 Bearer여야 합니다"),
    /** 토큰 만료 시간 (초 단위) */
    expiresIn: z
      .number()
      .int()
      .positive({ message: "토큰 만료 시간은 양의 정수여야 합니다" }),
    /** 리프레시 토큰 (선택적) */
    refreshToken: z.string().optional(),
  },
  {
    message: "토큰 정보가 누락되었거나 형식이 올바르지 않습니다",
  },
);

// === API 응답 스키마들 ===

/**
 * 로그아웃 API 응답 스키마
 * @description ApiResponse<LogoutResponse> 구조 검증
 */
export const LogoutApiResponseSchema = createApiResponseSchema(
  LogoutResponseSchema,
);

/**
 * 사용자 정보 조회 API 응답 스키마
 * @description ApiResponse<UserInfo> 구조 검증
 */
export const UserInfoApiResponseSchema = createApiResponseSchema(UserInfoSchema);

/**
 * 로그인 API 응답 스키마
 * @description ApiResponse<UserInfo> 구조 검증 (로그인 성공 시 사용자 정보 반환)
 */
export const LoginApiResponseSchema = createApiResponseSchema(UserInfoSchema);

/**
 * 토큰 기반 로그인 API 응답 스키마 (향후 사용)
 * @description ApiResponse<AuthToken & UserInfo> 구조 검증
 */
export const TokenLoginApiResponseSchema = createApiResponseSchema(
  AuthTokenSchema.merge(UserInfoSchema),
);

// === 타입 추론 ===

/**
 * Zod 스키마에서 추론된 타입들
 * API 함수와 컴포넌트에서 사용
 */
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;

/**
 * API 응답 타입들
 */
export type LogoutApiResponse = z.infer<typeof LogoutApiResponseSchema>;
export type UserInfoApiResponse = z.infer<typeof UserInfoApiResponseSchema>;
export type LoginApiResponse = z.infer<typeof LoginApiResponseSchema>;
export type TokenLoginApiResponse = z.infer<typeof TokenLoginApiResponseSchema>;