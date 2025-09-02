import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ExamSubmitStatusDetail } from "@/types/exam";
import type { QuestionAnswer } from "./ExamDetail";

/**
 * 답안지 결과 모달 컴포넌트 Props
 * @interface AnswerSheetResultProps
 */
type AnswerSheetResultProps = {
  /** 선택된 학생의 시험 제출 상세 정보 - null이면 모달 비활성화 */
  selectedSubmission: ExamSubmitStatusDetail | null;
  /** 학생의 문항별 답안 정보 배열 - 빈 배열이면 모달 비활성화 */
  selectedAnswers: QuestionAnswer[];
  /** 모달 닫기 핸들러 함수 - 사용자가 모달을 닫을 때 실행 */
  onClose: () => void;
};

/**
 * 학생 답안지 결과 표시 모달 컴포넌트
 * @description 특정 학생의 시험 답안지를 상세히 분석하고 표시하는 모달 컴포넌트
 *
 * 설계 원칙:
 * - 교육적 피드백 중심: 학습자와 교육자 모두에게 유용한 정보 제공
 * - 시각적 정보 전달: 색상과 레이아웃으로 직관적 이해 지원
 * - 상세 분석 지원: 문항별 세부 분석으로 학습 포인트 명확화
 * - 접근성 고려: 스크린 리더 및 키보드 네비게이션 지원
 * - 반응형 설계: 다양한 화면 크기에서 최적의 가독성 보장
 *
 * 주요 기능:
 * - 학생 기본 정보 표시 (이름, 시험명, 제출일자)
 * - 문항별 상세 답안 분석 (문제 내용, 학생 답안, 정답, 배점, 획득 점수)
 * - 정답/오답 시각적 구분 (색상 기반 즉시 인식)
 * - 총점 계산 및 강조 표시 (성과 요약)
 * - 스크롤 가능한 모달 레이아웃 (대용량 시험지 지원)
 * - 반응형 그리드 시스템 (모바일/데스크톱 최적화)
 *
 * 데이터 구조:
 * - selectedSubmission: 학생의 기본 제출 정보 (ExamSubmitStatusDetail 타입)
 * - selectedAnswers: 문항별 답안 배열 (QuestionAnswer 타입들)
 * - 두 데이터가 모두 존재해야 모달 활성화
 *
 * UI 레이아웃:
 * ```
 * ┌─────────────────────────────────────────┐
 * │ 모달 헤더 (학생명, 시험명)                 │
 * ├─────────────────────────────────────────┤
 * │ 기본 정보 카드 (3컬럼 그리드)              │
 * │ [학생명] [시험명] [제출일자]               │
 * ├─────────────────────────────────────────┤
 * │ 문항별 답안 섹션                          │
 * │ ┌─────────────────────────────────────┐ │
 * │ │ 문항 1                              │ │
 * │ │ [배점] [정답/오답 배지]              │ │
 * │ │ 문제: ...                           │ │
 * │ │ [학생답안]  [정답]                  │ │
 * │ │ 획득점수: N점                       │ │
 * │ └─────────────────────────────────────┘ │
 * │ ... 추가 문항들 ...                   │
 * ├─────────────────────────────────────────┤
 * │ 총점 표시 (강조된 파란색 박스)            │
 * └─────────────────────────────────────────┘
 * ```
 *
 * 시각적 디자인:
 * - 정답: 초록색 계열 (success 색상 팔레트)
 * - 오답: 빨간색 계열 (error 색상 팔레트)
 * - 정답 표시: 파란색 계열 (info 색상 팔레트)
 * - 총점: 강조된 파란색 배경 (primary 색상 팔레트)
 * - 카드 구조: 그림자와 테두리로 콘텐츠 구분
 *
 * 상태 관리:
 * - 모달 표시 조건: selectedSubmission && selectedAnswers.length > 0
 * - 자동 닫기: onOpenChange={false} 시 onClose() 호출
 * - 외부 상태와 연동: 부모 컴포넌트의 상태 변화에 반응
 *
 * 성능 최적화:
 * - 조건부 렌더링으로 불필요한 계산 방지
 * - Dialog 컴포넌트의 lazy 마운팅 활용
 * - 스크롤 최적화를 위한 max-height 설정
 * - map 함수에 고유 key 사용 (answer.questionId)
 *
 * 접근성 지원:
 * - DialogTitle과 DialogDescription으로 모달 목적 명시
 * - 색상과 함께 텍스트로도 정답/오답 정보 제공
 * - 키보드 네비게이션 지원 (Dialog 기본 기능)
 * - 스크린 리더를 위한 시맨틱 구조
 *
 * 반응형 지원:
 * - max-w-4xl로 대형 화면에서 최대 폭 제한
 * - grid-cols-3으로 기본 정보 3컬럼 배치
 * - grid-cols-2로 답안 정보 2컬럼 배치
 * - overflow-y-auto로 긴 내용 스크롤 지원
 * - max-h-[80vh]로 화면 크기 대응
 *
 * 확장 가능성:
 * - 답안별 해설 추가 가능
 * - 통계 정보 추가 가능 (정답률, 평균 점수 등)
 * - 인쇄 기능 연동 가능
 * - 답안 내보내기 기능 추가 가능
 * - 문항별 난이도 정보 표시 가능
 *
 * 사용 사례:
 * - 교사의 학생 답안 검토
 * - 학생 개별 피드백 제공
 * - 채점 결과 확인 및 검증
 * - 학습 포인트 분석 및 개선점 도출
 * - 시험 출제 품질 평가
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * function ExamDetailPage() {
 *   const [selectedSubmission, setSelectedSubmission] =
 *     useState<ExamSubmitStatusDetail | null>(null);
 *   const [selectedAnswers, setSelectedAnswers] =
 *     useState<QuestionAnswer[]>([]);
 *
 *   const handleOpenAnswerSheet = (submission: ExamSubmitStatusDetail) => {
 *     setSelectedSubmission(submission);
 *     // 실제로는 API에서 답안 데이터를 가져옴
 *     setSelectedAnswers(mockAnswers);
 *   };
 *
 *   const handleClose = () => {
 *     setSelectedSubmission(null);
 *     setSelectedAnswers([]);
 *   };
 *
 *   return (
 *     <>
 *       <ExamDetailTable onOpenDetail={handleOpenAnswerSheet} />
 *       <AnswerSheetResult
 *         selectedSubmission={selectedSubmission}
 *         selectedAnswers={selectedAnswers}
 *         onClose={handleClose}
 *       />
 *     </>
 *   );
 * }
 *
 * // API 연동 예시
 * const handleOpenAnswerSheet = async (submission: ExamSubmitStatusDetail) => {
 *   setSelectedSubmission(submission);
 *
 *   try {
 *     const answers = await fetchStudentAnswers(
 *       submission.student.id,
 *       submission.examId
 *     );
 *     setSelectedAnswers(answers);
 *   } catch (error) {
 *     console.error('답안 로딩 실패:', error);
 *     setSelectedAnswers([]);
 *   }
 * };
 *
 * // 통계 정보와 함께 사용
 * const enhancedAnswers = selectedAnswers.map(answer => ({
 *   ...answer,
 *   difficulty: getDifficultyLevel(answer.questionId),
 *   averageScore: getQuestionAverageScore(answer.questionId),
 *   correctRate: getQuestionCorrectRate(answer.questionId),
 * }));
 *
 * <AnswerSheetResult
 *   selectedSubmission={selectedSubmission}
 *   selectedAnswers={enhancedAnswers}
 *   onClose={handleClose}
 * />
 * ```
 *
 * 데이터 요구사항:
 * - ExamSubmitStatusDetail: student, examName, submissionDate, totalScore 포함
 * - QuestionAnswer[]: questionId, questionText, studentAnswer, correctAnswer, isCorrect, score, earnedScore 포함
 * - 모든 점수 데이터는 숫자 타입이어야 함
 * - 날짜 데이터는 표시 가능한 문자열 형식이어야 함
 *
 * 스타일링 가이드:
 * - 정답: text-green-700, bg-green-100
 * - 오답: text-red-700, bg-red-100
 * - 정답 답안: text-blue-700
 * - 총점: text-blue-600, bg-blue-50, border-blue-200
 * - 카드: border, rounded-lg, p-4, bg-white
 * - 정보 그리드: bg-gray-50, rounded-lg
 *
 * 향후 개선사항:
 * - 답안별 해설 및 풀이 과정 추가
 * - 문항별 통계 정보 (전체 정답률, 평균 점수)
 * - 인쇄 및 PDF 내보내기 기능
 * - 답안 이력 및 수정 내역 추적
 * - 실시간 채점 및 피드백 시스템 연동
 */
