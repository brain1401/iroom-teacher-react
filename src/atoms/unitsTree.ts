/**
 * 단원 트리 상태 관리 atoms
 * @description Jotai + React Query를 통합한 단원 트리 상태 관리
 *
 * 주요 기능:
 * - CSR 방식으로 문제 포함 단원 트리 로딩
 * - 학년별 필터링 지원
 * - 로딩 스피너와 함께 사용자 경험 최적화
 * - 캐싱을 통한 성능 최적화
 */

import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import type { Grade } from "@/types/grade";
import type {
  UnitsTreeResponse,
  UnitSelectionState,
  UnitTreeNode,
  CategoryNode,
  SubcategoryNode,
  UnitNode,
} from "@/types/units-tree";
import type { Problem } from "@/types/exam-sheet";
import {
  unitsTreeWithProblemsQueryOptions,
  basicUnitsTreeQueryOptions,
} from "@/api/units-tree/query";

/**
 * 선택된 학년 atom
 * @description 현재 단원 트리에서 필터링할 학년
 */
export const selectedGradeForUnitsTreeAtom = atom<Grade>("1");

/**
 * 문제 포함 단원 트리 조회 atom (CSR 방식)
 * @description 선택된 학년의 문제 포함 단원 트리를 CSR 방식으로 조회
 *
 * 특징:
 * - 선택된 학년이 변경되면 자동으로 재조회
 * - 대용량 데이터이므로 로딩 스피너 필요
 * - 캐싱을 통한 성능 최적화
 * - AbortController를 통한 자동 요청 취소
 *
 * 사용 예시:
 * ```typescript
 * const { data, isPending, isError, error } = useAtomValue(unitsTreeWithProblemsAtom);
 *
 * if (isPending) return <UnitsTreeLoadingSpinner />;
 * if (isError) return <ErrorDisplay error={error} />;
 *
 * // data 사용
 * ```
 */
/**
 * 문제 포함 단원 트리 조회 atom (grade를 매개변수로 받음)
 * @description 특정 학년의 문제가 포함된 단원 트리를 CSR로 조회하는 atom
 */
/**
 * 문제 포함 단원 트리 조회 atom (CSR 방식)
 * @description 선택된 학년의 문제 포함 단원 트리를 CSR 방식으로 조회
 *
 * 특징:
 * - 선택된 학년이 변경되면 자동으로 재조회
 * - 대용량 데이터이므로 로딩 스피너 필요
 * - 캐싱을 통한 성능 최적화
 * - AbortController를 통한 자동 요청 취소
 *
 * 사용 예시:
 * ```typescript
 * const { data, isPending, isError, error } = useAtomValue(unitsTreeWithProblemsAtom);
 *
 * if (isPending) return <UnitsTreeLoadingSpinner />;
 * if (isError) return <ErrorDisplay error={error} />;
 *
 * // data 사용
 * ```
 */
export const unitsTreeWithProblemsAtom = atomWithQuery((get) => {
  const selectedGrade = get(selectedGradeForUnitsTreeAtom);
  return unitsTreeWithProblemsQueryOptions(selectedGrade);
});

/**
 * 기본 단원 트리 조회 atom (빠른 로딩용)
 * @description 문제 없이 단원 구조만 빠르게 조회하는 atom
 *
 * 용도:
 * - 초기 페이지 로딩 시 단원 구조 미리보기
 * - 검색 및 필터링용 단원 목록
 * - SSR에서 사전 로드
 */
export const basicUnitsTreeAtom = atomWithQuery((get) => {
  const selectedGrade = get(selectedGradeForUnitsTreeAtom);
  return basicUnitsTreeQueryOptions(selectedGrade);
});

/**
 * 단원 선택 상태 atom
 * @description 사용자가 선택한 단원과 문제들을 추적하는 상태
 */
export const unitSelectionStateAtom = atom<UnitSelectionState>({
  selectedUnitIds: new Set<string>(),
  selectedProblemIds: new Set<string>(),
  expandedNodeIds: new Set<string>(),
  searchKeyword: undefined,
  filteredGrade: undefined,
});

/**
 * 선택된 단원 ID들 atom (읽기 전용)
 * @description 현재 선택된 단원 ID들만 추출하는 derived atom
 */
export const selectedUnitIdsAtom = atom((get) => {
  const selectionState = get(unitSelectionStateAtom);
  return selectionState.selectedUnitIds;
});

/**
 * 선택된 문제 ID들 atom (읽기 전용)
 * @description 현재 선택된 문제 ID들만 추출하는 derived atom
 */
