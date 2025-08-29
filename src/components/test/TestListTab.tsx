// src/routes/test-paper/_components/TestListTab.tsx

import { useState } from "react";
import { TestTable } from "./TestListTable";
import { Button } from "@/components/ui/button";
import { SelectGrade } from "../layout/SelectGrade";
import { PagePagination } from "@/components/layout/PagePagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash2 } from "lucide-react";
import type { TestLevel, TestStatus } from "@/types/test";

type Test = {
  id: string;
  unitName: string;
  testName: string;
  questionCount: number;
  questionLevel: TestLevel;
  status: TestStatus;
  createdAt: string;
  updatedAt: string;
};

type TestSubmitStatusDetail = {
  name: string;
  phoneNumber: string;
  TestName: string;
  submissionDate: string;
  submissionManagement: string;
};

const _fakeTestSubmitStatusDetail: TestSubmitStatusDetail[] = [
  {
    name: "윤아연",
    phoneNumber: "010-9185-8023",
    TestName: "기말 대비 모의고사",
    submissionDate: "2025-01-15",
    submissionManagement: "제출",
  },
  {
    name: "윤아연",
    phoneNumber: "010-9185-8023",
    TestName: "기말 대비 모의고사",
    submissionDate: "2025-01-15",
    submissionManagement: "제출",
  },
  {
    name: "윤아연",
    phoneNumber: "010-9185-8023",
    TestName: "기말 대비 모의고사",
    submissionDate: "2025-01-15",
    submissionManagement: "제출",
  },
  {
    name: "윤아연",
    phoneNumber: "010-9185-8023",
    TestName: "기말 대비 모의고사",
    submissionDate: "2025-01-15",
    submissionManagement: "제출",
  },
  {
    name: "윤아연",
    phoneNumber: "010-9185-8023",
    TestName: "기말 대비 모의고사",
    submissionDate: "2025-01-15",
    submissionManagement: "제출",
  },
];

const fakeTestData: Test[] = [
  {
    id: "paper-001",
    unitName: "1단원: 다항식의 연산",
    testName: "2025-1학기 중간고사 대비",
    questionCount: 20,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "paper-002",
    unitName: "2단원: 나머지정리와 인수분해",
    testName: "2025-1학기 중간고사 대비",
    questionCount: 20,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "paper-003",
    unitName: "3단원: 복소수와 이차방정식",
    testName: "단원 평가 (A)",
    questionCount: 20,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "paper-004",
    unitName: "4단원: 이차방정식과 이차함수",
    testName: "단원 평가 (B)",
    questionCount: 20,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "paper-005",
    unitName: "5단원: 여러 가지 방정식",
    testName: "2025-1학기 기말고사 대비",
    questionCount: 25,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "paper-006",
    unitName: "6단원: 부등식",
    testName: "2025-1학기 기말고사 대비",
    questionCount: 25,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "paper-007",
    unitName: "1단원 종합",
    testName: "오답노트 클리닉",
    questionCount: 25,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "paper-008",
    unitName: "2단원 종합",
    testName: "심화 문제 풀이",
    questionCount: 25,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "paper-009",
    unitName: "3단원 종합",
    testName: "월말 평가",
    questionCount: 25,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "paper-010",
    unitName: "4단원 종합",
    testName: "온라인 모의고사",
    questionCount: 25,
    questionLevel: "기초",
    status: "승인완료",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
];

export function TestListTab() {
  // Use static fake data directly (no state needed)
  const papers = fakeTestData;
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [selectedPaper, setSelectedPaper] = useState<Test | null>(null);
  const [activeModal, setActiveModal] = useState<"print" | "detail" | null>(
    null,
  );

  // 검색 관련 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchScope, setSearchScope] = useState<
    "all" | "testName" | "unitName"
  >("all");

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

  const handleOpenPrint = (paper: Test) => {
    setSelectedPaper(paper);
    setActiveModal("print");
  };

  const handleOpenDetail = (paper: Test) => {
    setSelectedPaper(paper);
    setActiveModal("detail");
  };

  const handleClose = () => {
    setActiveModal(null);
    setSelectedPaper(null);
  };

  // 개별 삭제 핸들러
  const handleDelete = (id: string) => {
    if (confirm("정말로 이 시험을 삭제하시겠습니까?")) {
      // 실제 삭제 로직 구현 예정
      console.log("삭제된 시험 ID:", id);
    }
  };

  // 선택된 항목들 삭제 핸들러
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    if (confirm(`선택된 ${selectedIds.size}개의 시험을 삭제하시겠습니까?`)) {
      // 실제 삭제 로직 구현 예정
      console.log("삭제된 시험 ID들:", Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  // 검색 필터링된 데이터
  const filteredPapers = papers.filter((paper) => {
    if (!searchKeyword.trim()) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (searchScope) {
      case "testName":
        return paper.testName.toLowerCase().includes(keyword);
      case "unitName":
        return paper.unitName.toLowerCase().includes(keyword);
      case "all":
      default:
        return (
          paper.testName.toLowerCase().includes(keyword) ||
          paper.unitName.toLowerCase().includes(keyword)
        );
    }
  });

  return (
    <div className="space-y-4 w-full">
      <div className="text-[2.5rem] font-bold">시험 목록</div>

      {/* 1. 툴바 영역: 검색, 필터, 삭제 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* 검색 영역 */}
          <div className="flex items-center gap-2">
            <Select
              value={searchScope}
              onValueChange={(value: "all" | "testName" | "unitName") =>
                setSearchScope(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">시험명+단원명</SelectItem>
                <SelectItem value="testName">시험명</SelectItem>
                <SelectItem value="unitName">단원명</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Input
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-[250px] pr-8"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* 학년 선택 */}
          <SelectGrade />
        </div>

        {/* 삭제 버튼 */}
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleDeleteSelected}
          >
            <Trash2 className="h-4 w-4" />
            삭제 ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* 2. 테이블 컴포넌트 */}
      <TestTable
        papers={filteredPapers}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
        onOpenPrint={handleOpenPrint}
        onOpenDetail={handleOpenDetail}
        onDelete={handleDelete}
      />

      {/* 3. 페이지네이션 컴포넌트 */}
      <PagePagination />
      {/* 모달: 인쇄/상세 공용 다이얼로그 */}
      <Dialog
        open={activeModal !== null}
        onOpenChange={(o) => {
          if (!o) handleClose();
        }}
      >
        <DialogContent className="max-w-3xl">
          {activeModal === "detail" && (
            <>
              <DialogHeader>
                <DialogTitle>시험 제출 상세</DialogTitle>
                <DialogDescription>{selectedPaper?.testName}</DialogDescription>
              </DialogHeader>
              {/* 상세 정보 콘텐츠 구성 예정 */}
              <div className="space-y-2">
                <div>이름: {selectedPaper?.unitName}</div>
                <div>전화번호: {selectedPaper?.questionCount}</div>
                <div>시험: {selectedPaper?.questionCount}</div>
                <div>제출 일자: {selectedPaper?.questionCount}</div>
                <div>제출 상태: {selectedPaper?.questionCount}</div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
