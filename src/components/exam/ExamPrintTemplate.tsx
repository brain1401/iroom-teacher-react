import { forwardRef, memo } from "react";
import type {
  ExamPrintData,
  ExamQuestion,
  MultipleChoiceOption,
} from "@/api/exam/exam-questions-types";
import { cn } from "@/lib/utils";

/**
 * 시험지 인쇄 템플릿 컴포넌트
 * @description 피그마 디자인에 맞는 A4 용지 형태의 시험지 인쇄 템플릿
 *
 * 주요 기능:
 * - 피그마 디자인 완벽 재현 (704x1051px → A4 비율)
 * - 문제별 점수 표시 ([5점] 형태)
 * - 답안 작성 공간 자동 배치
 * - 페이지 분할 지원
 * - @media print 최적화
 *
 * 설계 원칙:
 * - 실제 인쇄물과 동일한 레이아웃
 * - 이미지 로딩 최적화
 * - 폰트 및 여백 정확한 재현
 * - 페이지 넘김 처리
 */

type ExamPrintTemplateProps = {
  /** 시험 문제 데이터 */
  examData: ExamPrintData;
  /** 인쇄 타입 */
  printType?: "problem" | "answer" | "studentAnswer";
  /** 추가 CSS 클래스 */
  className?: string;
  /** 인라인 스타일 */
  style?: React.CSSProperties;
};

/**
 * 문제 텍스트에서 HTML 태그 제거 및 LaTeX 변환
 */
function ProcessQuestionText(text: string): string {
  // HTML 태그 제거
  const withoutHtml = text.replace(/<[^>]*>/g, "");

  // LaTeX 수식을 읽기 쉬운 형태로 변환 (간단한 처리)
  const withoutLatex = withoutHtml
    .replace(/\$\$?(.*?)\$\$?/g, "$1") // $...$ 또는 $$...$$ 제거
    .replace(/\\\\([a-zA-Z]+)/g, "$1") // \sqrt -> sqrt
    .replace(/\{([^}]*)\}/g, "($1)") // {x} -> (x)
    .replace(/\\\\/g, ""); // \\ 제거

  return withoutLatex.trim();
}

