import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAtomValue } from "jotai";

import { sheetListQueryAtom, sheetPageSizeAtom } from "@/atoms/sheetFilters";
import logger from "@/utils/logger";
import { useHydrateAtoms } from "jotai/utils";

/**
 * 시험 출제 탭 컴포넌트
 * @description 시험명 입력과 문제지 선택을 통해 시험을 출제하는 화면
 *
 * 주요 기능:
 * - 실제 API를 통한 문제지 목록 조회
 * - 시험명 입력 및 문제지 선택
 * - 선택된 문제지 정보 미리보기
 * - 시험 출제 처리
 * - 로딩 상태 및 에러 처리
 */
export function ExamCreationTab() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    examName: "",
    selectedExamSheetId: "",
  });

  const { data } = useAtomValue(sheetListQueryAtom);

  if (!data) {
    return <div>Loading...</div>;
  }

  logger.info("data (데이터)", data);

  const examSheets = data.content;

  logger.info("examSheets (문제지 목록)", examSheets);

  // 선택된 문제지 정보
  const selectedExamSheet = examSheets.find(
    (sheet) => sheet.id === formData.selectedExamSheetId,
  );

  // 시험 출제 핸들러
  const handleCreateExam = async () => {
    if (!formData.examName.trim()) {
      toast.error("시험명을 입력해주세요.");
      return;
    }

    if (!formData.selectedExamSheetId) {
      toast.error("문제지를 선택해주세요.");
      return;
    }

    setIsCreating(true);

    try {
      // TODO: 실제 시험 출제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 성공 메시지 표시
      toast.success("시험이 성공적으로 출제되었습니다!");

      // 폼 초기화
      setFormData({
        examName: "",
        selectedExamSheetId: "",
      });

      // 시험 목록 탭으로 이동 (실제로는 router를 사용해야 함)
      setTimeout(() => {
        window.location.href = "/main/exam-management";
      }, 1500);
    } catch (error) {
      console.error("시험 출제 실패:", error);
      toast.error("시험 출제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">시험 출제</h1>
        <p className="text-sm text-muted-foreground">
          시험명을 입력하고 문제지를 선택하여 시험을 출제할 수 있습니다.
        </p>
      </div>

      {/* 시험 출제 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>시험 정보 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 시험명 입력 */}
          <div className="space-y-2">
            <Label htmlFor="examName" className="text-base font-medium">
              시험명 *
            </Label>
            <Input
              id="examName"
              value={formData.examName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, examName: e.target.value }))
              }
              placeholder="시험명을 입력하세요"
              className="h-12"
              disabled={isCreating}
            />
          </div>

          {/* 문제지 선택 */}
          <div className="space-y-2">
            <Label htmlFor="examSheet" className="text-base font-medium">
              문제지 선택 *
            </Label>
            <Select
              value={formData.selectedExamSheetId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, selectedExamSheetId: value }))
              }
              disabled={isCreating}
            >
              <SelectTrigger className="h-12">
                <SelectValue
                  placeholder={
                    isCreating
                      ? "문제지를 불러오는 중..."
                      : examSheets.length === 0
                        ? "등록된 문제지가 없습니다"
                        : "문제지를 선택하세요"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {examSheets.map((sheet) => (
                  <SelectItem key={sheet.id} value={sheet.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{sheet.examName}</span>
                      <Badge variant="outline" className="ml-2">
                        {sheet.totalQuestions}문항
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isCreating && examSheets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                등록된 문제지가 없습니다. 먼저 문제지를 등록해주세요.
              </p>
            )}
          </div>

          {/* 선택된 문제지 정보 */}
          {selectedExamSheet && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">선택된 문제지 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">문제지명:</span>
                  <span>{selectedExamSheet.examName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">학년:</span>
                  <span>{selectedExamSheet.grade}학년</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">단원:</span>
                  <span className="truncate max-w-xs">
                    {selectedExamSheet.unitSummary.unitDetails[0]?.unitName ||
                      "단원 정보 없음"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">문항 수:</span>
                  <div className="flex items-center gap-2">
                    <span>{selectedExamSheet.totalQuestions}문항</span>
                    <div className="text-xs text-muted-foreground">
                      (객관식: {selectedExamSheet.multipleChoiceCount}, 주관식:{" "}
                      {selectedExamSheet.subjectiveCount})
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">총 배점:</span>
                  <span>{selectedExamSheet.totalPoints}점</span>
                </div>
                {selectedExamSheet.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">생성일:</span>
                    <span>
                      {new Date(
                        selectedExamSheet.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 시험 출제 버튼 */}
          <div className="flex justify-center pt-6">
            <Button
              size="lg"
              className="w-full max-w-md h-12 text-lg font-semibold"
              onClick={handleCreateExam}
              disabled={
                isCreating ||
                !formData.examName.trim() ||
                !formData.selectedExamSheetId ||
                examSheets.length === 0
              }
            >
              {isCreating
                ? "출제 중..."
                : isCreating
                  ? "로딩 중..."
                  : "시험 출제"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
