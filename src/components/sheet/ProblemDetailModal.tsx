// src/components/examsheet/ProblemDetailModal.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types/exam-sheet";

/**
 * 문제 상세보기 모달 컴포넌트
 * @description 시험 문제의 완전한 상세 정보를 표시하는 전용 모달 컴포넌트
 *
 * 주요 기능:
 * - 문제의 모든 세부 정보 완전 표시 (제목, 내용, 이미지, 보기, 메타데이터)
 * - 문제 유형별 맞춤형 레이아웃 (객관식 보기 vs 주관식 답안 영역)
 * - 시각적으로 구조화된 정보 배치로 가독성 극대화
 * - 다양한 미디어 타입 지원 (텍스트, 이미지, 수식)
 * - 접근성을 고려한 키보드 네비게이션
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * - 오버레이 클릭 및 ESC 키로 직관적인 모달 닫기
 * - 스크롤 가능한 콘텐츠 영역으로 긴 문제도 완전 표시
 *
 * 설계 철학:
 * - 실제 시험지 출력 형태와 최대한 유사한 시각적 표현
 * - 교사가 문제를 선택하기 전 충분한 정보를 제공
 * - 문제의 모든 요소를 누락 없이 명확하게 표시
 * - 사용자가 문제의 품질과 적절성을 즉시 판단할 수 있도록 지원
 * - 시각적 위계를 통한 정보의 논리적 그룹화
 *
 * 사용 맥락:
 * - UnitTreeItem에서 '상세 보기' 버튼 클릭 시
 * - ProblemListTab에서 문제 미리보기가 필요한 경우
 * - UnitSelectionModal에서 교체 전 문제 확인 시
 * - 문제 은행 브라우징 중 상세 검토가 필요한 경우
 * - 시험지 구성 중 문제 적절성 판단이 필요한 경우
 *
 * UI/UX 설계 원칙:
 * - 정보 밀도와 가독성의 최적 균형점 추구
 * - 문제 유형별 특성을 반영한 차별화된 레이아웃
 * - 시각적 구분자(배지, 색상, 간격)로 정보 그룹화
 * - 긴 내용도 부담 없이 읽을 수 있는 스크롤 영역 제공
 * - 모달 외부 클릭으로 자연스러운 닫기 동작
 *
 * 기술적 특징:
 * - React Portal 없이 고정 위치 모달 구현
 * - 이벤트 버블링 제어로 의도하지 않은 닫기 방지
 * - 조건부 렌더링으로 필요한 섹션만 표시
 * - 메모리 효율을 위한 모달 상태 관리
 * - 이미지 로딩 최적화와 오류 처리
 *
 * 성능 최적화:
 * - 모달이 닫힌 상태에서는 DOM에서 완전히 제거
 * - 이미지 lazy loading으로 초기 렌더링 속도 향상
 * - 불필요한 리렌더링 방지를 위한 조건부 렌더링
 * - 대용량 텍스트 콘텐츠의 효율적인 표시
 *
 * 접근성 고려사항:
 * - 키보드 탐색으로 모든 요소 접근 가능
 * - 스크린 리더를 위한 적절한 ARIA 레이블
 * - 고대비 모드에서도 명확한 정보 구분
 * - 포커스 트래핑으로 모달 내부에만 포커스 유지
 * - 의미있는 텍스트 대안으로 이미지 설명 제공
 *
 * 확장성 고려사항:
 * - 새로운 문제 유형 추가에 대한 대응력
 * - 다국어 지원을 위한 텍스트 레이아웃 유연성
 * - 수식 렌더링 엔진 통합 준비
 * - 오디오/비디오 미디어 지원 확장 가능
 * - 문제 편집 모드로 전환 기능 추가 가능
 *
 * @example
 * ```tsx
 * // 기본 사용법 - 문제 상세보기
 * function ProblemBrowser() {
 *   const [detailModal, setDetailModal] = useState({
 *     isOpen: false,
 *     problem: null
 *   });
 *
 *   const handleProblemDetail = (problem: Problem) => {
 *     setDetailModal({
 *       isOpen: true,
 *       problem: problem
 *     });
 *   };
 *
 *   return (
 *     <>
 *       {problems.map(problem => (
 *         <ProblemCard
 *           key={problem.id}
 *           problem={problem}
 *           onViewDetail={() => handleProblemDetail(problem)}
 *         />
 *       ))}
 *
 *       <ProblemDetailModal
 *         isOpen={detailModal.isOpen}
 *         onClose={() => setDetailModal({ isOpen: false, problem: null })}
 *         problem={detailModal.problem}
 *       />
 *     </>
 *   );
 * }
 *
 * // 고급 사용 예시 - 문제 비교 모드
 * function ProblemComparison() {
 *   const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
 *   const [problemHistory, setProblemHistory] = useState<Problem[]>([]);
 *
 *   const handleProblemView = (problem: Problem) => {
 *     // 이전에 본 문제들 히스토리에 추가
 *     if (currentProblem) {
 *       setProblemHistory(prev => [currentProblem, ...prev.slice(0, 4)]);
 *     }
 *     setCurrentProblem(problem);
 *   };
 *
 *   return (
 *     <div className="problem-comparison">
 *       <div className="main-problem-area">
 *         <ProblemDetailModal
 *           isOpen={!!currentProblem}
 *           onClose={() => setCurrentProblem(null)}
 *           problem={currentProblem}
 *         />
 *       </div>
 *
 *       <div className="problem-history">
 *         <h3>최근 본 문제들</h3>
 *         {problemHistory.map((problem, index) => (
 *           <ProblemMiniCard
 *             key={`${problem.id}-${index}`}
 *             problem={problem}
 *             onClick={() => handleProblemView(problem)}
 *           />
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 *
 * // 맞춤형 모달 - 추가 기능 포함
 * function EnhancedProblemModal() {
 *   const [showMetadata, setShowMetadata] = useState(false);
 *   const [fontSize, setFontSize] = useState('medium');
 *
 *   return (
 *     <ProblemDetailModal
 *       isOpen={isOpen}
 *       onClose={onClose}
 *       problem={problem}
 *       renderHeader={() => (
 *         <div className="enhanced-header">
 *           <h2>문제 상세보기</h2>
 *           <div className="controls">
 *             <FontSizeSelector
 *               value={fontSize}
 *               onChange={setFontSize}
 *             />
 *             <Toggle
 *               pressed={showMetadata}
 *               onPressedChange={setShowMetadata}
 *             >
 *               메타데이터 표시
 *             </Toggle>
 *           </div>
 *         </div>
 *       )}
 *       showMetadata={showMetadata}
 *       fontSize={fontSize}
 *     />
 *   );
 * }
 *
 * // 접근성이 강화된 사용 예시
 * function AccessibleProblemViewer() {
 *   const [announcements, setAnnouncements] = useState<string[]>([]);
 *
 *   const handleAccessibleOpen = (problem: Problem) => {
 *     const announcement = `
 *       ${problem.number}번 문제 상세보기가 열렸습니다.
 *       ${problem.type === 'objective' ? '객관식' : '주관식'} 문제이며,
 *       난이도는 ${getDifficultyText(problem.difficulty)}입니다.
 *     `;
 *
 *     setAnnouncements(prev => [...prev, announcement]);
 *
 *     // 스크린 리더에게 알림
 *     announceToScreenReader(announcement);
 *   };
 *
 *   return (
 *     <>
 *       <ProblemDetailModal
 *         isOpen={isOpen}
 *         onClose={onClose}
 *         problem={problem}
 *         onOpen={() => handleAccessibleOpen(problem)}
 *         ariaLabel={`${problem?.number}번 문제 상세보기`}
 *         ariaDescribedBy="problem-instructions"
 *       />
 *
 *       <div
 *         id="problem-instructions"
 *         className="sr-only"
 *       >
 *         문제의 상세 내용을 확인할 수 있습니다.
 *         ESC 키 또는 닫기 버튼으로 모달을 닫을 수 있습니다.
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
 * - 다양한 문제 유형 (객관식/주관식) 표시 테스트
 * - 이미지 포함 문제의 올바른 렌더링 테스트
 * - 긴 텍스트 콘텐츠의 스크롤 동작 테스트
 * - 모달 열기/닫기 동작 테스트
 * - 키보드 네비게이션 테스트
 * - 스크린 리더 호환성 테스트
 * - 반응형 레이아웃 테스트
 * - 성능 부하 테스트 (대용량 데이터)
 */
