# 🧩 컴포넌트 개발 가이드

React 컴포넌트 개발을 위한 패턴과 베스트 프랙티스 가이드입니다.

## 📋 컴포넌트 개발 원칙

### 1. 단일 책임 원칙
- 각 컴포넌트는 하나의 명확한 목적을 가져야 함
- 복잡한 로직은 커스텀 훅으로 분리
- UI 로직과 비즈니스 로직 분리

### 2. 재사용성과 확장성
- Props 인터페이스를 통한 유연한 설정
- 컴포넌트 합성 패턴 활용
- variant 시스템으로 다양한 스타일 지원

### 3. 타입 안전성
- 모든 Props에 타입 정의
- 이벤트 핸들러 타입 명시
- 제네릭을 활용한 재사용 가능한 컴포넌트

## 🏗️ 컴포넌트 구조 템플릿

### 기본 컴포넌트 템플릿

```typescript
import { useCallback } from "react";
import { cn } from "@/lib/utils";

// 1. Props 타입 정의
type ComponentProps = {
  /** 필수 prop 설명 */
  requiredProp: string;
  /** 선택적 prop 설명 */
  optionalProp?: number;
  /** 이벤트 핸들러 */
  onAction?: (value: string) => void;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 자식 요소 */
  children?: React.ReactNode;
};

// 2. 컴포넌트 주석
/**
 * 컴포넌트 설명
 * 주요 기능과 사용법을 간단히 설명
 * 
 * 주요 기능:
 * - 기능 1
 * - 기능 2
 * - 기능 3
 * 
 * @example
 * ```tsx
 * <Component 
 *   requiredProp="value"
 *   onAction={(value) => console.log(value)}
 * >
 *   내용
 * </Component>
 * ```
 */
export function Component({
  requiredProp,
  optionalProp = 0,
  onAction,
  className,
  children,
}: ComponentProps) {
  // 3. 커스텀 훅 (복잡한 로직 분리)
  const { state, updateState } = useComponentLogic();
  
  // 4. 이벤트 핸들러
  const handleClick = useCallback(() => {
    updateState(requiredProp);
    onAction?.(requiredProp);
  }, [requiredProp, onAction, updateState]);
  
  // 5. 조건부 렌더링
  if (!requiredProp) {
    return null;
  }
  
  // 6. 메인 JSX
  return (
    <div 
      className={cn("base-styles", className)}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
```

## 🎨 컴포넌트 합성 패턴

### asChild 패턴

```typescript
import { Slot } from "@radix-ui/react-slot";

type ButtonProps = {
  /** 버튼 내용 */
  children: React.ReactNode;
  /** 다른 컴포넌트로 렌더링 */
  asChild?: boolean;
  /** 버튼 variant */
  variant?: "default" | "ghost" | "outline";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * 버튼 컴포넌트
 * asChild를 통해 다른 컴포넌트와 합성 가능
 */
export function Button({ asChild = false, className, variant = "default", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  
  return (
    <Comp
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}

// 사용 예시
function Navigation() {
  return (
    <nav>
      {/* Button 스타일을 Link에 적용 */}
      <Button variant="ghost" asChild>
        <Link to="/examples/pokemon">포켓몬</Link>
      </Button>
      
      {/* 일반 버튼 */}
      <Button onClick={handleClick}>
        일반 버튼
      </Button>
    </nav>
  );
}
```

### 컴포넌트 합성 (Compound Components)

```typescript
// 부모 컴포넌트
type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("card-base", className)}>
      {children}
    </div>
  );
}

// 자식 컴포넌트들
function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("card-header", className)}>
      {children}
    </div>
  );
}

function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn("card-content", className)}>
      {children}
    </div>
  );
}

// 합성된 컴포넌트 export
Card.Header = CardHeader;
Card.Content = CardContent;

// 사용 예시
function PokemonCard() {
  return (
    <Card>
      <Card.Header>
        <h3>피카츄</h3>
      </Card.Header>
      <Card.Content>
        <img src="..." alt="피카츄" />
      </Card.Content>
    </Card>
  );
}
```

## 🪝 커스텀 훅 패턴

### 로직 캡슐화 훅

```typescript
interface UseToggleReturn {
  /** 현재 상태 */
  isOpen: boolean;
  /** 열기 */
  open: () => void;
  /** 닫기 */
  close: () => void;
  /** 토글 */
  toggle: () => void;
}

/**
 * 토글 상태 관리 훅
 * 모달, 드롭다운 등에서 재사용 가능
 */
export function useToggle(initialState = false): UseToggleReturn {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
}

// 컴포넌트에서 사용
function Modal() {
  const { isOpen, open, close } = useToggle();
  
  return (
    <>
      <Button onClick={open}>모달 열기</Button>
      {isOpen && <ModalContent onClose={close} />}
    </>
  );
}
```

### 데이터 페칭 훅

