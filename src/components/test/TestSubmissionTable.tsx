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
import type { TestSubmitStatusDetail } from "@/types/test";

/**
 * 시험 제출 현황 테이블 Props
 */
type TestSubmissionTableProps = {
  /** 제출 현황 데이터 */
  submissions: TestSubmitStatusDetail[];
  /** 선택된 항목 ID들 */
  selectedIds: Set<string>;
  /** 전체 선택/해제 핸들러 */
  onSelectAll: (checked: boolean) => void;
  /** 개별 선택/해제 핸들러 */
  onSelect: (id: string, checked: boolean) => void;
  /** 상세 보기 핸들러 */
  onOpenDetail: (submission: TestSubmitStatusDetail) => void;
  /** 답안 다운로드 핸들러 */
  onDownloadAnswer: (submission: TestSubmitStatusDetail) => void;
};

/**
 * 제출 상태에 따른 배지 variant 반환
 */
function GetStatusBadgeVariant(status: string) {
  switch (status) {
    case "미제출":
      return "destructive";
    case "제출완료":
      return "default";
    default:
      return "outline";
  }
}

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
export function TestSubmissionTable({
  submissions,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenDetail,
  onDownloadAnswer,
}: TestSubmissionTableProps) {
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
                    variant={GetStatusBadgeVariant(submission.submissionStatus)}
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
