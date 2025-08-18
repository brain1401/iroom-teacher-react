# 🎨 스타일링 가이드

Tailwind CSS v4 + shadcn/ui를 활용한 스타일링 패턴과 베스트 프랙티스 가이드입니다.

## 🎯 스타일링 원칙

### 1. 유틸리티 우선 (Utility-First)

- Tailwind 클래스를 우선적으로 사용
- 커스텀 CSS는 최소화
- 일관된 디자인 시스템 유지

### 2. 컴포넌트 기반 스타일링

- shadcn/ui 컴포넌트 활용
- variant 시스템으로 다양성 제공
- 재사용 가능한 스타일 패턴

### 3. 반응형 우선 (Mobile-First)

- 모바일 화면 기준으로 설계
- 점진적 향상 (Progressive Enhancement)
- 적절한 브레이크포인트 활용

## 🛠 핵심 도구

### cn() 함수

```typescript
import { cn } from "@/lib/utils";

// ✅ 기본 사용법
<div className={cn("base-class", "additional-class")} />

// ✅ 조건부 클래스
<div className={cn(
  "base-class",
  isActive && "active-class",
  hasError && "error-class"
)} />

// ✅ 객체 형태 조건
<div className={cn(
  "base-class",
  {
    "active-class": isActive,
    "error-class": hasError,
    "disabled-class": isDisabled,
  }
)} />

// ✅ Tailwind 충돌 해결
<div className={cn(
  "text-blue-500",    // 기본 색상
  "text-red-500",     // 조건부 색상 (덮어씀)
  className           // 외부 전달 클래스
)} />
```

### Class Variance Authority (CVA)

```typescript
import { cva } from "class-variance-authority";

// ✅ variant 시스템 정의
const buttonVariants = cva(
  // 기본 클래스
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 사용 예시
<button
  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
>
  버튼
</button>
```

## 🧩 shadcn/ui 활용 패턴

