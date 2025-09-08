import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Printer } from "lucide-react";

/**
 * 인쇄 옵션 선택 모달 컴포넌트
 * @description 시험지 인쇄 시 필요한 항목들을 선택할 수 있는 대화 상자 컴포넌트
 *
 * 주요 기능:
 * - 시각적으로 명확한 프린터 아이콘과 제목 표시
 * - 3가지 인쇄 항목 중 다중 선택 가능 (문제지, 문제 답안지, 학생 답안지)
 * - 체크박스 상태 관리를 통한 직관적인 선택 인터페이스
 * - 취소/확인 버튼으로 명확한 액션 구분
 * - 선택된 항목이 없을 때 확인 버튼 비활성화
 * - 취소 시 선택 상태를 기본값(문제지)으로 리셋
 * - 반응형 디자인으로 모바일 환경에서도 사용 가능
 * - ESC 키 또는 오버레이 클릭으로 모달 닫기 지원
 *
 * 설계 원칙:
 * - 사용자가 인쇄하고자 하는 항목을 명확히 구분할 수 있도록 설계
 * - 기본적으로 문제지는 선택된 상태로 시작 (가장 일반적인 인쇄 항목)
 * - 각 항목에 한글명과 영문 설명을 함께 표시하여 이해도 향상
 * - 시각적 피드백(hover 효과)을 통한 상호작용성 강화
 *
 * 사용 시나리오:
 * - 교사가 시험 문제를 인쇄하기 전 필요한 자료 선택
 * - 학생 답안지만 별도로 인쇄하고 싶은 경우
 * - 문제지와 답안지를 함께 인쇄하고 싶은 경우
 * - 채점용으로 답안이 포함된 문제지가 필요한 경우
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * function ExamPrintComponent() {
 *   const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
 *
 *   const handlePrint = (selectedItems: PrintItem[]) => {
 *     selectedItems.forEach(item => {
 *       switch (item) {
 *         case 'problem':
 *           printProblemSheet();
 *           break;
 *         case 'answer':
 *           printAnswerSheet();
 *           break;
 *         case 'studentAnswer':
 *           printStudentAnswerSheet();
 *           break;
 *       }
 *     });
 *   };
 *
 *   return (
 *     <>
 *       <Button onClick={() => setIsPrintModalOpen(true)}>
 *         인쇄 옵션 선택
 *       </Button>
 *
 *       <PrintOptionsModal
 *         isOpen={isPrintModalOpen}
 *         onClose={() => setIsPrintModalOpen(false)}
 *         onConfirm={handlePrint}
 *       />
 *     </>
 *   );
 * }
 *
 * // 커스텀 스타일링 적용
 * <PrintOptionsModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onConfirm={onConfirm}
 *   className="border-green-500 max-w-lg"
 * />
 * ```
 *
 * 접근성:
 * - 키보드 네비게이션 지원 (Tab, Enter, ESC)
 * - 체크박스에 적절한 label 연결
 * - 모달 타이틀이 스크린 리더에 의해 읽힘
 * - 확인 버튼 비활성화 시 적절한 시각적 피드백 제공
 *
 * 성능 고려사항:
 * - 컴포넌트 내부 상태로 선택 항목 관리하여 부모 컴포넌트 리렌더링 최소화
 * - 불필요한 리렌더링 방지를 위한 이벤트 핸들러 최적화
 * - 모달이 닫힐 때 상태 정리로 메모리 누수 방지
 */
/**
 * 인쇄 항목 타입
 * @description 선택 가능한 인쇄 항목들의 타입 정의
 *
 * - `problem`: 문제지 - 학생들이 풀 수 있는 문제만 포함된 시트
 * - `answer`: 문제 답안지 - 문제와 정답이 함께 표시된 교사용 시트
 * - `studentAnswer`: 학생 답안지 - 학생이 답을 작성할 수 있는 빈 답안 시트
 */
export type PrintItem = "problem" | "answer" | "studentAnswer";

type PrintOptionsModalProps = {
  /**
   * 모달 열림 상태
   * @description 모달의 표시/숨김을 제어하는 boolean 값
   * - true: 모달이 화면에 표시됨
   * - false: 모달이 숨겨짐
   */
  isOpen: boolean;

  /**
   * 모달 닫기 핸들러
   * @description 모달을 닫을 때 호출되는 콜백 함수
   * - ESC 키 또는 오버레이 클릭 시에도 호출됨
   * - 취소 버튼 클릭 시 호출됨
   */
  onClose: () => void;

  /**
   * 확인 버튼 클릭 핸들러
   * @description 사용자가 선택한 인쇄 항목들과 함께 호출되는 콜백 함수
   * @param selectedItems 선택된 인쇄 항목들의 배열 (problem, answer, studentAnswer)
   * @example
   * ```typescript
   * const handleConfirm = (items: PrintItem[]) => {
   *   if (items.includes('problem')) console.log('문제지 인쇄');
   *   if (items.includes('answer')) console.log('답안지 인쇄');
   *   if (items.includes('studentAnswer')) console.log('학생 답안지 인쇄');
   * };
   * ```
   */
  onConfirm: (selectedItems: PrintItem[]) => void;

  /**
   * 추가 CSS 클래스
   * @description 모달의 기본 스타일을 확장하거나 재정의할 때 사용
   * @default undefined
   * @example
   * ```tsx
   * // 모달 크기를 더 크게 만들기
   * <PrintOptionsModal className="max-w-lg" />
   *
   * // 모달에 그림자 효과 추가
   * <PrintOptionsModal className="shadow-2xl" />
   * ```
   */
  className?: string;
};

export function PrintOptionsModal({
  isOpen,
  onClose,
  onConfirm,
  className,
}: PrintOptionsModalProps) {
  const [selectedItems, setSelectedItems] = useState<PrintItem[]>(["problem"]);

  const printOptions = [
    {
      id: "problem" as PrintItem,
      label: "문제지",
      description: "Problem Sheet",
    },
    {
      id: "answer" as PrintItem,
      label: "문제 답안지",
      description: "Problem Answer Sheet",
    },
    {
      id: "studentAnswer" as PrintItem,
      label: "학생 답안지",
      description: "Student Answer Sheet",
    },
  ];

  const handleItemToggle = (itemId: PrintItem, checked: boolean) => {
    setSelectedItems((prev) => {
      if (checked) {
        return [...prev, itemId];
      } else {
        return prev.filter((id) => id !== itemId);
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedItems);
    onClose();
  };

  const handleCancel = () => {
    setSelectedItems(["problem"]); // 기본값으로 리셋
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-md w-[95vw] p-0 bg-white rounded-lg shadow-lg border-2 border-blue-500",
          "sm:max-w-md", // 기본 max-width 제거
          className,
        )}
      >
        {/* 프린터 아이콘 */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <Printer className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* 제목 */}
        <div className="text-center px-6 pb-6">
          <h2 className="text-xl font-bold text-gray-900">
            인쇄 항목을 선택해주세요.
          </h2>
        </div>

        {/* 체크박스 목록 */}
        <div className="px-6 space-y-4">
          {printOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <Checkbox
                id={option.id}
                checked={selectedItems.includes(option.id)}
                onCheckedChange={(checked) =>
                  handleItemToggle(option.id, Boolean(checked))
                }
                className="text-blue-500"
              />
              <div className="flex-1">
                <label
                  htmlFor={option.id}
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {option.label}
                </label>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3 p-6 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedItems.length === 0}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
