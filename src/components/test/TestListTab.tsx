// src/routes/test-paper/_components/TestListTab.tsx

import { useState } from "react";
import { TestTable } from "./TestListTable";
import { Button } from "@/components/ui/button";
import SelectGrade from "../layout/SelectGrade";
import { PagePagination } from "@/components/layout/PagePagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  // ... (useState 및 핸들러 함수들은 동일)
  const [papers] = useState<Test[]>(fakeTestData);
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [selectedPaper, setSelectedPaper] = useState<Test | null>(null);
  const [activeModal, setActiveModal] = useState<"print" | "detail" | null>(
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

  return (
    <div className="space-y-4 w-full">
      <div className="text-[2.5rem] font-bold">시험 목록</div>

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
      <TestTable
        papers={papers}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
        onOpenPrint={handleOpenPrint} // ✅ 누락된 prop 추가
        onOpenDetail={handleOpenDetail}
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
