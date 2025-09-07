// src/routes/exam-sheet/_components/ExamSheetTable.tsx

import type { ExamSheet } from "@/types/exam-sheet";
// 1. shadcn/ui 컴포넌트들을 모두 import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox"; // 👈 경로 수정!
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tableStyles, buttonStyles, badgeStyles } from "@/utils/commonStyles";
import {
  Printer,
  Eye,
  FileText,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { PrintButton } from "../common/PrintButton";

/**
 * 정렬 타입 정의
 */
type SortField = "examName" | "createdAt";
type SortOrder = "asc" | "desc";

/**
 * 시험지 테이블 컴포넌트 Props 타입
 * @description 시험지 목록을 테이블 형태로 표시하고 관리하는 컴포넌트의 속성 정의
 *
 * 이 Props는 대용량 시험지 데이터의 효율적 표시, 다중 선택, 정렬, 그리고
 * 각종 액션(인쇄, 미리보기, 답안 보기)을 위한 완전한 인터페이스를 제공합니다.
 *
 * 설계 철학:
 * - 교사가 생성한 모든 시험지를 한눈에 파악할 수 있는 정보 밀도
 * - 일괄 작업을 위한 다중 선택 시스템
 * - 직관적인 정렬과 필터링으로 원하는 시험지 빠른 탐색
 * - 실제 교육 현장에서 필요한 액션들의 원클릭 접근
 */
type ExamSheetTableProps = {
  /**
   * 시험지 목록 데이터
   * @description 테이블에 표시할 시험지들의 배열
   *
   * 각 ExamSheet 객체는 다음 정보를 포함:
   * - id: 고유 식별자 (선택 상태 관리 및 액션 수행 시 사용)
   * - unitName: 단원 정보 (여러 단원 포함 시 쉼표로 구분)
   * - examName: 시험지명 (사용자가 직접 입력한 제목)
   * - questionCount: 문항 수 (시험지의 규모 파악용)
   * - createdAt: 생성 일시 (ISO 문자열 형태)
   *
   * 성능 고려사항:
   * - 대용량 데이터셋을 위한 가상화(virtualization) 준비
   * - 메모이제이션으로 불필요한 리렌더링 방지
   * - 서버사이드 페이지네이션과 호환 가능한 구조
   *
   * @example
   * ```typescript
   * const sampleSheets: ExamSheet[] = [
   *   {
   *     id: "sheet-001",
   *     unitName: "1단원. 수와 연산, 2단원. 도형과 측정",
   *     examName: "1학기 중간고사",
   *     questionCount: 25,
   *     createdAt: "2024-03-15T09:30:00.000Z"
   *   }
   * ];
   * ```
   */
  sheets: ExamSheet[];

  /**
   * 선택된 시험지 ID 집합
   * @description 현재 사용자가 체크박스로 선택한 시험지들의 ID를 저장하는 Set
   *
   * Set 자료구조 선택 이유:
   * - O(1) 시간 복잡도의 포함 여부 확인
   * - 중복 자동 제거
   * - 대용량 선택 목록에서도 일정한 성능
   *
   * 사용 패턴:
   * - 개별 체크박스 상태 결정: `selectedIds.has(sheet.id)`
   * - 전체 선택 상태 계산: `selectedIds.size === sheets.length`
   * - 부분 선택 상태 확인: `selectedIds.size > 0 && selectedIds.size < sheets.length`
   *
   * @example
   * ```typescript
   * // 선택 상태 관리 예시
   * const [selectedIds, setSelectedIds] = useState(new Set<string>());
   *
   * // 개별 선택/해제
   * const toggleSelection = (id: string, checked: boolean) => {
   *   setSelectedIds(prev => {
   *     const newSet = new Set(prev);
   *     checked ? newSet.add(id) : newSet.delete(id);
   *     return newSet;
   *   });
   * };
   * ```
   */
  selectedIds: Set<string>;

  /**
   * 전체 선택 토글 핸들러
   * @description 테이블 헤더의 마스터 체크박스 클릭 시 호출되는 콜백 함수
   *
   * 동작 로직:
   * - checked === true: 현재 페이지의 모든 시험지 선택
   * - checked === false: 모든 선택 해제
   * - 중간 상태(indeterminate)에서는 전체 선택으로 변경
   *
   * 구현 고려사항:
   * - 페이지네이션 환경에서는 현재 페이지만 적용
   * - 필터링된 결과에서는 보이는 항목만 적용
   * - 대용량 데이터에서의 성능 최적화 필요
   *
   * @param checked true면 전체 선택, false면 전체 해제
   *
   * @example
   * ```typescript
   * const handleSelectAll = (checked: boolean) => {
   *   if (checked) {
   *     // 현재 페이지의 모든 시험지 ID 선택
   *     const currentPageIds = sheets.map(sheet => sheet.id);
   *     setSelectedIds(new Set(currentPageIds));
   *
   *     // 분석용 로깅
   *     analytics.track('exam_sheets_select_all', {
   *       count: currentPageIds.length
   *     });
   *   } else {
   *     // 모든 선택 해제
   *     setSelectedIds(new Set());
   *     analytics.track('exam_sheets_deselect_all');
   *   }
   * };
   * ```
   */
  onSelectAll: (checked: boolean) => void;

  /**
   * 개별 시험지 선택 토글 핸들러
   * @description 각 행의 체크박스 클릭 시 호출되는 콜백 함수
   *
   * 매개변수:
   * - id: 선택 상태를 변경할 시험지의 고유 식별자
   * - checked: true면 선택 추가, false면 선택 해제
   *
   * 부수 효과:
   * - 마스터 체크박스 상태 자동 업데이트
   * - 선택된 항목 개수에 따른 UI 상태 변경
   * - 벌크 액션 버튼의 활성화/비활성화 제어
   *
   * @param id 대상 시험지 ID
   * @param checked 새로운 선택 상태
   *
   * @example
   * ```typescript
   * const handleSelect = (id: string, checked: boolean) => {
   *   setSelectedIds(prev => {
   *     const newSet = new Set(prev);
   *
   *     if (checked) {
   *       newSet.add(id);
   *
   *       // 선택 제한 확인
   *       if (newSet.size > MAX_SELECTION_LIMIT) {
   *         toast.warning(`최대 ${MAX_SELECTION_LIMIT}개까지 선택 가능합니다.`);
   *         return prev; // 이전 상태 유지
   *       }
   *
   *       // 선택 완료 피드백
   *       toast.success(`시험지가 선택되었습니다. (${newSet.size}개 선택 중)`);
   *     } else {
   *       newSet.delete(id);
   *       toast.info(`선택이 해제되었습니다. (${newSet.size}개 선택 중)`);
   *     }
   *
   *     return newSet;
   *   });
   * };
   * ```
   */
  onSelect: (id: string, checked: boolean) => void;

  /**
   * 인쇄 모달 오픈 핸들러
   * @description 시험지 인쇄 옵션 선택 모달을 열 때 호출되는 콜백 함수
   *
   * 일반적인 인쇄 워크플로우:
   * 1. 사용자가 특정 시험지의 인쇄 버튼 클릭
   * 2. 이 핸들러가 해당 시험지 정보와 함께 호출됨
   * 3. 인쇄 옵션 모달이 열림 (문제지, 답안지, 학생용 답안지 선택)
   * 4. 사용자가 옵션을 선택하고 확인
   * 5. 실제 인쇄 또는 PDF 다운로드 수행
   *
   * 모달에서 제공할 정보:
   * - 시험지 기본 정보 (제목, 단원, 문항 수)
   * - 인쇄 형태 선택 (A4, B4 등)
   * - 출력물 종류 선택 (문제지, 정답지, 빈 답안지)
   * - 인쇄 매수 설정
   *
   * @param sheet 인쇄할 시험지 객체
   *
   * @example
   * ```typescript
   * const handleOpenPrint = (sheet: ExamSheet) => {
   *   // 인쇄 모달 상태 설정
   *   setPrintModal({
   *     isOpen: true,
   *     selectedSheet: sheet,
   *     defaultOptions: {
   *       sheetSize: 'A4',
   *       includeProblem: true,
   *       includeAnswer: false,
   *       includeStudentSheet: true,
   *       copies: 1
   *     }
   *   });
   *
   *   // 인쇄 요청 분석
   *   analytics.track('exam_sheet_print_requested', {
   *     sheetId: sheet.id,
   *     sheetName: sheet.examName,
   *     questionCount: sheet.questionCount
   *   });
   * };
   * ```
   */
  onOpenPrint: (sheet: ExamSheet) => void;

  /**
   * 문제 미리보기 모달 오픈 핸들러
   * @description 시험지의 문제 내용을 미리보기 모달로 표시할 때 호출되는 콜백 함수
   *
   * 미리보기 모달 특징:
   * - 실제 인쇄물과 동일한 레이아웃으로 표시
   * - 문제 번호, 배점, 문제 내용, 객관식 보기 포함
   * - 답안은 표시하지 않음 (학생용 시험지 형태)
   * - 확대/축소 기능으로 가독성 조절
   * - 페이지 네비게이션으로 여러 페이지 문제지 탐색
   *
   * 사용 목적:
   * - 인쇄 전 최종 검토
   * - 문제 배치와 레이아웃 확인
   * - 오타나 형식 오류 점검
   * - 난이도 분포 시각적 확인
   *
   * @param sheet 미리보기할 시험지 객체
   *
   * @example
   * ```typescript
   * const handleOpenProblemModal = (sheet: ExamSheet) => {
   *   // 문제 데이터 로딩 상태 관리
   *   setProblemPreview({
   *     isOpen: true,
   *     isLoading: true,
   *     sheet: sheet,
   *     problems: []
   *   });
   *
   *   // 시험지의 상세 문제 데이터 로드
   *   fetchExamSheetProblems(sheet.id)
   *     .then(problems => {
   *       setProblemPreview(prev => ({
   *         ...prev,
   *         isLoading: false,
   *         problems: problems
   *       }));
   *     })
   *     .catch(error => {
   *       toast.error('문제 데이터를 불러오는데 실패했습니다.');
   *       setProblemPreview(prev => ({ ...prev, isOpen: false }));
   *       logError(error, 'ExamSheetTable.handleOpenProblemModal');
   *     });
   * };
   * ```
   */
  onOpenProblemModal: (sheet: ExamSheet) => void;

  /**
   * 답안 보기 모달 오픈 핸들러
   * @description 시험지의 정답과 해설을 표시하는 모달을 열 때 호출되는 콜백 함수
   *
   * 답안 모달 구성요소:
   * - 각 문제별 정답 및 오답 선택지 분석
   * - 상세한 풀이 과정 및 해설
   * - 출제 의도 및 평가 기준 (있는 경우)
   * - 관련 개념 및 참고 자료 링크
   * - 예상 소요 시간 및 난이도 정보
   *
   * 교사용 부가 정보:
   * - 학생들의 예상 오답 패턴
   * - 채점 시 주의사항
   * - 부분점수 배점 기준
   * - 유사 문제 추천
   *
   * 보안 고려사항:
   * - 교사 권한 검증 후에만 답안 표시
   * - 답안 데이터의 암호화 전송
   * - 민감 정보 로깅 방지
   *
   * @param sheet 답안을 확인할 시험지 객체
   *
   * @example
   * ```typescript
   * const handleOpenAnswerModal = (sheet: ExamSheet) => {
   *   // 권한 확인
   *   if (!hasTeacherPermission()) {
   *     toast.error('답안 확인 권한이 없습니다.');
   *     return;
   *   }
   *
   *   setAnswerModal({
   *     isOpen: true,
   *     isLoading: true,
   *     sheet: sheet,
   *     answers: [],
   *     explanations: []
   *   });
   *
   *   // 보안된 답안 데이터 로드
   *   fetchSecureAnswers(sheet.id)
   *     .then(({ answers, explanations }) => {
   *       setAnswerModal(prev => ({
   *         ...prev,
   *         isLoading: false,
   *         answers,
   *         explanations
   *       }));
   *
   *       // 답안 접근 로깅 (보안 감사용)
   *       auditLog.record('answer_access', {
   *         teacherId: currentUser.id,
   *         sheetId: sheet.id,
   *         timestamp: new Date().toISOString()
   *       });
   *     })
   *     .catch(error => {
   *       toast.error('답안 데이터를 불러올 수 없습니다.');
   *       setAnswerModal(prev => ({ ...prev, isOpen: false }));
   *       securityLog.warn('answer_access_failed', { sheetId: sheet.id, error });
   *     });
   * };
   * ```
   */
  onOpenAnswerModal: (sheet: ExamSheet) => void;

  /**
   * 현재 정렬 필드
   * @description 테이블이 현재 어떤 필드를 기준으로 정렬되어 있는지 나타내는 값
   *
   * 사용 가능한 정렬 필드:
   * - `unitName`: 단원명 기준 정렬 (가나다순)
   * - `examName`: 시험지명 기준 정렬 (가나다순)
   * - `createdAt`: 생성일시 기준 정렬 (최신순/오래된순)
   *
   * UI 반영사항:
   * - 해당 컬럼 헤더에 정렬 화살표 표시
   * - 활성화된 정렬 컬럼의 시각적 강조
   * - 사용자의 정렬 기준 직관적 인식
   *
   * @default undefined (기본 정렬 없음)
   */
  sortField?: SortField;

  /**
   * 현재 정렬 순서
   * @description 선택된 필드를 오름차순/내림차순 중 어떤 방향으로 정렬할지 결정
   *
   * 정렬 순서:
   * - `asc`: 오름차순 (A→Z, 1→9, 과거→미래)
   * - `desc`: 내림차순 (Z→A, 9→1, 미래→과거)
   *
   * 필드별 기본 동작:
   * - unitName/examName: 첫 클릭 시 asc (가나다순)
   * - createdAt: 첫 클릭 시 desc (최신순)
   *
   * @default undefined
   */
  sortOrder?: SortOrder;

  /**
   * 정렬 변경 핸들러
   * @description 컬럼 헤더 클릭 시 정렬 기준을 변경하는 콜백 함수
   *
   * 동작 로직:
   * 1. 새로운 필드 클릭: 해당 필드의 기본 순서로 정렬
   * 2. 같은 필드 재클릭: 현재 순서의 반대로 토글
   * 3. 정렬 상태는 URL 파라미터나 로컬 스토리지에 저장 가능
   *
   * @param field 새롭게 정렬할 필드
   *
   * @example
   * ```typescript
   * const handleSort = (field: SortField) => {
   *   setSortState(prev => {
   *     // 같은 필드 클릭 시 순서 토글
   *     if (prev.sortField === field) {
   *       return {
   *         sortField: field,
   *         sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
   *       };
   *     }
   *
   *     // 새 필드 클릭 시 기본 순서 적용
   *     const defaultOrder = field === 'createdAt' ? 'desc' : 'asc';
   *     return {
   *       sortField: field,
   *       sortOrder: defaultOrder
   *     };
   *   });
   *
   *   // 정렬 기준 분석 트래킹
   *   analytics.track('exam_sheets_sorted', { field, order: newOrder });
   * };
   * ```
   */
  onSort?: (field: SortField) => void;

  /**
   * 전체 선택 여부
   * @description 현재 테이블의 모든 항목이 선택된 상태인지 나타내는 플래그
   *
   * 계산 방식:
   * - `selectedIds.size > 0 && selectedIds.size === sheets.length`
   * - 빈 목록에서는 항상 false
   * - 페이지네이션 환경에서는 현재 페이지 기준
   *
   * UI 영향:
   * - 마스터 체크박스의 checked 상태 결정
   * - 벌크 액션 버튼의 라벨 변경 ("전체 해제" vs "전체 선택")
   *
   * @default false
   */
  isAllSelected?: boolean;

  /**
   * 부분 선택 상태 여부
   * @description 일부만 선택되어 있는 중간 상태를 나타내는 플래그
   *
   * 중간 상태 조건:
   * - `selectedIds.size > 0 && selectedIds.size < sheets.length`
   * - 하나 이상 선택되었지만 전체는 아닌 상태
   *
   * 시각적 표현:
   * - 마스터 체크박스의 indeterminate 상태
   * - 보통 대시(-) 표시나 부분 채워진 체크박스로 표현
   * - 사용자에게 부분 선택 상태임을 명확히 전달
   *
   * @default false
   */
  isIndeterminate?: boolean;
};

/**
 * 시험지 테이블 메인 컴포넌트
 * @description 시험지 목록을 효율적으로 표시하고 관리하는 데이터 테이블 컴포넌트
 *
 * 주요 기능:
 * - 대용량 시험지 목록의 효율적 렌더링
 * - 다중 선택을 통한 일괄 작업 지원
 * - 컬럼별 정렬 기능으로 원하는 시험지 빠른 탐색
 * - 각 시험지별 원클릭 액션 (인쇄, 미리보기, 답안 확인)
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * - 접근성을 고려한 키보드 네비게이션
 * - 일관된 시각적 스타일과 사용자 경험
 *
 * 설계 특징:
 * - 공통 스타일 시스템 활용으로 일관성 유지
 * - 성능 최적화를 고려한 가상 스크롤 준비
 * - 서버사이드 페이지네이션과 클라이언트 정렬의 조화
 * - 교사 워크플로우에 특화된 액션 버튼 배치
 * - 모바일 환경에서도 편리한 터치 인터페이스
 *
 * 사용 시나리오:
 * - 교사가 지금까지 생성한 모든 시험지를 한눈에 보고 싶은 경우
 * - 특정 단원이나 시기에 만든 시험지들을 찾고 싶은 경우
 * - 여러 시험지를 선택해서 일괄 삭제하거나 폴더로 정리하고 싶은 경우
 * - 시험지 인쇄나 미리보기가 필요한 경우
 * - 채점을 위해 정답을 확인하고 싶은 경우
 * - 과거 출제 이력을 분석하여 새로운 시험지 기획에 참고하고 싶은 경우
 */
export function ExamSheetTable({
  sheets: sheets,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenPrint,
  onOpenProblemModal,
  onOpenAnswerModal,
  sortField,
  sortOrder,
  onSort,
  isAllSelected = false,
  isIndeterminate = false,
}: ExamSheetTableProps) {
  return (
    <div className={tableStyles.container}>
      <Table>
        {/* 2. TableHeader와 "전체 선택" 체크박스 추가 */}
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow className={tableStyles.header}>
            <TableHead className="w-[50px] text-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                className={tableStyles.checkbox}
                ref={(el) => {
                  if (el)
                    (el as HTMLInputElement).indeterminate = isIndeterminate;
                }}
              />
            </TableHead>
            <TableHead className={tableStyles.headerCell}>단원정보</TableHead>
            <SortableHeader
              field="examName"
              label="시험지명"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <TableHead className={tableStyles.headerCellCenter}>
              문항수
            </TableHead>
            <SortableHeader
              field="createdAt"
              label="생성일시"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
              className={tableStyles.headerCellCenter}
            />
            <TableHead className={tableStyles.headerCellCenter}>
              답안/미리보기/인쇄
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="max-h-[400px] overflow-y-auto">
          {sheets.map((sheet, index) => (
            <TableRow
              key={sheet.id}
              className={cn(
                tableStyles.row,
                index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
              )}
            >
              <TableCell className={tableStyles.cellCenter}>
                <Checkbox
                  checked={selectedIds.has(sheet.id)}
                  onCheckedChange={(checked) =>
                    onSelect(sheet.id, Boolean(checked))
                  }
                  className={tableStyles.checkbox}
                />
              </TableCell>
              <TableCell className={tableStyles.cellMedium}>
                <div className="flex flex-wrap gap-1">
                  {sheet.unitSummary.unitDetails
                    .slice(0, 3)
                    .map((unit, index) => (
                      <Badge
                        key={unit.unitId}
                        variant="secondary"
                        className="text-xs"
                      >
                        {unit.unitName}
                      </Badge>
                    ))}
                  {sheet.unitSummary.unitDetails.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{sheet.unitSummary.unitDetails.length - 3}개
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className={tableStyles.cell}>
                {sheet.examName}
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Badge variant="outline" className={badgeStyles.outline}>
                  {sheet.totalQuestions}문항
                </Badge>
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                {sheet.createdAt
                  ? `${new Date(sheet.createdAt)
                      .toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      .replace(/\./g, ".")
                      .replace(",", "")} 생성`
                  : "날짜 없음"}
              </TableCell>
              {/* 3. 답안/미리보기/인쇄 버튼들 추가 */}
              <TableCell className={tableStyles.cellCenter}>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenAnswerModal(sheet)}
                    className="text-xs px-2 py-1"
                  >
                    답안보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenProblemModal(sheet)}
                    className="text-xs px-2 py-1"
                  >
                    문제보기
                  </Button>
                  <PrintButton onClick={() => onOpenPrint(sheet)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * 정렬 가능한 테이블 헤더 컴포넌트
 */
function SortableHeader({
  field,
  label,
  sortField,
  sortOrder,
  onSort,
  className,
}: {
  field: SortField;
  label: string;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
  className?: string;
}) {
  const isActive = sortField === field;

  return (
    <TableHead className={cn(tableStyles.headerCell, className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-semibold hover:bg-transparent"
        onClick={() => onSort?.(field)}
      >
        {label}
        <div className="ml-1 flex items-center">
          {isActive ? (
            sortOrder === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4 flex items-center justify-center">
              <ChevronUp className="h-3 w-3 text-muted-foreground/50" />
            </div>
          )}
        </div>
      </Button>
    </TableHead>
  );
}
