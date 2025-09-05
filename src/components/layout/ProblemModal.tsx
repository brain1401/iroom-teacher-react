import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 기하학 문제 모달 컴포넌트
 *
 * 주요 기능:
 * - 문제 제목과 설명 표시
 * - 기하학 도형 이미지 표시
 * - 이전/다음 문제 네비게이션
 * - 모달 닫기 기능
 * - 반응형 디자인 지원
 *
 * @example
 * ```tsx
 * <ProblemModal
 *   isOpen={true}
 *   onClose={() => setIsOpen(false)}
 *   problemNumber={1}
 *   problemText="다음 그림의 원 O에서 AB = CD, OM⊥CD 이고 OA = 5√2cm, OM=5cm일 때, △OAB의 넓이는 몇 cm²인가?"
 *   geometryImage="/path/to/geometry-image.png"
 * />
 * ```
 */
type ProblemModalProps = {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 문제 번호 */
  problemNumber: number;
  /** 문제 설명 텍스트 */
  problemText: string;
  /** 기하학 도형 이미지 URL */
  geometryImage?: string;
  /** 이전 문제로 이동 핸들러 */
  onPrevious?: () => void;
  /** 다음 문제로 이동 핸들러 */
  onNext?: () => void;
  /** 이전 문제 사용 가능 여부 */
  hasPrevious?: boolean;
  /** 다음 문제 사용 가능 여부 */
  hasNext?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
};

export function ProblemModal({
  isOpen,
  onClose,
  problemNumber,
  problemText,
  geometryImage,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  className,
}: ProblemModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0",
          "bg-white rounded-lg shadow-lg",
          className,
        )}
      >
        {/* 헤더 영역 */}
        <div className="flex items-center justify-center p-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            문제 {problemNumber}번
          </h2>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="p-6 space-y-6">
          {/* 문제 설명 */}
          <div className="text-gray-700 leading-relaxed">{problemText}</div>

          {/* 기하학 도형 이미지 */}
          {geometryImage && (
            <div className="flex justify-center">
              <div className="relative max-w-full">
                <img
                  src={geometryImage}
                  alt={`문제 ${problemNumber}번 기하학 도형`}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {/* 네비게이션 버튼들 */}
          <div className="flex items-center justify-between pt-4">
            {/* 이전 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={cn(
                "flex items-center gap-2",
                !hasPrevious && "opacity-50 cursor-not-allowed",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>

            {/* 다음 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
              className={cn(
                "flex items-center gap-2",
                !hasNext && "opacity-50 cursor-not-allowed",
              )}
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 하단 닫기 버튼 */}
        <div className="p-6 pt-0">
          <Button
            onClick={onClose}
            className="w-full h-11 bg-gray-800 hover:bg-gray-700 text-white font-medium"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
