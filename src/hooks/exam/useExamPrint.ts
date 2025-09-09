import { useRef, useEffect, useCallback } from "react";
import logger from "@/utils/logger";
import { examQuestionsIdAtom, examQuestionsQueryAtom } from "@/atoms/exam";
import { useAtomValue, useSetAtom } from "jotai";

/**
 * 시험 인쇄 기능 커스텀 훅
 * @description 시험 API를 통합한 인쇄 기능 훅
 *
 * 주요 기능:
 * - 시험 문제 데이터 자동 조회
 * - 인쇄 옵션별 처리 (문제지, 답안지, 학생 답안지)
 * - 에러 및 로딩 상태 관리
 * - 인쇄 전후 콜백 처리
 *
 * @param examId 시험 ID
 * @returns 인쇄 관련 상태와 함수들
 */
export function useExamPrint(examId: string) {
  const printRef = useRef<HTMLDivElement>(null);
  const setExamQuestionsId = useSetAtom(examQuestionsIdAtom);

  // 시험 ID 설정
  useEffect(() => {
    setExamQuestionsId(examId);
  }, [examId, setExamQuestionsId]);

  // 시험 문제 데이터 조회
  const {
    data: examData,
    isLoading,
    error,
  } = useAtomValue(examQuestionsQueryAtom);

  // 수동 인쇄 함수 (react-to-print 대체)
  const handlePrint = useCallback(() => {
    if (!printRef.current) {
      logger.error("[useExamPrint] printRef.current가 null입니다!");
      return;
    }

    try {
      const refElement = printRef.current;

      // 인쇄용 iframe 생성
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "210mm";
      iframe.style.height = "297mm";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("iframe document를 생성할 수 없습니다");
      }

      // 스타일 복사
      const styles = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]'),
      );
      const styleHTML = styles.map((style) => style.outerHTML).join("\n");

      // 인쇄 내용 작성
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>시험 인쇄</title>
            ${styleHTML}
            <style>
              @media print {
                body { margin: 0; }
                @page { size: A4; margin: 20mm; }
              }
            </style>
          </head>
          <body>
            ${refElement.innerHTML}
          </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();

      // 인쇄 실행
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 100);
      }, 250);
    } catch (error) {
      logger.error("[useExamPrint] 인쇄 중 오류", { examId, error });
    }
  }, [examId, examData]);

  /**
   * 인쇄 준비 상태 확인
   */
  const isReadyToPrint =
    !isLoading && !error && !!examData && typeof window !== "undefined";

  return {
    // 데이터 상태
    examData,
    isLoading,
    error,

    // 인쇄 상태 및 함수
    isReadyToPrint,
    printRef,
    handlePrint,
  };
}
