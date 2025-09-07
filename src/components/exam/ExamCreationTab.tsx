import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAtomValue, useSetAtom } from "jotai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { sheetListQueryAtom } from "@/atoms/sheetFilters";
import { createExam, examKeys, createExamMutationOptions } from "@/api/exam";
import type { CreateExamRequest } from "@/api/exam/types";
import { getErrorMessage } from "@/utils/errorHandling";
import logger from "@/utils/logger";
import { refreshExamListAtom } from "@/atoms/exam";
import { useExamTab } from "@/contexts/ExamTabContext";

/**
 * 시험 출제 탭 컴포넌트
 * @description 시험명 입력과 문제지 선택을 통해 시험을 출제하는 화면
 *
 * 주요 기능:
 * - 실제 API를 통한 문제지 목록 조회
 * - 시험명 입력 및 문제지 선택
 * - 선택된 문제지 정보 미리보기
 * - 시험 출제 처리 (실제 API 연동)
 * - 로딩 상태 및 에러 처리
 * - 시작/종료 날짜 자동 설정 (현재 날짜 ~ +7일)
 * - 컨텍스트를 통한 탭 전환 지원
 */
export function ExamCreationTab() {
  const queryClient = useQueryClient();
  const refreshExamList = useSetAtom(refreshExamListAtom);

  // 탭 컨텍스트에서 setActiveTab 가져오기 (옵셔널 - 컨텍스트가 없을 수도 있음)
  let setActiveTab: ((tab: string) => void) | undefined;
  try {
    const tabContext = useExamTab();
    setActiveTab = tabContext.setActiveTab;
  } catch {
    // 컨텍스트가 없는 경우 무시
  }

  const [formData, setFormData] = useState({
    examName: "",
    selectedExamSheetId: "",
    description: "",
    duration: 120, // 기본 2시간
  });

  const { data } = useAtomValue(sheetListQueryAtom);

  // 시험 생성 mutation
  const createExamMutation = useMutation({
    ...createExamMutationOptions(),
    mutationFn: createExam,
    onSuccess: async (data) => {
      // 성공 메시지
      toast.success(`시험 "${data.examName}"이(가) 성공적으로 출제되었습니다!`);

      // 시험 목록 캐시 무효화 - 더 넓은 범위로 무효화
      // examKeys.all을 사용하여 모든 exam 관련 쿼리 무효화
      await queryClient.invalidateQueries({
        queryKey: examKeys.all,
        refetchType: "active", // 활성 쿼리만 리페치
      });

      // 추가로 정확한 리페치 보장
      await queryClient.refetchQueries({
        queryKey: examKeys.lists(),
        type: "active",
      });

      // Jotai atom 강제 리프레시 - 페이지를 0으로 리셋
      refreshExamList();

      // 폼 초기화
      setFormData({
        examName: "",
        selectedExamSheetId: "",
        description: "",
        duration: 120,
      });

      // 시험 목록 탭으로 이동 (약간의 딜레이 후)
      setTimeout(() => {
        if (setActiveTab) {
          setActiveTab("list");
        } else {
          // Fallback: DOM 조작 (권장하지 않음)
          const tabElement = document.querySelector(
            '[value="list"]',
          ) as HTMLElement;
          if (tabElement) {
            tabElement.click();
          }
        }
      }, 500);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      logger.error("시험 생성 실패:", error);
    },
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  const examSheets = data.content;

  // 선택된 문제지 정보
  const selectedExamSheet = examSheets.find(
    (sheet) => sheet.id === formData.selectedExamSheetId,
  );

  // 시험 출제 핸들러
  const handleCreateExam = () => {
    if (!formData.examName.trim()) {
      toast.error("시험명을 입력해주세요.");
      return;
    }

    if (!formData.selectedExamSheetId) {
      toast.error("문제지를 선택해주세요.");
      return;
    }

    // 현재 날짜와 7일 후 날짜 자동 설정
    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // API 요청 데이터 구성
    const requestData: CreateExamRequest = {
      examName: formData.examName.trim(),
      examSheetId: formData.selectedExamSheetId,
      description: formData.description.trim() || undefined,
      startDate,
      endDate,
      duration: formData.duration,
    };

    logger.info("시험 생성 요청:", requestData);

    // 시험 생성 API 호출
    createExamMutation.mutate(requestData);
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
              disabled={createExamMutation.isPending}
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
              disabled={createExamMutation.isPending}
            >
              <SelectTrigger className="h-12">
                <SelectValue
                  placeholder={
                    createExamMutation.isPending
                      ? "처리 중..."
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
            {!createExamMutation.isPending && examSheets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                등록된 문제지가 없습니다. 먼저 문제지를 등록해주세요.
              </p>
            )}
          </div>

          {/* 시험 설명 입력 (선택사항) */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              시험 설명 (선택)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="시험에 대한 설명을 입력하세요 (최대 500자)"
              className="min-h-[100px]"
              maxLength={500}
              disabled={createExamMutation.isPending}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.description.length}/500
            </p>
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
                createExamMutation.isPending ||
                !formData.examName.trim() ||
                !formData.selectedExamSheetId ||
                examSheets.length === 0
              }
            >
              {createExamMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  출제 중...
                </>
              ) : (
                "시험 출제"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
