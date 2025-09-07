import { useAtomValue, useSetAtom } from "jotai";
import { X, FileText, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  selectedProblemsDetailAtom,
  selectedProblemsStatsAtom,
  toggleUnitOrProblemAtom,
  resetUnitsTreeSelectionAtom,
} from "@/atoms/unitsTree";

/**
 * 선택된 문제 표시 패널 컴포넌트
 * @description 사용자가 선택한 문제들을 단원별로 정리하여 표시하는 패널
 *
 * 주요 기능:
 * - 선택된 문제를 단원별로 그룹화하여 표시
 * - 문제별 배점 표시
 * - 단원별 문제 수와 총 배점 표시
 * - 개별 문제 선택 해제 기능
 * - 전체 선택 초기화 기능
 * - 통계 정보 표시 (총 문제 수, 객관식/주관식 비율, 총 배점)
 */
export function SelectedProblemsPanel() {
  const selectedProblemsDetail = useAtomValue(selectedProblemsDetailAtom);
  const stats = useAtomValue(selectedProblemsStatsAtom);
  const toggleProblem = useSetAtom(toggleUnitOrProblemAtom);
  const resetSelection = useSetAtom(resetUnitsTreeSelectionAtom);

  // 선택된 문제가 없는 경우
  if (stats.totalCount === 0) {
    return (
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            선택된 문제
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[450px] text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="text-sm font-medium">선택된 문제가 없습니다</p>
            <p className="text-xs mt-2">왼쪽 트리에서 문제를 선택해주세요</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            선택된 문제
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetSelection()}
            className="text-xs h-7"
          >
            전체 해제
          </Button>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground">총 문제</div>
            <div className="font-semibold">{stats.totalCount}문제</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground">문제 유형</div>
            <div className="flex justify-center gap-1 mt-1">
              <Badge variant="outline" className="text-xs">
                객관식 {stats.objectiveCount}
              </Badge>
              <Badge variant="outline" className="text-xs">
                주관식 {stats.subjectiveCount}
              </Badge>
            </div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground">총 배점</div>
            <div className="font-semibold flex items-center justify-center gap-1">
              <Calculator className="h-3.5 w-3.5" />
              {stats.totalPoints}점
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden pb-4">
        <ScrollArea className="h-[380px] pr-4">
          <div className="space-y-3">
            {selectedProblemsDetail.map((unitGroup) => (
              <div
                key={unitGroup.unitId}
                className="border rounded-lg p-3 bg-card"
              >
                {/* 단원 헤더 */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{unitGroup.unitName}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {unitGroup.problemCount}문제 / {unitGroup.totalPoints}점
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {unitGroup.categoryName}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {unitGroup.subcategoryName}
                    </Badge>
                  </div>
                </div>

                {/* 문제 목록 */}
                <div className="space-y-1">
                  {unitGroup.problems.map((problem) => (
                    <div
                      key={problem.id}
                      className={cn(
                        "flex items-center gap-2 p-1.5 rounded-md",
                        "hover:bg-muted/50 group transition-colors"
                      )}
                    >
                      <span className="text-xs text-muted-foreground w-8">
                        {problem.number}.
                      </span>
                      <span className="text-xs flex-1 truncate">
                        {problem.title}
                      </span>
                      <Badge
                        variant={problem.type === "objective" ? "default" : "secondary"}
                        className="text-xs h-5"
                      >
                        {problem.type === "objective" ? "객관식" : "주관식"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {problem.points}점
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProblem({ type: "problem", id: problem.id })}
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}