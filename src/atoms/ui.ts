import { atom } from "jotai";

export type ThemeBgClassConfig = {
  light: string;
  dark: string;
};

// 메인 배경 추가 클래스 설정 (light/dark 테마별)
export const mainBgExtraClassAtom = atom<ThemeBgClassConfig>({
  light: "",
  dark: "",
});

// 메인 배경 추가 클래스 조합 (light/dark 자동 적용)
export const mainBgExtraCombinedClassAtom = atom((get) => {
  const cfg = get(mainBgExtraClassAtom);
  const light = cfg.light.trim() || "";
  const dark = cfg.dark.trim() || "";

  // light/dark 클래스를 조합
  if (!light && !dark) return "";
  if (light && !dark) return light;
  if (!light && dark) return `dark:${dark}`;
  return `${light} ${dark ? `dark:${dark}` : ""}`.trim();
});

export const isShowHeaderAtom = atom(false);
