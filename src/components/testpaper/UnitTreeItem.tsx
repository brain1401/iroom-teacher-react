import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronRight } from "lucide-react";
import type { UnitTreeNode } from "@/data/test-paper-mock-data";

/**
 * 단원 트리 아이템 컴포넌트 Props
 */
type UnitTreeItemProps = {
  /** 단원 노드 데이터 */
  unit: UnitTreeNode;
  /** 트리 레벨 (들여쓰기용) */
  level?: number;
  /** 선택된 아이템들 */
  selectedItems: Set<string>;
  /** 아이템 토글 핸들러 */
  onToggleItem: (id: string) => void;
  /** 문제 상세보기 핸들러 */
  onProblemDetail: (problemId: string) => void;
};

/**
 * 단원 트리 아이템 컴포넌트
 * @description 계층적 단원 구조를 표시하는 재귀적 컴포넌트
 *
 * 주요 기능:
 * - 계층적 단원 구조 렌더링
 * - 확장/축소 기능
 * - 문제 선택 체크박스
 * - 문제 상세보기 버튼
 */
export function UnitTreeItem({
  unit,
  level = 0,
  selectedItems,
  onToggleItem,
  onProblemDetail,
}: UnitTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = unit.children && unit.children.length > 0;

  // 체크박스 상태 계산 (문제인 경우에만)
  const getCheckboxState = () => {
    if (unit.id.startsWith("problem")) {
      return selectedItems.has(unit.id);
    }
    return false;
  };

  const checkboxState = getCheckboxState();

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
            <ChevronRight
              className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          </Button>
        )}
        {!hasChildren && <div className="w-4" />}

        {unit.id.startsWith("problem") && (
          <Checkbox
            checked={checkboxState === true}
            onCheckedChange={() => onToggleItem(unit.id)}
          />
        )}
        <div
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
          onClick={() => {
            if (unit.id.startsWith("problem")) {
              onToggleItem(unit.id);
            }
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {unit.id.startsWith("problem") && (
              <Badge
                variant={unit.type === "objective" ? "default" : "secondary"}
                className={`text-xs flex-shrink-0 ${
                  unit.type === "objective"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {unit.type === "objective" ? "객관식" : "주관식"}
              </Badge>
            )}
            <span
              className={`text-sm truncate flex-1 min-w-0 ${unit.id.startsWith("problem") ? "font-medium" : ""}`}
            >
              {unit.name.replace(/ \(객관식\)| \(주관식\)/g, "")}
            </span>
          </div>
        </div>

        {unit.id.startsWith("problem") && (
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs flex-shrink-0"
              onClick={() => onProblemDetail(unit.id)}
            >
              상세 보기
            </Button>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && unit.children && (
        <div className="space-y-1">
          {unit.children.map((child) => (
            <UnitTreeItem
              key={child.id}
              unit={child}
              level={level + 1}
              selectedItems={selectedItems}
              onToggleItem={onToggleItem}
              onProblemDetail={onProblemDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
