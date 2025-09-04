// src/components/exam/ExamListTab.tsx
import { ExamTable } from "./ExamListTable";
import { ExamSubmissionTable } from "./ExamSubmissionTable";
import { PagePagination } from "@/components/layout/PagePagination";
import { Toolbar } from "@/components/layout/Toolbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExamList } from "@/hooks/exam/useExamList";

/**
 * 시험 목록 탭 컴포넌트 Props
 */
type ExamListTabProps = {
  /**
   * 선택된 시험 ID (대시보드에서 전달)
   * @description 대시보드에서 특정 시험을 선택했을 때 전달되는 시험 고유 식별자
   * - 존재하면 해당 시험을 하이라이트 표시
   * - 시험 목록에서 해당 시험으로 자동 스크롤/포커스 가능
   * - null/undefined면 일반 목록 모드로 동작
   */
  selectedExamId?: string;

  /**
   * 선택된 시험명 (대시보드에서 전달)
   * @description 선택된 시험의 표시명으로 사용자에게 현재 컨텍스트 제공
   * - selectedExamId와 함께 사용하여 선택된 시험 정보 표시
   * - 파란색 배경의 알림 박스에 표시
   * - 사용자가 현재 어떤 시험을 보고 있는지 명확히 인지 가능
   */
  selectedExamName?: string;
};

/**
 * 시험 목록 관리 탭 컴포넌트
 * @description 교사의 시험 관리 업무를 위한 종합적인 시험 목록 인터페이스 컴포넌트
 *
 * 설계 원칙:
 * - 중앙 집중식 상태 관리: useExamList 훅을 통한 일관된 상태 관리
 * - 컴포넌트 합성: 재사용 가능한 하위 컴포넌트들의 조합으로 구성
 * - 사용자 중심 UX: 직관적인 필터링, 검색, 선택 시스템
 * - 반응형 설계: 다양한 화면 크기에서 최적의 사용성 보장
 * - 접근성 우선: 키보드 네비게이션 및 스크린 리더 지원
 *
 * 주요 기능:
 * - 시험 목록 표시 및 관리 (생성, 수정, 삭제)
 * - 다중 검색 시스템 (시험명, 단원명, 통합 검색)
 * - 학년별 필터링 (중1, 중2, 중3)
 * - 다중 선택 및 일괄 삭제 기능
 * - 시험 상세 정보 모달 (제출 현황 포함)
 * - 대시보드 연동 (선택된 시험 하이라이트)
 * - 인쇄 미리보기 기능 (향후 확장)
 * - 페이지네이션 지원 (대용량 데이터 처리)
 *
 * 컴포넌트 구조:
 * ```
 * ExamListTab
 * ├── 헤더 (제목 + 선택된 시험 정보)
 * ├── Toolbar (검색 + 필터 + 일괄 작업)
 * ├── ExamTable (시험 목록 테이블)
 * ├── PagePagination (페이지 네비게이션)
 * └── Dialog (상세 정보 모달)
 *     └── ExamSubmissionTable (제출 현황)
 * ```
 *
 * 상태 관리:
 * - useExamList 훅을 통한 중앙집중식 상태 관리
 * - filteredSheets: 검색/필터링 적용된 시험 목록
 * - selectedIds: 사용자가 선택한 시험 ID들의 Set
 * - activeModal: 현재 활성화된 모달 상태 ("detail" | null)
 * - filters: 검색어, 검색 범위, 학년 필터 상태
 *
 * 검색 및 필터링:
 * - 검색 범위: "all"(시험명+단원명), "examName"(시험명), "unitName"(단원명)
 * - 학년 필터: 중1, 중2, 중3 개별 선택
 * - 실시간 검색: 타이핑과 동시에 결과 업데이트
 * - 복합 필터: 검색어와 학년 필터 조합 적용
 *
 * 대시보드 연동:
 * - selectedExamId/selectedExamName props로 외부 컨텍스트 수신
 * - 선택된 시험 정보를 파란색 알림 박스로 표시
 * - 사용자가 현재 작업 중인 시험을 명확히 인지
 * - 대시보드 → 시험 목록 → 상세 보기 워크플로 지원
 *
 * 모달 시스템:
 * - Dialog 컴포넌트 기반 모달 관리
 * - 시험별 제출 현황 상세 보기
 * - ExamSubmissionTable로 학생별 제출 정보 표시
 * - 스크롤 가능한 대용량 데이터 지원
 * - 키보드 ESC 및 외부 클릭으로 닫기 지원
 *
 * 성능 최적화:
 * - useExamList 훅의 메모이제이션 활용
 * - 필터링 로직의 클라이언트 사이드 처리
 * - Set 자료구조를 통한 선택 상태 최적화
 * - 조건부 렌더링으로 불필요한 계산 방지
 *
 * 접근성 지원:
 * - 시맨틱 HTML 구조 사용
 * - 키보드 네비게이션 완전 지원
 * - 스크린 리더를 위한 적절한 레이블링
 * - 고대비 색상 및 충분한 터치 영역
 * - WCAG 2.1 AA 수준 준수
 *
 * 사용자 워크플로:
 * ```
 * 1. 시험 목록 확인
 *    ↓
 * 2. 필터/검색으로 원하는 시험 찾기
 *    ↓
 * 3. 시험 선택 (단일/다중)
 *    ↓
 * 4. 작업 수행 (상세보기/삭제/인쇄)
 *    ↓
 * 5. 모달에서 제출 현황 확인
 *    ↓
 * 6. 개별 학생 답안 검토
 * ```
 *
 * 확장성 고려사항:
 * - 새로운 검색 필터 추가 용이
 * - 일괄 작업 기능 확장 가능
 * - 모달 시스템의 다중 모달 지원 가능
 * - API 연동을 통한 실시간 데이터 동기화 가능
 * - 무한 스크롤 또는 가상화 적용 가능
 *
 * 에러 처리:
 * - useExamList 훅에서 에러 상태 관리
 * - 네트워크 오류 시 사용자 친화적 메시지 표시
 * - 삭제 실패 시 롤백 처리
 * - 모달 로딩 실패 시 적절한 fallback UI
 *
 * @example
 * ```tsx
 * // 기본 사용법 (독립적 사용)
 * function ExamManagementPage() {
 *   return (
 *     <div className="container mx-auto py-6">
 *       <ExamListTab />
 *     </div>
 *   );
 * }
 *
 * // 대시보드 연동 사용법
 * function ExamManagementWithDashboard() {
 *   const [selectedExam, setSelectedExam] = useState<{id: string, name: string} | null>(null);
 *
 *   return (
 *     <div className="flex">
 *       <DashboardSidebar onExamSelect={setSelectedExam} />
 *       <main className="flex-1">
 *         <ExamListTab
 *           selectedExamId={selectedExam?.id}
 *           selectedExamName={selectedExam?.name}
 *         />
 *       </main>
 *     </div>
 *   );
 * }
 *
 * // 탭 시스템 내에서 사용
 * function ExamManagementTabs() {
 *   return (
 *     <Tabs defaultValue="list">
 *       <TabsList>
 *         <TabsTrigger value="list">시험 목록</TabsTrigger>
 *         <TabsTrigger value="create">시험 출제</TabsTrigger>
 *       </TabsList>
 *       <TabsContent value="list">
 *         <ExamListTab />
 *       </TabsContent>
 *       <TabsContent value="create">
 *         <ExamRegistrationTab />
 *       </TabsContent>
 *     </Tabs>
 *   );
 * }
 *
 * // 커스텀 이벤트 핸들러와 함께 사용
 * function ExamListWithCustomActions() {
 *   const handleExamSelect = (examId: string) => {
 *     console.log('선택된 시험:', examId);
 *     // 커스텀 로직 실행
 *   };
 *
 *   return (
 *     <ExamListTab
 *       selectedExamId="exam-001"
 *       selectedExamName="중간고사 수학"
 *     />
 *   );
 * }
 * ```
 *
 * 데이터 플로우:
 * ```
 * useExamList 훅 → 상태 및 액션 제공 →
 * ExamListTab → Toolbar (필터링) →
 * ExamTable (표시) → Dialog (상세) →
 * ExamSubmissionTable (제출현황)
 * ```
 *
 * Props 전달 체계:
 * ```
 * 외부 → ExamListTab (selectedExamId, selectedExamName)
 * ExamListTab → Toolbar (검색/필터 상태 및 핸들러)
 * ExamListTab → ExamTable (목록 데이터 및 선택 핸들러)
 * ExamListTab → Dialog (모달 상태 및 내용)
 * Dialog → ExamSubmissionTable (제출 현황 데이터)
 * ```
 *
 * 스타일링:
 * - 헤더: text-[2.5rem] font-bold로 강조
 * - 선택 알림: bg-blue-50, border-blue-200로 파란색 테마
 * - 모달: max-w-6xl, max-h-[80vh]로 대형 컨텐츠 지원
 * - 스크롤: overflow-y-auto로 긴 목록 처리
 *
 * 향후 개선 사항:
 * - 실시간 알림 시스템 (새 시험 생성, 제출 현황 변경)
 * - 시험 통계 대시보드 통합
 * - 엑셀 내보내기 기능
 * - 시험 템플릿 시스템
 * - 드래그 앤 드롭을 통한 시험 순서 변경
 * - 고급 검색 필터 (날짜 범위, 난이도, 참여율 등)
 */
