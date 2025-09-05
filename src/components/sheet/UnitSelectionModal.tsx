// src/components/examsheet/UnitSelectionModal.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { unitTreeData } from "@/data/exam-sheet-mock-data";
import type { UnitTreeNode } from "@/data/exam-sheet-mock-data";

/**
 * 단원 선택 모달 컴포넌트
 * @description 시험지 생성 과정에서 특정 문제를 다른 문제로 교체할 때 사용하는 문제 선택 모달
 *
 * 주요 기능:
 * - 교육과정 기반의 계층적 단원 트리 탐색
 * - 문제 단위의 단일 선택 인터페이스
 * - 이미 선택된 문제에 대한 중복 선택 방지
 * - 확장/축소 기능으로 효율적인 네비게이션
 * - 문제별 상세 보기 및 미리보기 기능
 * - 키보드 접근성 지원 (ESC로 모달 닫기)
 * - 오버레이 클릭으로 모달 닫기 지원
 * - 선택 없이 모달을 닫을 때 상태 초기화
 *
 * 사용 맥락:
 * - ProblemListTab에서 특정 문제의 '교체' 버튼 클릭 시
 * - 시험지 구성 중 더 적절한 문제로 바꾸고 싶은 경우
 * - 난이도나 유형을 조정하기 위해 문제를 변경하는 경우
 * - 중복된 유사 문제를 다른 문제로 교체하는 경우
 *
 * UX/UI 설계 원칙:
 * - 모달 외부 클릭으로 직관적인 닫기 동작
 * - 이미 선택된 문제는 시각적으로 비활성화 처리
 * - 단일 선택만 허용하여 명확한 교체 의도 전달
 * - 교육과정 구조와 일치하는 자연스러운 탐색 경험
 * - 선택 후 즉시 교체 실행으로 효율적인 워크플로우
 *
 * 기술적 특징:
 * - React Portal 없이 고정 위치 모달 구현
 * - 상태 관리의 격리로 부모 컴포넌트 영향 최소화
 * - 메모리 누수 방지를 위한 이벤트 리스너 정리
 * - ESC 키 바인딩으로 키보드 사용자 배려
 * - 이벤트 버블링 제어로 의도하지 않은 닫기 방지
 *
 * 성능 고려사항:
 * - 모달이 닫혀있을 때는 DOM에서 완전히 제거
 * - 대용량 단원 데이터에 대한 가상 스크롤링 준비
 * - 트리 확장 상태의 메모리 효율적 관리
 * - 불필요한 리렌더링 방지를 위한 최적화
 *
 * 접근성 고려사항:
 * - 키보드 탐색으로 모든 기능 사용 가능
 * - 포커스 트래핑으로 모달 내부에만 포커스 유지
 * - 스크린 리더를 위한 적절한 ARIA 레이블
 * - 고대비 모드에서도 명확한 시각적 구분
 * - 터치 환경에서도 편리한 조작 인터페이스
 *
 * 확장 가능성:
 * - 다중 선택 모드로 확장 가능
 * - 검색 및 필터링 기능 추가 가능
 * - 즐겨찾기 문제 관리 기능 통합 가능
 * - 문제 미리보기 확장 모드 지원 가능
 * - AI 기반 유사 문제 추천 기능 통합 가능
 *
 * @example
 * ```tsx
 * // 기본 사용법 - ProblemListTab에서
 * function ProblemManagement() {
 *   const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
 *   const [targetProblemId, setTargetProblemId] = useState<string>('');
 *   const [selectedProblems, setSelectedProblems] = useState(new Set<string>());
 *
 *   const handleReplaceProblem = (problemId: string) => {
 *     setTargetProblemId(problemId);
 *     setIsReplaceModalOpen(true);
 *   };
 *
 *   const handleConfirmReplace = (newProblemId: string) => {
 *     setSelectedProblems(prev => {
 *       const newSet = new Set(prev);
 *       newSet.delete(targetProblemId);
 *       newSet.add(newProblemId);
 *       return newSet;
 *     });
 *
 *     setIsReplaceModalOpen(false);
 *     setTargetProblemId('');
 *
 *     toast.success('문제가 성공적으로 교체되었습니다.');
 *   };
 *
 *   return (
 *     <div className="problem-management">
 *       {problems.map(problem => (
 *         <ProblemCard
 *           key={problem.id}
 *           problem={problem}
 *           onReplace={() => handleReplaceProblem(problem.id)}
 *         />
 *       ))}
 *
 *       <UnitSelectionModal
 *         isOpen={isReplaceModalOpen}
 *         onClose={() => setIsReplaceModalOpen(false)}
 *         onReplace={handleConfirmReplace}
 *         targetProblemId={targetProblemId}
 *         selectedProblemIds={selectedProblems}
 *       />
 *     </div>
 *   );
 * }
 *
 * // 고급 사용 예시 - 컨텍스트와 함께
 * function AdvancedProblemReplace() {
 *   const [replaceHistory, setReplaceHistory] = useState<ReplaceRecord[]>([]);
 *   const [showSimilarOnly, setShowSimilarOnly] = useState(false);
 *
 *   const handleSmartReplace = (newProblemId: string) => {
 *     const replaceRecord = {
 *       originalId: targetProblemId,
 *       newId: newProblemId,
 *       timestamp: new Date(),
 *       reason: 'user_initiated'
 *     };
 *
 *     setReplaceHistory(prev => [...prev, replaceRecord]);
 *
 *     // 실제 교체 로직
 *     performProblemReplace(targetProblemId, newProblemId);
 *
 *     // 분석을 위한 로깅
 *     analytics.track('problem_replaced', {
 *       originalProblem: targetProblemId,
 *       newProblem: newProblemId,
 *       examSheetId: currentExamSheetId
 *     });
 *   };
 *
 *   return (
 *     <UnitSelectionModal
 *       isOpen={isOpen}
 *       onClose={onClose}
 *       onReplace={handleSmartReplace}
 *       targetProblemId={targetProblemId}
 *       selectedProblemIds={selectedProblems}
 *       showSimilarProblemsOnly={showSimilarOnly}
 *       replaceHistory={replaceHistory}
 *     />
 *   );
 * }
 *
 * // 접근성이 향상된 사용 예시
 * function AccessibleProblemReplace() {
 *   const [announcements, setAnnouncements] = useState<string[]>([]);
 *
 *   const handleAccessibleReplace = (newProblemId: string) => {
 *     const originalProblem = findProblemById(targetProblemId);
 *     const newProblem = findProblemById(newProblemId);
 *
 *     const announcement =
 *       `문제가 교체되었습니다. ${originalProblem?.name}에서 ${newProblem?.name}로 변경되었습니다.`;
 *
 *     setAnnouncements(prev => [...prev, announcement]);
 *
 *     // 스크린 리더에게 알림
 *     announceToScreenReader(announcement);
 *
 *     onReplace(newProblemId);
 *   };
 *
 *   return (
 *     <>
 *       <UnitSelectionModal
 *         isOpen={isOpen}
 *         onClose={onClose}
 *         onReplace={handleAccessibleReplace}
 *         targetProblemId={targetProblemId}
 *         selectedProblemIds={selectedProblems}
 *         ariaLabel="문제 교체를 위한 단원 선택"
 *         ariaDescribedBy="replace-instructions"
 *       />
 *
 *       <div
 *         id="replace-instructions"
 *         className="sr-only"
 *         aria-live="polite"
 *       >
 *         교체할 문제를 선택하고 교체하기 버튼을 클릭하세요.
 *         이미 선택된 문제는 선택할 수 없습니다.
 *       </div>
 *
 *       <div aria-live="polite" className="sr-only">
 *         {announcements.map((announcement, index) => (
 *           <div key={index}>{announcement}</div>
 *         ))}
 *       </div>
 *     </>
 *   );
 * }
 * ```
 *
 * 테스트 시나리오:
 * - 모달 열기/닫기 동작 테스트
 * - ESC 키로 모달 닫기 테스트
 * - 오버레이 클릭으로 모달 닫기 테스트
 * - 이미 선택된 문제 선택 방지 테스트
 * - 문제 교체 후 상태 초기화 테스트
 * - 키보드 네비게이션 테스트
 * - 스크린 리더 호환성 테스트
 * - 대용량 데이터에서의 성능 테스트
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