export const selectedProblemIdsAtom = atom((get) => {
  const selectionState = get(unitSelectionStateAtom);
  return selectionState.selectedProblemIds;
});

/**
 * 확장된 노드 ID들 atom (읽기/쓰기)
 * @description 트리 UI에서 펼쳐진 노드들을 관리하는 atom
 */
export const expandedNodeIdsAtom = atom(
  (get) => {
    const selectionState = get(unitSelectionStateAtom);
    return selectionState.expandedNodeIds;
  },
  (get, set, nodeId: string) => {
    const currentState = get(unitSelectionStateAtom);
    const newExpandedIds = new Set(currentState.expandedNodeIds);

    if (newExpandedIds.has(nodeId)) {
      newExpandedIds.delete(nodeId);
    } else {
      newExpandedIds.add(nodeId);
    }

    set(unitSelectionStateAtom, {
      ...currentState,
      expandedNodeIds: newExpandedIds,
    });
  },
);

/**
 * 단원/문제 토글 액션 atom (쓰기 전용)
 * @description 단원이나 문제의 선택 상태를 토글하는 액션
 */
export const toggleUnitOrProblemAtom = atom(
  null,
  (get, set, params: { type: "unit" | "problem"; id: string }) => {
    const currentState = get(unitSelectionStateAtom);
    const { type, id } = params;

    if (type === "unit") {
      const newSelectedUnitIds = new Set(currentState.selectedUnitIds);
      if (newSelectedUnitIds.has(id)) {
        newSelectedUnitIds.delete(id);
      } else {
        newSelectedUnitIds.add(id);
      }

      set(unitSelectionStateAtom, {
        ...currentState,
        selectedUnitIds: newSelectedUnitIds,
      });
    } else {
      const newSelectedProblemIds = new Set(currentState.selectedProblemIds);
      if (newSelectedProblemIds.has(id)) {
        newSelectedProblemIds.delete(id);
      } else {
        newSelectedProblemIds.add(id);
      }

      set(unitSelectionStateAtom, {
        ...currentState,
        selectedProblemIds: newSelectedProblemIds,
      });
    }
  },
);

/**
 * 단원의 모든 문제 일괄 선택/해제 atom (쓰기 전용)
 * @description 특정 단원의 모든 문제를 한번에 선택하거나 해제하는 액션
 */
export const toggleAllProblemsInUnitAtom = atom(
  null,
  (get, set, params: { unitId: string; unitNode?: UnitNode }) => {
    const currentState = get(unitSelectionStateAtom);
    const { data } = get(unitsTreeWithProblemsAtom);

    if (!data) return;

    // unitNode가 제공되지 않은 경우 트리에서 찾기
    let targetUnit: UnitNode | undefined = params.unitNode;

    if (!targetUnit) {
      data.categories.forEach((category: CategoryNode) => {
        category.children.forEach((subcategory: SubcategoryNode) => {
          subcategory.children.forEach((unit: UnitNode) => {
            if (unit.id === params.unitId) {
              targetUnit = unit;
            }
          });
        });
      });
    }

    if (
      !targetUnit ||
      !targetUnit.problems ||
      targetUnit.problems.length === 0
    ) {
      return;
    }

    const unitProblemIds = targetUnit.problems.map((p: Problem) => p.id);
    const newSelectedProblemIds = new Set(currentState.selectedProblemIds);

    // 이 단원의 모든 문제가 이미 선택되어 있는지 확인
    const allSelected = unitProblemIds.every((id) =>
      newSelectedProblemIds.has(id),
    );

    if (allSelected) {
      // 모두 선택되어 있으면 모두 해제
      unitProblemIds.forEach((id) => newSelectedProblemIds.delete(id));
    } else {
      // 하나라도 선택되지 않았으면 모두 선택
      unitProblemIds.forEach((id) => newSelectedProblemIds.add(id));
    }

    set(unitSelectionStateAtom, {
      ...currentState,
      selectedProblemIds: newSelectedProblemIds,
    });
  },
);

/**
 * 중분류(Subcategory)의 모든 문제 일괄 선택/해제 atom (쓰기 전용)
 * @description 특정 중분류의 모든 하위 단원 문제를 한번에 선택하거나 해제
 */
