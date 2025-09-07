import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ExamSubmitStatusDetail } from "@/types/exam";
import type { QuestionAnswer } from "./ExamDetail";
import type { ServerStudentAnswerDetail } from "@/types/server-exam";

/**
 * 답안지 결과 모달 컴포넌트 Props
 */
type Props = {
  /** 선택된 학생의 시험 제출 상세 정보 - null이면 모달 비활성화 */
  selectedSubmission: ExamSubmitStatusDetail | null;
  /** 학생 답안 상세 데이터 - 서버에서 직접 받은 구조 사용 */
  studentAnswerData: ServerStudentAnswerDetail | null;
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
 * - 시험 및 학생 기본 정보 표시
 * - 점수 및 정답률 통계 표시
 * - 문항별 상세 답안 분석
 * - 정답/오답 시각적 구분
 * - 문항 난이도 및 타입 정보 표시
 * - 서버 데이터 구조 직접 활용 (변환 없음)
 *
 * @example
 * ```tsx
 * <AnswerSheetCheckModal
 *   selectedSubmission={selectedSubmission}
 *   studentAnswerData={studentAnswerData}
 *   onClose={handleClose}
 * />
 * ```
 */
export function AnswerSheetCheckModal({
  selectedSubmission,
  studentAnswerData,
  onClose,
}: Props) {
  return (
    <Dialog
      open={!!selectedSubmission && !!studentAnswerData}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
        {selectedSubmission && studentAnswerData && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {studentAnswerData.studentInfo.studentName} 님의 답안 확인
              </DialogTitle>
              <DialogDescription className="text-lg">
                {studentAnswerData.examInfo.examName}
              </DialogDescription>
            </DialogHeader>

            {/* 시험 및 학생 기본 정보 */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
              <div>
                <p className="text-sm text-gray-600">학생명</p>
                <p className="font-semibold">
                  {studentAnswerData.studentInfo.studentName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">시험명</p>
                <p className="font-semibold">
                  {studentAnswerData.examInfo.examName}
                </p>
              </div>
            </div>

            {/* 제출 정보 */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg mb-6">
              <div>
                <p className="text-sm text-gray-600">제출 일시</p>
                <p className="font-semibold">
                  {new Date(studentAnswerData.submittedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">답변한 문제</p>
                <p className="font-semibold">
                  {studentAnswerData.answeredQuestions} /{" "}
                  {studentAnswerData.totalQuestions}
                </p>
              </div>
            </div>

            {/* 문항별 답안 목록 */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">문항별 답안 분석</h3>
              {studentAnswerData.questionAnswers.map((questionAnswer) => (
                <div
                  key={questionAnswer.questionId}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  {/* 문항 헤더 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium">
                        문항 {questionAnswer.questionNumber}
                      </h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {questionAnswer.questionType === "MULTIPLE_CHOICE"
                          ? "객관식"
                          : "주관식"}
                      </span>
                      {questionAnswer.unitInfo && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {questionAnswer.unitInfo.unitName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          questionAnswer.studentAnswer ===
                          questionAnswer.correctAnswer
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {questionAnswer.studentAnswer ===
                        questionAnswer.correctAnswer
                          ? "정답"
                          : "오답"}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        최대 {questionAnswer.maxScore}점
                      </span>
                    </div>
                  </div>

                  {/* 문제 내용 */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">
                      <strong>문제:</strong> {questionAnswer.questionText}
                    </p>
                  </div>

                  {/* 답안 비교 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        학생 답안
                      </p>
                      <div className="p-3 border rounded-lg bg-white">
                        <p className="text-gray-800">
                          {questionAnswer.studentAnswer}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        정답
                      </p>
                      <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                        <p className="text-blue-800 font-medium">
                          {questionAnswer.correctAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
