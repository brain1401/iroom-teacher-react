import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atomWithQuery } from "jotai-tanstack-query";
import { login as loginApi, logout as logoutApi, currentUserQueryOptions } from "@/api/auth";
import type { User, LoginRequest } from "@/api/auth";

/**
 * Jotai 인증 상태 관리
 * @description 서버 API와 연동된 전역 인증 상태 관리 시스템
 *
 * 주요 특징:
 * - 서버 API 함수 활용으로 실제 백엔드 연동 준비 완료
 * - localStorage 기반 상태 영속화
 * - React Query와 통합된 사용자 정보 관리
 * - 타입 안전성 보장
 */

/**
 * 로그인 상태 관리 atom
 * @description 사용자의 인증 상태를 전역에서 관리하는 atom
 *
 * 주요 기능:
 * - localStorage에 자동 저장 (새로고침 후에도 유지)
 * - 모든 컴포넌트에서 로그인 상태 확인 가능
 * - 자동 로그아웃 시 false로 변경
 *
 * @example
 * ```typescript
 * // 로그인 상태 확인
 * const isAuthenticated = useAtomValue(isAuthenticatedAtom);
 * 
 * // 로그인 상태 변경
 * const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
 * setIsAuthenticated(true); // 로그인 처리
 * ```
 */
export const isAuthenticatedAtom = atomWithStorage("isAuthenticated", false);

/**
 * 사용자 정보 atom (서버 타입 기반)
 * @description 서버에서 받은 사용자 정보를 localStorage에 영구 저장
 *
 * 주요 기능:
 * - 서버 API 응답 구조와 일치하는 타입 사용
 * - localStorage에 자동 저장으로 새로고침 후에도 유지
 * - 로그아웃 시 초기값으로 리셋
 *
 * @example
 * ```typescript
 * // 사용자 정보 조회
 * const user = useAtomValue(userAtom);
 * console.log(`안녕하세요, ${user.name}님!`);
 * 
 * // 사용자 정보 설정
 * const setUser = useSetAtom(userAtom);
 * setUser(serverUserData);
 * ```
 */
export const userAtom = atomWithStorage<Partial<User>>("user", {
  id: 0,
  username: "",
  email: "",
  name: "",
  role: "teacher",
  createdAt: "",
  lastLoginAt: "",
});

/**
 * 현재 사용자 정보 쿼리 atom
 * @description React Query와 통합된 현재 사용자 정보 조회
 *
 * 주요 기능:
 * - 서버에서 최신 사용자 정보 조회
 * - 자동 캐싱 및 백그라운드 업데이트
 * - 인증 에러 시 자동 에러 처리
 *
 * @example
 * ```typescript
 * const { data: user, isLoading, error } = useAtomValue(currentUserQueryAtom);
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <LoginRedirect />;
 * return <UserProfile user={user} />;
 * ```
 */
export const currentUserQueryAtom = atomWithQuery(() => {
  return currentUserQueryOptions();
});

/**
 * 로그인 처리 atom
 * @description 서버 API를 사용한 로그인 로직 처리
 *
 * 주요 기능:
 * - 서버 API 호출로 실제 인증 처리
 * - 성공 시 사용자 정보와 인증 상태 업데이트
 * - 에러 처리 및 사용자 친화적 메시지 제공
 *
 * @example
 * ```typescript
 * const login = useSetAtom(loginAtom);
 * 
 * const handleLogin = async (credentials) => {
 *   try {
 *     const result = await login(credentials);
 *     if (result.success) {
 *       navigate("/main");
 *     }
 *   } catch (error) {
 *     toast.error(getErrorMessage(error));
 *   }
 * };
 * ```
 */
export const loginAtom = atom(
  null,
  async (get, set, credentials: LoginRequest) => {
    try {
      // 서버 API를 통한 로그인 처리
      const response = await loginApi(credentials);
      
      // 로그인 성공 시 상태 업데이트
      set(userAtom, response.user);
      set(isAuthenticatedAtom, true);
      
      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      // 에러 발생 시 상태 초기화
      set(userAtom, {
        id: 0,
        username: "",
        email: "",
        name: "",
        role: "teacher",
        createdAt: "",
        lastLoginAt: "",
      });
      set(isAuthenticatedAtom, false);
      
      throw error; // 컴포넌트에서 에러 처리할 수 있도록 재발생
    }
  }
);

/**
 * 로그아웃 처리 atom
 * @description 서버 API를 사용한 로그아웃 로직 처리
 *
 * 주요 기능:
 * - 서버에 로그아웃 요청 전송 (쿠키 정리)
 * - 클라이언트 상태 완전 초기화
 * - localStorage 데이터 정리
 *
 * @example
 * ```typescript
 * const logout = useSetAtom(logoutAtom);
 * 
 * const handleLogout = async () => {
 *   try {
 *     await logout();
 *     navigate("/");
 *   } catch (error) {
 *     console.error("로그아웃 에러:", error);
 *     // 에러가 발생해도 클라이언트 상태는 정리됨
 *   }
 * };
 * ```
 */
export const logoutAtom = atom(
  null,
  async (get, set) => {
    try {
      // 서버 API를 통한 로그아웃 처리
      await logoutApi();
    } catch (error) {
      console.error("서버 로그아웃 에러:", error);
      // 서버 에러가 발생해도 클라이언트 상태는 정리
    } finally {
      // 클라이언트 상태 완전 초기화
      set(userAtom, {
        id: 0,
        username: "",
        email: "",
        name: "",
        role: "teacher",
        createdAt: "",
        lastLoginAt: "",
      });
      set(isAuthenticatedAtom, false);
    }
  }
);

/**
 * 인증 상태 확인 atom (derived)
 * @description 현재 인증 상태와 사용자 정보를 종합한 계산된 상태
 *
 * @example
 * ```typescript
 * const authStatus = useAtomValue(authStatusAtom);
 * 
 * if (authStatus.isLoading) return <Spinner />;
 * if (!authStatus.isAuthenticated) return <LoginForm />;
 * return <AuthenticatedApp user={authStatus.user} />;
 * ```
 */
export const authStatusAtom = atom((get) => {
  const isAuthenticated = get(isAuthenticatedAtom);
  const user = get(userAtom);
  const { data: currentUser, isLoading, error } = get(currentUserQueryAtom);

  return {
    isAuthenticated,
    user: isAuthenticated ? (currentUser || user) : null,
    isLoading: isAuthenticated ? isLoading : false,
    error: isAuthenticated ? error : null,
    hasValidSession: isAuthenticated && !error,
  };
});