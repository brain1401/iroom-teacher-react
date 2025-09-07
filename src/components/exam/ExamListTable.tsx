// src/routes/exam-sheet/_components/ExamTable.tsx

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
import type { ServerExam as Exam } from "@/api/exam/types";
import { Link } from "@tanstack/react-router";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { PrintButton } from "../common/PrintButton";

/**
 * 시험지 테이블 컴포넌트 props 타입
 * @description 목록 렌더링, 선택 제어, 모달 오픈 콜백 전달
 *
 * 주요 속성:
 * - sheets: 시험지 목록 데이터
 * - selectedIds: 체크된 행의 ID 집합
 * - onSelectAll: 전체 선택 토글 핸들러
 * - onSelect: 개별 선택 토글 핸들러
 * - onOpenPrint: 인쇄 미리보기 모달 오픈 콜백
 * - onOpenDetail: 시험지 상세 모달 오픈 콜백
 */
/**
 * 시험 목록 테이블 컴포넌트 Props
 */
type ExamTableProps = {
  /** 시험 목록 데이터 배열 - Exam 타입의 배열로 각 시험 정보를 포함 */
  sheets: Exam[];
  /** 현재 선택된 시험 ID들의 Set - 체크박스 상태 관리용 컬렉션 */
  selectedIds: Set<string>;
  /** 전체 선택/해제 토글 핸들러 - 헤더 체크박스 클릭 시 실행 */
  onSelectAll: (checked: boolean) => void;
  /** 개별 시험 선택/해제 핸들러 - 각 행의 체크박스 클릭 시 실행 */
  onSelect: (id: string, checked: boolean) => void;
  /** 시험 인쇄 미리보기 모달 열기 핸들러 (현재 미사용, 향후 확장용) */
  onOpenPrint: (sheet: Exam) => void;
  /** 시험 상세 정보 모달 열기 핸들러 (현재 라우팅으로 대체) */
  onOpenDetail: (sheet: Exam) => void;
  /** 대시보드에서 선택된 시험 ID (하이라이트 표시용) */
  selectedExamId?: string;
};

/**
 * 시험 목록 테이블 컴포넌트
 * @description 교사의 시험 관리를 위한 종합적인 테이블 컴포넌트로 시험 목록 표시 및 관리 기능 제공
 *
 * 설계 원칙:
 * - 데이터 중심 설계: Exam 타입 기반의 완전한 시험 정보 표시
 * - 효율적인 상태 관리: Set 기반 선택 상태로 O(1) 조회 성능
 * - 시각적 정보 전달: 배지 시스템을 통한 직관적 상태 표시
 * - 접근성 우선: 키보드 네비게이션 및 스크린 리더 지원
 * - 공통 스타일 시스템: 일관된 디자인 토큰 적용
 *
 * 주요 기능:
 * - 시험 정보 표시 (단원정보, 시험명, 문항수, 난이도, 참여현황)
 * - 전체 및 개별 선택 시스템 (다중 선택 지원)
 * - 난이도별 색상 구분 배지 (상/중/하 난이도 표시)
 * - 참여 현황 배지 (실제 참여자/총 대상자 비율 표시)
 * - 시험 상세보기 링크 (TanStack Router 기반 네비게이션)
 * - 홀짝 행 색상 구분으로 가독성 향상
 * - 반응형 테이블 레이아웃
 *
 * 테이블 구조:
 * - 체크박스 열: 다중 선택을 위한 체크박스 (전체 선택 포함)
 * - 단원정보 열: 시험이 속한 단원 또는 과목 정보
 * - 시험명 열: 시험의 제목 또는 명칭
 * - 문항수 열: 총 문제 개수 (배지 형태로 표시)
 * - 시험난이도 열: 상/중/하 난이도 (색상 구분 배지)
 * - 참여현황 열: 학생 참여 통계 (ParticipationBadge 컴포넌트)
 * - 제출명단 열: 상세보기 링크 버튼
 *
 * 상태 관리:
 * - selectedIds: Set<string> 구조로 선택된 시험 ID 관리
 * - isAllSelected: 전체 선택 상태 계산 (sheets.length와 selectedIds.size 비교)
 * - 각 행의 선택 상태는 Set.has()로 효율적 확인
 *
 * 스타일링:
 * - tableStyles: 공통 테이블 스타일 시스템 활용
 * - buttonStyles: 일관된 버튼 스타일 적용
 * - badgeStyles: 상태별 배지 스타일 통합 관리
 * - 홀짝 행 구분: rowEven/rowOdd로 시각적 구분
 *
 * 네비게이션:
 * - TanStack Router Link 컴포넌트 활용
 * - 타입 안전한 라우팅 (examId 파라미터 전달)
 * - Search 파라미터로 examName 추가 전달
 * - Button의 asChild 패턴으로 접근성 유지
 *
 * 성능 최적화:
 * - Set 자료구조로 선택 상태 확인 최적화
 * - map 함수의 key에 고유 ID 사용으로 리렌더링 최적화
 * - 조건부 렌더링으로 불필요한 계산 방지
 *
 * 접근성 지원:
 * - 체크박스에 적절한 aria-label 제공
 * - 테이블 헤더와 셀의 명확한 연관성
 * - 키보드 네비게이션 지원 (Link, Button, Checkbox)
 * - 색상뿐만 아니라 텍스트로도 정보 전달
 *
 * 확장성:
 * - 정렬 기능 추가 가능 (컬럼 헤더 클릭)
 * - 필터링 기능 연동 가능
 * - 페이지네이션 지원 가능
 * - 컨텍스트 메뉴 추가 가능
 * - 드래그 앤 드롭 기능 확장 가능
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * function ExamManagementPage() {
 *   const [exams, setExams] = useState<Exam[]>([]);
 *   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
 *
 *   const handleSelectAll = (checked: boolean) => {
 *     if (checked) {
 *       setSelectedIds(new Set(exams.map(t => t.id)));
 *     } else {
 *       setSelectedIds(new Set());
 *     }
 *   };
 *
 *   const handleSelect = (id: string, checked: boolean) => {
 *     setSelectedIds(prev => {
 *       const next = new Set(prev);
 *       if (checked) next.add(id);
 *       else next.delete(id);
 *       return next;
 *     });
 *   };
 *
 *   return (
 *     <ExamTable
 *       sheets={exams}
 *       selectedIds={selectedIds}
 *       onSelectAll={handleSelectAll}
 *       onSelect={handleSelect}
 *       onOpenPrint={(exam) => console.log('인쇄:', exam.id)}
 *       onOpenDetail={(exam) => console.log('상세보기:', exam.id)}
 *     />
 *   );
 * }
 *
 * // 선택된 시험들에 대한 일괄 작업
 * const handleBulkAction = () => {
 *   const selectedExams = exams.filter(t => selectedIds.has(t.id));
 *
 *   // 일괄 처리 로직
 *   processBulkAction(selectedExams);
 * };
 *
 * // 필터링된 목록 표시
 * const filteredExams = exams.filter(t => t.questionLevel === "상");
 *
 * <ExamTable
 *   sheets={filteredExams}
 *   selectedIds={selectedIds}
 *   // ... 기타 props
 * />
 * ```
 *
 * 데이터 요구사항:
 * - Exam 타입의 배열 (id, unitName, examName, questionCount, questionLevel, actualParticipants, totalParticipants 포함)
 * - 각 시험의 id는 고유해야 함 (키 및 라우팅용)
 * - questionLevel은 getDifficultyBadgeVariant에서 지원하는 값이어야 함
 * - 참여 현황 데이터는 숫자 타입이어야 함
 *
 * 라우팅 연동:
 * - /main/exam-management/$examId 경로로 이동
 * - examId 파라미터와 examName 검색 파라미터 전달
 * - TanStack Router의 타입 안전성 활용
 *
 * 향후 개선 사항:
 * - 정렬 기능 (컬럼 헤더 클릭)
 * - 인라인 편집 기능
 * - 드래그 앤 드롭 순서 변경
 * - 무한 스크롤 또는 가상화 (대용량 데이터)
 * - 검색 및 필터링 통합
 */
