import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { studentAnswerDetailQueryOptions } from "@/api/dashboard";
import type { StudentAnswerDetailParams } from "@/types/server-exam";

/**
 * 학생 답안 조회를 위한 파라미터 atoms
 * @description 선택된 시험 ID와 학생 ID를 관리하는 atoms
 */

/**
 * 선택된 시험 ID atom
 * @description 답안 상세를 조회할 시험의 고유 ID (UUID 형태)
 */
export const selectedExamIdAtom = atom<string>("");

/**
 * 선택된 학생 ID atom
 * @description 답안 상세를 조회할 학생의 고유 ID (정수)
 */
export const selectedStudentIdAtom = atom<number>(0);

/**
 * 학생 답안 상세 조회 파라미터 atom
 * @description examId와 studentId를 결합한 파라미터 객체
 *
 * 주요 기능:
 * - selectedExamIdAtom과 selectedStudentIdAtom을 결합
 * - API 호출에 필요한 파라미터 형태로 변환
 * - 유효성 검증을 통해 안전한 API 호출 보장
 */
export const studentAnswerParamsAtom = atom<StudentAnswerDetailParams>(
  (get) => {
    const examId = get(selectedExamIdAtom);
    const studentId = get(selectedStudentIdAtom);

    return {
      examId,
      studentId,
    };
  },
);

/**
 * 학생 답안 상세 조회 쿼리 atom
 * @description TanStack Query와 Jotai를 통합하여 학생 답안 상세 정보를 관리하는 atom
 *
 * 주요 기능:
 * - examId와 studentId가 모두 유효한 경우에만 쿼리 실행
 * - 서버 상태 캐싱 및 동기화
 * - 로딩, 에러, 성공 상태 자동 관리
 * - 답안 데이터는 정적이므로 긴 캐시 시간 설정
 *
 * - enabled: examId와 studentId가 모두 유효한 경우에만 실행
 * - refetchOnWindowFocus: false (답안은 정적 데이터)
 *
 * @example
 * ```typescript
 * // 컴포넌트에서 사용
 * function StudentAnswerModal() {
 *   const { data, isPending, isError } = useAtomValue(studentAnswerDetailQueryAtom);
 *
 *   if (isPending) return <Loading />;
 *   if (isError) return <Error />;
 *   if (!data) return <NoData />;
 *
 *   return <AnswerDetailView answerData={data} />;
 * }
 *
 * // 모달 열기
 * function openAnswerModal(examId: string, studentId: number) {
 *   setSelectedExamId(examId);
 *   setSelectedStudentId(studentId);
 * }
 * ```
 */
export const studentAnswerDetailQueryAtom = atomWithQuery((get) => {
  const params = get(studentAnswerParamsAtom);

  return studentAnswerDetailQueryOptions(params);
});

/**
 * 학생 답안 상세 데이터 atom (파생 상태)
 * @description 쿼리 결과에서 데이터만 추출하는 derived atom
 *
 * 주요 기능:
 * - 쿼리 상태를 분석하여 적절한 데이터 반환
 * - 로딩 중이거나 에러인 경우 null 반환
 * - 성공한 경우 서버 데이터 직접 반환
 * - 컴포넌트에서 쉽게 사용할 수 있도록 단순화
 *
 * @example
 * ```typescript
 * function AnswerDetail() {
 *   const answerData = useAtomValue(studentAnswerDetailDataAtom);
 *
 *   if (!answerData) {
 *     return <div>답안 데이터를 불러오는 중...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h2>{answerData.examInfo.examName}</h2>
 *       <p>학생: {answerData.studentInfo.studentName}</p>
 *       <p>점수: {answerData.scoreInfo.totalScore}/{answerData.scoreInfo.maxScore}</p>
 *       {answerData.questionAnswers.map(qa => (
 *         <QuestionItem key={qa.questionId} question={qa} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const studentAnswerDetailDataAtom = atom((get) => {
  const queryResult = get(studentAnswerDetailQueryAtom);

  // 로딩 중이거나 에러인 경우 null 반환
  if (queryResult.isPending || queryResult.isError || !queryResult.data) {
    return null;
  }

  return queryResult.data;
});

/**
 * 학생 답안 상세 로딩 상태 atom
 * @description 답안 데이터 로딩 상태를 관리하는 atom
 *
 * 주요 기능:
 * - 파라미터 유효성 검증 후 로딩 상태 반환
 * - examId 또는 studentId가 무효한 경우 항상 false
 * - 유효한 파라미터인 경우에만 실제 쿼리 로딩 상태 반환
 * - 무한 로딩 오버레이 문제 방지
 */
export const studentAnswerLoadingAtom = atom((get) => {
  const params = get(studentAnswerParamsAtom);
  const queryResult = get(studentAnswerDetailQueryAtom);

  // 파라미터가 무효하면 로딩 상태 false (무한 로딩 방지)
  if (!params.examId || !params.studentId) {
    return false;
  }

  return queryResult.isPending;
});

/**
 * 학생 답안 상세 에러 상태 atom
 * @description 답안 데이터 조회 에러 상태를 관리하는 atom
 */
export const studentAnswerErrorAtom = atom((get) => {
  const queryResult = get(studentAnswerDetailQueryAtom);
  return queryResult.error;
});
