import { apiClient } from "@/api/client";
import type { 
  LoginRequest, 
  LoginResponse, 
  LogoutResponse, 
  CurrentUserResponse,
  User
} from "./types";

/**
 * 로그인 API 함수
 * @description 사용자 인증을 처리하고 httpOnly 쿠키 설정
 *
 * 주요 기능:
 * - 사용자명과 비밀번호로 서버 인증
 * - 성공 시 httpOnly 쿠키 자동 설정 (서버에서 처리)
 * - 사용자 정보 반환
 *
 * @param credentials 로그인 인증 정보
 * @returns 로그인된 사용자 정보
 * @throws {ApiResponseError} 잘못된 인증 정보 또는 서버 에러
 * @throws {ApiError} 네트워크 에러
 *
 * @example
 * ```typescript
 * try {
 *   const result = await login({ username: "admin", password: "1234" });
 *   console.log(`환영합니다, ${result.user.name}님!`);
 * } catch (error) {
 *   console.error("로그인 실패:", getErrorMessage(error));
 * }
 * ```
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // TODO: 실제 서버 엔드포인트로 교체 필요
  // 현재는 mock 구현으로 서버 API 패턴 준수
  
  // 임시 인증 로직 (개발용)
  if (credentials.username === "admin" && credentials.password === "1234") {
    const mockUser: User = {
      id: 1,
      username: "admin",
      email: "admin@iroom.com",
      name: "관리자",
      role: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      lastLoginAt: new Date().toISOString(),
    };

    return {
      user: mockUser,
      accessToken: "mock-token-12345",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24시간 후
    };
  } else if (credentials.username === "teacher" && credentials.password === "1234") {
    const mockUser: User = {
      id: 2,
      username: "teacher",
      email: "teacher@iroom.com", 
      name: "김교사",
      role: "teacher",
      createdAt: "2024-01-01T00:00:00Z",
      lastLoginAt: new Date().toISOString(),
    };

    return {
      user: mockUser,
      accessToken: "mock-token-67890",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } else {
    // 실제 서버 에러 형태로 에러 발생
    throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
  }
  
  // 실제 서버 연동 시 사용할 코드 (주석 처리)
  // return await apiClient.post<LoginResponse>("/api/auth/login", credentials);
}

/**
 * 로그아웃 API 함수
 * @description 사용자 세션 종료 및 httpOnly 쿠키 제거
 *
 * 주요 기능:
 * - 서버에 로그아웃 요청 전송
 * - httpOnly 쿠키 자동 삭제 (서버에서 처리)
 * - 클라이언트 상태 초기화는 별도 처리 필요
 *
 * @returns 로그아웃 성공 응답
 * @throws {ApiResponseError} 서버 에러
 * @throws {ApiError} 네트워크 에러
 *
 * @example
 * ```typescript
 * try {
 *   const result = await logout();
 *   console.log(result.message); // "로그아웃되었습니다."
 * } catch (error) {
 *   console.error("로그아웃 실패:", getErrorMessage(error));
 * }
 * ```
 */
export async function logout(): Promise<LogoutResponse> {
  // TODO: 실제 서버 엔드포인트로 교체 필요
  // 현재는 mock 구현으로 성공 응답 반환
  
  return {
    success: true,
    message: "로그아웃되었습니다.",
  };
  
  // 실제 서버 연동 시 사용할 코드 (주석 처리)
  // return await apiClient.post<LogoutResponse>("/api/auth/logout");
}

/**
 * 현재 사용자 정보 조회 API 함수
 * @description httpOnly 쿠키 기반으로 현재 로그인된 사용자 정보 조회
 *
 * 주요 기능:
 * - 쿠키 기반 인증 확인
 * - 현재 사용자 정보 반환
 * - 세션 유효성 검증
 *
 * @returns 현재 로그인된 사용자 정보
 * @throws {ApiResponseError} 인증되지 않은 사용자 또는 세션 만료
 * @throws {ApiError} 네트워크 에러
 *
 * @example
 * ```typescript
 * try {
 *   const user = await getCurrentUser();
 *   console.log(`현재 사용자: ${user.name} (${user.role})`);
 * } catch (error) {
 *   // 인증 실패 시 로그인 페이지로 리다이렉트
 *   redirectToLogin();
 * }
 * ```
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  // TODO: 실제 서버 엔드포인트로 교체 필요
  // 현재는 localStorage의 사용자 정보 반환 (임시)
  
  // SSR 호환성: 브라우저 환경에서만 localStorage 접근
  if (typeof window === "undefined") {
    throw new Error("서버 환경에서는 사용자 정보를 사용할 수 없습니다.");
  }
  
  const storedUser = localStorage.getItem("user");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (!isAuthenticated || !storedUser) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  try {
    const user = JSON.parse(storedUser);
    
    // 서버 응답 형태로 변환
    return {
      id: parseInt(user.id || "0"),
      username: user.username || "",
      email: user.email || `${user.username}@iroom.com`,
      name: user.name || "",
      role: user.role || "teacher",
      createdAt: "2024-01-01T00:00:00Z",
      lastLoginAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error("사용자 정보를 불러올 수 없습니다.");
  }
  
  // 실제 서버 연동 시 사용할 코드 (주석 처리)  
  // return await apiClient.get<CurrentUserResponse>("/api/auth/me");
}

/**
 * 사용자 정보 업데이트 API 함수
 * @description 현재 사용자의 프로필 정보 업데이트
 *
 * @param updates 업데이트할 사용자 정보
 * @returns 업데이트된 사용자 정보
 * @throws {ApiResponseError} 서버 에러 또는 권한 없음
 * @throws {ApiError} 네트워크 에러
 */
export async function updateProfile(updates: Partial<Pick<User, "name" | "email">>): Promise<User> {
  // TODO: 실제 서버 엔드포인트로 교체 필요
  throw new Error("프로필 업데이트 기능은 아직 구현되지 않았습니다.");
  
  // 실제 서버 연동 시 사용할 코드 (주석 처리)
  // return await apiClient.put<User>("/api/auth/profile", updates);
}