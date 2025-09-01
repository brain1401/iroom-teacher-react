import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * Jotai 인증 상태 관리란?
 * - 전역 상태 관리 라이브러리로 Redux, Zustand와 비슷한 역할
 * - useState와 비슷하지만 여러 컴포넌트에서 공유 가능
 * - atom이라는 작은 상태 단위로 관리
 * - localStorage와 연동하여 새로고침 후에도 상태 유지
 */

/**
 * 사용자 정보 타입
 * @description 로그인한 사용자의 기본 정보를 담는 타입
 */
type User = {
  /** 사용자 고유 ID */
  id: string;
  /** 사용자명 (로그인 ID) */
  username: string;
  /** 실제 이름 */
  name: string;
  /** 사용자 역할 */
  role: "teacher" | "admin";
};

/**
 * 로그인 자격 증명 타입
 * @description 로그인 시 필요한 인증 정보
 */
type LoginCredentials = {
  /** 사용자명 */
  username: string;
  /** 비밀번호 */
  password: string;
};

/**
 * 로그인 결과 타입
 * @description 로그인 성공/실패 결과와 사용자 정보
 */
type LoginResult = {
  /** 로그인 성공 여부 */
  success: boolean;
  /** 로그인한 사용자 정보 (성공시에만) */
  user?: User;
};

/**
 * 로그인 상태 관리 atom
 * @description 사용자의 인증 상태를 전역에서 관리하는 atom
 *
 * 주요 기능:
 * - 로그인 상태를 boolean 값으로 관리
 * - localStorage에 자동 저장 (새로고침 후에도 유지)
 * - 모든 컴포넌트에서 로그인 상태 확인 가능
 * - 자동 로그아웃 시 false로 변경
 *
 * 설계 원칙:
 * - 단순한 boolean 값으로 관리 (true: 로그인됨, false: 로그아웃됨)
 * - localStorage 키: "isAuthenticated"로 영구 저장
 * - 기본값: false (로그아웃 상태)
 * - 보안을 위해 토큰이 아닌 상태만 저장
 *
 * 사용 예시:
 * ```typescript
 * // 📌 로그인 상태 확인 - useAtomValue 사용
 * const isAuthenticated = useAtomValue(isAuthenticatedAtom);
 * if (isAuthenticated) {
 *   // 로그인된 사용자만 접근 가능한 컨텐츠 표시
 * }
 *
 * // 📌 로그인 상태 변경 - useSetAtom 사용
 * const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
 * setIsAuthenticated(true); // 로그인 처리
 * setIsAuthenticated(false); // 로그아웃 처리
 * ```
 */
export const isAuthenticatedAtom = atomWithStorage("isAuthenticated", false);

/**
 * 사용자 정보 atom
 * @description 로그인한 사용자의 정보를 localStorage에 영구 저장하여 관리
 *
 * 주요 기능:
 * - 사용자의 기본 정보 (ID, 이름, 역할 등) 저장
 * - localStorage에 자동 저장으로 새로고침 후에도 유지
 * - 로그아웃 시 초기값으로 리셋
 * - 사용자 역할에 따른 권한 관리 기반 데이터 제공
 *
 * 설계 원칙:
 * - 민감한 정보 제외 (토큰, 비밀번호 등은 저장 안함)
 * - localStorage 키: "user"로 영구 저장
 * - 기본값: 빈 사용자 객체 (로그아웃 상태)
 * - 역할 기본값: "teacher" (일반 교사 권한)
 *
 * 사용 예시:
 * ```typescript
 * // 📌 사용자 정보 조회 - useAtomValue 사용
 * const user = useAtomValue(userAtom);
 * console.log(`안녕하세요, ${user.name}님!`);
 * 
 * if (user.role === "admin") {
 *   // 관리자 전용 기능
 * }
 *
 * // 📌 사용자 정보 설정 - useSetAtom 사용
 * const setUser = useSetAtom(userAtom);
 * setUser({
 *   id: "12345",
 *   username: "teacher01",
 *   name: "김교사",
 *   role: "teacher"
 * });
 * ```
 */
export const userAtom = atomWithStorage("user", {
  id: "",
  username: "",
  name: "",
  role: "teacher" as "teacher" | "admin",
});

/**
 * 로그인 처리 atom
 * @description 로그인 로직을 처리하는 write-only atom
 *
 * 주요 기능:
 * - 사용자명과 비밀번호를 받아 인증 처리
 * - 로그인 성공 시 사용자 정보와 인증 상태 업데이트
 * - 로그인 실패 시 에러 메시지 반환
 * - 임시 하드코딩된 인증 로직 (실제 API 연동 시 교체 예정)
 *
 * 설계 원칙:
 * - write-only atom: 읽기 불가, 로그인 액션만 수행
 * - Promise 반환: 비동기 로그인 처리 지원
 * - 상태 원자성: 로그인 성공 시에만 관련 상태 모두 업데이트
 * - 에러 처리: 실패 시 명확한 에러 메시지 제공
 *
 * 사용 예시:
 * ```typescript
 * // 📌 로그인 처리 - useSetAtom 사용
 * const login = useSetAtom(loginAtom);
 * 
 * const handleLogin = async (credentials) => {
 *   try {
 *     const result = await login(credentials);
 *     if (result.success) {
 *       navigate("/dashboard");
 *     }
 *   } catch (error) {
 *     setErrorMessage(error.message);
 *   }
 * };
 * ```
 */
export const loginAtom = atom(
  null,
  (get, set, credentials: LoginCredentials): Promise<LoginResult> => {
    // TODO: 실제 API 호출로 교체 필요
    // 현재는 개발/테스트용 하드코딩된 로그인
    if (credentials.username === "admin" && credentials.password === "1234") {
      const user: User = {
        id: "1",
        username: credentials.username,
        name: "관리자",
        role: "admin",
      };
      
      // 로그인 성공 시 관련 상태 모두 업데이트
      set(userAtom, user);
      set(isAuthenticatedAtom, true);
      
      return Promise.resolve({ success: true, user });
    } else {
      return Promise.reject(new Error("아이디 또는 비밀번호가 올바르지 않습니다."));
    }
  }
);

/**
 * 로그아웃 처리 atom
 * @description 로그아웃 로직을 처리하는 write-only atom
 *
 * 주요 기능:
 * - 사용자 정보를 초기값으로 리셋
 * - 인증 상태를 false로 변경
 * - localStorage에서 사용자 데이터 제거
 * - 세션 정리 및 보안 처리
 *
 * 설계 원칙:
 * - write-only atom: 읽기 불가, 로그아웃 액션만 수행
 * - 완전한 정리: 모든 인증 관련 상태 초기화
 * - 즉시 실행: 동기적으로 상태 정리
 * - 안전성: 민감한 정보 완전 삭제
 *
 * 사용 예시:
 * ```typescript
 * // 📌 로그아웃 처리 - useSetAtom 사용
 * const logout = useSetAtom(logoutAtom);
 * 
 * const handleLogout = () => {
 *   logout();
 *   navigate("/login");
 * };
 * ```
 */
export const logoutAtom = atom(
  null,
  (get, set) => {
    // 사용자 정보 초기화
    set(userAtom, { 
      id: "", 
      username: "", 
      name: "", 
      role: "teacher" 
    });
    
    // 인증 상태 해제
    set(isAuthenticatedAtom, false);
  }
);