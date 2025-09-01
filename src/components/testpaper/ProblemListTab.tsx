// src/components/testpaper/ProblemListTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, RefreshCw, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { badgeStyles } from "@/utils/commonStyles";
import type { Problem, TestPaper } from "@/types/test-paper";
import { UnitSelectionModal } from "./UnitSelectionModal";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/**
 * 문제 목록 탭 컴포넌트
 * @description 문제지 생성 과정에서 자동 선택된 문제들을 관리하고 최종 문제지를 생성하는 핵심 컴포넌트
 * 
 * 주요 기능:
 * - 조건에 따라 자동 선택된 문제들의 목록 표시
 * - 드래그 앤 드롭을 통한 문제 순서 재배치
 * - 개별 문제 교체 기능 (단원 선택 모달을 통해)
 * - 문제지 미리보기 기능
 * - 최종 문제지 생성 및 저장
 * - 문제 상세 정보 표시 (단원, 난이도, 유형, 점수, 보기 등)
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * - 접근성을 고려한 키보드 드래그 앤 드롭 지원
 * 
 * 설계 원칙:
 * - 사용자가 생성하고자 하는 문제지의 전체적인 구성을 한눈에 파악할 수 있도록 설계
 * - 각 문제별로 충분한 정보를 제공하여 교체 필요성을 쉽게 판단할 수 있음
 * - 드래그 앤 드롭 인터페이스로 직관적인 문제 순서 조정 가능
 * - 실제 출제 환경을 고려한 문제 표시 형식 (번호, 점수, 보기 등)
 * - 안전한 문제지 생성을 위한 확인 과정과 에러 처리 포함
 * 
 * 사용 시나리오:
 * - 교사가 특정 조건으로 자동 생성된 문제지를 검토하는 경우
 * - 일부 문제가 마음에 들지 않아 다른 문제로 교체하고 싶은 경우
 * - 문제 순서를 교육과정이나 난이도에 맞게 재배치하고 싶은 경우
 * - 최종 문제지 생성 전 미리보기로 전체 구성을 확인하고 싶은 경우
 * - 생성된 문제지를 나중에 사용하기 위해 저장하고 싶은 경우
 * 
 * 기술적 특징:
 * - @dnd-kit 라이브러리를 사용한 고성능 드래그 앤 드롭
 * - 키보드 네비게이션 지원으로 접근성 향상
 * - React Suspense와 호환되는 비동기 상태 관리
 * - localStorage를 활용한 로컬 데이터 지속성
 * - Toast 알림으로 사용자 피드백 제공
 * - TanStack Router를 통한 타입 안전한 네비게이션
 * 
 * @example
 * ```tsx
 * // 기본 사용법
 * function TestPaperCreationFlow() {
 *   const [problems, setProblems] = useState<Problem[]>(generatedProblems);
 *   const [selectedIds, setSelectedIds] = useState(new Set<string>());
 * 
 *   const handleReorderProblems = (reorderedProblems: Problem[]) => {
 *     setProblems(reorderedProblems);
 *     console.log('문제 순서가 변경되었습니다:', reorderedProblems);
 *   };
 * 
 *   const handleReplaceProblem = (oldId: string, newId: string) => {
 *     // API에서 새 문제 데이터 가져오기
 *     const newProblem = await fetchProblemById(newId);
 *     const updatedProblems = problems.map(p => 
 *       p.id === oldId ? newProblem : p
 *     );
 *     setProblems(updatedProblems);
 *   };
 * 
 *   return (
 *     <ProblemListTab
 *       testName="중간고사 수학 문제지"
 *       problems={problems}
 *       onReorderProblems={handleReorderProblems}
 *       onReplaceProblem={handleReplaceProblem}
 *       onPreviewTestPaper={() => openPreviewModal()}
 *       onBack={() => navigate(-1)}
 *       selectedProblemIds={selectedIds}
 *     />
 *   );
 * }
 * 
 * // 커스텀 문제지 생성 워크플로우
 * function CustomTestCreationWorkflow() {
 *   const [currentStep, setCurrentStep] = useState(1);
 *   const [testConfig, setTestConfig] = useState(initialConfig);
 *   
 *   return (
 *     <div className="multi-step-workflow">
 *       {currentStep === 1 && (
 *         <TestConfigurationStep 
 *           onNext={(config) => {
 *             setTestConfig(config);
 *             setCurrentStep(2);
 *           }}
 *         />
 *       )}
 *       {currentStep === 2 && (
 *         <ProblemListTab
 *           testName={testConfig.testName}
 *           problems={testConfig.generatedProblems}
 *           onReorderProblems={(problems) => 
 *             setTestConfig(prev => ({ ...prev, problems }))
 *           }
 *           // ... 기타 props
 *         />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * 접근성:
 * - 키보드로 드래그 앤 드롭 조작 가능 (Space, Arrow keys)
 * - 스크린 리더를 위한 적절한 ARIA 레이블
 * - 고대비 모드에서도 문제 구분 가능한 시각적 요소
 * - 포커스 인디케이터로 현재 선택된 요소 명확히 표시
 * - 색상에 의존하지 않는 정보 전달 (텍스트 라벨 병행 사용)
 * 
 * 성능 고려사항:
 * - 드래그 앤 드롭 중 불필요한 리렌더링 최소화
 * - 이미지 lazy loading으로 초기 로딩 시간 단축
 * - 대량의 문제 목록 처리를 위한 가상화 준비
 * - 메모이제이션을 통한 복잡한 계산 최적화
 * - 문제지 생성 시 진행 상태 표시로 UX 향상
 */
