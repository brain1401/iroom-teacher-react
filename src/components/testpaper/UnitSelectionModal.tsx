// src/components/testpaper/UnitSelectionModal.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { unitTreeData } from "@/data/test-paper-mock-data";
import type { UnitTreeNode } from "@/data/test-paper-mock-data";

/**
 * 단원 선택 모달 컴포넌트
 * @description 문제 교체 시 단원을 선택할 수 있는 모달
 *
 * 주요 기능:
 * - 계층적 단원 트리 구조
 * - 체크박스로 단원/문제 선택
 * - 확장/축소 기능
 * - 상세 보기 버튼
 * - 교체하기 버튼
 */
type UnitSelectionModalProps = {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 교체하기 핸들러 */
  onReplace: (selectedProblemId: string) => void;
  /** 교체할 문제 ID */
  targetProblemId: string;
  /** 이미 선택된 문제 ID들 */
  selectedProblemIds: Set<string>;
};

export function UnitSelectionModal({
  isOpen,
  onClose,
  onReplace,
  targetProblemId,
  selectedProblemIds,
}: UnitSelectionModalProps) {
  // 선택된 문제 상태
  const [selectedProblemId, setSelectedProblemId] = useState<string>("");

  // 공통 단원 트리 데이터 사용

  // 교체하기 핸들러
  const handleReplace = () => {
    if (selectedProblemId) {
      onReplace(selectedProblemId);
      onClose();
      setSelectedProblemId("");
    }
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  // 모달이 닫힐 때 선택 상태 초기화
  const handleClose = () => {
    setSelectedProblemId("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-sky-600"> 문제 선택</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {unitTreeData.map((unit) => (
              <UnitTreeItem
                key={unit.id}
                unit={unit}
                selectedProblemId={selectedProblemId}
                onSelectProblem={setSelectedProblemId}
                selectedProblemIds={selectedProblemIds}
              />
            ))}
          </div>
        </CardContent>
        <div className="flex justify-center p-4 border-t">
          <Button
            onClick={handleReplace}
            disabled={!selectedProblemId}
            className="w-full max-w-xs"
          >
            교체하기
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * 단원 트리 아이템 컴포넌트
 * @description 계층적 단원 구조를 표시하는 컴포넌트
 */
type UnitTreeItemProps = {
  unit: UnitTreeNode;
  level?: number;
  selectedProblemId: string;
  onSelectProblem: (problemId: string) => void;
  selectedProblemIds: Set<string>;
};

function UnitTreeItem({
  unit,
  level = 0,
  selectedProblemId,
  onSelectProblem,
  selectedProblemIds,
}: UnitTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = unit.children && unit.children.length > 0;
  const isProblem = unit.id.startsWith("problem");

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div style={{ marginLeft: `${level * 16}px` }} />
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        {!hasChildren && <div className="w-4" />}

        <Checkbox
          checked={selectedProblemId === unit.id}
          disabled={
            unit.id.startsWith("problem") && selectedProblemIds.has(unit.id)
          }
          onCheckedChange={() => {
            if (unit.id.startsWith("problem")) {
              // 이미 선택된 문제는 선택할 수 없음
              if (selectedProblemIds.has(unit.id)) {
                return;
              }
              const newSelectedId =
                selectedProblemId === unit.id ? "" : unit.id;
              onSelectProblem(newSelectedId);
            }
          }}
        />
        <span className="text-sm">{unit.name}</span>

        {isProblem && (
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-6 text-xs">
              상세 보기
            </Button>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-1">
          {unit.children?.map((child: UnitTreeNode) => (
            <UnitTreeItem
              key={child.id}
              unit={child}
              level={level + 1}
              selectedProblemId={selectedProblemId}
              onSelectProblem={onSelectProblem}
              selectedProblemIds={selectedProblemIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
