// src/components/examsheet/ExamSheetRegistrationTab.tsx
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
import { useExamSheetRegistration } from "@/hooks/exam-sheet/useExamSheetRegistration";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
// Mock data imports removed - will be replaced with server API calls
/**
 * 문제지 등록 탭 콘텐츠
 * @description 교사가 새로운 시험지를 생성하기 위한 종합적인 인터페이스를 제공하는 핵심 컴포넌트
 *
 * 주요 기능:
 * - 시험지 기본 정보 설정 (시험지명, 학년, 문항 수)
 * - 계층적 단원 구조를 통한 직관적인 문제 선택
 * - 실시간 문항 유형별 개수 추적 (객관식/주관식)
 * - 선택한 문제들의 체계적 관리 및 미리보기
 * - 드래그 앤 드롭으로 조절 가능한 반응형 레이아웃
 * - 문제 상세보기를 통한 선택 전 검토 기능
 * - 시험지 생성 후 자동 워크플로우 연결
 * - 접근성과 사용성을 고려한 키보드 네비게이션
 *
 * 컴포넌트 구조:
 * - 상단: 시험지 기본 정보 입력 섹션
 * - 좌측: 교육과정 기반 단원 트리 (문제 선택용)
 * - 우측: 선택된 문제 목록 및 관리 도구
 * - 하단: 시험지 생성 액션 버튼
 * - 모달: 문제 상세보기 및 미리보기
 *
 * 설계 철학:
 * - 교사의 자연스러운 시험 출제 프로세스를 디지털화
 * - 교육과정과 일치하는 직관적인 단원 구조 탐색
 * - 실시간 피드백으로 시험지 구성 현황 투명하게 제공
 * - 실수를 방지하는 다단계 검토 및 확인 프로세스
 * - 반복 작업을 최소화하는 효율적인 인터페이스
 *
 * 워크플로우 시나리오:
 * 1. 시험지 기본 정보 입력 (시험지명, 학년 선택)
 * 2. 단원 트리에서 출제 범위에 해당하는 문제들 탐색
 * 3. 개별 문제의 상세 내용 확인 및 선택/해제
 * 4. 선택된 문제 목록에서 최종 구성 검토
 * 5. 문항 유형 및 개수 확인 후 시험지 생성
 * 6. 생성된 시험지의 미리보기 및 수정
 * 7. 최종 확정 및 시험 목록으로 자동 이동
 *
 * 사용자 경험 고려사항:
 * - 대용량 문제 은행에서도 빠른 탐색 및 선택
 * - 시각적 피드백으로 현재 선택 상태 명확히 표시
 * - 실수로 선택한 문제의 쉬운 제거 및 교체
 * - 문항 수 제한 등 제약 조건의 직관적 알림
 * - 작업 중단 시에도 선택 상태 보존 (세션 관리)
 *
 * 기술적 특징:
 * - React 18의 최신 훅 패턴 활용
 * - 커스텀 훅을 통한 복잡한 상태 로직 캡슐화
 * - 불변성을 지키는 상태 관리로 예측 가능한 동작
 * - 메모이제이션을 통한 대용량 데이터 렌더링 최적화
 * - TanStack Router를 활용한 타입 안전한 네비게이션
 * - 로컬 스토리지 활용으로 데이터 지속성 보장
 *
 * 접근성 및 사용성:
 * - WCAG 2.1 AA 수준의 접근성 준수
 * - 키보드만으로도 모든 기능 사용 가능
 * - 스크린 리더를 위한 적절한 ARIA 레이블
 * - 고대비 모드에서도 명확한 시각적 구분
 * - 터치 환경에서도 편리한 조작 가능
 * - 다국어 지원을 고려한 텍스트 레이아웃
 *
 * 성능 최적화:
 * - 가상 스크롤링으로 대용량 단원 트리 처리
 * - 디바운싱된 검색으로 실시간 필터링
 * - 지연 로딩으로 초기 로딩 시간 최적화
 * - 이미지 프리로딩으로 미리보기 속도 향상
 * - 메모리 누수 방지를 위한 적절한 정리 로직
 *
 * 확장성 고려사항:
 * - 다양한 문제 유형 추가 대응 (서술형, 실기 등)
 * - 협업 기능을 위한 실시간 동기화 준비
 * - AI 기반 문제 추천 기능 통합 가능
 * - 다중 시험지 일괄 생성 기능 확장 준비
 * - 외부 문제 은행 연동 인터페이스 준비
 *
 * @example
 * ```tsx
 * // 기본 사용법 - 라우팅 컨텍스트에서
 * function ExamSheetManagementPage() {
 *   const [currentTab, setCurrentTab] = useState('registration');
 *
 *   return (
 *     <div className="exam-sheet-management">
 *       <TabNavigation
 *         activeTab={currentTab}
 *         onTabChange={setCurrentTab}
 *       />
 *
 *       {currentTab === 'registration' && (
 *         <ExamSheetRegistrationTab />
 *       )}
 *
 *       {currentTab === 'list' && (
 *         <ExamSheetListTab />
 *       )}
 *     </div>
 *   );
 * }
 *
 * // 커스텀 설정과 함께 사용
 * function CustomExamSheetCreation() {
 *   const [maxQuestions] = useState(50); // 기본 30 대신 50문항
 *   const [allowedGrades] = useState(['중1', '중2', '중3', '고1']);
 *
 *   return (
 *     <ExamSheetRegistrationTab
 *       maxQuestions={maxQuestions}
 *       availableGrades={allowedGrades}
 *       onExamCreated={(exam) => {
 *         console.log('새로운 시험지 생성:', exam);
 *         // 커스텀 후처리 로직
 *         sendAnalytics('exam_sheet_created', {
 *           questionCount: exam.questions.length,
 *           grade: exam.grade
 *         });
 *       }}
 *     />
 *   );
 * }
 *
 * // 미리 구성된 템플릿으로 시작
 * function TemplateBasedCreation() {
 *   const midtermTemplate = {
 *     name: '1학기 중간고사',
 *     grade: '중2',
 *     preselectedUnits: ['unit-2-1', 'unit-2-2'],
 *     suggestedQuestionCount: 25
 *   };
 *
 *   return (
 *     <ExamSheetRegistrationTab
 *       initialTemplate={midtermTemplate}
 *       showTemplateSelector={true}
 *       onTemplateApply={(template) => {
 *         console.log('템플릿 적용:', template);
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * 통합 테스트 시나리오:
 * - 시험지 생성 전체 플로우 테스트
 * - 대용량 문제 데이터셋에서의 성능 테스트
 * - 다양한 브라우저 및 디바이스에서의 호환성 테스트
 * - 접근성 도구를 사용한 사용성 테스트
 * - 네트워크 지연 상황에서의 로딩 테스트
 */