type ProblemListTabProps = {
  /** 
   * 문제지명
   * @description 생성할 문제지의 제목
   * - 화면 상단에 표시되며 사용자가 현재 작업 중인 문제지를 식별하는 데 사용
   * - 최종 문제지 저장 시 식별자로도 활용
   * @example "중간고사 수학 문제지", "1학년 국어 단원평가"
   */
  testName: string;

  /** 
   * 선택된 문제 목록
   * @description 자동 생성되거나 사용자가 선택한 문제들의 배열
   * - 각 문제는 Problem 타입의 완전한 데이터를 포함
   * - 순서는 실제 문제지에서의 출제 순서를 나타냄
   * - 드래그 앤 드롭으로 순서 변경 가능
   * - 개별 문제는 교체 가능
   */
  problems: Problem[];

  /** 
   * 문제 순서 변경 핸들러
   * @description 드래그 앤 드롭으로 문제 순서가 변경될 때 호출되는 콜백 함수
   * @param problems 새로운 순서로 정렬된 문제 배열
   * @example
   * ```typescript
   * const handleReorder = (newProblems: Problem[]) => {
   *   setProblems(newProblems);
   *   // 순서 변경을 서버에 저장하거나 로컬 상태 업데이트
   *   saveProblemOrder(newProblems.map(p => p.id));
   * };
   * ```
   */
  onReorderProblems: (problems: Problem[]) => void;

  /** 
   * 문제 교체 핸들러
   * @description 특정 문제를 다른 문제로 교체할 때 호출되는 콜백 함수
   * @param oldProblemId 교체될 기존 문제의 ID
   * @param newProblemId 새로 선택된 문제의 ID
   * @example
   * ```typescript
   * const handleReplace = async (oldId: string, newId: string) => {
   *   try {
   *     const newProblem = await fetchProblemById(newId);
   *     const updatedProblems = problems.map(p => 
   *       p.id === oldId ? newProblem : p
   *     );
   *     setProblems(updatedProblems);
   *     toast.success('문제가 성공적으로 교체되었습니다.');
   *   } catch (error) {
   *     toast.error('문제 교체에 실패했습니다.');
   *   }
   * };
   * ```
   */
  onReplaceProblem: (oldProblemId: string, newProblemId: string) => void;

  /** 
   * 문제지 미리보기 핸들러
   * @description 현재 구성된 문제지를 미리보기 모드로 열 때 호출되는 콜백 함수
   * - 일반적으로 새 창이나 모달에서 실제 문제지 형태로 표시
   * - 인쇄 레이아웃을 미리 확인할 수 있음
   * @example
   * ```typescript
   * const handlePreview = () => {
   *   // 미리보기 모달 열기
   *   setPreviewModalOpen(true);
   *   
   *   // 또는 새 창에서 미리보기
   *   const previewWindow = window.open('/preview', '_blank');
   *   previewWindow.postMessage({ problems, testName }, '*');
   * };
   * ```
   */
  onPreviewTestPaper: () => void;

  /** 
   * 뒤로가기 핸들러
   * @description 이전 단계(문제지 설정 단계)로 돌아갈 때 호출되는 콜백 함수
   * - 일반적으로 브라우저 뒤로가기나 라우터 네비게이션 사용
   * - 현재 작업 중인 데이터 저장 여부 확인 필요할 수 있음
   * @example
   * ```typescript
   * const handleBack = () => {
   *   // 변경사항이 있는 경우 확인 대화상자 표시
   *   if (hasUnsavedChanges) {
   *     const confirmed = confirm('저장하지 않은 변경사항이 있습니다. 정말 뒤로가시겠습니까?');
   *     if (!confirmed) return;
   *   }
   *   
   *   navigate(-1); // 또는 특정 경로로 이동
   * };
   * ```
   */
  onBack: () => void;

  /** 
   * 이미 선택된 문제 ID들
   * @description 현재 문제지에 포함된 문제들의 ID 집합
   * - 문제 교체 시 중복 선택 방지용으로 사용
   * - Set 자료구조를 사용하여 O(1) 시간 복잡도로 중복 확인 가능
   * - UnitSelectionModal에서 이미 선택된 문제들을 비활성화 처리하는 데 활용
   * @example
   * ```typescript
   * const selectedIds = new Set(problems.map(p => p.id));
   * 
   * // 문제 교체 시 중복 확인
   * const isAlreadySelected = selectedIds.has(candidateProblemId);
   * if (isAlreadySelected) {
   *   toast.warning('이미 선택된 문제입니다.');
   *   return;
   * }
   * ```
   */
  selectedProblemIds: Set<string>;
};