```typescript
interface UseApiReturn<T> {
  /** 데이터 */
  data: T | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** 다시 가져오기 */
  refetch: () => void;
}

/**
 * API 데이터 페칭 훅
 * @param url API 엔드포인트
 * @param options 요청 옵션
 */
export function useApi<T>(url: string, options?: RequestInit): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await baseApiClient.request<T>({
        url,
        ...options,
      });
      
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('API 요청 실패'));
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, isLoading, error, refetch: fetchData };
}
```

## 🔄 상태 관리 패턴

### 로컬 상태 vs 전역 상태

```typescript
// ✅ 로컬 상태: 컴포넌트 내부에서만 사용
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <form>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
    </form>
  );
}

// ✅ 전역 상태: 여러 컴포넌트에서 공유
function PokemonList() {
  const pokemonList = useAtomValue(pokemonListQueryAtom);
  const setFilters = useSetAtom(pokemonListFiltersAtom);
  
  return (
    <div>
      <SearchInput onSearch={(term) => setFilters({ search: term })} />
      <Grid items={pokemonList.data?.results} />
    </div>
  );
}
```

### 폼 상태 관리

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 폼 스키마 정의
const formSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다"),
  email: z.string().email("올바른 이메일을 입력하세요"),
  age: z.number().min(1).max(120),
});

type FormData = z.infer<typeof formSchema>;

/**
 * 사용자 정보 폼 컴포넌트
 */
export function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  
  const onSubmit = async (data: FormData) => {
    try {
      await submitUserData(data);
    } catch (error) {
      console.error("폼 제출 실패", error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input 
          {...register("name")}
          placeholder="이름"
        />
        {errors.name && <span>{errors.name.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "제출 중..." : "제출"}
      </button>
    </form>
  );
}
```

## 📱 반응형 컴포넌트

### 미디어 쿼리 훅

```typescript
/**
 * 미디어 쿼리 훅
 * @param query CSS 미디어 쿼리
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  
  return matches;
}

// 사용 예시
function ResponsiveComponent() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  return (
    <div>
      {isMobile && <MobileLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

### 반응형 그리드

```typescript
interface GridProps {
  /** 그리드 아이템들 */
  items: any[];
  /** 렌더 함수 */
  renderItem: (item: any, index: number) => React.ReactNode;
  /** 그리드 컬럼 설정 */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

/**
 * 반응형 그리드 컴포넌트
 */
export function ResponsiveGrid({ 
  items, 
  renderItem, 
  columns = { mobile: 1, tablet: 2, desktop: 3 } 
}: GridProps) {
  return (
    <div 
      className={cn(
        "grid gap-4",
        `grid-cols-${columns.mobile}`,
        `md:grid-cols-${columns.tablet}`,
        `lg:grid-cols-${columns.desktop}`
      )}
    >
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
```

## ♿ 접근성 패턴

### 키보드 네비게이션

```typescript
/**
 * 키보드 네비게이션이 가능한 메뉴 컴포넌트
 */
export function Menu({ items }: { items: MenuItem[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        items[focusedIndex]?.onSelect();
        break;
    }
  };
  
  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <div
          key={item.id}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
          className={cn(
            "menu-item",
            index === focusedIndex && "menu-item-focused"
          )}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
```

### 스크린 리더 지원

```typescript
/**
 * 스크린 리더 친화적인 버튼
 */
export function AccessibleButton({ 
  children, 
  ariaLabel,
  isLoading = false,
  ...props 
}: ButtonProps & { 
  ariaLabel?: string;
  isLoading?: boolean;
}) {
  return (
    <button
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <span aria-hidden="true">
          <Spinner />
        </span>
      )}
      <span className={isLoading ? "sr-only" : undefined}>
        {children}
      </span>
    </button>
  );
}
```

## 🧪 컴포넌트 테스트

### 기본 테스트 패턴

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button 컴포넌트", () => {
  it("기본 렌더링이 올바르게 동작한다", () => {
    render(<Button>클릭</Button>);
    
    const button = screen.getByRole("button", { name: "클릭" });
    expect(button).toBeInTheDocument();
  });
  
  it("클릭 이벤트가 올바르게 호출된다", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it("비활성 상태에서 클릭이 동작하지 않는다", () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>클릭</Button>);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

## 📋 컴포넌트 개발 체크리스트

### 개발 전
- [ ] 컴포넌트 목적과 책임 명확히 정의
- [ ] 재사용 가능한 구조로 설계
- [ ] Props 인터페이스 설계
- [ ] 접근성 요구사항 확인

### 개발 중
- [ ] Props 타입 정의 및 주석 작성
- [ ] 커스텀 훅으로 로직 분리
- [ ] 조건부 렌더링 명확히 처리
- [ ] 이벤트 핸들러 최적화 (useCallback)
- [ ] className 조합에 cn() 사용

### 완료 후
- [ ] 접근성 테스트 (키보드, 스크린 리더)
- [ ] 반응형 디자인 확인
- [ ] 에러 케이스 처리 확인
- [ ] 성능 최적화 확인
- [ ] 유닛 테스트 작성

---

이 가이드를 따라 재사용 가능하고 접근성이 좋은 컴포넌트를 개발해 주세요.