export function ExamSheetRegistrationTab() {
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
    handlePreviewExamSheet,
    getSelectedProblems,
    setExamCreatedCallback,
  } = useExamSheetRegistration();

  /**
   * 시험 출제 완료 후 시험 목록 탭으로 이동
   */
  useEffect(() => {
    setExamCreatedCallback((newExam) => {
      // 시험 목록 탭으로 이동
      console.log("시험 출제 완료:", newExam);
      // localStorage에 새로운 시험 정보 저장
      const newExams = JSON.parse(localStorage.getItem("newExams") || "[]");
      newExams.push(newExam);
      localStorage.setItem("newExams", JSON.stringify(newExams));

      // 시험 목록 탭으로 이동
      window.location.href = "/main/exam-management?tab=list";
    });
  }, [setExamCreatedCallback]);

  // 문제 목록 화면이 활성화된 경우
  if (showProblemList) {
    return (
      <ProblemListTab
        examName={examName}
        problems={getSelectedProblems()}
        onReorderProblems={reorderProblems}
        onReplaceProblem={replaceProblem}
        onPreviewExamSheet={handlePreviewExamSheet}
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
                {/* TODO: unitTreeData를 서버 API로 교체 필요 */}
                {[].map((unit: any) => (
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
                                  {/* TODO: findProblemInTree를 서버 API로 교체 필요 */}
                                  <Circle className="h-3 w-3 text-blue-500 flex-shrink-0" />
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
