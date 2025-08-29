// src/routes/test-paper/_components/TestListTab.tsx

import { useState } from "react";
import { TestDetailTable } from "./TestDetailTable";
import { PagePagination } from "@/components/layout/PagePagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "../ui/badge";

type TestSubmitStatusDetail = {
  studentId: string;
  /** 학생 이름 */
  studentName: string;
  /** 학생 전화번호 */
  phoneNumber: string;
  /** 시험명 */
  testName: string;
  /** 제출 상태 */
  status: "미제출" | "제출" | "제출완료";
  /** 제출 일시 */
  submittedAt?: string;
  /** 제출한 답안 */
  submittedAnswer?: string;
};

type StudentTestSubmission = {
  studentId: string;
  studentName: string;
  testName: string;
  submittedAt: string;
  totalScore: number;
  answers: QuestionAnswer[];
};

type QuestionAnswer = {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  earnedScore: number;
};

const fakeTestSubmitStatusDetail: TestSubmitStatusDetail[] = [
  {
    studentId: "1",
    studentName: "윤아연",
    phoneNumber: "010-9185-8023",
    testName: "기말 대비 모의고사",
    submittedAt: "2025-01-15",
    status: "제출",
  },
  {
    studentId: "2",
    studentName: "윤아연",
    phoneNumber: "010-9185-8023",
    testName: "기말 대비 모의고사",
    submittedAt: "2025-01-15",
    status: "미제출",
  },
  {
    studentId: "3",
    studentName: "윤아연",
    phoneNumber: "010-9185-8023",
    testName: "기말 대비 모의고사",
    submittedAt: "2025-01-15",
    status: "제출",
  },
  {
    studentId: "4",
    studentName: "윤아연",
    phoneNumber: "010-9185-8023",
    testName: "기말 대비 모의고사",
    submittedAt: "2025-01-15",
    status: "제출",
  },
  {
    studentId: "5",
    studentName: "윤아연",
    phoneNumber: "010-9185-8023",
    testName: "기말 대비 모의고사",
    submittedAt: "2025-01-15",
    status: "제출",
  },
];

const fakeStudentSubmissions: StudentTestSubmission[] = [
  {
    studentId: "student-001",
    studentName: "김철수",
    testName: "2025-1학기 중간고사 대비",
    submittedAt: "2025-01-20 09:30",
    totalScore: 85,
    answers: [
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
    ],
  },
];

export function TestDetail() {
  // ... (useState 및 핸들러 함수들은 동일)
  // Use static fake data directly (no state needed)
  const papers = fakeTestSubmitStatusDetail;
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [selectedPaper, setSelectedPaper] =
    useState<TestSubmitStatusDetail | null>(null);
  const [selectedSubmittedAnswer, setSelectedSubmittedAnswer] = useState<
    QuestionAnswer[]
  >([]); // 빈 배열로 초기화

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(papers.map((p) => p.studentId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleOpenDetail = (paper: TestSubmitStatusDetail) => {
    setSelectedPaper(paper);
    setSelectedSubmittedAnswer(fakeStudentSubmissions[0].answers);
  };

  const handleClose = () => {
    setSelectedPaper(null);
    setSelectedSubmittedAnswer([]);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="text-[2.5rem] font-bold">시험 제출 현황</div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge className="bg-gray-800 text-white">전체</Badge>
          <p className="text-sm">20명</p>
          <Badge className="bg-sky-500 text-white">제출</Badge>
          <p className="text-sm">10명</p>
          <Badge className="bg-red-500 text-white">미제출</Badge>
          <p className="text-sm">10명</p>
        </div>
      </div>

      {/* 2. 테이블 컴포넌트 */}
      <TestDetailTable
        submissions={fakeTestSubmitStatusDetail}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
        onOpenDetail={handleOpenDetail}
      />

      {/* 3. 페이지네이션 컴포넌트 */}
      <PagePagination />
      {/* 모달: 답안 확인 다이얼로그 */}
      <Dialog
        open={!!selectedPaper && selectedSubmittedAnswer.length > 0}
        onOpenChange={(o) => {
          if (!o) handleClose();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          {selectedSubmittedAnswer.length > 0 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {selectedPaper?.studentName} 님의 답안 확인
                </DialogTitle>
                <DialogDescription className="text-lg">
                  {selectedPaper?.testName}
                </DialogDescription>
              </DialogHeader>

              {/* 시험 기본 정보 */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                  <p className="text-sm text-gray-600">학생명</p>
                  <p className="font-semibold">{selectedPaper?.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">시험명</p>
                  <p className="font-semibold">{selectedPaper?.testName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">제출일자</p>
                  <p className="font-semibold">{selectedPaper?.submittedAt}</p>
                </div>
              </div>

              {/* 답안 상세 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  문항별 답안
                </h3>

                {selectedSubmittedAnswer.map((answer, index) => (
                  <div
                    key={answer.questionId}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">
                        문항 {index + 1}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          배점: {answer.score}점
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            answer.isCorrect
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {answer.isCorrect ? "정답" : "오답"}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">문제</p>
                      <p className="text-gray-800">{answer.questionText}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">학생 답안</p>
                        <p
                          className={`font-medium ${
                            answer.isCorrect ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {answer.studentAnswer}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">정답</p>
                        <p className="font-medium text-blue-700">
                          {answer.correctAnswer}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">획득 점수</span>
                        <span
                          className={`font-bold text-lg ${
                            answer.isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {answer.earnedScore}점
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 총점 표시 */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-blue-800">
                      총점
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {fakeStudentSubmissions[0].totalScore}점
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
