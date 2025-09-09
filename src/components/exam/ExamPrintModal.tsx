import { useState } from "react";
import { ExamPrintTemplate } from "./ExamPrintTemplate";
import { useExamPrint } from "@/hooks/exam/useExamPrint";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, Eye } from "lucide-react";

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

export function ExamPrintModal({ examId, onClose }: ExamPrintModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { examData, isLoading, error, isReadyToPrint, printRef, handlePrint } =
    useExamPrint(examId);

  /**
   * 인쇄 옵션 확인 및 실행
   */
  const handleConfirm = () => {
    if (!isReadyToPrint) {
      return;
    }

    setIsProcessing(true);

    try {
      handlePrint();
    } catch (error) {
      console.error("인쇄 실행 중 오류:", error);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 1000);
    }
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">시험지 미리보기</h2>
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-lg font-medium">
                  시험 데이터를 불러오는 중...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  잠시만 기다려주세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">오류 발생</h2>
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
            <Alert variant="destructive">
              <AlertDescription>
                시험 데이터를 불러오는데 실패했습니다.
                <br />
                <span className="text-sm mt-1 block">
                  오류: {String(error)}
                </span>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때 처리
  if (!examData) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">데이터 없음</h2>
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
            <p className="text-gray-600">시험 데이터를 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // 메인 렌더링 - 시험지 미리보기 및 인쇄 기능
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">시험지 미리보기</h2>
            <p className="text-sm text-gray-600 mt-1">
              {examData.examName} - {examData.grade}학년
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleConfirm}
              disabled={!isReadyToPrint || isProcessing}
              className="flex items-center space-x-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>{isProcessing ? "인쇄 중..." : "인쇄하기"}</span>
            </Button>
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>

        {/* 시험지 내용 */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <ExamPrintTemplate
              ref={printRef}
              examData={examData}
              printType="problem"
            />
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              총 {examData.totalQuestions}문제 • {examData.totalPoints}점
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>미리보기 모드</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
