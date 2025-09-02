/**
 * 고급 필터링을 지원하는 시험 목록 탭 컴포넌트
 * @description 종합적인 필터 사이드바와 함께 시험 목록을 관리하는 컴포넌트
 */

import { useAtom, useAtomValue } from "jotai";
import { Filter, SidebarClose, SidebarOpen } from "lucide-react";

// Components
import { ExamTable } from "./ExamListTable";
import { ExamSubmissionTable } from "./ExamSubmissionTable";
import { ExamFilterSidebar } from "./ExamFilterSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  showFilterSidebarAtom,
  collapsedFilterSidebarAtom,
  activeFiltersCountAtom,
} from "@/atoms/examFilters";
import { useExamListWithFilters } from "@/hooks/exam/useExamListWithFilters";
import type { ExamSubmitStatusDetail } from "@/types/exam";
import { cn } from "@/lib/utils";

/**
 * 고급 시험 목록 탭 컴포넌트 Props
 */
type Props = {
  /**
   * 선택된 시험 ID (대시보드에서 전달)
   */
  selectedExamId?: string;

  /**
   * 선택된 시험명 (대시보드에서 전달)
   */
  selectedExamName?: string;

  /**
   * 컴포넌트 클래스명
   */
  className?: string;
};

/**
 * 고급 필터링을 지원하는 시험 목록 관리 탭 컴포넌트
 * @description 종합적인 필터 사이드바와 향상된 검색 기능을 제공하는 시험 목록 인터페이스
 *
 * 주요 개선사항:
 * - 왼쪽 사이드바를 통한 고급 필터링 시스템
 * - 실시간 필터 적용 및 결과 업데이트
 * - 필터 상태 영구 저장 (localStorage)
 * - 사이드바 축소/확장 기능
 * - 반응형 레이아웃 지원
 * - 활성 필터 개수 표시
 * - 필터 프리셋 시스템
 *
 * 필터 카테고리:
 * 1. **빠른 필터** - 프리셋 버튼으로 일반적인 필터 조합 제공
 * 2. **검색 필터** - 고급 검색 옵션과 함께 텍스트 검색
 * 3. **상태 필터** - 난이도 다중 선택
 * 4. **날짜 필터** - 생성일/수정일 범위 선택
 * 5. **성과 필터** - 문항 수, 참여율 슬라이더 범위 설정
 * 6. **콘텐츠 필터** - 단원, 시험 유형 다중 선택
 *
 * 레이아웃 구조:
 * ```
 * ┌─────────────────┬──────────────────────────────┐
 * │                 │ Header (Title + Selected)    │
 * │   Filter        ├──────────────────────────────┤
 * │   Sidebar       │ Table Content                │
 * │   (Collapsible) │                              │
 * │                 │ Pagination                   │
 * └─────────────────┴──────────────────────────────┘
 * ```
 *
 * 상태 관리:
 * - 필터 상태: Jotai 원자들로 전역 관리
 * - 사이드바 상태: 표시/숨김, 축소/확장 상태 영구 저장
 * - 로컬 상태: 모달, 선택된 항목 등 일시적 상태
 *
 * 성능 최적화:
 * - 메모이제이션된 필터링 로직
 * - 조건부 렌더링으로 불필요한 계산 방지
 * - 가상화 지원 준비 (대용량 데이터)
 *
 * 접근성:
 * - 키보드 네비게이션 완전 지원
 * - 스크린 리더 친화적 구조
 * - 적절한 ARIA 레이블링
 * - 고대비 색상 지원
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * <EnhancedExamSheetListTab />
 *
 * // 대시보드 연동
 * <EnhancedExamSheetListTab
 *   selectedExamId="exam-001"
 *   selectedExamName="중간고사 수학"
 * />
 * ```
 */
