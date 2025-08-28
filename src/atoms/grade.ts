import { atom } from "jotai";
import type { Grade } from "@/types/grade";

/**
 * 선택 학년 전역 상태 atom
 * @description 통계/시험지 등 학년 기반 화면에서 공통 사용
 *
 * 주요 기능:
 * - 기본값: "중1"
 * - Select 컴포넌트와 양방향 바인딩
 */
export const selectedGradeAtom = atom<Grade>("중1");
