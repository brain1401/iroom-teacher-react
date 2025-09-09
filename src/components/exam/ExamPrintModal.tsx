import { useState, useEffect } from "react";
// PrintOptionsModal 관련 import 제거됨
import { MemoizedExamPrintTemplate } from "./ExamPrintTemplate";
import { useExamPrint } from "@/hooks/exam/useExamPrint";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import logger from "@/utils/logger";

/**
 * 시험 인쇄 통합 모달 컴포넌트
 * @description 인쇄 옵션 선택부터 실제 인쇄까지 통합 처리하는 컴포넌트
 *
 * 주요 기능:
 * - 인쇄 옵션 선택 모달 표시
 * - 시험 데이터 자동 로딩
 * - 피그마 디자인 기반 인쇄 템플릿 렌더링
 * - react-to-print 통합
 * - 에러 및 로딩 상태 처리
 *
 * 작업 흐름:
 * 1. 사용자가 인쇄 버튼 클릭
 * 2. 인쇄 옵션 선택 모달 표시
 * 3. 옵션 선택 후 시험 데이터 로딩
 * 4. 인쇄 템플릿 렌더링
 * 5. react-to-print로 실제 인쇄
 */

type ExamPrintModalProps = {
  /** 시험 ID */
  examId: string;
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
};

export function ExamPrintModal({
  examId,
  isOpen,
  onClose,
  className,
}: ExamPrintModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { examData, isLoading, error, isReadyToPrint, printRef, handlePrint } =
    useExamPrint(examId);

  /**
   * 인쇄 옵션 확인 및 실행
   */
  const handleConfirm = async () => {
    if (!isReadyToPrint) {
      return;
    }

    setIsProcessing(true);

    try {
      handlePrint();
    } catch (error) {
      logger.error("[ExamPrintModal] 인쇄 실행 중 오류", {
        examId,
        error: String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 로딩 중일 때만 로딩 메시지 표시
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>시험 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러가 있을 때만 에러 메시지 표시
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
          <Alert variant="destructive">
            <AlertDescription>
              시험 데이터를 불러오는데 실패했습니다: {String(error)}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // 데이터가 준비되면 바로 시험지 표시
  return (
    <>
      {examData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">시험지 미리보기</h2>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  닫기
                </button>
              </div>
              <MemoizedExamPrintTemplate
                ref={printRef}
                examData={examData}
                printType="problem"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
