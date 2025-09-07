/**
 * Auth API 모듈 통합 export
 * @description 인증 관련 API, 타입, 쿼리 옵션을 한 곳에서 관리
 */

// API 함수들
export { login, logout, getCurrentUser, updateProfile } from "./api";

// 타입 정의들
export type {
  User,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  CurrentUserResponse,
  AuthError,
} from "./types";

// React Query 옵션들
export {
  authKeys,
  currentUserQueryOptions,
  userProfileQueryOptions,
} from "./query";