export const toggleAllProblemsInSubcategoryAtom = atom(
  null,
  (
    get,
    set,
    params: { subcategoryId: string; subcategoryNode?: SubcategoryNode },
  ) => {
    const currentState = get(unitSelectionStateAtom);
    const { data } = get(unitsTreeWithProblemsAtom);

    if (!data) return;

    let targetSubcategory: SubcategoryNode | undefined = params.subcategoryNode;

    if (!targetSubcategory) {
      data.categories.forEach((category: CategoryNode) => {
        category.children.forEach((subcategory: SubcategoryNode) => {
          if (subcategory.id === params.subcategoryId) {
            targetSubcategory = subcategory;
          }
        });
      });
    }

    if (!targetSubcategory) return;

    const allProblemIds: string[] = [];
    targetSubcategory.children.forEach((unit: UnitNode) => {
      if (unit.problems) {
        unit.problems.forEach((problem: Problem) => {
          allProblemIds.push(problem.id);
        });
      }
    });

    if (allProblemIds.length === 0) return;

    const newSelectedProblemIds = new Set(currentState.selectedProblemIds);
    const allSelected = allProblemIds.every((id) =>
      newSelectedProblemIds.has(id),
    );

    if (allSelected) {
      allProblemIds.forEach((id) => newSelectedProblemIds.delete(id));
    } else {
      allProblemIds.forEach((id) => newSelectedProblemIds.add(id));
    }

    set(unitSelectionStateAtom, {
      ...currentState,
      selectedProblemIds: newSelectedProblemIds,
    });
  },
);

/**
 * 대분류(Category)의 모든 문제 일괄 선택/해제 atom (쓰기 전용)
 * @description 특정 대분류의 모든 하위 문제를 한번에 선택하거나 해제
 */
export const toggleAllProblemsInCategoryAtom = atom(
  null,
  (get, set, params: { categoryId: string; categoryNode?: CategoryNode }) => {
    const currentState = get(unitSelectionStateAtom);
    const { data } = get(unitsTreeWithProblemsAtom);

    if (!data) return;

    let targetCategory: CategoryNode | undefined = params.categoryNode;

    if (!targetCategory) {
      targetCategory = data.categories.find(
        (cat: CategoryNode) => cat.id === params.categoryId,
      );
    }

    if (!targetCategory) return;

    const allProblemIds: string[] = [];
    targetCategory.children.forEach((subcategory: SubcategoryNode) => {
      subcategory.children.forEach((unit: UnitNode) => {
        if (unit.problems) {
          unit.problems.forEach((problem: Problem) => {
            allProblemIds.push(problem.id);
          });
        }
      });
    });

    if (allProblemIds.length === 0) return;

    const newSelectedProblemIds = new Set(currentState.selectedProblemIds);
    const allSelected = allProblemIds.every((id) =>
      newSelectedProblemIds.has(id),
    );

    if (allSelected) {
      allProblemIds.forEach((id) => newSelectedProblemIds.delete(id));
    } else {
      allProblemIds.forEach((id) => newSelectedProblemIds.add(id));
    }

    set(unitSelectionStateAtom, {
      ...currentState,
      selectedProblemIds: newSelectedProblemIds,
    });
  },
);

/**
 * 선택된 문제 상세 정보 atom (읽기 전용)
 * @description 선택된 문제들의 상세 정보를 단원별로 정리
 */
export const selectedProblemsDetailAtom = atom((get) => {
  const selectedProblemIds = get(selectedProblemIdsAtom);
  const { data } = get(unitsTreeWithProblemsAtom);

  if (!data || selectedProblemIds.size === 0) {
    return [];
  }

  type UnitWithSelectedProblems = {
    unitId: string;
    unitName: string;
    unitCode: string;
    categoryName: string;
    subcategoryName: string;
    problems: Problem[];
    totalPoints: number;
    problemCount: number;
  };

  const unitsWithProblems: UnitWithSelectedProblems[] = [];

  data.categories.forEach((category: CategoryNode) => {
    category.children.forEach((subcategory: SubcategoryNode) => {
      subcategory.children.forEach((unit: UnitNode) => {
        if (unit.problems) {
          const selectedProblemsInUnit = unit.problems.filter(
            (problem: Problem) => selectedProblemIds.has(problem.id),
          );

          if (selectedProblemsInUnit.length > 0) {
            unitsWithProblems.push({
              unitId: unit.id,
              unitName: unit.name,
              unitCode: unit.unitCode,
              categoryName: category.name,
              subcategoryName: subcategory.name,
              problems: selectedProblemsInUnit,
              totalPoints: selectedProblemsInUnit.reduce(
                (sum, p) => sum + (p.points || 0),
                0,
              ),
              problemCount: selectedProblemsInUnit.length,
            });
          }
        }
      });
    });
  });

  return unitsWithProblems;
});

/**
 * 검색 키워드 atom (읽기/쓰기)
 * @description 단원 트리 검색 기능을 위한 키워드 상태
 */