### 기본 컴포넌트 사용

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ExampleComponent() {
  return (
    <Card>
      <CardHeader>
        <h2>제목</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Badge variant="secondary">라벨</Badge>
          <Button variant="outline" size="sm">
            버튼
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 컴포넌트 커스터마이징

```typescript
// ✅ className으로 스타일 확장
<Button
  variant="outline"
  className={cn(
    "border-2",           // 테두리 강조
    "hover:scale-105",    // 호버 효과
    "transition-transform" // 애니메이션
  )}
>
  커스텀 버튼
</Button>

// ✅ asChild로 의미 변경
<Button asChild variant="ghost">
  <Link to="/pokemon">포켓몬 보기</Link>
</Button>
```

### 새 컴포넌트 추가

```bash
# shadcn/ui 컴포넌트 설치
pnpx shadcn@latest add alert
pnpx shadcn@latest add dialog
pnpx shadcn@latest add dropdown-menu
```

## 🎨 디자인 시스템

### 색상 시스템

```css
/* src/css/colors.css */
:root {
  /* Primary Colors */
  --primary: 220 14% 96%;
  --primary-foreground: 220 9% 46%;

  /* Secondary Colors */
  --secondary: 220 13% 91%;
  --secondary-foreground: 220 9% 46%;

  /* Accent Colors */
  --accent: 220 13% 91%;
  --accent-foreground: 220 9% 46%;

  /* Destructive Colors */
  --destructive: 0 84% 60%;
  --destructive-foreground: 210 20% 98%;
}

[data-theme="dark"] {
  --primary: 220 14% 4%;
  --primary-foreground: 210 20% 98%;
  /* ... 다크 모드 색상 */
}
```

```typescript
// 사용 예시
<div className="bg-primary text-primary-foreground">
  Primary 배경
</div>

<div className="bg-secondary text-secondary-foreground">
  Secondary 배경
</div>

<div className="bg-destructive text-destructive-foreground">
  Error 배경
</div>
```

### 타이포그래피

```typescript
// ✅ 텍스트 크기 시스템
<h1 className="text-4xl font-bold">큰 제목</h1>
<h2 className="text-3xl font-semibold">중간 제목</h2>
<h3 className="text-2xl font-medium">작은 제목</h3>
<p className="text-base">본문 텍스트</p>
<span className="text-sm text-muted-foreground">보조 텍스트</span>

// ✅ 폰트 weight
<span className="font-thin">100</span>
<span className="font-light">300</span>
<span className="font-normal">400</span>
<span className="font-medium">500</span>
<span className="font-semibold">600</span>
<span className="font-bold">700</span>
```

### 간격 시스템

```typescript
// ✅ Margin & Padding
<div className="p-4">              {/* padding: 1rem */}
<div className="px-6 py-3">        {/* padding: 0.75rem 1.5rem */}
<div className="m-2">              {/* margin: 0.5rem */}
<div className="mx-auto">          {/* margin: 0 auto */}

// ✅ Gap (Flexbox/Grid)
<div className="flex gap-4">       {/* gap: 1rem */}
<div className="grid gap-6">       {/* gap: 1.5rem */}

// ✅ Space Between
<div className="space-y-4">        {/* margin-top을 자식에게 적용 */}
<div className="space-x-2">        {/* margin-left를 자식에게 적용 */}
```

## 📱 반응형 디자인

### 브레이크포인트

```typescript
// Tailwind 기본 브레이크포인트
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// ✅ 반응형 클래스
<div className={cn(
  "grid grid-cols-1",      // 모바일: 1열
  "md:grid-cols-2",        // 태블릿: 2열
  "lg:grid-cols-3",        // 데스크톱: 3열
  "xl:grid-cols-4"         // 대형 화면: 4열
)}>
  {items.map(item => <Card key={item.id} />)}
</div>

// ✅ 텍스트 크기 반응형
<h1 className={cn(
  "text-2xl",              // 모바일
  "md:text-3xl",           // 태블릿
  "lg:text-4xl"            // 데스크톱
)}>
  제목
</h1>
```

### 모바일 우선 설계

```typescript
// ✅ 모바일 우선 접근법
<div className={cn(
  // 모바일 기본 스타일
  "flex flex-col p-4 text-sm",

  // 태블릿 이상에서 변경
  "md:flex-row md:p-6 md:text-base",

  // 데스크톱에서 변경
  "lg:p-8 lg:text-lg"
)}>
  콘텐츠
</div>

// ❌ 데스크톱 우선 (권장하지 않음)
<div className="lg:text-lg md:text-base text-sm">
  텍스트
</div>
```

## 🎭 다크 모드

### 다크 모드 구현

```typescript
// ✅ CSS 변수 활용
<div className={cn(
  "bg-background text-foreground",  // 자동으로 테마 색상 적용
  "border border-border"            // 테마에 따른 테두리
)}>
  다크 모드 지원 컨테이너
</div>

// ✅ 조건부 다크 모드 스타일
<div className={cn(
  "bg-white text-black",            // 라이트 모드
  "dark:bg-gray-900 dark:text-white" // 다크 모드
)}>
  수동 다크 모드 스타일
</div>
```

### 테마 전환

```typescript
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </Button>
  );
}
```

## ✨ 애니메이션과 전환

### Tailwind 애니메이션

```typescript
// ✅ 기본 애니메이션
<div className="animate-spin">로딩 스피너</div>
<div className="animate-pulse">펄스 효과</div>
<div className="animate-bounce">바운스 효과</div>

// ✅ 호버 전환
<button className={cn(
  "transition-all duration-300",      // 모든 속성 0.3초 전환
  "hover:scale-105",                  // 호버 시 크기 증가
  "hover:shadow-lg",                  // 호버 시 그림자
  "active:scale-95"                   // 클릭 시 크기 감소
)}>
  인터랙티브 버튼
</button>

// ✅ 커스텀 전환
<div className={cn(
  "transform transition-transform duration-500 ease-in-out",
  isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
)}>
  슬라이드 애니메이션
</div>
```

### 고급 애니메이션

```css
/* src/css/animations.css */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
```

```typescript
// 사용 예시
<div className="animate-slide-in">
  커스텀 애니메이션
</div>
```

## 🖼️ 레이아웃 패턴

### Flexbox 패턴

```typescript
// ✅ 중앙 정렬
<div className="flex items-center justify-center h-screen">
  중앙 정렬 콘텐츠
</div>

// ✅ 네비게이션 레이아웃
<nav className="flex items-center justify-between p-4">
  <div className="flex items-center gap-4">
    <Logo />
    <NavLinks />
  </div>
  <UserMenu />
</nav>

// ✅ 카드 레이아웃
<div className="flex flex-col space-y-4">
  <CardHeader />
  <CardContent className="flex-1" />
  <CardFooter />
</div>
```

### Grid 패턴

```typescript
// ✅ 반응형 그리드
<div className={cn(
  "grid gap-6",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
)}>
  {items.map(item => <Card key={item.id} />)}
</div>

// ✅ 복잡한 레이아웃
<div className="grid grid-cols-12 gap-4">
  <aside className="col-span-12 md:col-span-3">사이드바</aside>
  <main className="col-span-12 md:col-span-9">메인 콘텐츠</main>
</div>

// ✅ 자동 크기 조정 그리드
<div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
  <Icon />
  <div className="min-w-0">
    <h3 className="truncate">긴 제목이 여기에...</h3>
  </div>
  <Button size="sm">액션</Button>
</div>
```

## 🎯 성능 최적화

### CSS 최적화

```typescript
// ✅ 자주 사용하는 스타일 패턴을 컴포넌트로 추출
const cardStyles = cn(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
);

const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent",
      },
    },
  },
);
```

### 동적 스타일링 최적화

```typescript
// ✅ 조건부 스타일 최적화
const getStatusColor = useMemo(() => {
  switch (status) {
    case "success": return "text-green-600 bg-green-50";
    case "error": return "text-red-600 bg-red-50";
    case "warning": return "text-yellow-600 bg-yellow-50";
    default: return "text-gray-600 bg-gray-50";
  }
}, [status]);

<div className={cn("px-3 py-1 rounded-full", getStatusColor)}>
  {status}
</div>
```

## 📋 스타일링 체크리스트

### 개발 전

- [ ] 디자인 시스템 확인
- [ ] 반응형 요구사항 파악
- [ ] 다크 모드 필요성 확인
- [ ] 접근성 요구사항 검토

### 개발 중

- [ ] cn() 함수로 클래스 조합
- [ ] shadcn/ui 컴포넌트 우선 사용
- [ ] 모바일 우선 반응형 설계
- [ ] 적절한 간격과 타이포그래피 적용

### 완료 후

- [ ] 다양한 화면 크기에서 테스트
- [ ] 다크 모드 동작 확인
- [ ] 접근성 테스트 (대비, 포커스)
- [ ] 성능 영향 확인

## 🚫 피해야 할 패턴

```typescript
// ❌ 인라인 스타일 사용
<div style={{ padding: "16px", margin: "8px" }}>

// ❌ !important 남용
<div className="!text-red-500 !bg-blue-600">

// ❌ 하드코딩된 크기
<div className="w-[347px] h-[234px]">

// ❌ 의미 없는 클래스명
<div className="component-1 item-a">

// ❌ 중복된 스타일
<div className="p-4 px-4 py-4">
```

## ✅ 권장 패턴

```typescript
// ✅ 의미 있는 유틸리티 조합
<div className="container mx-auto px-4 py-8">

// ✅ 재사용 가능한 스타일 패턴
const cardBase = "rounded-lg border bg-card shadow-sm";

// ✅ 조건부 스타일링
<div className={cn(
  "base-styles",
  isActive && "active-styles",
  variant === "primary" && "primary-styles"
)}>

// ✅ 컴포넌트 기반 스타일링
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>내용</CardContent>
</Card>
```

---

이 가이드를 따라 일관되고 유지보수하기 쉬운 스타일링을 구현해 주세요.