export function EnhancedExamSheetListTab({
  selectedExamId,
  selectedExamName,
  className,
}: Props) {
  // 사이드바 상태
  const [showSidebar, setShowSidebar] = useAtom(showFilterSidebarAtom);
  const [isCollapsed, setIsCollapsed] = useAtom(collapsedFilterSidebarAtom);
  const activeFiltersCount = useAtomValue(activeFiltersCountAtom);

  // 시험 목록 데이터 및 액션
  const {
    filteredSheets,
    selectedIds,
    activeModal,
    selectedSheet,
    fakeExamSubmitStatusDetail,
    availableFilterOptions,
    handleSelectAll,
    handleSelect,
    handleDeleteSelected,
    handleOpenPrint,
    handleOpenDetail,
    handleClose,
  } = useExamListWithFilters();

  return (
    <div className={cn("flex h-full gap-4", className)}>
      {/* 필터 사이드바 */}
      {showSidebar && (
        <ExamFilterSidebar
          availableUnits={availableFilterOptions.availableUnits}
          availableExamTypes={availableFilterOptions.availableExamTypes}
          className="flex-shrink-0"
        />
      )}

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* 헤더 영역 */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-[2.5rem] font-bold">시험 목록</h1>

              {/* 필터 토글 버튼 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="h-8 px-3"
                  title={
                    showSidebar ? "필터 사이드바 숨기기" : "필터 사이드바 보기"
                  }
                >
                  {showSidebar ? (
                    <SidebarClose className="h-4 w-4 mr-1" />
                  ) : (
                    <SidebarOpen className="h-4 w-4 mr-1" />
                  )}
                  <Filter className="h-4 w-4 mr-1" />
                  필터
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                {/* 필터 축소/확장 버튼 (사이드바가 보일 때만) */}
                {showSidebar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 px-2"
                    title={isCollapsed ? "필터 상세 보기" : "필터 축소"}
                  >
                    {isCollapsed ? "상세" : "축소"}
                  </Button>
                )}
              </div>
            </div>

            {/* 선택된 시험 정보 표시 */}
            {selectedExamId && selectedExamName && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">
                    선택된 시험:
                  </span>
                  <span className="text-blue-600 font-medium">
                    {selectedExamName}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 결과 요약 */}
          <div className="text-right text-sm text-muted-foreground">
            <div>총 {filteredSheets.length}개의 시험</div>
            {selectedIds.size > 0 && (
              <div className="text-blue-600 font-medium">
                {selectedIds.size}개 선택됨
              </div>
            )}
            {activeFiltersCount > 0 && (
              <div className="text-orange-600">
                {activeFiltersCount}개 필터 활성
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 테이블 영역 */}
        <div className="flex-1">
          {filteredSheets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-muted-foreground text-lg mb-2">
                조건에 맞는 시험이 없습니다
              </div>
              <div className="text-sm text-muted-foreground">
                다른 필터 조건을 시도해보세요
              </div>
            </div>
          ) : (
            <ExamTable
              sheets={filteredSheets}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelect={handleSelect}
              onOpenPrint={handleOpenPrint}
              onOpenDetail={handleOpenDetail}
              selectedExamId={selectedExamId}
            />
          )}
        </div>

        {/* 선택된 항목 일괄 작업 */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <span className="font-medium">{selectedIds.size}개</span>의 시험이
              선택되었습니다
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(false)}
                className="h-8"
              >
                선택 해제
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="h-8"
              >
                삭제 ({selectedIds.size})
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 상세 정보 모달 */}
      <Dialog
        open={activeModal !== null}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden">
          {activeModal === "detail" && selectedSheet && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  시험 제출 현황
                  <Badge variant="outline">{selectedSheet.status}</Badge>
                </DialogTitle>
                <DialogDescription>
                  <div className="space-y-1">
                    <div>
                      <strong>시험명:</strong> {selectedSheet.examName}
                    </div>
                    <div>
                      <strong>단원명:</strong> {selectedSheet.unitName}
                    </div>
                    <div>
                      <strong>문항 수:</strong> {selectedSheet.questionCount}
                      문항
                    </div>
                    <div>
                      <strong>난이도:</strong> {selectedSheet.questionLevel}
                    </div>
                    <div>
                      <strong>참여율:</strong>{" "}
                      {selectedSheet.actualParticipants}/
                      {selectedSheet.totalParticipants}명 (
                      {(
                        (selectedSheet.actualParticipants /
                          selectedSheet.totalParticipants) *
                        100
                      ).toFixed(1)}
                      %)
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>

              {/* 시험 제출 현황 테이블 */}
              <ScrollArea className="flex-1 max-h-[60vh]">
                <ExamSubmissionTable
                  submissions={fakeExamSubmitStatusDetail.filter(
                    (submission: ExamSubmitStatusDetail) =>
                      submission.examName === selectedSheet.examName,
                  )}
                  selectedIds={new Set()}
                  onSelectAll={() => {}}
                  onSelect={() => {}}
                  onOpenDetail={(submission: ExamSubmitStatusDetail) => {
                    console.log("학생 상세 정보:", submission);
                    alert(
                      `${submission.student.name} 학생의 상세 정보를 확인합니다.`,
                    );
                  }}
                  onDownloadAnswer={(submission: ExamSubmitStatusDetail) => {
                    console.log("답안 다운로드:", submission);
                    alert(
                      `${submission.student.name} 학생의 답안을 다운로드합니다.`,
                    );
                  }}
                />
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
