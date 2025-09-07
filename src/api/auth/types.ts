/**
 * 사용자 정보 타입 (서버 응답 기반)
 * @description 서버에서 반환하는 사용자 정보 구조
 */
export type User = {
  /** 사용자 고유 ID */
  id: number;
  /** 사용자명 (로그인 ID) */
  username: string;
  /** 사용자 이메일 */
  email: string;
  /** 실제 이름 */
  name: string;
  /** 사용자 역할 */
  role: "teacher" | "admin";
  /** 계정 생성일 */
  createdAt: string;
  /** 마지막 로그인 시각 */
  lastLoginAt?: string;
};

/**
 * 로그인 요청 타입
 * @description 로그인 시 서버로 전송하는 인증 정보
 */
export type LoginRequest = {
  /** 사용자명 */
  username: string;
  /** 비밀번호 */
  password: string;
};

/**
 * 로그인 응답 타입
 * @description 로그인 성공 시 서버에서 반환하는 사용자 정보
 */
export type LoginResponse = {
  /** 사용자 정보 */
  user: User;
  /** 액세스 토큰 (현재는 사용하지 않음, httpOnly 쿠키 사용) */
  accessToken?: string;
  /** 토큰 만료 시간 */
  expiresAt?: string;
};

/**
 * 로그아웃 응답 타입
 * @description 로그아웃 성공 시 서버에서 반환하는 응답
 */
export type LogoutResponse = {
  /** 로그아웃 성공 여부 */
  success: boolean;
  /** 응답 메시지 */
  message: string;
};

/**
 * 현재 사용자 정보 응답 타입
 * @description /api/auth/me 엔드포인트에서 반환하는 사용자 정보
 */
export type CurrentUserResponse = User;

/**
 * 인증 에러 타입
 * @description 인증 관련 에러 정보
 */
export type AuthError = {
  /** 에러 코드 */
  code:
    | "INVALID_CREDENTIALS"
    | "ACCOUNT_LOCKED"
    | "SESSION_EXPIRED"
    | "UNAUTHORIZED";
  /** 에러 메시지 */
  message: string;
  /** 추가 정보 */
  details?: Record<string, unknown>;
};
