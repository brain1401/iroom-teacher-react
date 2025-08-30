import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * 로그인 상태 관리 atom
 * @description 사용자 인증 상태를 관리
 */
export const isAuthenticatedAtom = atomWithStorage("isAuthenticated", false);

/**
 * 사용자 정보 atom
 * @description 로그인한 사용자의 정보를 저장
 */
export const userAtom = atomWithStorage("user", {
  id: "",
  username: "",
  name: "",
  role: "teacher" as "teacher" | "admin",
});

/**
 * 로그인 함수 atom
 * @description 로그인 처리를 위한 함수
 */
export const loginAtom = atom(
  null,
  (get, set, credentials: { username: string; password: string }) => {
    // 임시 로그인 로직 (실제로는 API 응답 사용)
    if (credentials.username === "admin" && credentials.password === "1234") {
      const user = {
        id: "1",
        username: credentials.username,
        name: "관리자",
        role: "admin" as const,
      };
      
      set(userAtom, user);
      set(isAuthenticatedAtom, true);
      
      return Promise.resolve({ success: true, user });
    } else {
      return Promise.reject(new Error("아이디 또는 비밀번호가 올바르지 않습니다."));
    }
  }
);

/**
 * 로그아웃 함수 atom
 * @description 로그아웃 처리를 위한 함수
 */
export const logoutAtom = atom(
  null,
  (get, set) => {
    set(userAtom, { id: "", username: "", name: "", role: "teacher" });
    set(isAuthenticatedAtom, false);
  }
);