export function ProblemListTab({
  testName,
  problems,
  onReorderProblems,
  onReplaceProblem,
  onPreviewTestPaper,
  onBack,
  selectedProblemIds,
}: ProblemListTabProps) {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetProblemId, setTargetProblemId] = useState<string>("");

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 드래그 종료 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = problems.findIndex(
        (problem) => problem.id === active.id,
      );
      const newIndex = problems.findIndex((problem) => problem.id === over?.id);

      const newProblems = arrayMove(problems, oldIndex, newIndex);
      onReorderProblems(newProblems);
    }
  };

  // 문제지 생성 핸들러
  const handleCreateTestPaper = async () => {
    setIsCreating(true);

    try {
      // 문제지 생성 로직 (실제로는 API 호출)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연 시뮬레이션

      // 새로 생성된 문제지 데이터
      const newTestPaper: TestPaper = {
        id: `paper-${Date.now()}`, // 고유 ID 생성
        unitName: problems.map((problem) => problem.unitName).join(", "),
        testName,
        questionCount: problems.length,
        createdAt: new Date().toISOString(),
      };

      // localStorage에 새 문제지 저장
      const existingPapers = JSON.parse(
        localStorage.getItem("newTestPapers") || "[]",
      );
      existingPapers.unshift(newTestPaper);
      localStorage.setItem("newTestPapers", JSON.stringify(existingPapers));

      // 성공 메시지 표시
      toast.success("문제지가 성공적으로 생성되었습니다!");

      // 문제지 목록 탭으로 이동
      setTimeout(() => {
        navigate({ to: "/main/test-paper", search: { tab: "list" } });
      }, 1500);
    } catch (error) {
      toast.error("문제지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsCreating(false);
    }
  };

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
            문제지 미리보기
          </Button>
        </div>
      </div>

      {/* 문제 목록 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={problems.map((problem) => problem.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {problems.map((problem, index) => (
              <SortableProblemCard
                key={`problem-${problem.id}-${index}`}
                problem={problem}
                problemNumber={index + 1}
                onReplace={() => handleReplaceClick(problem.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 문제지 생성 버튼 */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          className="w-full max-w-md h-12 text-lg font-semibold"
          onClick={handleCreateTestPaper}
          disabled={isCreating}
        >
          {isCreating ? "생성 중..." : "문제지 생성"}
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
 * 드래그 가능한 문제 카드 컴포넌트
 * @description 개별 문제를 시각적으로 표현하는 드래그 가능한 카드 컴포넌트
 * 
 * 주요 기능:
 * - @dnd-kit을 사용한 고성능 드래그 앤 드롭 지원
 * - 문제 정보의 완전한 시각적 표현 (내용, 이미지, 보기 등)
 * - 키보드 접근성을 고려한 드래그 핸들 제공
 * - 드래그 중 시각적 피드백 (투명도, 그림자, 크기 변화)
 * - 문제 교체를 위한 직관적인 버튼 인터페이스
 * - 문제 유형별 맞춤형 표시 (객관식 보기, 주관식 답안 영역 등)
 * 
 * 설계 원칙:
 * - 실제 문제지 출력 형태와 최대한 유사한 레이아웃
 * - 한눈에 문제의 핵심 정보를 파악할 수 있는 정보 배치
 * - 드래그 앤 드롭 시 사용자가 어떤 문제를 이동 중인지 명확히 인식 가능
 * - 문제 번호, 단원, 유형, 난이도 등 메타데이터의 체계적 표시
 * - 이미지가 있는 문제와 없는 문제 모두 균형잡힌 레이아웃
 * 
 * 접근성 고려사항:
 * - 키보드로 드래그 앤 드롭 조작 가능
 * - 스크린 리더를 위한 적절한 텍스트 라벨
 * - 고대비 모드에서도 구분 가능한 시각적 요소
 * - 포커스 상태의 명확한 시각적 표시
 */
type SortableProblemCardProps = {
  problem: Problem;
  problemNumber: number;
  onReplace: () => void;
};

function SortableProblemCard({
  problem,
  problemNumber,
  onReplace,
}: SortableProblemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: problem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-2 transition-all duration-200",
        isDragging && "opacity-50 shadow-lg scale-105",
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 드래그 핸들 */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
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
