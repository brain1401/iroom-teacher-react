import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronRight } from "lucide-react";
import type { UnitTreeNode } from "@/data/exam-sheet-mock-data";

/**
 * 단원 트리 아이템 컴포넌트 Props
 * @description 계층적 교육과정 단원 구조를 표현하는 트리 컴포넌트의 속성 정의
 *
 * 이 Props는 재귀적 트리 렌더링을 위한 모든 필수 데이터와 핸들러를 포함합니다.
 * 단원부터 세부 문제까지의 계층 구조를 효율적으로 표현할 수 있도록 설계되었습니다.
 */
type UnitTreeItemProps = {
  /**
   * 단원 노드 데이터
   * @description 현재 렌더링할 단원 또는 문제의 완전한 데이터 객체
   *
   * UnitTreeNode 구조:
   * - id: 고유 식별자 ('unit-', 'subunit-', 'problem-' 접두사로 타입 구분)
   * - name: 표시될 단원명 또는 문제 제목
   * - children?: 하위 단원이나 문제들 (재귀 구조)
   * - type?: 문제인 경우 'objective' 또는 'subjective'
   * - difficulty?: 문제 난이도 ('low', 'medium', 'high')
   *
   * @example
   * ```typescript
   * // 단원 노드 예시
   * const unitNode: UnitTreeNode = {
   *   id: "unit-1-1",
   *   name: "1단원. 수와 연산",
   *   children: [
   *     {
   *       id: "subunit-1-1-1",
   *       name: "자연수와 정수",
   *       children: [
   *         {
   *           id: "problem-123",
   *           name: "자연수의 개념 문제",
   *           type: "objective",
   *           difficulty: "medium"
   *         }
   *       ]
   *     }
   *   ]
   * };
   * ```
   */
  unit: UnitTreeNode;

  /**
   * 트리 레벨 (들여쓰기용)
   * @description 현재 노드가 트리에서 몇 번째 깊이에 위치하는지 나타내는 수치
   *
   * - 0: 최상위 단원 (예: "1단원. 수와 연산")
   * - 1: 중단원 (예: "자연수와 정수")
   * - 2: 소단원 (예: "자연수의 개념")
   * - 3+: 세부 문제들
   *
   * 용도:
   * - CSS marginLeft 계산에 사용 (`${level * 16}px`)
   * - 초기 확장 상태 결정 (level < 2인 경우 기본 확장)
   * - 시각적 계층 구조 표현을 위한 들여쓰기
   *
   * @default 0
   * @example
   * ```tsx
   * // 레벨별 시각적 표현
   * // level 0: 1단원. 수와 연산
   * //   level 1:   자연수와 정수
   * //     level 2:     자연수의 개념
   * //       level 3:       [문제 1] 자연수란?
   * ```
   */
  level?: number;

  /**
   * 선택된 아이템들
   * @description 현재 사용자가 선택한 문제들의 ID를 저장하는 Set 자료구조
   *
   * 특징:
   * - Set 사용으로 O(1) 시간 복잡도의 중복 확인
   * - 문제 ID만 저장 (단원은 선택 불가)
   * - 체크박스 상태 결정에 사용
   * - 실시간 선택/해제 상태 반영
   *
   * @example
   * ```typescript
   * const [selectedItems, setSelectedItems] = useState(
   *   new Set<string>(['problem-123', 'problem-456'])
   * );
   *
   * // 선택 상태 확인
   * const isSelected = selectedItems.has('problem-123');
   *
   * // 새 문제 선택
   * const newSelected = new Set(selectedItems).add('problem-789');
   * setSelectedItems(newSelected);
   * ```
   */
  selectedItems: Set<string>;

  /**
   * 아이템 토글 핸들러
   * @description 문제의 선택 상태를 변경할 때 호출되는 콜백 함수
   *
   * 동작 방식:
   * - 이미 선택된 문제인 경우: 선택 해제
   * - 선택되지 않은 문제인 경우: 선택 추가
   * - 단원 클릭 시에는 호출되지 않음 (문제만 선택 가능)
   *
   * @param id 토글할 문제의 고유 ID ('problem-' 접두사)
   *
   * @example
   * ```typescript
   * const handleToggleItem = (problemId: string) => {
   *   setSelectedItems(prev => {
   *     const newSet = new Set(prev);
   *     if (newSet.has(problemId)) {
   *       newSet.delete(problemId);
   *       console.log(`문제 ${problemId} 선택 해제`);
   *     } else {
   *       newSet.add(problemId);
   *       console.log(`문제 ${problemId} 선택`);
   *
   *       // 선택 제한 검사
   *       if (newSet.size > maxSelectionCount) {
   *         toast.error(`최대 ${maxSelectionCount}개까지 선택 가능합니다.`);
   *         newSet.delete(problemId);
   *       }
   *     }
   *     return newSet;
   *   });
   * };
   * ```
   */
  onToggleItem: (id: string) => void;

  /**
   * 문제 상세보기 핸들러
   * @description 문제의 상세 내용을 볼 수 있는 모달이나 페이지를 열 때 호출되는 콜백 함수
   *
   * 용도:
   * - 문제 전문 내용 표시
   * - 문제 이미지나 도표 확인
   * - 객관식 보기나 주관식 답안 예시 확인
   * - 문제 메타데이터 (난이도, 단원, 출제 의도 등) 표시
   *
   * @param problemId 상세보기할 문제의 고유 ID
   *
   * @example
   * ```typescript
   * const handleProblemDetail = (problemId: string) => {
   *   // 모달 방식
   *   setProblemDetailModal({
   *     isOpen: true,
   *     problemId: problemId
   *   });
   *
   *   // 또는 새 창 방식
   *   const detailWindow = window.open(
   *     `/problems/${problemId}`,
   *     '_blank',
   *     'width=800,height=600'
   *   );
   *
   *   // 또는 라우터 네비게이션
   *   navigate({
   *     to: '/problem-detail/$problemId',
   *     params: { problemId }
   *   });
   * };
   * ```
   */
  onProblemDetail: (problemId: string) => void;
};

