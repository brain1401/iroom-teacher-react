// src/components/test/TestDetail.tsx

import { useState, useMemo } from "react";
import { TestDetailTable } from "./TestDetailTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { testSubmissionMockData } from "@/data/student-mock-data";
import {
  getTestSubmissionData,
  dashboardTestSubmissions,
} from "@/data/test-submission-dashboard";
import type { TestSubmitStatusDetail } from "@/types/test";
import { AnswerSheetResult } from "./AnswerSheetResult";

/**
 * 문항 답안 타입
 */
export type QuestionAnswer = {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  earnedScore: number;
};

/**
 * 학생 시험 제출 상세 타입
 */
export type StudentTestSubmission = {
  studentId: string;
  studentName: string;
  testName: string;
  submittedAt: string;
  totalScore: number;
  answers: QuestionAnswer[];
};

/**
 * 시험 제출 현황 상세 컴포넌트 Props
 */
type TestDetailProps = {
  /** 뒤로가기 핸들러 */
  onBack?: () => void;
  /** 시험명 (선택적) */
  testName?: string;
  /** 특정 시험 ID (선택적) */
  testId?: string;
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
export function TestDetail({ onBack, testName, testId }: TestDetailProps) {
  // 제출 현황 데이터 (가데이터 기반)
  const submissions = useMemo(() => {
    if (testId) {
      // 특정 시험의 제출 현황 데이터 가져오기
      return getTestSubmissionData(testId);
    }
    // 전체 제출 현황 데이터 (기본값)
    return testSubmissionMockData;
  }, [testId]);

  // 선택된 항목 관리
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] =
    useState<TestSubmitStatusDetail | null>(null);
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
  const handleOpenDetail = (submission: TestSubmitStatusDetail) => {
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
  const testInfo = useMemo(() => {
    if (testId) {
      return dashboardTestSubmissions.find((test) => test.id === testId);
    }
    return null;
  }, [testId]);

  return (
    <div className="space-y-4 w-full">
      {/* 헤더 영역 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </Button>
        <div className="flex-1">
          <div className="text-[2.5rem] font-bold">시험 제출 현황</div>
          {testName && <p className="text-lg text-gray-600 mt-1">{testName}</p>}
          {testInfo && (
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="text-sm">
                {testInfo.unitName}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {testInfo.status}
              </Badge>
              <span className="text-sm text-gray-500">
                생성일: {testInfo.createdAt}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 제출 통계 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-800 text-white">전체</Badge>
            <p className="text-sm font-medium">{submissionStats.total}명</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-sky-500 text-white">제출완료</Badge>
            <p className="text-sm font-medium">{submissionStats.submitted}명</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 text-white">미제출</Badge>
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
        {testInfo && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              전체 대상:{" "}
              <span className="font-medium">{testInfo.totalStudents}명</span>
            </div>
            <div className="text-sm text-gray-600">
              제출률:{" "}
              <span className="font-medium">
                {testInfo.submissionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 테이블 컴포넌트 */}
      <TestDetailTable
        submissions={submissions as TestSubmitStatusDetail[]}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
        onOpenDetail={handleOpenDetail}
      />

      {/* 답안 확인 모달 */}
      <AnswerSheetResult
        selectedSubmission={selectedSubmission}
        selectedAnswers={selectedAnswers}
        onClose={handleClose}
      />
    </div>
  );
}