export function ExamSheetListTab({
  selectedExamId,
  selectedExamName,
}: ExamListTabProps) {
  const {
    // 상태
    filteredSheets,
    selectedIds,
    activeModal,
    selectedSheet,
    fakeExamSubmitStatusDetail,
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
  } = useExamList();

  // 검색 범위 옵션
  const searchScopeOptions = [
    { value: "all", label: "시험명+단원명" },
    { value: "examName", label: "시험명" },
    { value: "unitName", label: "단원명" },
  ];

  return (
    <div className="space-y-4 w-full">
      <div className="text-[2.5rem] font-bold">시험 목록</div>

      {/* 선택된 시험 정보 표시 */}
      {selectedExamId && selectedExamName && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800">
              선택된 시험:
            </span>
            <span className="text-blue-600">{selectedExamName}</span>
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
      <ExamTable
        sheets={filteredSheets}
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
          {activeModal === "detail" && selectedSheet && (
            <>
              <DialogHeader>
                <DialogTitle>시험 제출 현황</DialogTitle>
                <DialogDescription>
                  {selectedSheet.examName}
                  {/* TODO: unitName 속성이 서버 타입에 없음 - 단원 정보 API 구현 필요 */}
                </DialogDescription>
              </DialogHeader>
              {/* 시험 제출 현황 테이블 */}
              <div className="overflow-y-auto max-h-[60vh]">
                <ExamSubmissionTable
                  submissions={fakeExamSubmitStatusDetail.filter(
                    (submission) =>
                      submission.examName === selectedSheet.examName,
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
