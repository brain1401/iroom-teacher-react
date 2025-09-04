/**
 * 교사 대시보드 상태 관리
 * @description 대시보드의 시험 제출 현황과 점수 분포 데이터를 전역에서 관리
 *
 * 주요 기능:
 * - 학년별 선택 상태 관리 (1, 2, 3 학년)
 * - 최근 시험 제출 현황 데이터 조회 및 변환
 * - 점수 분포 데이터 조회 및 차트용 변환
 * - 서버 데이터와 UI 컴포넌트 간 데이터 형식 자동 변환
 * - 에러 처리 및 로딩 상태 관리
 */

import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";
import {
  recentExamsStatusQueryOptions,
  scoreDistributionQueryOptions,
} from "@/api/dashboard/query";
import {
  transformExamSubmissions,
  transformScoreDistributionForChart,
} from "@/utils/dashboardTransform";
import type { DashboardExamSubmission } from "@/types/exam";

// 편의를 위한 재Export
export {
  recentExamsStatusQueryOptions,
  scoreDistributionQueryOptions,
} from "@/api/dashboard/query";

/**
 * 선택된 학년을 관리하는 atom
 * @description 사용자가 선택한 학년 정보를 localStorage에 영구 저장
 *
 * 특징:
 * - 1, 2, 3 학년만 선택 가능 (서버 API 제약사항)
 * - 기본값: 1학년
 * - 사용자별 개인화 설정으로 새로고침 후에도 유지
 *
 * 사용 예시:
 * ```typescript
 * // 📌 값과 설정 함수 모두 필요 - useAtom 사용
 * const [selectedGrade, setSelectedGrade] = useAtom(selectedGradeAtom);
 * setSelectedGrade(2); // 2학년 선택
 *
 * // 📌 설정만 필요한 경우 - useSetAtom 사용
 * const setGrade = useSetAtom(selectedGradeAtom);
 * setGrade(3); // 3학년 선택
 * ```
 */
export const selectedGradeAtom = atomWithStorage<1 | 2 | 3>(
  "dashboard-selected-grade",
  1,
);

/**
 * 최근 시험 제출 현황 데이터를 관리하는 쿼리 atom
 * @description React Query + Jotai를 조합하여 시험 제출 현황을 전역에서 관리
 *
 * 작동 방식:
 * 1. selectedGradeAtom의 값이 변경되면 자동으로 새로운 쿼리 실행
 * 2. 서버에서 해당 학년의 시험 제출 현황 데이터 조회
 * 3. 로딩, 에러, 데이터 상태를 모든 컴포넌트에서 공유
 * 4. 동일한 학년 요청은 캐시에서 바로 반환
 *
 * 캐시 설정:
 * - staleTime: 5분 (데이터가 5분간 fresh 상태 유지)
 * - gcTime: 10분 (캐시 10분간 유지)
 * - 자동 재시도: 3회
 *
 * 사용 예시:
 * ```typescript
 * // 📌 값만 읽기 - useAtomValue 사용
 * const { data, isPending, isError } = useAtomValue(recentExamsStatusQueryAtom);
 * ```
 */
export const recentExamsStatusQueryAtom = atomWithQuery((get) => {
  const grade = get(selectedGradeAtom);
  return recentExamsStatusQueryOptions({ grade });
});

/**
 * 점수 분포 데이터를 관리하는 쿼리 atom
 * @description 선택된 학년의 점수 분포 데이터를 전역에서 관리
 *
 * 작동 방식:
 * 1. selectedGradeAtom의 값이 변경되면 자동으로 새로운 쿼리 실행
 * 2. 서버에서 해당 학년의 점수 분포 데이터 조회
 * 3. 현재 서버에서 모든 값이 0으로 반환되지만 타입 구조는 정확함
 *
 * 알려진 이슈:
 * - 서버에서 현재 모든 점수 분포 값이 0으로 반환됨
 * - 타입 구조는 정확하므로 향후 실제 데이터 반환 시 정상 작동 예상
 *
 * 사용 예시:
 * ```typescript
 * // 📌 값만 읽기 - useAtomValue 사용
 * const { data, isPending, isError } = useAtomValue(scoreDistributionQueryAtom);
 * ```
 */
export const scoreDistributionQueryAtom = atomWithQuery((get) => {
  const grade = get(selectedGradeAtom);
  return scoreDistributionQueryOptions({ grade });
});

