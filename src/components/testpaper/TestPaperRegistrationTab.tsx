// src/components/testpaper/TestPaperRegistrationTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Circle, Square, GripVertical, Eye } from "lucide-react";
import { ProblemListTab } from "./ProblemListTab";
import { ProblemDetailModal } from "./ProblemDetailModal";
import { UnitTreeItem } from "./UnitTreeItem";
import { useTestPaperRegistration } from "@/hooks/test-paper/useTestPaperRegistration";
import { unitTreeData, findProblemInTree } from "@/data/test-paper-mock-data";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import type { TestLevel, TestStatus } from "@/types/test";

/**
 * 문제지 등록 탭 콘텐츠
 * @description 이미지와 동일한 구조로 문제지 정보, 단원 선택, 선택된 단원 확인 및 문제지 생성 기능 제공
 *
 * 주요 구성:
 * - 문제지 정보 섹션 (문제지명, 문항수, 객관식/주관식, 학년)
 * - 좌측: 단원 선택 트리 구조
 * - 우측: 선택된 단원 목록 및 문제지 생성
 * - 시험 출제 완료 후 목록 탭으로 자동 이동
 */
export function TestPaperRegistrationTab() {
  const navigate = useNavigate();

  const {
    // 상태
    examName,
    selectedGrade,
    selectedProblems,
    showProblemList,
    isProblemDetailModalOpen,
    selectedProblemForDetail,
    selectedObjectiveCount,
    selectedSubjectiveCount,
    totalQuestionCount,
    selectedProblemList,

    // 액션
    setExamName,
    setSelectedGrade,
    toggleProblem,
    removeProblem,
    replaceProblem,
    reorderProblems,
    handleProblemDetail,
    handleCloseProblemDetail,
    handleCreateExam,
    handleBack,
    handleCreateTestPaper,
    handlePreviewTestPaper,
    getSelectedProblems,
    setTestCreatedCallback,
  } = useTestPaperRegistration();

  /**
   * 시험 출제 완료 후 시험 목록 탭으로 이동
   */
  useEffect(() => {
    setTestCreatedCallback((newTest) => {
      // 시험 목록 탭으로 이동
      console.log("시험 출제 완료:", newTest);
      // localStorage에 새로운 시험 정보 저장
      const newTests = JSON.parse(localStorage.getItem("newTests") || "[]");
      newTests.push(newTest);
      localStorage.setItem("newTests", JSON.stringify(newTests));

      // 시험 목록 탭으로 이동
      window.location.href = "/main/test-management?tab=list";
    });
  }, [setTestCreatedCallback]);

  // 문제 목록 화면이 활성화된 경우
  if (showProblemList) {
    return (
      <ProblemListTab
        testName={examName}
        problems={getSelectedProblems()}
        onReorderProblems={reorderProblems}
        onReplaceProblem={replaceProblem}
        onPreviewTestPaper={handlePreviewTestPaper}
        onBack={handleBack}
        selectedProblemIds={selectedProblems}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 문제지 정보 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sky-600">문제지 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 문제지명 */}
          <div className="space-y-2">
            <Label htmlFor="exam-name">문제지명</Label>
            <Input
              id="exam-name"
              placeholder="문제지명 입력"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="truncate"
            />
          </div>

          {/* 학년 선택 */}
          <div className="space-y-2">
            <Label>학년</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="중1">중1</SelectItem>
                <SelectItem value="중2">중2</SelectItem>
                <SelectItem value="중3">중3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 문항 수, 객관식, 주관식 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>문항 수</Label>
              <Input
                value={totalQuestionCount}
                className="text-center font-semibold"
                readOnly
              />
              <div className="text-xs text-muted-foreground">(최대30문항)</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-blue-500" />
                <Label>객관식</Label>
              </div>
              <Input
                value={selectedObjectiveCount}
                className={`text-center font-semibold text-blue-600 ${
                  selectedObjectiveCount === 0 ? "opacity-50" : ""
                }`}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4 text-green-500" />
                <Label>주관식</Label>
              </div>
              <Input
                value={selectedSubjectiveCount}
                className={`text-center font-semibold text-green-600 ${
                  selectedSubjectiveCount === 0 ? "opacity-50" : ""
                }`}
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 본문: 좌측 단원 선택 / 우측 선택 단원 */}
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[600px] rounded-lg border group relative"
      >
        {/* 좌측: 단원 선택 트리 */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <Card className="h-full flex flex-col border-none">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-sky-600 flex items-center gap-2">
                문제 선택
                <div className="flex items-center gap-1 text-xs text-gray-400 font-normal">
                  <GripVertical className="h-3 w-3" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {unitTreeData.map((unit) => (
                  <UnitTreeItem
                    key={unit.id}
                    unit={unit}
                    selectedItems={selectedProblems}
                    onToggleItem={toggleProblem}
                    onProblemDetail={handleProblemDetail}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </ResizablePanel>

        <ResizableHandle
          className="w-4 hover:w-6 transition-all duration-200 hover:bg-blue-100 group-hover:bg-gray-100 cursor-col-resize relative group/handle"
          withHandle
        >
          {/* 드래그 가능한 영역을 시각적으로 강조 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-12 bg-gray-400 rounded-full group-hover/handle:bg-blue-500 transition-colors duration-200" />
          </div>

          {/* 드래그 힌트 아이콘 - 항상 표시 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover/handle:opacity-100 transition-opacity duration-200 pointer-events-none">
            <GripVertical className="h-4 w-4 text-gray-600 group-hover/handle:text-blue-600" />
          </div>

          {/* 드래그 방향 힌트 - 작은 점들 */}
          <div className="absolute inset-0 flex items-center justify-between px-1 opacity-40 group-hover/handle:opacity-80 transition-opacity duration-200 pointer-events-none">
            <div className="w-1 h-2 bg-gray-500 rounded-full group-hover/handle:bg-blue-500" />
            <div className="w-1 h-2 bg-gray-500 rounded-full group-hover/handle:bg-blue-500" />
          </div>

          {/* 호버 시 배경 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent opacity-0 group-hover/handle:opacity-100 transition-opacity duration-200 pointer-events-none" />

          {/* 드래그 가능함을 나타내는 애니메이션 효과 */}
          <div className="absolute inset-0 border-l border-r border-dashed border-gray-300 opacity-0 group-hover/handle:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </ResizableHandle>

        {/* 우측: 선택 단원 */}
        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="h-full flex flex-col space-y-4 ">
            <Card className="flex-1 flex flex-col border-none">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-sky-600 flex items-center gap-2">
                  문제 단원 선택
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-normal">
                    <GripVertical className="h-3 w-3" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {selectedProblemList.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">선택된 문제가 없습니다.</p>
                      <p className="text-xs mt-1">
                        좌측에서 문제를 선택해주세요.
                      </p>
                    </div>
                  ) : (
                    selectedProblemList.map((group) => (
                      <div key={group.detailName} className="space-y-2">
                        {/* 소단원 헤더 */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <span className="text-sm font-medium text-gray-700 truncate flex-1 min-w-0">
                            {group.detailName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs flex-shrink-0 ml-2"
                          >
                            {group.problems.length}개 선택
                          </Badge>
                        </div>

                        {/* 해당 소단원의 문제들 */}
                        {group.problems.map((problem) => (
                          <div
                            key={problem.id}
                            className="flex items-center justify-between gap-2 rounded-md border p-3 ml-4 min-w-0"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Checkbox
                                checked={selectedProblems.has(problem.id)}
                                onCheckedChange={() =>
                                  toggleProblem(problem.id)
                                }
                                className="flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  {findProblemInTree(problem.id)?.type ===
                                  "objective" ? (
                                    <Circle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                  ) : (
                                    <Square className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  )}
                                  <div className="min-w-0 flex-1 overflow-hidden">
                                    <Label className="text-sm font-medium truncate block w-full">
                                      {problem.name}
                                    </Label>
                                    {problem.hierarchy && (
                                      <p className="text-xs text-gray-500 mt-1 truncate w-full">
                                        문제 ID: {problem.id}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 flex-shrink-0"
                                onClick={() => handleProblemDetail(problem.id)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-shrink-0 whitespace-nowrap"
                                onClick={() => removeProblem(problem.id)}
                              >
                                삭제
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-12 text-lg font-semibold flex-shrink-0"
              onClick={handleCreateExam}
              disabled={selectedProblems.size === 0 || !examName.trim()}
            >
              문제지 작성
            </Button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* 문제 상세보기 모달 */}
      <ProblemDetailModal
        isOpen={isProblemDetailModalOpen}
        onClose={handleCloseProblemDetail}
        problem={selectedProblemForDetail}
      />
    </div>
  );
}
