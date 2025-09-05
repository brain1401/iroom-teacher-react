import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Download } from "lucide-react";
import type { ExamSubmitStatusDetail } from "@/types/exam";
import { getStatusBadgeVariant } from "@/utils/badge/ExamSubmission";

/**
 * 시험 제출 현황 테이블 Props
 */
/**
 * 시험 제출 현황 테이블 컴포넌트 Props
 * @interface ExamSubmissionTableProps
 */
type ExamSubmissionTableProps = {
  /**
   * 시험 제출 현황 데이터 배열
   * @description ExamSubmitStatusDetail 타입의 배열로 각 학생의 제출 정보를 포함
   * - 학생 기본 정보 (이름, 학년/반, 번호, 전화번호)
   * - 제출 상태 정보 (제출일자, 상태, 점수, 제출시간, 오답수)
   * - 빈 배열일 경우 "데이터 없음" 상태 표시
   */
  submissions: ExamSubmitStatusDetail[];

  /**
   * 현재 선택된 학생 ID들의 Set 컬렉션
   * @description 체크박스 상태 관리를 위한 고유 식별자 집합
   * - Set 자료구조로 O(1) 시간복잡도의 선택 상태 확인
   * - 다중 선택 기능을 위한 핵심 데이터 구조
   * - student.id를 키로 사용하여 학생별 선택 상태 추적
   */
  selectedIds: Set<string>;

  /**
   * 전체 선택/해제 토글 핸들러 함수
   * @description 헤더의 마스터 체크박스 클릭 시 실행되는 함수
   * - true: 모든 학생을 선택 상태로 변경
   * - false: 모든 학생을 선택 해제 상태로 변경
   * - 전체/부분 선택 상태에 따른 indeterminate 처리 포함
   */
  onSelectAll: (checked: boolean) => void;

  /**
   * 개별 학생 선택/해제 핸들러 함수
   * @description 각 행의 체크박스 클릭 시 실행되는 함수
   * - 첫 번째 인자: 선택/해제할 학생의 고유 ID
   * - 두 번째 인자: 선택 상태 (true: 선택, false: 선택 해제)
   * - selectedIds Set 업데이트를 위한 핵심 함수
   */
  onSelect: (id: string, checked: boolean) => void;

  /**
   * 학생 답안 상세 보기 모달 열기 핸들러 함수
   * @description Eye 아이콘 버튼 클릭 시 실행되는 함수
   * - 선택된 학생의 상세 답안 정보를 모달로 표시
   * - AnswerSheetResult 컴포넌트와 연동하여 문항별 답안 분석 제공
   * - 제출 완료된 학생만 활성화 (미제출 학생은 버튼 비활성화)
   */
  onOpenDetail: (submission: ExamSubmitStatusDetail) => void;

  /**
   * 학생 답안 다운로드 핸들러 함수
   * @description Download 아이콘 버튼 클릭 시 실행되는 함수
   * - 학생의 답안지를 파일 형태로 다운로드 (PDF, 이미지 등)
   * - 점수가 있는 학생만 다운로드 가능 (hasScore 조건)
   * - 인쇄, 보관, 공유 목적의 답안지 출력 기능
   */
  onDownloadAnswer: (submission: ExamSubmitStatusDetail) => void;
};

/**
 * 시험 제출 현황 테이블 컴포넌트
 * @description 학생들의 시험 제출 현황을 표시하는 테이블
 *
 * 주요 기능:
 * - 학생별 제출 현황 표시
 * - 제출 상태별 색상 구분
 * - 점수 및 제출 시간 표시
 * - 상세 보기 및 답안 다운로드
 */
export function ExamSubmissionTable({
  submissions,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenDetail,
  onDownloadAnswer,
}: ExamSubmissionTableProps) {
  const allSelected =
    submissions.length > 0 && selectedIds.size === submissions.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < submissions.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) (el as HTMLInputElement).indeterminate = someSelected;
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="w-20">번호</TableHead>
            <TableHead className="w-32">학년/반</TableHead>
            <TableHead className="w-24">번호</TableHead>
            <TableHead>학생명</TableHead>
            <TableHead className="w-32">전화번호</TableHead>
            <TableHead className="w-32">제출일자</TableHead>
            <TableHead className="w-24">상태</TableHead>
            <TableHead className="w-20">점수</TableHead>
            <TableHead className="w-24">제출시간</TableHead>
            <TableHead className="w-20">오답수</TableHead>
            <TableHead className="w-32">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission, index) => {
            const isSelected = selectedIds.has(submission.student.id);
            const hasScore = submission.earnedScore !== undefined;

            return (
              <TableRow key={submission.student.id}>
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      onSelect(submission.student.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell className="text-center">
                  {submission.student.grade}/{submission.student.class}
                </TableCell>
                <TableCell className="text-center">
                  {submission.student.number}
                </TableCell>
                <TableCell className="font-medium">
                  {submission.student.name}
                </TableCell>
                <TableCell>{submission.student.phoneNumber}</TableCell>
                <TableCell>{submission.submissionDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusBadgeVariant(submission.submissionStatus)}
                  >
                    {submission.submissionStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {hasScore ? (
                    <span className="font-semibold">
                      {submission.earnedScore}/{submission.totalScore}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {submission.submissionTime
                    ? `${submission.submissionTime}분`
                    : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {submission.wrongAnswerCount !== undefined
                    ? submission.wrongAnswerCount
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenDetail(submission)}
                      title="상세 보기"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {hasScore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadAnswer(submission)}
                        title="답안 다운로드"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
