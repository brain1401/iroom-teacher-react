import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Printer } from "lucide-react";

/**
 * 인쇄 옵션 선택 모달 컴포넌트
 *
 * 주요 기능:
 * - 프린터 아이콘과 제목 표시
 * - 인쇄 항목 체크박스 선택
 * - 취소/확인 버튼 처리
 * - 선택된 항목 반환
 *
 * @example
 * ```tsx
 * <PrintOptionsModal
 *   isOpen={true}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={(selectedItems) => console.log(selectedItems)}
 * />
 * ```
 */
type PrintItem = "problem" | "answer" | "studentAnswer";

type PrintOptionsModalProps = {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 확인 버튼 클릭 핸들러 */
  onConfirm: (selectedItems: PrintItem[]) => void;
  /** 추가 CSS 클래스 */
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
