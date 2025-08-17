import { useLayoutEffect } from "react";
import { useSetAtom } from "jotai";
import type { ThemeBgClassConfig } from "@/atoms/ui";
import { mainBgExtraClassAtom } from "@/atoms/ui";

// 배경 클래스 설정 타입 (문자열 또는 테마별 객체)
type BackgroundClassConfig = string | Partial<ThemeBgClassConfig>;

/**
 * 메인 배경 클래스를 설정하는 커스텀 훅
 * @param backgroundClass - 적용할 배경 클래스 (문자열 또는 테마별 객체)
 * @example
 * // 문자열: light/dark 모두 동일하게 적용
 * useMainBackground("bg-gradient-to-br from-blue-50 via-white to-purple-50");
 *
 * // 테마별 다른 배경 적용
 * useMainBackground({
 *   light: "bg-gradient-to-br from-blue-50 via-white to-purple-50",
 *   dark: "bg-gradient-to-br from-slate-800 via-slate-900 to-purple-900"
 * });
 *
 * // light만 설정 (dark는 유지)
 * useMainBackground({ light: "bg-slate-100" });
 *
 * // dark만 설정 (light는 유지)
 * useMainBackground({ dark: "bg-slate-900" });
 */
export const useMainBackground = (
  backgroundClass: BackgroundClassConfig = "",
) => {
  const setMainBgExtra = useSetAtom(mainBgExtraClassAtom);

  useLayoutEffect(() => {
    // 배경 클래스 설정
    if (typeof backgroundClass === "string") {
      // 문자열인 경우 light/dark 모두 동일하게 적용
      setMainBgExtra({
        light: backgroundClass,
        dark: backgroundClass,
      });
    } else {
      // 객체인 경우 부분 업데이트 (병합)
      setMainBgExtra((prev) => ({
        light:
          backgroundClass.light !== undefined
            ? backgroundClass.light
            : prev.light,
        dark:
          backgroundClass.dark !== undefined ? backgroundClass.dark : prev.dark,
      }));
    }

    // 컴포넌트 언마운트 시 빈 값으로 초기화
    return () => {
      try {
        // React의 Strict Mode나 Fast Refresh에서 발생할 수 있는 AggregateError 방지
        setMainBgExtra({
          light: "",
          dark: "",
        });
      } catch (error) {
        // cleanup 중 발생하는 에러는 무시 (개발 환경에서만 로그)
        if (process.env.NODE_ENV === "development") {
          console.warn("[useMainBackground] cleanup 중 에러 발생:", error);
        }
      }
    };
  }, [backgroundClass]); // setMainBgExtra는 useSetAtom에서 stable하므로 dependency에서 제거
};