function AnswerSheetResult({
  selectedSubmission,
  selectedAnswers,
  onClose,
}: AnswerSheetResultProps) {
  return (
    <Dialog
      open={!!selectedSubmission && selectedAnswers.length > 0}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
        {selectedSubmission && selectedAnswers.length > 0 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedSubmission.student.name} 님의 답안 확인
              </DialogTitle>
              <DialogDescription className="text-lg">
                {selectedSubmission.examName}
              </DialogDescription>
            </DialogHeader>

            {/* 시험 기본 정보 */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              <div>
                <p className="text-sm text-gray-600">학생명</p>
                <p className="font-semibold">
                  {selectedSubmission.student.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">시험명</p>
                <p className="font-semibold">{selectedSubmission.examName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">제출일자</p>
                <p className="font-semibold">
                  {selectedSubmission.submissionDate}
                </p>
              </div>
            </div>

            {/* 답안 상세 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                문항별 답안
              </h3>

              {selectedAnswers.map((answer, index) => (
                <div
                  key={answer.questionId}
                  className="border rounded-lg p-4 bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">문항 {index + 1}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        배점: {answer.score}점
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          answer.isCorrect
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {answer.isCorrect ? "정답" : "오답"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">문제</p>
                    <p className="text-gray-800">{answer.questionText}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">학생 답안</p>
                      <p
                        className={`font-medium ${
                          answer.isCorrect ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {answer.studentAnswer}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">정답</p>
                      <p className="font-medium text-blue-700">
                        {answer.correctAnswer}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">획득 점수</span>
                      <span
                        className={`font-bold text-lg ${
                          answer.isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {answer.earnedScore}점
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* 총점 표시 */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-800">
                    총점
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedSubmission.totalScore}점
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { AnswerSheetResult };