const ExamPrintTemplate = forwardRef<HTMLDivElement, ExamPrintTemplateProps>(
  ({ examData, printType = "problem", className, style }, ref) => {
    const { examName, grade, questions, totalQuestions, totalPoints } =
      examData;

    // 로깅: 컴포넌트 렌더링 및 ref 상태 (성능 최적화를 위해 제거)
    // useEffect(() => {
    //   logger.debug("[ExamPrintTemplate] 컴포넌트 렌더링", {
    //     examName,
    //     grade,
    //     questionsLength: questions?.length || 0,
    //     totalQuestions,
    //     totalPoints,
    //     printType,
    //     refExists: !!ref,
    //     refCurrent:
    //       ref && typeof ref === "object" && "current" in ref
    //         ? !!ref.current
    //         : false,
    //   });

    //   // ref가 할당된 후 DOM 요소 확인
    //   if (ref && typeof ref === "object" && "current" in ref && ref.current) {
    //     const element = ref.current;
    //     logger.debug("[ExamPrintTemplate] ref DOM 요소 확인", {
    //       tagName: element.tagName,
    //       className: element.className,
    //       offsetHeight: element.offsetHeight,
    //       scrollHeight: element.scrollHeight,
    //       children: element.children.length,
    //     });
    //   }
    // }, [examData, printType, ref]);

    // 한 페이지당 문제 수 (문제가 잘리지 않도록 더 적게: 3문제)
    const questionsPerPage = 3;
    const totalPages = Math.ceil(questions.length / questionsPerPage);

    return (
      <div ref={ref} className={cn("print-container", className)} style={style}>
        {/* 인쇄용 스타일 */}
        <style>{`
          @media print {
            html, body {
              height: initial !important;
              overflow: initial !important;
              -webkit-print-color-adjust: exact;
            }
            
            .print-container {
              margin: 0;
              padding: 0;
              width: 210mm;
              min-height: 297mm;
            }
            
            .exam-page {
              width: 210mm;
              height: 297mm;
              padding: 15mm;
              margin: 0;
              box-sizing: border-box;
              page-break-after: always;
              background: white;
              border: 2px solid #000;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            
            .exam-page:last-child {
              page-break-after: auto;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            .question-item {
              page-break-inside: avoid;
              break-inside: avoid;
              flex-shrink: 0;
            }
            
            .questions-container {
              flex: 1;
              overflow: hidden;
            }
          }
          
          @media screen {
            .print-container {
              max-width: 794px;
              margin: 0 auto;
              background: #f5f5f5;
              padding: 20px;
            }
            
            .exam-page {
              width: 100%;
              min-height: 1123px;
              background: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              margin-bottom: 20px;
              padding: 30px;
              box-sizing: border-box;
              border: 2px solid #000;
            }
          }
        `}</style>

        {Array.from({ length: totalPages }).map((_, pageIndex) => {
          const startIndex = pageIndex * questionsPerPage;
          const endIndex = Math.min(
            startIndex + questionsPerPage,
            questions.length,
          );
          // 문제 순서대로 정렬
          const sortedQuestions = [...questions].sort(
            (a, b) => a.order - b.order,
          );
          const pageQuestions = sortedQuestions.slice(startIndex, endIndex);

          return (
            <div
              key={`page-${pageIndex}-${startIndex}-${endIndex}`}
              className="exam-page"
            >
              {pageIndex > 0 && <div className="page-break" />}

              {/* 시험지 헤더 */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  {/* 시험 제목 */}
                  <div className="flex-1">
                    <div className="border-2 border-black inline-block px-8 py-3">
                      <h1 className="text-3xl font-bold text-black">
                        {examName || "시험 문제지"}
                      </h1>
                    </div>
                  </div>

                  {/* QR코드 영역 */}
                  <div className="ml-4">
                    <div className="w-20 h-20 border-2 border-black flex items-center justify-center bg-white">
                      <img
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI4IiB5PSI4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSIyNCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNDAiIHk9IjgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjU2IiB5PSI4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI3MiIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iOCIgeT0iMjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjI0IiB5PSIyNCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNDAiIHk9IjI0IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI1NiIgeT0iMjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjcyIiB5PSIyNCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iOCIgeT0iNDAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjI0IiB5PSI0MCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI1NiIgeT0iNDAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjcyIiB5PSI0MCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iOCIgeT0iNTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjI0IiB5PSI1NiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNDAiIHk9IjU2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI1NiIgeT0iNTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjcyIiB5PSI1NiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iOCIgeT0iNzIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjI0IiB5PSI3MiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNDAiIHk9IjcyIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI1NiIgeT0iNzIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjcyIiB5PSI3MiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPC9zdmc+"
                        alt="QR Code"
                        className="w-16 h-16"
                      />
                    </div>
                  </div>
                </div>

                {/* 시험 정보 */}
                <div className="flex justify-between items-center text-sm border-b-2 border-black pb-2">
                  <div className="flex space-x-6">
                    <div>학년: {grade}학년</div>
                    <div>총 문제 수: {totalQuestions}문제</div>
                    <div>총 배점: {totalPoints}점</div>
                  </div>
                  {totalPages > 1 && (
                    <div className="font-bold">
                      페이지: {pageIndex + 1}/{totalPages}
                    </div>
                  )}
                </div>
              </div>

              {/* 문제 목록 */}
              <div className="questions-container space-y-8">
                {pageQuestions.map((question: ExamQuestion, index: number) => {
                  const globalIndex = startIndex + index;

                  return (
                    <div
                      key={question.questionId}
                      className="question-item border border-black p-4 mb-6"
                    >
                      {/* 문제 번호와 점수 */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold">
                          {globalIndex + 1}.
                        </h3>
                        <span className="text-sm font-bold border border-black px-2 py-1">
                          {question.points}점
                        </span>
                      </div>

                      {/* 문제 내용 */}
                      <div className="question-content mb-4">
                        <p className="text-base leading-relaxed">
                          {ProcessQuestionText(question.questionText)}
                        </p>
                      </div>

                      {/* 답안 작성 공간 */}
                      {question.questionType === "MULTIPLE_CHOICE" ? (
                        <div className="answer-area border-t border-gray-300 pt-3">
                          <div className="text-sm font-bold mb-2">정답:</div>
                          <div className="flex space-x-8">
                            {question.options?.map(
                              (
                                option: MultipleChoiceOption,
                                optionIndex: number,
                              ) => (
                                <label
                                  key={option.optionNumber}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="radio"
                                    name={`question-${question.questionId}`}
                                    className="w-4 h-4"
                                    disabled
                                    checked={option.isCorrect}
                                  />
                                  <span className="text-sm font-bold">
                                    {["①", "②", "③", "④", "⑤"][optionIndex]}
                                  </span>
                                  <span className="text-sm ml-1">
                                    {option.content}
                                  </span>
                                </label>
                              ),
                            ) ||
                              // 기본 선택지 (options가 없는 경우)
                              ["①", "②", "③", "④", "⑤"].map((option) => (
                                <label
                                  key={option}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="radio"
                                    name={`question-${question.questionId}`}
                                    className="w-4 h-4"
                                    disabled
                                  />
                                  <span className="text-sm font-bold">
                                    {option}
                                  </span>
                                </label>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="answer-area border-t border-gray-300 pt-3">
                          <div className="text-sm font-bold mb-2">답안:</div>
                          <div className="border border-black min-h-20 p-3">
                            {/* 답안 작성 공간 */}
                            <div className="text-gray-400 text-sm">
                              {question.questionType === "SHORT_ANSWER"
                                ? "단답형 답안을 작성하세요"
                                : "서술형 답안을 작성하세요"}
                            </div>
                          </div>
                          {/* 정답 표시 (인쇄 타입이 answer인 경우) */}
                          {printType === "answer" && question.correctAnswer && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="text-sm font-bold text-yellow-800">
                                정답:
                              </div>
                              <div className="text-sm text-yellow-700">
                                {question.correctAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 페이지 하단 정보 */}
              <div className="mt-8 pt-4 border-t-2 border-black text-center text-sm font-bold">
                <div>이룸클래스 시험 시스템</div>
                {totalPages > 1 && (
                  <div className="mt-1">
                    {pageIndex + 1} / {totalPages}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

ExamPrintTemplate.displayName = "ExamPrintTemplate";

// React.memo로 래핑하여 불필요한 리렌더링 방지
const MemoizedExamPrintTemplate = memo(ExamPrintTemplate);

export { MemoizedExamPrintTemplate as ExamPrintTemplate };