export const unitsTreeSearchKeywordAtom = atom(
  (get) => {
    const selectionState = get(unitSelectionStateAtom);
    return selectionState.searchKeyword || "";
  },
  (get, set, keyword: string) => {
    const currentState = get(unitSelectionStateAtom);
    set(unitSelectionStateAtom, {
      ...currentState,
      searchKeyword: keyword.trim() || undefined,
    });
  },
);

/**
 * 필터링된 단원 트리 atom (읽기 전용)
 * @description 검색 키워드와 학년 필터를 적용한 단원 트리
 */
export const filteredUnitsTreeAtom = atom((get) => {
  const { data, isPending, isError, error } = get(unitsTreeWithProblemsAtom);
  const searchKeyword = get(unitsTreeSearchKeywordAtom);

  if (isPending || isError || !data) {
    return {
      data: null,
      isPending,
      isError,
      error,
      filteredCategories: [],
    };
  }

  // 검색 키워드가 없으면 전체 데이터 반환
  if (!searchKeyword) {
    return {
      data,
      isPending,
      isError,
      error,
      filteredCategories: data.categories,
    };
  }

  // 검색 키워드로 필터링
  const keyword = searchKeyword.toLowerCase();
  const filteredCategories = data.categories
    .map((category: CategoryNode) => ({
      ...category,
      children: category.children
        .map((subcategory: SubcategoryNode) => ({
          ...subcategory,
          children: subcategory.children.filter(
            (unit: UnitNode) =>
              unit.name.toLowerCase().includes(keyword) ||
              unit.unitCode.toLowerCase().includes(keyword) ||
              unit.description?.toLowerCase().includes(keyword) ||
              (unit.problems &&
                unit.problems.some(
                  (problem: Problem) =>
                    problem.title.toLowerCase().includes(keyword) ||
                    problem.content.toLowerCase().includes(keyword),
                )),
          ),
        }))
        .filter(
          (subcategory: SubcategoryNode) => subcategory.children.length > 0,
        ),
    }))
    .filter((category: CategoryNode) => category.children.length > 0);

  return {
    data,
    isPending,
    isError,
    error,
    filteredCategories,
  };
});

/**
 * 선택된 문제 통계 atom (읽기 전용)
 * @description 선택된 문제들의 통계 정보를 계산하는 derived atom
 */
export const selectedProblemsStatsAtom = atom((get) => {
  const selectedProblemIds = get(selectedProblemIdsAtom);
  const { data } = get(unitsTreeWithProblemsAtom);

  if (!data || selectedProblemIds.size === 0) {
    return {
      totalCount: 0,
      objectiveCount: 0,
      subjectiveCount: 0,
      totalPoints: 0,
      unitCount: 0,
      selectedProblems: [],
    };
  }

  // 전체 문제 목록에서 선택된 문제들 찾기
  const allProblems: Array<{ unitId: string; problem: Problem }> = [];

  data.categories.forEach((category: CategoryNode) => {
    category.children.forEach((subcategory: SubcategoryNode) => {
      subcategory.children.forEach((unit: UnitNode) => {
        if (unit.problems) {
          unit.problems.forEach((problem: Problem) => {
            if (selectedProblemIds.has(problem.id)) {
              allProblems.push({ unitId: unit.id, problem });
            }
          });
        }
      });
    });
  });

  const objectiveCount = allProblems.filter(
    ({ problem }: { problem: Problem }) => problem.type === "objective",
  ).length;

  const subjectiveCount = allProblems.filter(
    ({ problem }: { problem: Problem }) => problem.type === "subjective",
  ).length;

  const totalPoints = allProblems.reduce(
    (sum: number, { problem }: { problem: Problem }) =>
      sum + (problem.points || 0),
    0,
  );

  const unitIds = new Set(
    allProblems.map(({ unitId }: { unitId: string }) => unitId),
  );

  return {
    totalCount: allProblems.length,
    objectiveCount,
    subjectiveCount,
    totalPoints,
    unitCount: unitIds.size,
    selectedProblems: allProblems.map(
      ({ problem }: { problem: Problem }) => problem,
    ),
  };
});

/**
 * 단원 트리 초기화 액션 atom (쓰기 전용)
 * @description 모든 선택 상태를 초기화하는 액션
 */
export const resetUnitsTreeSelectionAtom = atom(null, (get, set) => {
  set(unitSelectionStateAtom, {
    selectedUnitIds: new Set<string>(),
    selectedProblemIds: new Set<string>(),
    expandedNodeIds: new Set<string>(),
    searchKeyword: undefined,
    filteredGrade: undefined,
  });
});
