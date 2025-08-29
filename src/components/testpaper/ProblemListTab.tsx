// src/components/testpaper/ProblemListTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { badgeStyles } from "@/utils/commonStyles";
import type { Problem } from "@/types/test-paper";
import { UnitSelectionModal } from "./UnitSelectionModal";

/**
 * 문제 목록 탭 컴포넌트
 * @description 시험지 작성 시 선택된 문제들을 보여주고 관리하는 화면
 *
 * 주요 기능:
 * - 선택된 문제 목록 표시
 * - 문제 교체 기능
 * - 시험지 미리보기
 * - 시험지 생성
 */
type ProblemListTabProps = {
  /** 시험지명 */
  testName: string;
  /** 선택된 문제 목록 */
  problems: Problem[];
  /** 문제 교체 핸들러 */
  onReplaceProblem: (oldProblemId: string, newProblemId: string) => void;
  /** 시험지 미리보기 핸들러 */
  onPreviewTestPaper: () => void;
  /** 시험지 생성 핸들러 */
  onCreateTestPaper: () => void;
  /** 뒤로가기 핸들러 */
  onBack: () => void;
  /** 이미 선택된 문제 ID들 */
  selectedProblemIds: Set<string>;
};

export function ProblemListTab({
  testName,
  problems,
  onReplaceProblem,
  onPreviewTestPaper,
  onCreateTestPaper,
  onBack,
  selectedProblemIds,
}: ProblemListTabProps) {
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetProblemId, setTargetProblemId] = useState<string>("");

  // 교체 버튼 클릭 핸들러
  const handleReplaceClick = (problemId: string) => {
    setTargetProblemId(problemId);
    setIsModalOpen(true);
  };

  // 모달에서 교체 확인 핸들러
  const handleReplaceConfirm = (selectedProblemId: string) => {
    onReplaceProblem(targetProblemId, selectedProblemId);
    setIsModalOpen(false);
  };
  return (
    <div className="w-full space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{testName} 문제 목록</h1>
          <p className="text-sm text-muted-foreground">
            입력한 조건에 따라 문제가 자동으로 생성되었습니다. 미리보기하여
            확인하고, 필요시 다른 단원의 문제로 교체할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            뒤로가기
          </Button>
          <Button onClick={onPreviewTestPaper}>
            <Eye className="h-4 w-4 mr-2" />
            시험지 미리보기
          </Button>
        </div>
      </div>

      {/* 문제 목록 */}
      <div className="space-y-4">
        {problems.map((problem, index) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            problemNumber={index + 1}
            onReplace={() => handleReplaceClick(problem.id)}
          />
        ))}
      </div>

      {/* 시험지 생성 버튼 */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          className="w-full max-w-md h-12 text-lg font-semibold"
          onClick={onCreateTestPaper}
        >
          시험지 생성
        </Button>
      </div>

      {/* 단원 선택 모달 */}
      <UnitSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReplace={handleReplaceConfirm}
        targetProblemId={targetProblemId}
        selectedProblemIds={selectedProblemIds}
      />
    </div>
  );
}

/**
 * 문제 카드 컴포넌트
 * @description 개별 문제를 표시하는 카드
 */
type ProblemCardProps = {
  problem: Problem;
  problemNumber: number;
  onReplace: () => void;
};

function ProblemCard({ problem, problemNumber, onReplace }: ProblemCardProps) {
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "low":
        return "난이도 하";
      case "medium":
        return "난이도 중";
      case "high":
        return "난이도 상";
      default:
        return "난이도 하";
    }
  };

  const getTypeText = (type: string) => {
    return type === "objective" ? "객관식" : "주관식";
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{problemNumber}번</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={badgeStyles.outline}>
                {problem.unitName}
              </Badge>
              <Badge variant="outline" className={badgeStyles.outline}>
                {getTypeText(problem.type)}
              </Badge>
              <Badge variant="outline" className={badgeStyles.outline}>
                {getDifficultyText(problem.difficulty)}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onReplace}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            교체
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 문제 내용 */}
        <div className="space-y-2">
          <p className="text-sm leading-relaxed">{problem.content}</p>
          <p className="text-xs text-muted-foreground">[{problem.points}점]</p>
        </div>

        {/* 문제 이미지 */}
        {problem.imageUrl && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <img
              src={problem.imageUrl}
              alt={`문제 ${problemNumber} 이미지`}
              className="max-w-full h-auto mx-auto"
            />
          </div>
        )}

        {/* 객관식 보기 */}
        {problem.type === "objective" && problem.options && (
          <div className="space-y-2">
            <p className="text-sm font-medium">보기:</p>
            <div className="grid grid-cols-5 gap-2">
              {problem.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-2 border rounded text-sm"
                >
                  {String.fromCharCode(9312 + index)} {option}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
