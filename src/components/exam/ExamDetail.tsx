import { useState, useLayoutEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { ExamAttendeesTable } from "./ExamAttendeesTable";
import { Badge } from "@/components/ui/badge";
import type { ExamSubmitStatusDetail } from "@/types/exam";

import { AnswerSheetCheckModal } from "./AnswerSheetResult";
import { fetchStudentAnswerSheet } from "@/api/exam/api";
import type { ServerStudentAnswerDetail } from "@/types/server-exam";
import { useRouter } from "@tanstack/react-router";

import { selectedExamIdAtom, selectExamAtom } from "@/atoms/exam";
import {
  selectedExamDetailAtom,
  selectedExamSubmissionStatusAtom,
} from "@/atoms/examDetail";
import type { ExamAttendee } from "@/api/exam/types";

/**
 * 시험 문항 답안 정보 타입
 * @description 학생이 제출한 개별 문항의 답안과 채점 결과를 나타내는 타입
 *
 * 주요 용도:
 * - 답안지 상세 보기 모달에서 문항별 답안 표시
 * - 채점 결과 및 점수 계산
 * - 정답/오답 시각적 표시
 */
export type QuestionAnswer = {
  /** 문항 고유 식별자 */
  questionId: string;
  /** 문항 내용 텍스트 */
  questionText: string;
  /** 학생이 제출한 답안 */
  studentAnswer: string;
  /** 정답 */
  correctAnswer: string;
  /** 정답 여부 */
  isCorrect: boolean;
  /** 문항 배점 */
  score: number;
  /** 학생이 획득한 점수 (정답시 score와 동일, 오답시 0) */
  earnedScore: number;
};

/**
 * 학생 시험 제출 상세 타입
 */
export type StudentExamSubmission = {
  studentId: string;
  studentName: string;
  examName: string;
  submittedAt: string;
  totalScore: number;
  answers: QuestionAnswer[];
};

/**
 * 시험 제출 현황 상세 컴포넌트 Props
 */
type ExamDetailProps = {
  /** 뒤로가기 핸들러 */
  onBack?: () => void;
  /** 시험명 (선택적) */
  examName?: string;
  /** 특정 시험 ID (선택적) */
  examId?: string;
  /** SSR 데이터 로딩 에러 */
  preloadedError?: string | null;
};

/**
 * 시험 제출 현황 상세 컴포넌트
 * @description 특정 시험의 학생별 제출 현황을 표시 (SSR로 사전 로드된 데이터 사용)
 *
 * 주요 기능:
 * - 제출/미제출 통계 표시
 * - 학생별 제출 현황 테이블
 * - 답안 상세 확인 모달
 * - 뒤로가기 기능
 * - SSR 사전 로드된 서버 데이터 기반 제출 현황 표시
 * - 로딩 상태 없는 즉시 렌더링 (SSR 장점 활용)
 */
export function ExamDetail({ onBack, examName, examId }: ExamDetailProps = {}) {
  const router = useRouter();

  // SSR 하이드레이션: examId로 selectedExamIdAtom 즉시 초기화
  // 서버에서 프리로드된 QueryClient 데이터와 atom 상태 동기화
  useHydrateAtoms([[selectedExamIdAtom, examId || null]] as const);

  // 상태 관리
  const [selectedSubmission, setSelectedSubmission] =
    useState<ExamSubmitStatusDetail | null>(null);
  const [studentAnswerData, setStudentAnswerData] =
    useState<ServerStudentAnswerDetail | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  // Atoms 가져오기
  const selectExam = useSetAtom(selectExamAtom);

  // 기존에 정의된 atoms 사용
  const examDetailState = useAtomValue(selectedExamDetailAtom);
  const submissionStatusState = useAtomValue(selectedExamSubmissionStatusAtom);

  const examDetail = examDetailState.exam;
  const submissionStatus = submissionStatusState.submissionStatus;

  // examId가 변경될 때 selectedExamIdAtom 업데이트 (URL 변경 대응)
  useLayoutEffect(() => {
    if (examId) {
      selectExam(examId);
    }
    return () => {
      selectExam(null); // 컴포넌트 언마운트 시 정리
    };
  }, [examId, selectExam]);

  // 제출 현황 데이터는 이제 ExamAttendeesTable에서 별도로 로드

  /**
   * 학생 답안 상세 보기 핸들러
   * @description "답안 확인" 버튼 클릭 시 서버 API를 통해 학생 답안 상세 정보를 조회
   *
   * 주요 기능:
   * - submissionId를 사용하여 학생 답안 상세 정보 API 호출
   * - 서버 데이터 구조에 맞춰 컴포넌트 상태 업데이트
   * - 실제 서버 응답을 모달에 전달
   */
  const handleOpenDetail = async (attendee: ExamAttendee) => {
    // ExamAttendee 타입에서 필요한 정보 추출
    const submission: ExamSubmitStatusDetail = {
      id: attendee.submissionId,
      student: {
        id: attendee.studentId.toString(),
        name: attendee.studentName,
      },
      examName: attendee.examName,
      submissionDate: new Date(attendee.submittedAt).toLocaleDateString(
        "ko-KR",
      ),
      submittedAt: attendee.submittedAt,
      score: null,
      totalScore: 0,
      status: "submitted",
      submissionStatus: "제출완료",
      correctAnswerCount: 0,
      wrongAnswerCount: 0,
    };

    setSelectedSubmission(submission);
    setIsLoadingAnswer(true);
    setAnswerError(null);

    try {
      // submissionId를 사용하여 학생 답안 상세 정보 조회
      const answerData = await fetchStudentAnswerSheet(attendee.submissionId);
      setStudentAnswerData(answerData);
    } catch (error) {
      console.error("학생 답안 조회 실패:", error);
      setAnswerError("답안 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  /**
   * 모달 닫기 핸들러
   * @description 답안 상세 모달을 닫고 관련 상태를 초기화
   */
  const handleClose = () => {
    setSelectedSubmission(null);
    setStudentAnswerData(null);
    setAnswerError(null);
  };

  // 로딩 상태 처리
  if (examDetailState.isLoading || submissionStatusState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">시험 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (examDetailState.isError || submissionStatusState.isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            시험 정보를 불러오는데 실패했습니다.
          </p>
          <button
            onClick={() => router.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 시험 정보 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {examDetail?.examName}
          </h1>
          <Badge variant="outline" className="text-sm">
            {examDetail?.grade}학년
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">총 문항:</span>
            <span className="ml-2 font-medium">
              {examDetail?.examSheetInfo?.totalQuestions || 0}문항
            </span>
          </div>
          <div>
            <span className="text-gray-500">총 배점:</span>
            <span className="ml-2 font-medium">
              {examDetail?.examSheetInfo?.totalPoints || 0}점
            </span>
          </div>
          <div>
            <span className="text-gray-500">생성일:</span>
            <span className="ml-2 font-medium">
              {examDetail?.createdAt
                ? new Date(examDetail.createdAt).toLocaleDateString()
                : "-"}
            </span>
          </div>
        </div>

        {examDetail?.content && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-gray-500 text-sm">설명:</span>
            <p className="mt-1 text-gray-700">{examDetail.content}</p>
          </div>
        )}
      </div>

      {/* 제출 통계 섹션 */}
      {submissionStatus && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            제출 현황
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {submissionStatus.submissionStats.maxStudent}
              </div>
              <div className="text-sm text-blue-600 mt-1">전체 학생</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {submissionStatus.submissionStats.actualSubmissions}
              </div>
              <div className="text-sm text-green-600 mt-1">제출 완료</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {submissionStatus.submissionStats.notSubmitted}
              </div>
              <div className="text-sm text-red-600 mt-1">미제출</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {Math.round(submissionStatus.submissionStats.submissionRate)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">제출률</div>
            </div>
          </div>
        </div>
      )}

      {/* 응시자 테이블 컴포넌트 - 별도 API에서 데이터 로드 */}
      <ExamAttendeesTable
        examId={examId || ""}
        onOpenDetail={handleOpenDetail}
      />

      {/* 답안 확인 모달 */}
      <AnswerSheetCheckModal
        selectedSubmission={selectedSubmission}
        studentAnswerData={studentAnswerData}
        onClose={handleClose}
      />

      {/* 로딩 오버레이 (답안 데이터 로딩 중) */}
      {isLoadingAnswer && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">학생 답안을 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 답안 로딩 에러 처리 */}
      {answerError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <strong className="font-bold">오류: </strong>
          <span>답안 데이터를 불러오는데 실패했습니다.</span>
        </div>
      )}
    </div>
  );
}
