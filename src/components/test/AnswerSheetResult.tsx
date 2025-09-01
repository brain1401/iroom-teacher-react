import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { TestSubmitStatusDetail } from "@/types/test";
import type { QuestionAnswer } from "./TestDetail";

type AnswerSheetResultProps = {
  selectedSubmission: TestSubmitStatusDetail;
  selectedAnswers: QuestionAnswer[];
  onClose: () => void;
};

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
                {selectedSubmission.testName}
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
                <p className="font-semibold">{selectedSubmission.testName}</p>
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
