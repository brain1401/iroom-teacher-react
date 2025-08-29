// src/routes/test-paper/_components/TestPaperListTab.tsx

import { useState } from "react";
import { TestPaperTable } from "./TestPaperTable";
import { Button } from "@/components/ui/button";
import { SelectGrade } from "../layout/SelectGrade";
import { PagePagination } from "../layout/PagePagination";
import { ProblemModal } from "../layout/ProblemModal";
import { PrintOptionsModal } from "./PrintOptionsModal";
import { Input } from "@/components/ui/input";
import { Trash2, Search, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TestPaper = {
  id: string;
  unitName: string;
  testName: string;
  questionCount: number;
  createdAt?: string;
};

const fakeTestPaperData: TestPaper[] = [
  {
    id: "paper-001",
    unitName: "1단원: 다항식의 연산",
    testName: "2025-1학기 중간고사 대비",
    questionCount: 20,
    createdAt: "2025-01-15T14:30:00Z",
  },
  {
    id: "paper-002",
    unitName: "2단원: 나머지정리와 인수분해",
    testName: "2025-1학기 중간고사 대비",
    questionCount: 20,
    createdAt: "2025-01-16T09:15:00Z",
  },
  {
    id: "paper-003",
    unitName: "3단원: 복소수와 이차방정식",
    testName: "단원 평가 (A)",
    questionCount: 20,
    createdAt: "2025-01-17T16:45:00Z",
  },
  {
    id: "paper-004",
    unitName: "4단원: 이차방정식과 이차함수",
    testName: "단원 평가 (B)",
    questionCount: 20,
    createdAt: "2025-01-18T11:20:00Z",
  },
  {
    id: "paper-005",
    unitName: "5단원: 여러 가지 방정식",
    testName: "2025-1학기 기말고사 대비",
    questionCount: 25,
    createdAt: "2025-01-19T13:10:00Z",
  },
  {
    id: "paper-006",
    unitName: "6단원: 부등식",
    testName: "2025-1학기 기말고사 대비",
    questionCount: 25,
    createdAt: "2025-01-20T15:30:00Z",
  },
  {
    id: "paper-007",
    unitName: "1단원 종합",
    testName: "오답노트 클리닉",
    questionCount: 25,
    createdAt: "2025-01-21T10:45:00Z",
  },
  {
    id: "paper-008",
    unitName: "2단원 종합",
    testName: "심화 문제 풀이",
    questionCount: 25,
    createdAt: "2025-01-22T14:20:00Z",
  },
  {
    id: "paper-009",
    unitName: "3단원 종합",
    testName: "월말 평가",
    questionCount: 25,
    createdAt: "2025-01-23T16:55:00Z",
  },
  {
    id: "paper-010",
    unitName: "4단원 종합",
    testName: "온라인 모의고사",
    questionCount: 25,
    createdAt: "2025-01-24T12:30:00Z",
  },
];

export function TestPaperListTab() {
  // Use static fake data directly (no state needed)
  const papers = fakeTestPaperData;
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [selectedPaper, setSelectedPaper] = useState<TestPaper | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // 정렬 상태
  const [sortField, setSortField] = useState<
    "unitName" | "testName" | "createdAt" | undefined
  >(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 검색 상태
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [searchScope, setSearchScope] = useState<
    "both" | "unitName" | "testName"
  >("both");

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

  const handleOpenAnswerModal = (paper: TestPaper) => {
    // 답안 모달 열기 로직 (임시로 콘솔 출력)
    console.log("답안 모달 열기:", paper);
    alert(`${paper.testName}의 답안을 확인합니다.`);
  };

  // 개별 삭제 핸들러
  const handleDelete = (paper: TestPaper) => {
    console.log("시험지 삭제:", paper);
    if (confirm(`${paper.testName}을(를) 삭제하시겠습니까?`)) {
      // TODO: 실제 삭제 로직 구현
      alert(`${paper.testName}이(가) 삭제되었습니다.`);
    }
  };

  // 전체 삭제 핸들러
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    const selectedPapers = papers.filter((paper) => selectedIds.has(paper.id));
    const paperNames = selectedPapers.map((paper) => paper.testName).join(", ");

    if (
      confirm(
        `선택된 ${selectedIds.size}개의 시험지(${paperNames})를 삭제하시겠습니까?`,
      )
    ) {
      // TODO: 실제 삭제 로직 구현
      alert(`${selectedIds.size}개의 시험지가 삭제되었습니다.`);
      // 선택 상태 초기화
      setSelectedIds(new Set());
    }
  };

  // 정렬 처리 함수
  const handleSort = (field: "unitName" | "testName" | "createdAt") => {
    if (sortField === field) {
      // 같은 필드 클릭 시 순서 변경
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 다른 필드 클릭 시 해당 필드로 변경하고 오름차순으로 설정
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 검색 필터링된 데이터 (검색 범위에 따라 필터링)
  const filteredPapers = papers.filter((paper) => {
    if (!searchKeyword.trim()) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (searchScope) {
      case "unitName":
        return paper.unitName.toLowerCase().includes(keyword);
      case "testName":
        return paper.testName.toLowerCase().includes(keyword);
      case "both":
      default:
        return (
          paper.unitName.toLowerCase().includes(keyword) ||
          paper.testName.toLowerCase().includes(keyword)
        );
    }
  });

  // 정렬된 데이터
  const sortedPapers = [...filteredPapers].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case "unitName":
        aValue = a.unitName;
        bValue = b.unitName;
        break;
      case "testName":
        aValue = a.testName;
        bValue = b.testName;
        break;
      case "createdAt":
        aValue = a.createdAt || "";
        bValue = b.createdAt || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

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
    <div className="flex flex-col h-full space-y-4">
      <div className="text-[2.5rem] font-bold flex-shrink-0">시험지 목록</div>

      {/* 1. 툴바 영역: 필터와 검색 */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <SelectGrade />
          {/* 삭제 아이콘 - 체크된 항목이 있을 때만 표시 */}
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="h-8 px-2"
              title={`선택된 ${selectedIds.size}개 삭제`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1 text-xs">({selectedIds.size})</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 검색 범위 선택 드롭다운 */}
          <Select
            value={searchScope}
            onValueChange={(value: "both" | "unitName" | "testName") =>
              setSearchScope(value)
            }
          >
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">단원정보+시험지명</SelectItem>
              <SelectItem value="unitName">단원정보</SelectItem>
              <SelectItem value="testName">시험지명</SelectItem>
            </SelectContent>
          </Select>

          {/* 검색 입력창 */}
          <div className="relative">
            <Input
              placeholder="검색어를 입력하세요."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-64 h-8 pr-8"
            />
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* 2. 테이블 컴포넌트 - 스크롤 영역 */}
      <div className="flex-1 min-h-0">
        <TestPaperTable
          papers={sortedPapers}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelect={handleSelect}
          onOpenPrint={handleOpenPrint}
          onOpenProblemModal={handleOpenProblemModal}
          onOpenAnswerModal={handleOpenAnswerModal}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
        />
      </div>

      {/* 3. 페이지네이션 컴포넌트 */}
      <PagePagination className="flex-shrink-0" />

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