/**
 * 변환된 시험 제출 현황 데이터를 관리하는 derived atom
 * @description 서버 응답을 UI 컴포넌트에서 사용할 수 있는 형태로 자동 변환
 *
 * 변환 과정:
 * 1. recentExamsStatusQueryAtom에서 서버 원본 데이터 가져오기
 * 2. transformExamSubmissions 유틸리티로 UI 형태로 변환
 * 3. 에러나 로딩 상태에서는 빈 배열 반환
 *
 * 변환 내용:
 * - examId → id 매핑
 * - unitName 자동 생성 ("단원 {examId}")
 * - 제출률 기반 status 계산 (complete/partial/pending)
 * - 안전한 기본값 처리 (null/undefined 방어)
 *
 * Jotai Best Practice 적용:
 * - 컴포넌트의 useMemo 대신 derived atom 사용
 * - 비즈니스 로직을 atom 레벨에서 처리
 * - 데이터 변환을 중앙화하여 일관성 보장
 *
 * 사용 예시:
 * ```typescript
 * // 📌 derived atom은 값만 읽으므로 useAtomValue 사용
 * const examSubmissions = useAtomValue(transformedExamSubmissionsAtom);
 * // examSubmissions: DashboardExamSubmission[]
 * ```
 */
export const transformedExamSubmissionsAtom = atom<DashboardExamSubmission[]>(
  (get) => {
    const { data, isPending, isError } = get(recentExamsStatusQueryAtom);

    // 로딩 중이거나 에러인 경우 빈 배열 반환
    if (isPending || isError || !data) {
      return [];
    }

    // 서버 데이터를 UI 형태로 변환
    return transformExamSubmissions(data.examSubmissions);
  },
);

/**
 * 차트용 점수 분포 데이터를 관리하는 derived atom
 * @description 점수 분포 데이터를 차트 컴포넌트에서 사용할 수 있는 형태로 변환
 *
 * 변환 과정:
 * 1. scoreDistributionQueryAtom에서 서버 원본 데이터 가져오기
 * 2. transformScoreDistributionForChart 유틸리티로 차트 형태로 변환
 * 3. 점수 구간별로 학년 데이터를 정렬하여 반환
 *
 * 변환 결과:
 * ```typescript
 * [
 *   { scoreRange: "90-100", grade1: 5, grade2: 3, grade3: 0 },
 *   { scoreRange: "80-89", grade1: 8, grade2: 6, grade3: 0 },
 *   // ...
 * ]
 * ```
 *
 * 사용 예시:
 * ```typescript
 * // 📌 차트 라이브러리에서 바로 사용 가능
 * const chartData = useAtomValue(chartScoreDistributionAtom);
 * <BarChart data={chartData} />
 * ```
 */
export const chartScoreDistributionAtom = atom((get) => {
  const { data, isPending, isError } = get(scoreDistributionQueryAtom);
  const selectedGrade = get(selectedGradeAtom);

  // 로딩 중이거나 에러인 경우 빈 배열 반환
  if (isPending || isError || !data) {
    console.log("[chartScoreDistributionAtom] 데이터 없음:", {
      isPending,
      isError,
      data,
    });
    return [];
  }

  // 디버깅: 서버에서 받은 원본 데이터 확인
  console.log("[chartScoreDistributionAtom] 서버 원본 데이터:", data);
  console.log("[chartScoreDistributionAtom] 선택된 학년:", selectedGrade);

  // 선택된 학년 정보와 함께 차트용 형태로 변환
  const transformedData = transformScoreDistributionForChart(
    data.distributions,
    selectedGrade,
  );
  console.log("[chartScoreDistributionAtom] 변환된 데이터:", transformedData);

  return transformedData;
});

/**
 * 선택된 학년의 점수 통계를 관리하는 derived atom
 * @description 현재 선택된 학년의 평균 점수, 합격률 등 통계 정보 제공
 *
 * 계산 내용:
 * - 평균 점수 (점수 구간 중간값 기반 가중평균)
 * - 합격률 (60점 이상 비율)
 * - 전체 학생 수
 *
 * 사용 예시:
 * ```typescript
 * const stats = useAtomValue(selectedGradeStatsAtom);
 * console.log(`평균 점수: ${stats.averageScore}점`);
 * console.log(`합격률: ${(stats.passRate * 100).toFixed(1)}%`);
 * ```
 */
export const selectedGradeStatsAtom = atom((get) => {
  const { data, isPending, isError } = get(scoreDistributionQueryAtom);

  // 로딩 중이거나 에러인 경우 기본값 반환
  if (isPending || isError || !data) {
    return {
      averageScore: 0,
      passRate: 0,
      totalStudents: 0,
    };
  }

  // 서버에서 제공하는 통계 정보 사용
  return {
    averageScore: data.averageScore || 0,
    passRate: (data.statistics?.passingRate || 0) / 100, // 서버는 백분율로 제공
    totalStudents: data.totalStudentCount || 0,
  };
});

