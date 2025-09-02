import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  tableStyles,
  buttonStyles,
  badgeStyles,
  getStatusBadgeVariant,
} from "@/utils/commonStyles";
import type { ExamSubmitStatusDetail } from "@/types/exam";

/**
 * 시험 제출 현황 상세 테이블 컴포넌트 Props
 * @interface ExamDetailTableProps
 */
type ExamDetailTableProps = {
  /** 시험 제출 현황 데이터 배열 - 학생별 제출 정보를 담은 배열 */
  submissions: ExamSubmitStatusDetail[];
  /** 현재 선택된 학생 ID들의 Set - 체크박스 상태 관리용 */
  selectedIds: Set<string>;
  /** 전체 선택/해제 토글 핸들러 함수 */
  onSelectAll: (checked: boolean) => void;
  /** 개별 학생 선택/해제 핸들러 함수 */
  onSelect: (id: string, checked: boolean) => void;
  /** 학생 답안 상세 보기 모달 열기 핸들러 함수 */
  onOpenDetail: (submission: ExamSubmitStatusDetail) => void;
};

/**
 * 시험 제출 현황 상세 테이블 컴포넌트
 * @description 특정 시험의 학생별 제출 현황을 표 형태로 표시하는 컴포넌트
 *
 * 설계 원칙:
 * - 데이터 표시 최적화: 대량의 학생 데이터를 효율적으로 렌더링
 * - 다중 선택 지원: 일괄 처리를 위한 체크박스 기반 선택 시스템
 * - 상태별 시각화: 제출 상태에 따른 직관적인 배지 표시
 * - 접근성 고려: 키보드 네비게이션 및 스크린 리더 지원
 * - 공통 스타일 시스템 활용: tableStyles, buttonStyles, badgeStyles 적용
 *
 * 주요 기능:
 * - 학생별 제출 현황 목록 표시 (이름, 전화번호, 시험명, 제출일자, 상태)
 * - 전체 선택/해제 체크박스 (헤더에 위치)
 * - 개별 학생 선택/해제 체크박스 (각 행에 위치)
 * - 제출 상태별 색상 구분 배지 (제출완료/미제출/채점중 등)
 * - 답안 상세 보기 버튼 (제출완료된 학생만 활성화)
 * - 반응형 테이블 레이아웃
 * - 홀짝 행 색상 구분으로 가독성 향상
 *
 * 테이블 구조:
 * - 체크박스 열: 다중 선택을 위한 체크박스
 * - 이름 열: 학생 이름 (굵은 글씨로 강조)
 * - 전화번호 열: 연락처 정보
 * - 시험명 열: 해당 시험의 제목
 * - 제출일자 열: 제출 완료 일시 (YYYY-MM-DD HH:mm 형식)
 * - 제출상태 열: 상태별 색상 배지 (중앙 정렬)
 * - 답안확인 열: 상세보기 버튼 (중앙 정렬)
 *
 * 상태 관리:
 * - selectedIds: Set 자료구조로 O(1) 시간복잡도의 선택 상태 확인
 * - isAllSelected: 전체 선택 상태를 계산하여 체크박스 표시
 * - 각 행의 체크 상태는 Set.has()로 효율적으로 판단
 *
 * UX 고려사항:
 * - 미제출 학생의 답안확인 버튼 비활성화
 * - 홀짝 행 배경색 구분으로 시각적 가독성 향상
 * - 상태별 배지 색상으로 직관적 정보 전달
 * - 반응형 디자인으로 다양한 화면 크기 지원
 *
 * 성능 최적화:
 * - Set 자료구조로 선택 상태 확인 최적화
 * - 공통 스타일 시스템으로 CSS 재사용성 향상
 * - 조건부 렌더링으로 불필요한 DOM 업데이트 방지
 *
 * 접근성 지원:
 * - 체크박스에 적절한 레이블링
 * - 테이블 헤더와 셀 간의 명확한 연관성
 * - 키보드 네비게이션 지원
 * - 색상뿐만 아니라 텍스트로도 상태 정보 제공
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * function ExamDetailPage() {
 *   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
 *   const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmitStatusDetail | null>(null);
 *
 *   const handleSelectAll = (checked: boolean) => {
 *     if (checked) {
 *       setSelectedIds(new Set(submissions.map(s => s.student.id)));
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
 *   const handleOpenDetail = (submission: ExamSubmitStatusDetail) => {
 *     setSelectedSubmission(submission);
 *   };
 *
 *   return (
 *     <ExamDetailTable
 *       submissions={submissions}
 *       selectedIds={selectedIds}
 *       onSelectAll={handleSelectAll}
 *       onSelect={handleSelect}
 *       onOpenDetail={handleOpenDetail}
 *     />
 *   );
 * }
 *
 * // 선택된 학생들에 대한 일괄 작업
 * const handleBulkAction = () => {
 *   const selectedSubmissions = submissions.filter(s =>
 *     selectedIds.has(s.student.id)
 *   );
 *
 *   // 일괄 처리 로직 (예: 점수 일괄 입력, 재시험 대상 지정 등)
 *   processBulkAction(selectedSubmissions);
 * };
 *
 * // 특정 상태의 학생들만 필터링하여 표시
 * const filteredSubmissions = submissions.filter(s =>
 *   s.submissionStatus === "제출완료"
 * );
 *
 * <ExamDetailTable
 *   submissions={filteredSubmissions}
 *   selectedIds={selectedIds}
 *   onSelectAll={handleSelectAll}
 *   onSelect={handleSelect}
 *   onOpenDetail={handleOpenDetail}
 * />
 * ```
 *
 * 데이터 구조 요구사항:
 * - ExamSubmitStatusDetail 타입의 배열
 * - 각 항목은 student, examName, submissionDate, submissionStatus 포함
 * - student.id는 고유 식별자로 사용
 * - submissionStatus는 getStatusBadgeVariant에서 지원하는 값이어야 함
 *
 * 스타일링:
 * - tableStyles: 공통 테이블 스타일 (컨테이너, 헤더, 행, 셀)
 * - buttonStyles: 공통 버튼 스타일 (primary variant 사용)
 * - badgeStyles: 공통 배지 스타일 (상태별 variant와 연동)
 * - 홀짝 행 구분: rowEven/rowOdd 스타일 적용
 *
 * 확장성 고려사항:
 * - 정렬 기능 추가 가능 (컬럼 헤더 클릭)
 * - 페이지네이션 연동 가능
 * - 검색/필터링 기능과 연동 가능
 * - 컨텍스트 메뉴 추가 가능 (우클릭 메뉴)
 * - 드래그 앤 드롭 선택 기능 추가 가능
 */