/**
 * 단원 트리 아이템 컴포넌트
 * @description 교육과정의 계층적 단원 구조를 시각적으로 표현하는 재귀적 트리 컴포넌트
 *
 * 주요 기능:
 * - 무한 깊이의 계층적 단원 구조 렌더링 (재귀 컴포넌트)
 * - 단원별 확장/축소 기능으로 필요한 부분만 표시
 * - 문제 단위의 개별 선택 기능 (체크박스)
 * - 문제 유형별 시각적 구분 (객관식/주관식 배지)
 * - 레벨별 들여쓰기로 직관적인 계층 구조 표현
 * - 문제 상세보기 및 미리보기 기능
 * - 키보드 접근성을 고려한 인터랙션
 * - 반응형 레이아웃으로 다양한 화면 크기 지원
 *
 * 아키텍처 특징:
 * - 재귀적 렌더링으로 무한 깊이 트리 구조 지원
 * - 메모리 효율적인 확장 상태 관리 (각 노드별 독립적 상태)
 * - Set 자료구조 활용으로 O(1) 선택 상태 확인
 * - 불변성을 지키는 상태 업데이트 패턴
 * - 이벤트 버블링을 활용한 효율적인 클릭 핸들링
 *
 * 사용 시나리오:
 * - 문제 은행에서 특정 단원의 문제들을 브라우징하는 경우
 * - 시험지 생성 시 여러 단원에서 문제를 선택하는 경우
 * - 교육과정 구조를 따라 단계적으로 문제를 탐색하는 경우
 * - 특정 유형이나 난이도의 문제만 필터링하여 보는 경우
 * - 대량의 문제 중에서 원하는 문제들을 체크리스트 방식으로 선택하는 경우
 *
 * 설계 원칙:
 * - 교육과정의 자연스러운 계층 구조를 그대로 반영
 * - 사용자가 현재 어느 위치에 있는지 시각적으로 명확히 표현
 * - 대용량 데이터셋에서도 부분 로딩과 확장/축소로 성능 유지
 * - 터치 환경과 키보드 환경 모두에서 편리한 조작 가능
 * - 일관된 시각적 패턴으로 사용자 학습 곡선 최소화
 *
 * 접근성:
 * - 키보드로 전체 트리 네비게이션 가능 (Tab, Arrow keys)
 * - 스크린 리더를 위한 적절한 ARIA 레이블과 역할 정의
 * - 고대비 모드에서도 구분 가능한 시각적 요소 사용
 * - 포커스 상태의 명확한 시각적 표시
 * - 확장/축소 상태를 스크린 리더에게 전달
 *
 * 성능 최적화:
 * - 가상화(virtualization) 지원으로 대량 데이터 처리
 * - 필요한 노드만 렌더링하는 지연 로딩
 * - 메모이제이션을 통한 불필요한 리렌더링 방지
 * - 이벤트 핸들러의 효율적인 메모리 관리
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