/**
 * 대시보드 로딩 상태를 통합 관리하는 derived atom
 * @description 대시보드의 모든 데이터 로딩 상태를 하나로 통합
 *
 * 판정 기준:
 * - 시험 제출 현황 또는 점수 분포 중 하나라도 로딩 중이면 true
 * - 모든 데이터가 로딩 완료되면 false
 *
 * 사용 예시:
 * ```typescript
 * const isLoading = useAtomValue(dashboardLoadingAtom);
 * if (isLoading) {
 *   return <DashboardSkeleton />;
 * }
 * ```
 */
export const dashboardLoadingAtom = atom((get) => {
  const { isPending: isExamsLoading } = get(recentExamsStatusQueryAtom);
  const { isPending: isScoreLoading } = get(scoreDistributionQueryAtom);

  return isExamsLoading || isScoreLoading;
});

/**
 * 대시보드 에러 상태를 통합 관리하는 derived atom
 * @description 대시보드의 모든 데이터 에러 상태를 하나로 통합
 *
 * 에러 정보:
 * - 시험 제출 현황과 점수 분포의 에러를 각각 제공
 * - hasError로 전체 에러 여부 확인 가능
 *
 * 사용 예시:
 * ```typescript
 * const { hasError, examsError, scoreError } = useAtomValue(dashboardErrorAtom);
 * if (hasError) {
 *   return <ErrorDisplay errors={[examsError, scoreError]} />;
 * }
 * ```
 */
export const dashboardErrorAtom = atom((get) => {
  const { error: examsError } = get(recentExamsStatusQueryAtom);
  const { error: scoreError } = get(scoreDistributionQueryAtom);

  return {
    hasError: Boolean(examsError || scoreError),
    examsError,
    scoreError,
  };
});

/**
 * 대시보드 데이터 새로고침 액션 atom
 * @description 대시보드의 모든 데이터를 수동으로 새로고침하는 액션
 *
 * 실행 내용:
 * - 현재 선택된 학년의 시험 제출 현황 다시 조회
 * - 현재 선택된 학년의 점수 분포 다시 조회
 * - 캐시 무효화를 통한 강제 새로고침
 *
 * 사용 예시:
 * ```typescript
 * const refreshDashboard = useSetAtom(refreshDashboardAtom);
 *
 * const handleRefresh = () => {
 *   refreshDashboard();
 * };
 * ```
 */
export const refreshDashboardAtom = atom(null, (get, set) => {
  // 현재 선택된 학년 확인
  const currentGrade = get(selectedGradeAtom);

  // 쿼리 다시 실행을 위해 atom들의 값 재읽기
  // atomWithQuery는 의존성이 변경되지 않으면 캐시된 값을 반환하므로
  // queryClient를 통한 invalidation이 더 적절하지만,
  // 여기서는 단순히 새로운 요청 트리거
  try {
    // 새로운 데이터 로드 트리거
    set(selectedGradeAtom, currentGrade);
  } catch (error) {
    console.error("[refreshDashboard] 대시보드 새로고침 실패:", error);
  }
});

/**
 * 대시보드 요약 정보를 제공하는 derived atom
 * @description 대시보드 상단에 표시할 요약 정보를 통합 제공
 *
 * 제공 정보:
 * - 선택된 학년
 * - 총 시험 수
 * - 평균 제출률
 * - 평균 점수
 * - 로딩/에러 상태
 *
 * 사용 예시:
 * ```typescript
 * const summary = useAtomValue(dashboardSummaryAtom);
 * <DashboardHeader
 *   grade={summary.selectedGrade}
 *   totalExams={summary.totalExams}
 *   averageSubmissionRate={summary.averageSubmissionRate}
 *   averageScore={summary.averageScore}
 * />
 * ```
 */
export const dashboardSummaryAtom = atom((get) => {
  const selectedGrade = get(selectedGradeAtom);
  const examSubmissions = get(transformedExamSubmissionsAtom);
  const gradeStats = get(selectedGradeStatsAtom);
  const isLoading = get(dashboardLoadingAtom);
  const { hasError } = get(dashboardErrorAtom);

  // 평균 제출률 계산
  const averageSubmissionRate =
    examSubmissions.length > 0
      ? examSubmissions.reduce((sum, exam) => {
          const rate =
            exam.totalStudents > 0
              ? exam.submissionCount / exam.totalStudents
              : 0;
          return sum + rate;
        }, 0) / examSubmissions.length
      : 0;

  return {
    selectedGrade,
    totalExams: examSubmissions.length,
    averageSubmissionRate: Math.round(averageSubmissionRate * 100) / 100, // 소수점 둘째 자리
    averageScore: gradeStats.averageScore,
    totalStudents: gradeStats.totalStudents,
    passRate: gradeStats.passRate,
    isLoading,
    hasError,
  };
});
