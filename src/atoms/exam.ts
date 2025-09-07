/**
 * 시험 관련 Jotai atoms
 * @description 서버 API와 연동된 시험 데이터 상태 관리
 *
 * 주요 특징:
 * - atomWithQuery로 서버 상태 관리
 * - 필터 상태와 자동 동기화
 * - 캐시 무효화 및 리페칭 지원
 * - SSR 호환 설계
 */

import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import {
  examListQueryOptions,
  defaultExamStatisticsQueryOptions,
} from "@/api/exam";
import {
  examServerParamsAtom,
  examPageAtom,
  selectedGradeAtom,
  searchKeywordAtom,
} from "./examFilters";

/**
 * 현재 선택된 시험 ID 원자
 * @description 시험 상세 및 제출 현황 조회에 사용
 */
export const selectedExamIdAtom = atom<string | null>(null);

/**
 * 시험 목록 쿼리 원자
 * @description 필터 상태와 자동 동기화되는 시험 목록 조회
 *
 * 의존성:
 * - examServerParamsAtom: 서버 API 파라미터
 * - 필터 변경 시 자동으로 새로운 쿼리 실행
 */
export const examListQueryAtom = atomWithQuery((get) => {
  const serverParams = get(examServerParamsAtom);
  return examListQueryOptions(serverParams);
});

/**
 * 시험 통계 쿼리 원자
 * @description 학년별 시험 분포 통계 조회
 */
export const examStatisticsQueryAtom = atomWithQuery(() => {
  return defaultExamStatisticsQueryOptions();
});

/**
 * 현재 페이지의 시험 목록 파생 원자
 * @description 쿼리 결과에서 시험 목록과 페이지네이션 정보 추출
 */
export const currentExamListAtom = atom((get) => {
  const queryResult = get(examListQueryAtom);

  return {
    exams: queryResult.data?.content || [],
    pagination: {
      currentPage: queryResult.data?.number ?? 0,
      totalPages: queryResult.data?.totalPages ?? 0,
      totalElements: queryResult.data?.totalElements ?? 0,
      size: queryResult.data?.size ?? 20,
      hasNext: !(queryResult.data?.last ?? true),
      hasPrev: !(queryResult.data?.first ?? true),
    },
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    isFetching: queryResult.isFetching,
  };
});

/**
 * 시험 통계 파생 원자
 * @description 통계 쿼리 결과 정리
 */
export const examStatisticsAtom = atom((get) => {
  const queryResult = get(examStatisticsQueryAtom);

  return {
    statistics: queryResult.data || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    hasData: Boolean(queryResult.data),
  };
});

/**
 * 시험 액션 원자들
 * @description 시험 관련 상태 변경 액션들
 */

/**
 * 시험 선택 액션 원자
 * @description 시험 ID를 설정하여 상세 조회 활성화
 */
export const selectExamAtom = atom(null, (_get, set, examId: string | null) => {
  set(selectedExamIdAtom, examId);
});

/**
 * 시험 선택 해제 액션 원자
 * @description 선택된 시험 해제
 */
export const clearSelectedExamAtom = atom(null, (_get, set) => {
  set(selectedExamIdAtom, null);
});

/**
 * 시험 목록 새로고침 액션 원자
 * @description 현재 필터로 시험 목록 다시 로드
 */
export const refreshExamListAtom = atom(null, (_get, set) => {
  // 페이지를 0으로 리셋하여 첫 페이지부터 다시 로드
  // 이렇게 하면 examServerParamsAtom이 변경되고 쿼리가 다시 실행됨
  set(examPageAtom, 0);

  // 추가로 검색 필터를 임시로 변경했다가 복원하여 강제 리프레시
  // 이는 서버 파라미터를 변경하여 쿼리를 강제로 다시 실행시킴
  const currentSearch = _get(searchKeywordAtom);
  set(searchKeywordAtom, `${currentSearch} `);
  setTimeout(() => {
    set(searchKeywordAtom, currentSearch);
  }, 0);
});

/**
 * 특정 학년 시험 조회 액션 원자
 * @description 학년을 변경하고 첫 페이지로 이동
 */
export const viewGradeExamsAtom = atom(null, (_get, set, grade: string) => {
  set(selectedGradeAtom, grade);
  set(examPageAtom, 0);
});

/**
 * 시험 검색 결과 요약 파생 원자
 * @description 현재 검색/필터 결과의 요약 정보
 */
export const examSearchSummaryAtom = atom((get) => {
  const examList = get(currentExamListAtom);
  const serverParams = get(examServerParamsAtom);

  return {
    totalResults: examList.pagination.totalElements,
    currentPage: examList.pagination.currentPage + 1, // UI에서는 1부터 시작
    totalPages: examList.pagination.totalPages,
    hasResults: examList.exams.length > 0,
    isFiltered: Boolean(
      serverParams.search || serverParams.grade || serverParams.recent,
    ),
    resultRange: {
      start: examList.pagination.currentPage * examList.pagination.size + 1,
      end: Math.min(
        (examList.pagination.currentPage + 1) * examList.pagination.size,
        examList.pagination.totalElements,
      ),
    },
  };
});
