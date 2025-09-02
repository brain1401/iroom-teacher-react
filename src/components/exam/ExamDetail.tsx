import { useState, useMemo } from "react";
import { ExamDetailTable } from "./ExamDetailTable";
import { Badge } from "@/components/ui/badge";
import { examSubmissionMockData } from "@/data/student-mock-data";
import {
  getExamSubmissionData,
  dashboardExamSubmissions,
} from "@/data/exam-submission-dashboard";
import type { ExamSubmitStatusDetail } from "@/types/exam";
import { AnswerSheetCheckModal } from "./AnswerSheetResult";

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
};

/**
 * 시험 제출 현황 상세 컴포넌트
 * @description 특정 시험의 학생별 제출 현황을 표시
 *
 * 주요 기능:
 * - 제출/미제출 통계 표시
 * - 학생별 제출 현황 테이블
 * - 답안 상세 확인 모달
 * - 뒤로가기 기능
 * - 가데이터 기반 제출 현황 표시
 */
export function ExamDetail({ onBack, examName, examId }: ExamDetailProps) {
  // 제출 현황 데이터 (가데이터 기반)
  const submissions = useMemo(() => {
    if (examId) {
      // 특정 시험의 제출 현황 데이터 가져오기
      return getExamSubmissionData(examId);
    }
    // 전체 제출 현황 데이터 (기본값)
    return examSubmissionMockData;
  }, [examId]);

  // 선택된 항목 관리
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] =
    useState<ExamSubmitStatusDetail | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<QuestionAnswer[]>([]);

  /**
   * 제출 통계 계산
   */
  const submissionStats = useMemo(() => {
    const total = submissions.length;
    const submitted = submissions.filter(
      (s) => s.submissionStatus === "제출완료",
    ).length;
    const notSubmitted = total - submitted;

    return {
      total,
      submitted,
      notSubmitted,
      submissionRate: total > 0 ? (submitted / total) * 100 : 0,
    };
  }, [submissions]);

  /**
   * 전체 선택/해제 핸들러
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(submissions.map((s) => s.student.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  /**
   * 개별 선택/해제 핸들러
   */
  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  /**
   * 상세 보기 핸들러
   */
  const handleOpenDetail = (submission: ExamSubmitStatusDetail) => {
    setSelectedSubmission(submission);

    // 가상 답안 데이터 생성 (실제로는 API에서 받아올 데이터)
    const mockAnswers: QuestionAnswer[] = [
      {
        questionId: "q1",
        questionText: "방정식 2x + 3 = 7의 해를 구하시오.",
        studentAnswer: "x = 2",
        correctAnswer: "x = 2",
        isCorrect: true,
        score: 5,
        earnedScore: 5,
      },
      {
        questionId: "q2",
        questionText: "직선의 방정식을 구하시오.",
        studentAnswer: "y = 3x + 1",
        correctAnswer: "y = 2x + 1",
        isCorrect: false,
        score: 5,
        earnedScore: 0,
      },
      {
        questionId: "q3",
        questionText: "이차함수 y = x² - 4x + 3의 꼭짓점을 구하시오.",
        studentAnswer: "(2, -1)",
        correctAnswer: "(2, -1)",
        isCorrect: true,
        score: 5,
        earnedScore: 5,
      },
      {
        questionId: "q4",
        questionText: "다항식 (x+2)(x-3)을 전개하시오.",
        studentAnswer: "x² - x - 6",
        correctAnswer: "x² - x - 6",
        isCorrect: true,
        score: 5,
        earnedScore: 5,
      },
      {
        questionId: "q5",
        questionText: "이차방정식 x² - 5x + 6 = 0의 해를 구하시오.",
        studentAnswer: "x = 2, x = 3",
        correctAnswer: "x = 2, x = 3",
        isCorrect: true,
        score: 5,
        earnedScore: 5,
      },
    ];

    setSelectedAnswers(mockAnswers);
  };

  /**
   * 모달 닫기 핸들러
   */
  const handleClose = () => {
    setSelectedSubmission(null);
    setSelectedAnswers([]);
  };

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // 기본 뒤로가기 (브라우저 히스토리)
      window.history.back();
    }
  };

  /**
   * 총점 계산
   */
  const totalScore = useMemo(() => {
    return selectedAnswers.reduce((sum, answer) => sum + answer.earnedScore, 0);
  }, [selectedAnswers]);

  /**
   * 시험 정보 가져오기
   */
  const examInfo = useMemo(() => {
    if (examId) {
      return dashboardExamSubmissions.find((exam) => exam.id === examId);
    }
    return null;
  }, [examId]);

  return (
    <div className="space-y-4 w-full">
      {/* 헤더 영역 */}
      <div className=" flex items-center gap-4">
        <div className="flex-1">
          <div className="text-[2.5rem] leading-none font-bold">
            시험 제출 현황
          </div>

          {examName && <p className="text-lg text-gray-600 mt-1">{examName}</p>}
          {examInfo && (
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="text-sm">
                {examInfo.unitName}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {examInfo.status}
              </Badge>
              <span className="text-sm text-gray-500">
                생성일: {examInfo.createdAt}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 제출 통계 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-900 text-white">전체</Badge>
            <p className="text-sm font-medium">{submissionStats.total}명</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-sky-500 text-white">제출완료</Badge>
            <p className="text-sm font-medium">{submissionStats.submitted}명</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-600 text-white">미제출</Badge>
            <p className="text-sm font-medium">
              {submissionStats.notSubmitted}명
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 text-white">제출률</Badge>
            <p className="text-sm font-medium">
              {submissionStats.submissionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* 시험별 추가 정보 */}
        {examInfo && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              전체 대상:{" "}
              <span className="font-medium">{examInfo.totalStudents}명</span>
            </div>
            <div className="text-sm text-gray-600">
              제출률:{" "}
              <span className="font-medium">
                {examInfo.submissionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 테이블 컴포넌트 */}
      <ExamDetailTable
        submissions={submissions as ExamSubmitStatusDetail[]}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
        onOpenDetail={handleOpenDetail}
      />

      {/* 답안 확인 모달 */}
      <AnswerSheetCheckModal
        selectedSubmission={selectedSubmission}
        selectedAnswers={selectedAnswers}
        onClose={handleClose}
      />
    </div>
  );
}
