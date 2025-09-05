/**
 * 통계 관련 Jotai Atoms
 * @description 통계 페이지의 상태 관리를 위한 atoms
 */

import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { selectedGradeAtom } from "./dashboard";
import {
  unitWrongAnswerRatesQueryOptions,
  scoreDistributionQueryOptions,
} from "@/api/statistics";
import type {
  UnitWrongAnswerRatesResponse,
  ScoreDistributionResponse,
} from "@/api/statistics";

/**
 * 단원별 오답률 쿼리 atom
 * @description 선택된 학년의 단원별 오답률 데이터를 가져오는 atom
 */
export const unitWrongAnswerRatesQueryAtom = atomWithQuery((get) => {
  const grade = get(selectedGradeAtom);
  return unitWrongAnswerRatesQueryOptions({ grade });
});

/**
 * 성적 분포도 쿼리 atom (통계 페이지용)
 * @description 선택된 학년의 성적 분포 데이터를 가져오는 atom
 */
export const statisticsScoreDistributionQueryAtom = atomWithQuery((get) => {
  const grade = get(selectedGradeAtom);
  return scoreDistributionQueryOptions({ grade });
});

/**
 * 통계 차트용 시험별 평균 점수 데이터 atom
 * @description 현재는 임시 데이터 사용 (API 확장 대기)
 * TODO: 서버에서 시험별 통계 API 제공 시 실제 데이터로 교체
 */
export const examAverageScoresAtom = atom((get) => {
  const grade = get(selectedGradeAtom);
  const scoreData = get(statisticsScoreDistributionQueryAtom);
  
  // 서버에서 시험별 데이터가 없으므로 현재 평균점수 기반으로 임시 데이터 생성
  if (scoreData.isPending || scoreData.isError || !scoreData.data) {
    return [];
  }

  const currentAverage = scoreData.data.averageScore;
  
  // 학년별 임시 시험 데이터 (실제 API 대기)
  const examsByGrade = {
    1: [
      { examName: "1학기 중간", average: Math.round(currentAverage - 5) },
      { examName: "1학기 기말", average: Math.round(currentAverage) },
      { examName: "2학기 중간", average: Math.round(currentAverage - 2) },
      { examName: "2학기 기말", average: Math.round(currentAverage + 3) },
    ],
    2: [
      { examName: "1학기 중간", average: Math.round(currentAverage - 7) },
      { examName: "1학기 기말", average: Math.round(currentAverage - 2) },
      { examName: "2학기 중간", average: Math.round(currentAverage - 4) },
      { examName: "2학기 기말", average: Math.round(currentAverage + 1) },
    ],
    3: [
      { examName: "1학기 중간", average: Math.round(currentAverage - 8) },
      { examName: "1학기 기말", average: Math.round(currentAverage - 3) },
      { examName: "2학기 중간", average: Math.round(currentAverage - 5) },
      { examName: "2학기 기말", average: Math.round(currentAverage) },
    ],
  };

  return examsByGrade[grade].map((exam, index) => ({
    name: exam.examName,
    avg: exam.average,
    participants: scoreData.data.totalStudentCount,
  }));
});

/**
 * 통계 차트용 단원별 오답률 데이터 atom
 * @description 서버에서 받은 실제 단원별 오답률 데이터를 차트용으로 변환
 */
export const unitWrongAnswerChartDataAtom = atom((get) => {
  const wrongAnswerData = get(unitWrongAnswerRatesQueryAtom);
  
  if (wrongAnswerData.isPending || wrongAnswerData.isError || !wrongAnswerData.data) {
    return [];
  }

  // 상위 4개 오답률 단원만 표시 (이미 서버에서 순위순으로 정렬됨)
  return wrongAnswerData.data.unitStatistics.slice(0, 4).map((unit) => ({
    name: unit.unitName,
    wrongRate: Math.round(unit.wrongAnswerRate),
    totalSubmitted: unit.submissionCount,
    wrongCount: unit.wrongAnswerCount,
  }));
});

/**
 * 통계 페이지 로딩 상태 atom
 * @description 모든 통계 데이터 로딩 상태를 통합
 */
export const statisticsLoadingAtom = atom((get) => {
  const wrongAnswerQuery = get(unitWrongAnswerRatesQueryAtom);
  const scoreQuery = get(statisticsScoreDistributionQueryAtom);
  
  return wrongAnswerQuery.isPending || scoreQuery.isPending;
});

/**
 * 통계 페이지 에러 상태 atom
 * @description 모든 통계 데이터 에러 상태를 통합
 */
export const statisticsErrorAtom = atom((get) => {
  const wrongAnswerQuery = get(unitWrongAnswerRatesQueryAtom);
  const scoreQuery = get(statisticsScoreDistributionQueryAtom);
  
  const hasError = wrongAnswerQuery.isError || scoreQuery.isError;
  const error = wrongAnswerQuery.error || scoreQuery.error;
  
  return { hasError, error };
});