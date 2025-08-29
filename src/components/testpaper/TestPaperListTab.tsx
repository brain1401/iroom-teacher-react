// src/routes/test-paper/_components/TestPaperListTab.tsx

import { useState } from "react";
import { TestPaperTable } from "./TestPaperTable";
import { Button } from "@/components/ui/button";
import { SelectGrade } from "../layout/SelectGrade";
import { PagePagination } from "../layout/PagePagination";
import { ProblemModal } from "../layout/ProblemModal";
import { PrintOptionsModal } from "./PrintOptionsModal";

type TestPaper = {
  id: string;
  unitName: string;
  testName: string;
  questionCount: number;
};

const fakeTestPaperData: TestPaper[] = [
  {
    id: "paper-001",
    unitName: "1단원: 다항식의 연산",
    testName: "2025-1학기 중간고사 대비",
    questionCount: 20,
  },
  {
    id: "paper-002",
    unitName: "2단원: 나머지정리와 인수분해",
    testName: "2025-1학기 중간고사 대비",
    questionCount: 20,
  },
  {
    id: "paper-003",
    unitName: "3단원: 복소수와 이차방정식",
    testName: "단원 평가 (A)",
    questionCount: 20,
  },
  {
    id: "paper-004",
    unitName: "4단원: 이차방정식과 이차함수",
    testName: "단원 평가 (B)",
    questionCount: 20,
  },
  {
    id: "paper-005",
    unitName: "5단원: 여러 가지 방정식",
    testName: "2025-1학기 기말고사 대비",
    questionCount: 25,
  },
  {
    id: "paper-006",
    unitName: "6단원: 부등식",
    testName: "2025-1학기 기말고사 대비",
    questionCount: 25,
  },
  {
    id: "paper-007",
    unitName: "1단원 종합",
    testName: "오답노트 클리닉",
    questionCount: 25,
  },
  {
    id: "paper-008",
    unitName: "2단원 종합",
    testName: "심화 문제 풀이",
    questionCount: 25,
  },
  {
    id: "paper-009",
    unitName: "3단원 종합",
    testName: "월말 평가",
    questionCount: 25,
  },
  {
    id: "paper-010",
    unitName: "4단원 종합",
    testName: "온라인 모의고사",
    questionCount: 25,
  },
];

export function TestPaperListTab() {
  // Use static fake data directly (no state needed)
  const papers = fakeTestPaperData;
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [selectedPaper, setSelectedPaper] = useState<TestPaper | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // 문제 모달 관련 상태
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [currentProblemNumber, setCurrentProblemNumber] = useState(1);
  const [currentTestPaper, setCurrentTestPaper] = useState<TestPaper | null>(
    null,
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(papers.map((p) => p.id)));
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

  const handleOpenPrint = (paper: TestPaper) => {
    setSelectedPaper(paper);
    setIsPrintModalOpen(true);
  };

  const handleOpenProblemModal = (paper: TestPaper) => {
    setCurrentTestPaper(paper);
    setCurrentProblemNumber(1);
    setIsProblemModalOpen(true);
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedPaper(null);
  };

  const handleCloseProblemModal = () => {
    setIsProblemModalOpen(false);
    setCurrentTestPaper(null);
    setCurrentProblemNumber(1);
  };

  const handlePreviousProblem = () => {
    if (currentProblemNumber > 1) {
      setCurrentProblemNumber(currentProblemNumber - 1);
    }
  };

  const handleNextProblem = () => {
    if (
      currentTestPaper &&
      currentProblemNumber < currentTestPaper.questionCount
    ) {
      setCurrentProblemNumber(currentProblemNumber + 1);
    }
  };

  // 가상의 문제 데이터 생성 함수
  const generateProblemData = (testPaper: TestPaper) => {
    const problems = [];
    for (let i = 1; i <= testPaper.questionCount; i++) {
      problems.push({
        number: i,
        text: `${testPaper.unitName} - ${i}번 문제입니다. 이 문제는 ${testPaper.testName}의 ${i}번째 문제로, 수학적 사고력을 요구하는 문제입니다.`,
        image: `/path/to/problem${i}-image.png`,
      });
    }
    return problems;
  };

  const currentProblemData = currentTestPaper
    ? generateProblemData(currentTestPaper)
    : [];
  const currentProblem = currentProblemData.find(
    (p) => p.number === currentProblemNumber,
  );

  return (
    <div className="space-y-4 w-full">
      <div className="text-[2.5rem] font-bold">시험지 목록</div>

      {/* 1. 툴바 영역: 필터와 삭제 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline">전체</Button>
          <SelectGrade />
        </div>
        <Button variant="destructive" disabled={selectedIds.size === 0}>
          삭제
        </Button>
      </div>

      {/* 2. 테이블 컴포넌트 */}
      <TestPaperTable
        papers={papers}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
        onOpenPrint={handleOpenPrint}
        onOpenProblemModal={handleOpenProblemModal}
      />

      {/* 3. 페이지네이션 컴포넌트 */}
      <PagePagination />

      {/* 인쇄 옵션 모달 */}
      <PrintOptionsModal
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
        onConfirm={(selectedItems) => {
          console.log("선택된 인쇄 항목:", selectedItems);
          console.log("선택된 시험지:", selectedPaper);
          // 여기에 실제 인쇄 로직 구현
        }}
      />

      {/* 문제 모달 */}
      {currentProblem && currentTestPaper && (
        <ProblemModal
          isOpen={isProblemModalOpen}
          onClose={handleCloseProblemModal}
          problemNumber={currentProblem.number}
          problemText={currentProblem.text}
          geometryImage={currentProblem.image}
          hasPrevious={currentProblemNumber > 1}
          hasNext={currentProblemNumber < currentTestPaper.questionCount}
          onPrevious={handlePreviousProblem}
          onNext={handleNextProblem}
        />
      )}
    </div>
  );
}