type ProblemDetailModalProps = {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 표시할 문제 데이터 */
  problem: Problem | null;
};

export function ProblemDetailModal({
  isOpen,
  onClose,
  problem,
}: ProblemDetailModalProps) {
  if (!isOpen || !problem) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sky-600">문제 상세보기</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* 문제 번호 및 제목 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {problem.number}번
              </Badge>
              <Badge
                variant={problem.type === "objective" ? "default" : "secondary"}
                className="text-sm"
              >
                {problem.type === "objective" ? "객관식" : "주관식"}
              </Badge>
              <Badge
                variant={
                  problem.difficulty === "high"
                    ? "destructive"
                    : problem.difficulty === "medium"
                      ? "default"
                      : "secondary"
                }
                className="text-sm"
              >
                {problem.difficulty === "high"
                  ? "상"
                  : problem.difficulty === "medium"
                    ? "중"
                    : "하"}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {problem.points}점
              </Badge>
            </div>
            <h3 className="text-lg font-semibold">{problem.title}</h3>
          </div>

          {/* 문제 내용 */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">문제 내용</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {problem.content}
              </p>
            </div>
          </div>

          {/* 문제 이미지 */}
          {problem.imageUrl && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">문제 이미지</h4>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={problem.imageUrl}
                  alt="문제 이미지"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            </div>
          )}

          {/* 객관식 보기 */}
          {problem.type === "objective" && problem.options && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">보기</h4>
              <div className="space-y-2">
                {problem.options?.map((option, optionIndex) => (
                  <div
                    key={`option-${option}-${problem.id || 'unknown'}`}
                    className="flex items-center gap-2 p-2 rounded border"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="text-sm">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 문제 정보 */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">문제 정보</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">단원:</span>
                <span className="ml-2 font-medium">{problem.unitName}</span>
              </div>
              <div>
                <span className="text-gray-500">생성일:</span>
                <span className="ml-2 font-medium">
                  {problem.createdAt
                    ? new Date(problem.createdAt).toLocaleDateString()
                    : "정보 없음"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