export function ExamDetailTable({
  submissions,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenDetail,
}: ExamDetailTableProps) {
  /**
   * 전체 선택 체크박스의 상태를 결정하는 계산
   * @description submissions 배열과 selectedIds Set을 비교하여 전체 선택 여부를 판단
   *
   * 계산 로직:
   * - submissions.length > 0: 데이터가 존재해야 함
   * - selectedIds.size === submissions.length: 모든 항목이 선택된 상태
   *
   * 성능 최적화:
   * - Set.size와 Array.length 비교는 O(1) 연산
   * - 매 렌더링마다 다시 계산되지만 연산이 매우 가벼움
   */
  const isAllSelected =
    submissions.length > 0 && selectedIds.size === submissions.length;

  return (
    <div className={tableStyles.container}>
      <Table>
        <TableHeader>
          <TableRow className={tableStyles.header}>
            {/* 전체 선택 체크박스 */}
            <TableHead className="w-[50px] text-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                className={tableStyles.checkbox}
                aria-label="전체 학생 선택/해제"
              />
            </TableHead>
            <TableHead className={tableStyles.headerCell}>이름</TableHead>
            <TableHead className={tableStyles.headerCell}>전화번호</TableHead>
            <TableHead className={tableStyles.headerCell}>시험명</TableHead>
            <TableHead className={tableStyles.headerCell}>제출일자</TableHead>
            <TableHead className={tableStyles.headerCellCenter}>
              제출 상태
            </TableHead>
            <TableHead className={tableStyles.headerCellCenter}>
              답안확인
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission, index) => {
            const isSelected = selectedIds.has(submission.student.id);
            const canViewAnswer = submission.submissionStatus === "제출완료";

            return (
              <TableRow
                key={submission.student.id}
                className={cn(
                  tableStyles.row,
                  index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
                )}
              >
                {/* 개별 선택 체크박스 */}
                <TableCell className={tableStyles.cellCenter}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      onSelect(submission.student.id, Boolean(checked))
                    }
                    className={tableStyles.checkbox}
                    aria-label={`${submission.student.name} 선택/해제`}
                  />
                </TableCell>

                {/* 학생 이름 */}
                <TableCell className={tableStyles.cellMedium}>
                  {submission.student.name}
                </TableCell>

                {/* 전화번호 */}
                <TableCell className={tableStyles.cell}>
                  {submission.student.phoneNumber}
                </TableCell>

                {/* 시험명 */}
                <TableCell className={tableStyles.cell}>
                  {submission.examName}
                </TableCell>

                {/* 제출일자 */}
                <TableCell className={tableStyles.cell}>
                  {submission.submissionDate}
                </TableCell>

                {/* 제출 상태 배지 */}
                <TableCell className={tableStyles.cellCenter}>
                  <Badge
                    variant={getStatusBadgeVariant(submission.submissionStatus)}
                    className={
                      badgeStyles[
                        getStatusBadgeVariant(submission.submissionStatus)
                      ]
                    }
                  >
                    {submission.submissionStatus}
                  </Badge>
                </TableCell>

                {/* 답안확인 버튼 */}
                <TableCell className={tableStyles.cellCenter}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={buttonStyles.primary}
                    onClick={() => onOpenDetail(submission)}
                    disabled={!canViewAnswer}
                    aria-label={
                      canViewAnswer
                        ? `${submission.student.name} 답안 상세보기`
                        : `${submission.student.name} 답안 확인 불가 (미제출)`
                    }
                  >
                    답안확인
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
