"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Combobox 아이템 타입
 * @description 선택 가능한 옵션의 구조 정의
 */
export type ComboboxItem = {
  /** 고유 값 (실제 저장되는 값) */
  value: string;
  /** 표시 레이블 */
  label: string;
  /** 비활성화 여부 */
  disabled?: boolean;
};

/**
 * Combobox 컴포넌트 Props
 * @description 재사용 가능한 Combobox 컴포넌트의 속성 정의
 */
export type ComboboxProps = {
  /** 선택 가능한 아이템 목록 */
  items: ComboboxItem[];
  /** 현재 선택된 값 */
  value?: string;
  /** 값 변경 시 콜백 함수 */
  onValueChange?: (value: string) => void;
  /** 선택되지 않았을 때 표시할 placeholder */
  placeholder?: string;
  /** 검색 입력창 placeholder */
  searchPlaceholder?: string;
  /** 검색 결과가 없을 때 표시할 텍스트 */
  emptyText?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 클래스명 (Popover 컨테이너) */
  className?: string;
  /** 버튼 추가 클래스명 */
  buttonClassName?: string;
  /** Popover content 너비 */
  popoverWidth?: string;
  /** 버튼 variant */
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  /** 버튼 크기 */
  buttonSize?: "default" | "sm" | "lg" | "icon";
};

/**
 * Combobox 컴포넌트
 * @description 검색 기능이 있는 선택 드롭다운 컴포넌트
 *
 * 주요 기능:
 * - 검색 가능한 드롭다운
 * - 키보드 네비게이션 지원
 * - 커스터마이징 가능한 스타일
 * - controlled/uncontrolled 모드 지원
 *
 * @example
 * ```tsx
 * // Controlled 사용
 * const [value, setValue] = useState("");
 * <Combobox
 *   items={[
 *     { value: "react", label: "React" },
 *     { value: "vue", label: "Vue" },
 *     { value: "angular", label: "Angular" }
 *   ]}
 *   value={value}
 *   onValueChange={setValue}
 *   placeholder="프레임워크 선택..."
 * />
 *
 * // Uncontrolled 사용
 * <Combobox
 *   items={items}
 *   onValueChange={(value) => console.log(value)}
 *   placeholder="선택하세요..."
 * />
 * ```
 */
export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      items,
      value: controlledValue,
      onValueChange,
      placeholder = "선택하세요...",
      searchPlaceholder = "검색...",
      emptyText = "결과가 없습니다.",
      disabled = false,
      className,
      buttonClassName,
      popoverWidth = "200px",
      buttonVariant = "outline",
      buttonSize = "default",
    },
    ref,
  ) => {
    // Popover 열림/닫힘 상태
    const [open, setOpen] = React.useState(false);

    // Uncontrolled 모드를 위한 내부 상태
    const [internalValue, setInternalValue] = React.useState("");

    // Controlled vs Uncontrolled 모드 처리
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    /**
     * 값 변경 핸들러
     * controlled/uncontrolled 모드 모두 지원
     */
    const handleValueChange = React.useCallback(
      (newValue: string) => {
        // 토글 동작 (같은 값 선택 시 선택 해제)
        const finalValue = newValue === value ? "" : newValue;

        if (!isControlled) {
          setInternalValue(finalValue);
        }

        onValueChange?.(finalValue);
        setOpen(false);
      },
      [value, isControlled, onValueChange],
    );

    // 현재 선택된 아이템의 레이블 가져오기
    const selectedItem = React.useMemo(
      () => items.find((item) => item.value === value),
      [items, value],
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant={buttonVariant}
            size={buttonSize}
            role="combobox"
            aria-expanded={open}
            aria-label={placeholder}
            disabled={disabled}
            className={cn(
              "justify-between",
              popoverWidth && `w-[${popoverWidth}]`,
              buttonClassName,
            )}
            style={{ width: popoverWidth }}
          >
            <span className="truncate">
              {selectedItem ? selectedItem.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("p-0", className)}
          style={{ width: popoverWidth }}
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                    onSelect={handleValueChange}
                  >
                    {item.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

Combobox.displayName = "Combobox";

/**
 * ComboboxDemo 예제 컴포넌트
 * @description Combobox 사용 예제
 *
 * @example
 * ```tsx
 * import { ComboboxDemo } from "@/components/ui/combobox";
 *
 * function App() {
 *   return <ComboboxDemo />;
 * }
 * ```
 */
function ComboboxDemo() {
  const [value, setValue] = React.useState("");

  const frameworks: ComboboxItem[] = [
    {
      value: "next.js",
      label: "Next.js",
    },
    {
      value: "sveltekit",
      label: "SvelteKit",
    },
    {
      value: "nuxt.js",
      label: "Nuxt.js",
    },
    {
      value: "remix",
      label: "Remix",
    },
    {
      value: "astro",
      label: "Astro",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Controlled Combobox</h3>
        <Combobox
          items={frameworks}
          value={value}
          onValueChange={setValue}
          placeholder="프레임워크를 선택하세요..."
          searchPlaceholder="프레임워크 검색..."
          emptyText="프레임워크를 찾을 수 없습니다."
          popoverWidth="250px"
        />
        <p className="text-sm text-muted-foreground mt-2">
          선택된 값: {value || "(없음)"}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Uncontrolled Combobox</h3>
        <Combobox
          items={frameworks}
          onValueChange={(val) => console.log("선택됨:", val)}
          placeholder="프레임워크 선택..."
          buttonVariant="secondary"
          buttonSize="sm"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Disabled Combobox</h3>
        <Combobox items={frameworks} disabled placeholder="비활성화됨" />
      </div>
    </div>
  );
}