export function ExamTable({
  sheets,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenDetail: _onOpenDetail,
  selectedExamId,
}: ExamTableProps) {
  // "전체 선택" 체크박스의 상태를 결정하는 변수
  const isAllSelected = sheets.length > 0 && selectedIds.size === sheets.length;

  return (
    <div className={tableStyles.container}>
      <Table>
        {/* 2. TableHeader와 "전체 선택" 체크박스 추가 */}
        <TableHeader>
          <TableRow className={tableStyles.header}>
            <TableHead className="w-[50px] text-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                className={tableStyles.checkbox}
              />
            </TableHead>
            <TableHead className={tableStyles.headerCell}>시험명</TableHead>
            <TableHead className={tableStyles.headerCell}>단원정보</TableHead>
            <TableHead className={tableStyles.headerCellCenter}>
              문항수
            </TableHead>
            <TableHead className={tableStyles.headerCellCenter}>
              참여 현황
            </TableHead>
            <TableHead className={tableStyles.headerCellCenter}>
              제출명단
            </TableHead>
            <TableHead className={tableStyles.headerCellCenter}>인쇄</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sheets.map((sheet, index) => (
            <TableRow
              key={sheet.id}
              className={cn(
                tableStyles.row,
                index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
                selectedExamId === sheet.id &&
                  "ring-2 ring-blue-500 bg-blue-50/50 hover:bg-blue-100/50",
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
              <TableCell className={tableStyles.cell}>
                {sheet.examName}
              </TableCell>
              <TableCell className={tableStyles.cellMedium}>
                {/* 단원 정보를 Badge 컴포넌트들로 표시 */}
                {sheet.units && sheet.units.length > 0 ? (
                  sheet.units.map((unit) => (
                    <Badge
                      key={unit.id}
                      variant="secondary"
                      className={cn(badgeStyles.secondary, "text-xs")}
                    >
                      {unit.unitName}
                    </Badge>
                  ))
                ) : (
                  <Badge
                    variant="outline"
                    className={cn(
                      badgeStyles.outline,
                      "text-xs text-muted-foreground",
                    )}
                  >
                    {sheet.grade}학년 수학
                  </Badge>
                )}
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Badge variant="outline" className={badgeStyles.outline}>
                  {sheet.totalQuestions ? (
                    `${sheet.totalQuestions}문항`
                  ) : sheet.examSheetInfo?.totalQuestions ? (
                    `${sheet.examSheetInfo.totalQuestions}문항`
                  ) : (
                    <span className="text-muted-foreground">미등록</span>
                  )}
                </Badge>
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Badge variant="outline" className={badgeStyles.outline}>
                  {sheet.attendanceInfo ? (
                    `${sheet.attendanceInfo.actualAttendees}/${sheet.attendanceInfo.totalAssigned}`
                  ) : (
                    <span className="text-muted-foreground">집계중</span>
                  )}
                </Badge>
              </TableCell>
              {/* 3. UI에 있던 버튼들도 추가 */}
              <TableCell className={tableStyles.cellCenter}>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={buttonStyles.primary}
                >
                  <Link
                    to="/main/exam/manage/$examId"
                    params={{ examId: sheet.id }}
                  >
                    상세보기
                  </Link>
                </Button>
              </TableCell>

              {/* 4. 인쇄 버튼  */}
              <TableCell className={tableStyles.cellCenter}>
                <PrintButton onClick={() => {}} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
