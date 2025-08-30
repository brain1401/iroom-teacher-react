// src/components/test/TestListTab.tsx
import { TestTable } from "./TestListTable";
import { TestSubmissionTable } from "./TestSubmissionTable";
import { PagePagination } from "@/components/layout/PagePagination";
import { Toolbar } from "@/components/layout/Toolbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTestList } from "@/hooks/test/useTestList";

/**
 * 시험 목록 탭 컴포넌트 Props
 */
type TestListTabProps = {
  /** 선택된 시험 ID (대시보드에서 전달) */
  selectedTestId?: string;
  /** 선택된 시험명 (대시보드에서 전달) */
  selectedTestName?: string;
};

/**
 * 시험 목록 탭 컴포넌트
 * @description 시험 목록을 표시하고 관리하는 메인 컴포넌트
 *
 * 주요 기능:
 * - 시험 목록 표시
 * - 검색 및 필터링
 * - 선택된 항목 관리
 * - 삭제 기능
 * - 상세 정보 모달
 * - 대시보드에서 선택된 시험 하이라이트
 */
export function TestListTab({
  selectedTestId,
  selectedTestName,
}: TestListTabProps) {
  const {
    // 상태
    filteredPapers,
    selectedIds,
    activeModal,
    selectedPaper,
    fakeTestSubmitStatusDetail,
    filters,

    // 액션
    setSearchKeyword,
    setSearchScope,
    setSelectedGrade,
    handleSelectAll,
    handleSelect,
    handleDeleteSelected,
    handleOpenPrint,
    handleOpenDetail,
    handleClose,
  } = useTestList();

  // 검색 범위 옵션
  const searchScopeOptions = [
    { value: "all", label: "시험명+단원명" },
    { value: "testName", label: "시험명" },
    { value: "unitName", label: "단원명" },
  ];

  return (
    <div className="space-y-4 w-full">
      <div className="text-[2.5rem] font-bold">시험 목록</div>

      {/* 선택된 시험 정보 표시 */}
      {selectedTestId && selectedTestName && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800">
              선택된 시험:
            </span>
            <span className="text-blue-600">{selectedTestName}</span>
          </div>
        </div>
      )}

      {/* 1. 툴바 영역: 필터와 검색 */}
      <Toolbar
        searchKeyword={filters.searchKeyword}
        onSearchChange={setSearchKeyword}
        searchScope={filters.searchScope}
        onSearchScopeChange={(value) => setSearchScope(value as any)}
        searchScopeOptions={searchScopeOptions}
        selectedCount={selectedIds.size}
        onDelete={handleDeleteSelected}
        isShowGradeSelect={true}
      />

      {/* 2. 테이블 컴포넌트 */}
      <TestTable
        papers={filteredPapers}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
        onOpenPrint={handleOpenPrint}
        onOpenDetail={handleOpenDetail}
      />

      {/* 4. 모달: 시험 제출 현황 다이얼로그 */}
      <Dialog
        open={activeModal !== null}
        onOpenChange={(o) => {
          if (!o) handleClose();
        }}
      >
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          {activeModal === "detail" && selectedPaper && (
            <>
              <DialogHeader>
                <DialogTitle>시험 제출 현황</DialogTitle>
                <DialogDescription>
                  {selectedPaper.testName} - {selectedPaper.unitName}
                </DialogDescription>
              </DialogHeader>
              {/* 시험 제출 현황 테이블 */}
              <div className="overflow-y-auto max-h-[60vh]">
                <TestSubmissionTable
                  submissions={fakeTestSubmitStatusDetail.filter(
                    (submission) =>
                      submission.testName === selectedPaper.testName,
                  )}
                  selectedIds={new Set()}
                  onSelectAll={() => {}}
                  onSelect={() => {}}
                  onOpenDetail={(submission) => {
                    console.log("학생 상세 정보:", submission);
                    alert(
                      `${submission.student.name} 학생의 상세 정보를 확인합니다.`,
                    );
                  }}
                  onDownloadAnswer={(submission) => {
                    console.log("답안 다운로드:", submission);
                    alert(
                      `${submission.student.name} 학생의 답안을 다운로드합니다.`,
                    );
                  }}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
