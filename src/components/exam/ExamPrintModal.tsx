import { useState, useEffect } from "react";
import { PrintOptionsModal } from "@/components/sheet/PrintOptionsModal";
import type { PrintItem } from "@/components/sheet/PrintOptionsModal";
import { ExamPrintTemplate } from "./ExamPrintTemplate";
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
  const {
    examData,
    isLoading,
    error,
    isReadyToPrint,
    printRef,
    handlePrint,
  } = useExamPrint(examId);

  // 로깅: 컴포넌트 상태 변화
  useEffect(() => {
    logger.debug("[ExamPrintModal] 상태 변화", {
      examId,
      isOpen,
      isProcessing,
      hasExamData: !!examData,
      isLoading,
      hasError: !!error,
      isReadyToPrint,
      printRefExists: !!printRef?.current
    });
  }, [examId, isOpen, isProcessing, examData, isLoading, error, isReadyToPrint, printRef]);

  /**
   * 인쇄 옵션 확인 및 실행
   */
  const handleConfirm = async (items: PrintItem[]) => {
    logger.debug("[ExamPrintModal] 인쇄 옵션 확인", { 
      examId,
      selectedItems: items,
      isReadyToPrint,
      hasExamData: !!examData,
      questionsCount: examData?.questions?.length || 0
    });

    if (!isReadyToPrint) {
      logger.error("[ExamPrintModal] 인쇄 데이터가 준비되지 않음", {
        examId,
        isLoading,
        hasError: !!error,
        hasExamData: !!examData,
        printRefExists: !!printRef?.current
      });
      return;
    }

    logger.debug("[ExamPrintModal] 인쇄 처리 시작", { examId });
    setIsProcessing(true);

    try {
      // printRef 상태 마지막 확인
      logger.debug("[ExamPrintModal] printRef 최종 확인", {
        examId,
        printRefExists: !!printRef?.current,
        printRefHTML: printRef?.current?.innerHTML?.slice(0, 200) + "...",
        printRefChildCount: printRef?.current?.children?.length || 0
      });

      // react-to-print 실행
      logger.debug("[ExamPrintModal] handlePrint 호출 직전", { examId });
      handlePrint();
      logger.debug("[ExamPrintModal] handlePrint 호출 완료", { examId });
    } catch (error) {
      logger.error("[ExamPrintModal] 인쇄 실행 중 오류", { 
        examId, 
        error: String(error),
        printRefExists: !!printRef?.current
      });
    } finally {
      setTimeout(() => {
        logger.debug("[ExamPrintModal] 인쇄 프로세스 완료, 모달 닫기", { examId });
        setIsProcessing(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <>
      {/* 인쇄 옵션 선택 모달 */}
      <PrintOptionsModal
        isOpen={isOpen && !isProcessing}
        onClose={onClose}
        onConfirm={handleConfirm}
        className={className}
      />

      {/* 처리 중 상태 표시 */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
            {isLoading && (
              <>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>시험 데이터를 불러오는 중...</p>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  시험 데이터를 불러오는데 실패했습니다: {String(error)}
                </AlertDescription>
              </Alert>
            )}

            {isReadyToPrint && (
              <>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>인쇄를 준비하고 있습니다...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* 인쇄 템플릿 (화면 밖에 렌더링) */}
      {examData && (
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "210mm",
            visibility: "hidden"
          }}
        >
          <ExamPrintTemplate
            ref={printRef}
            examData={examData}
            printType="problem"
          />
        </div>
      )}
    </>
  );
}