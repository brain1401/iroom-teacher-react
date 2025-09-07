import { useAtomValue, useSetAtom } from "jotai";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  CategoryNode,
  SubcategoryNode,
  UnitNode,
} from "@/types/units-tree";
import {
  unitsTreeWithProblemsAtom,
  selectedProblemIdsAtom,
  expandedNodeIdsAtom,
  toggleUnitOrProblemAtom,
  toggleAllProblemsInUnitAtom,
  toggleAllProblemsInSubcategoryAtom,
  toggleAllProblemsInCategoryAtom,
} from "@/atoms/unitsTree";
import { UnitsTreeLoadingSpinner } from "./UnitsTreeLoadingSpinner";

/**
 * 단원 트리 문제 선택 컴포넌트
 * @description 트리 구조로 문제를 표시하고 선택할 수 있는 UI 컴포넌트
 *
 * 주요 기능:
 * - 계층적 트리 구조 표시 (대분류 → 중분류 → 세부단원 → 문제)
 * - 체크박스를 통한 문제 선택
 * - 단원별 일괄 선택/해제
 * - 문제 배점 표시
 * - 단원별 문제 수 카운팅
 * - 확장/축소 가능한 트리 구조
 */
export function UnitsTreeProblemSelector() {
  const { data, isPending, isError } = useAtomValue(unitsTreeWithProblemsAtom);
  const selectedProblemIds = useAtomValue(selectedProblemIdsAtom);
  const expandedNodeIds = useAtomValue(expandedNodeIdsAtom);
  const toggleExpanded = useSetAtom(expandedNodeIdsAtom);
  const toggleProblem = useSetAtom(toggleUnitOrProblemAtom);
  const toggleAllInUnit = useSetAtom(toggleAllProblemsInUnitAtom);
  const toggleAllInSubcategory = useSetAtom(toggleAllProblemsInSubcategoryAtom);
  const toggleAllInCategory = useSetAtom(toggleAllProblemsInCategoryAtom);

  // 로딩 상태
  if (isPending) {
    return <UnitsTreeLoadingSpinner />;
  }

  // 에러 상태
  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">문제를 불러올 수 없습니다</p>
          <p className="text-sm mt-2">잠시 후 다시 시도해주세요</p>
        </div>
      </div>
    );
  }

  /**
   * 단원의 선택 상태 계산
   * @param unit 단원 노드
   * @returns 전체선택/부분선택/미선택 상태
   */
  const getUnitSelectionState = (unit: UnitNode): "all" | "some" | "none" => {
    if (!unit.problems || unit.problems.length === 0) return "none";

    const selectedCount = unit.problems.filter((p) =>
      selectedProblemIds.has(p.id),
    ).length;

    if (selectedCount === 0) return "none";
    if (selectedCount === unit.problems.length) return "all";
    return "some";
  };

  /**
   * 중분류의 선택 상태 계산
   */
  const getSubcategorySelectionState = (
    subcategory: SubcategoryNode,
  ): "all" | "some" | "none" => {
    const allProblems: string[] = [];
    subcategory.children.forEach((unit) => {
      if (unit.problems) {
        unit.problems.forEach((p) => allProblems.push(p.id));
      }
    });

    if (allProblems.length === 0) return "none";

    const selectedCount = allProblems.filter((id) =>
      selectedProblemIds.has(id),
    ).length;

    if (selectedCount === 0) return "none";
    if (selectedCount === allProblems.length) return "all";
    return "some";
  };

  /**
   * 대분류의 선택 상태 계산
   */
  const getCategorySelectionState = (
    category: CategoryNode,
  ): "all" | "some" | "none" => {
    const allProblems: string[] = [];
    category.children.forEach((subcategory) => {
      subcategory.children.forEach((unit) => {
        if (unit.problems) {
          unit.problems.forEach((p) => allProblems.push(p.id));
        }
      });
    });

    if (allProblems.length === 0) return "none";

    const selectedCount = allProblems.filter((id) =>
      selectedProblemIds.has(id),
    ).length;

    if (selectedCount === 0) return "none";
    if (selectedCount === allProblems.length) return "all";
    return "some";
  };

  /**
   * 문제 수 계산
   */
  const getProblemCount = (
    node: CategoryNode | SubcategoryNode | UnitNode,
  ): number => {
    if (node.type === "unit") {
      return node.problems?.length || 0;
    } else if (node.type === "subcategory") {
      return node.children.reduce(
        (sum, unit) => sum + (unit.problems?.length || 0),
        0,
      );
    } else {
      return node.children.reduce(
        (sum, sub) =>
          sum +
          sub.children.reduce(
            (unitSum, unit) => unitSum + (unit.problems?.length || 0),
            0,
          ),
        0,
      );
    }
  };

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <div className="p-4">
        {data.categories.map((category) => {
          const categoryExpanded = expandedNodeIds.has(category.id);
          const categorySelection = getCategorySelectionState(category);
          const categoryProblemCount = getProblemCount(category);

          return (
            <div key={category.id} className="mb-2">
              {/* 대분류 */}
              <div
                className="flex items-center gap-2 py-2 hover:bg-muted/50 rounded-md px-2 cursor-pointer"
                onClick={(e) => {
                  // 버튼이나 체크박스를 직접 클릭한 경우 중복 실행 방지
                  if (
                    (e.target as HTMLElement).closest("button") ||
                    (e.target as HTMLElement).closest('button[role="checkbox"]')
                  ) {
                    return;
                  }
                  toggleAllInCategory({
                    categoryId: category.id,
                    categoryNode: category,
                  });
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleExpanded(category.id)}
                >
                  {categoryExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                <Checkbox
                  checked={
                    categorySelection === "all" || categorySelection === "some"
                  }
                  onCheckedChange={() =>
                    toggleAllInCategory({
                      categoryId: category.id,
                      categoryNode: category,
                    })
                  }
                  className={
                    categorySelection === "some"
                      ? "data-[state=checked]:bg-primary/50"
                      : ""
                  }
                />

                <span className="font-semibold flex-1">{category.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {categoryProblemCount}문제
                </Badge>
              </div>

              {/* 중분류 */}
              {categoryExpanded && (
                <div className="ml-6">
                  {category.children.map((subcategory) => {
                    const subcategoryExpanded = expandedNodeIds.has(
                      subcategory.id,
                    );
                    const subcategorySelection =
                      getSubcategorySelectionState(subcategory);
                    const subcategoryProblemCount =
                      getProblemCount(subcategory);

                    return (
                      <div key={subcategory.id} className="mb-1">
                        <div
                          className="flex items-center gap-2 py-1.5 hover:bg-muted/50 rounded-md px-2 cursor-pointer"
                          onClick={(e) => {
                            // 버튼이나 체크박스를 직접 클릭한 경우 중복 실행 방지
                            if (
                              (e.target as HTMLElement).closest("button") ||
                              (e.target as HTMLElement).closest(
                                'button[role="checkbox"]',
                              )
                            ) {
                              return;
                            }
                            toggleAllInSubcategory({
                              subcategoryId: subcategory.id,
                              subcategoryNode: subcategory,
                            });
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => toggleExpanded(subcategory.id)}
                          >
                            {subcategoryExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>

                          <Checkbox
                            checked={
                              subcategorySelection === "all" ||
                              subcategorySelection === "some"
                            }
                            onCheckedChange={() =>
                              toggleAllInSubcategory({
                                subcategoryId: subcategory.id,
                                subcategoryNode: subcategory,
                              })
                            }
                            className={cn(
                              "h-4 w-4",
                              subcategorySelection === "some"
                                ? "data-[state=checked]:bg-primary/50"
                                : "",
                            )}
                          />

                          <span className="text-sm flex-1">
                            {subcategory.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {subcategoryProblemCount}
                          </Badge>
                        </div>

                        {/* 세부단원 */}
                        {subcategoryExpanded && (
                          <div className="ml-6">
                            {subcategory.children.map((unit) => {
                              const unitExpanded = expandedNodeIds.has(unit.id);
                              const unitSelection = getUnitSelectionState(unit);
                              const unitProblemCount =
                                unit.problems?.length || 0;

                              return (
                                <div key={unit.id} className="mb-1">
                                  <div
                                    className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded-md px-2 cursor-pointer"
                                    onClick={(e) => {
                                      // 버튼이나 체크박스를 직접 클릭한 경우 중복 실행 방지
                                      if (
                                        (e.target as HTMLElement).closest(
                                          "button",
                                        ) ||
                                        (e.target as HTMLElement).closest(
                                          'button[role="checkbox"]',
                                        )
                                      ) {
                                        return;
                                      }
                                      if (unitProblemCount > 0) {
                                        toggleAllInUnit({
                                          unitId: unit.id,
                                          unitNode: unit,
                                        });
                                      }
                                    }}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => toggleExpanded(unit.id)}
                                      disabled={unitProblemCount === 0}
                                    >
                                      {unitExpanded ? (
                                        <ChevronDown className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                    </Button>

                                    <Checkbox
                                      checked={
                                        unitSelection === "all" ||
                                        unitSelection === "some"
                                      }
                                      onCheckedChange={() =>
                                        toggleAllInUnit({
                                          unitId: unit.id,
                                          unitNode: unit,
                                        })
                                      }
                                      disabled={unitProblemCount === 0}
                                      className={cn(
                                        "h-3.5 w-3.5",
                                        unitSelection === "some"
                                          ? "data-[state=checked]:bg-primary/50"
                                          : "",
                                      )}
                                    />

                                    <span className="text-xs flex-1">
                                      {unit.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs h-5"
                                    >
                                      {unitProblemCount}
                                    </Badge>
                                  </div>

                                  {/* 문제 목록 */}
                                  {unitExpanded && unit.problems && (
                                    <div className="ml-8 space-y-1 mt-1">
                                      {unit.problems.map((problem) => {
                                        const isSelected =
                                          selectedProblemIds.has(problem.id);

                                        return (
                                          <div
                                            key={problem.id}
                                            className={cn(
                                              "flex items-center gap-2 py-0.5 px-2 rounded-md text-xs cursor-pointer",
                                              "hover:bg-muted/30",
                                              isSelected && "bg-primary/5",
                                            )}
                                            onClick={(e) => {
                                              // 체크박스 자체를 클릭한 경우 중복 실행 방지
                                              if (
                                                (
                                                  e.target as HTMLElement
                                                ).closest(
                                                  'button[role="checkbox"]',
                                                )
                                              ) {
                                                return;
                                              }
                                              toggleProblem({
                                                type: "problem",
                                                id: problem.id,
                                              });
                                            }}
                                          >
                                            <Checkbox
                                              checked={isSelected}
                                              onCheckedChange={() =>
                                                toggleProblem({
                                                  type: "problem",
                                                  id: problem.id,
                                                })
                                              }
                                              className="h-3 w-3"
                                            />

                                            <span className="flex-1">
                                              {problem.number}. {problem.title}
                                            </span>

                                            <span className="text-muted-foreground">
                                              ({problem.points}점)
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
