import { forwardRef, useEffect } from "react";
import type { ExamQuestionsData } from "@/api/exam/exam-questions-types";
import { cn } from "@/lib/utils";
import logger from "@/utils/logger";

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
  examData: ExamQuestionsData;
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
function processQuestionText(text: string): string {
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
    const { examName, grade, questions, totalQuestions, totalPoints } = examData;
    
    // 로깅: 컴포넌트 렌더링 및 ref 상태
    useEffect(() => {
      logger.debug("[ExamPrintTemplate] 컴포넌트 렌더링", {
        examName,
        grade,
        questionsLength: questions?.length || 0,
        totalQuestions,
        totalPoints,
        printType,
        refExists: !!ref,
        refCurrent: ref && typeof ref === "object" && "current" in ref ? !!ref.current : false
      });
      
      // ref가 할당된 후 DOM 요소 확인
      if (ref && typeof ref === "object" && "current" in ref && ref.current) {
        const element = ref.current;
        logger.debug("[ExamPrintTemplate] ref DOM 요소 확인", {
          tagName: element.tagName,
          className: element.className,
          offsetHeight: element.offsetHeight,
          scrollHeight: element.scrollHeight,
          children: element.children.length
        });
      }
    }, [examData, printType, ref]);
    
    // 한 페이지당 문제 수 (피그마 디자인 기준: 7문제)
    const questionsPerPage = 7;
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
              padding: 20mm;
              margin: 0;
              box-sizing: border-box;
              page-break-after: always;
              background: white;
            }
            
            .exam-page:last-child {
              page-break-after: auto;
            }
            
            .page-break {
              page-break-before: always;
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
              padding: 40px;
              box-sizing: border-box;
            }
          }
        `}</style>
        
        {Array.from({ length: totalPages }).map((_, pageIndex) => {
          const startIndex = pageIndex * questionsPerPage;
          const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
          const pageQuestions = questions.slice(startIndex, endIndex);
          
          return (
            <div key={pageIndex} className="exam-page">
              {pageIndex > 0 && <div className="page-break" />}
              
              {/* 시험지 헤더 */}
              <div className="text-center mb-12">
                <div className="border-2 border-black inline-block px-16 py-4 mb-6">
                  <h1 className="text-4xl font-bold text-black">
                    {examName || "시험 문제지"}
                  </h1>
                </div>
                
                {/* 시험 정보 */}
                <div className="text-sm text-gray-600 space-y-1">
                  <div>학년: {grade}학년</div>
                  <div>총 문제 수: {totalQuestions}문제</div>
                  <div>총 배점: {totalPoints}점</div>
                  {totalPages > 1 && <div>페이지: {pageIndex + 1}/{totalPages}</div>}
                </div>
              </div>
              
              {/* 문제 목록 */}
              <div className="space-y-8">
                {pageQuestions.map((question, index) => {
                  const globalIndex = startIndex + index;
                  
                  return (
                    <div
                      key={question.questionId}
                      className="question-item border border-black rounded p-6 relative"
                    >
                      {/* 문제 번호와 점수 */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">
                          {globalIndex + 1}.
                        </h3>
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          [ {question.points}점 ]
                        </span>
                      </div>
                      
                      {/* 문제 내용 */}
                      <div className="question-content mb-6">
                        <p className="text-base leading-relaxed">
                          {processQuestionText(question.questionText)}
                        </p>
                      </div>
                      
                      {/* 이미지 영역 (피그마 디자인처럼 3개 이미지 배치) */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="border border-gray-300 h-16 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                          이미지 1
                        </div>
                        <div className="border border-gray-300 h-16 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                          이미지 2
                        </div>
                        <div className="border border-gray-300 h-16 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                          이미지 3
                        </div>
                      </div>
                      
                      {/* 답안 작성 공간 */}
                      {question.questionType === "MULTIPLE_CHOICE" ? (
                        <div className="answer-area">
                          <div className="text-sm text-gray-600 mb-2">정답:</div>
                          <div className="flex space-x-6">
                            {["①", "②", "③", "④", "⑤"].map((option) => (
                              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${question.questionId}`}
                                  className="w-4 h-4"
                                  disabled
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="answer-area">
                          <div className="text-sm text-gray-600 mb-2">답안:</div>
                          <div className="border border-gray-300 min-h-16 p-3 bg-gray-50">
                            {/* 답안 작성 공간 */}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* 페이지 하단 정보 */}
              <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                <div>이룸클래스 시험 시스템</div>
                {totalPages > 1 && <div>{pageIndex + 1} / {totalPages}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

ExamPrintTemplate.displayName = "ExamPrintTemplate";

export { ExamPrintTemplate };