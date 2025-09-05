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

### 4. 공통 스타일 시스템

- `@/utils/commonStyles` 활용
- 일관된 디자인 토큰 사용
- 중복 코드 제거

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

### 공통 스타일 시스템

```typescript
import {
  tableStyles,
  buttonStyles,
  badgeStyles,
  cardStyles,
  layoutStyles,
  typographyStyles,
  spacingStyles,
  statusStyles,
  getDifficultyBadgeVariant,
  getStatusBadgeVariant
} from "@/utils/commonStyles";

// ✅ 테이블 스타일 사용
<div className={tableStyles.container}>
  <TableRow className={tableStyles.header}>
    <TableHead className={tableStyles.headerCell}>제목</TableHead>
  </TableRow>
</div>

// ✅ 버튼 스타일 사용
<Button className={buttonStyles.primary}>버튼</Button>

// ✅ 배지 스타일 사용
<Badge
  variant={getDifficultyBadgeVariant("상")}
  className={badgeStyles[getDifficultyBadgeVariant("상")]}
>
  상
</Badge>

// ✅ 카드 스타일 사용
<Card className={cardStyles.interactive}>내용</Card>
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

## 📊 테이블 스타일링 패턴

### 통일된 테이블 구조

```typescript
import {
  tableStyles,
  buttonStyles,
  badgeStyles,
  getDifficultyBadgeVariant
} from "@/utils/commonStyles";

export function DataTable({ data }: DataTableProps) {
  return (
    <div className={tableStyles.container}>
      <Table>
        <TableHeader>
          <TableRow className={tableStyles.header}>
            <TableHead className="w-[50px] text-center">
              <Checkbox className={tableStyles.checkbox} />
            </TableHead>
            <TableHead className={tableStyles.headerCell}>제목</TableHead>
            <TableHead className={tableStyles.headerCellCenter}>상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id}
              className={cn(
                tableStyles.row,
                index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd
              )}
            >
              <TableCell className={tableStyles.cellCenter}>
                <Checkbox className={tableStyles.checkbox} />
              </TableCell>
              <TableCell className={tableStyles.cellMedium}>
                {item.title}
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Badge
                  variant={getDifficultyBadgeVariant(item.level)}
                  className={badgeStyles[getDifficultyBadgeVariant(item.level)]}
                >
                  {item.level}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 테이블 스타일 상수

```typescript
// @/utils/commonStyles.ts
export const tableStyles = {
  container: "rounded-lg border bg-card shadow-sm",
  header: "border-b bg-muted/50",
  headerCell: "font-semibold text-foreground",
  headerCellCenter: "font-semibold text-foreground text-center",
  row: "transition-colors hover:bg-muted/50",
  rowEven: "bg-background",
  rowOdd: "bg-muted/20",
  cell: "text-foreground",
  cellCenter: "text-center",
  cellMedium: "font-medium text-foreground",
  checkbox:
    "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
} as const;
```

## 🎨 버튼 스타일링 패턴

### 통일된 버튼 스타일

```typescript
import { buttonStyles } from "@/utils/commonStyles";

// ✅ 기본 버튼
<Button variant="outline" className={buttonStyles.primary}>
  기본 버튼
</Button>

// ✅ 액션 버튼
<Button variant="outline" className={buttonStyles.secondary}>
  액션 버튼
</Button>

// ✅ 위험 버튼
<Button variant="outline" className={buttonStyles.destructive}>
  삭제
</Button>
```

### 버튼 스타일 상수

```typescript
// @/utils/commonStyles.ts
export const buttonStyles = {
  primary: cn(
    "transition-all duration-200",
    "hover:bg-primary hover:text-primary-foreground",
    "focus:ring-2 focus:ring-primary/20",
    "border-primary/20 text-primary",
  ),
  secondary: cn(
    "transition-all duration-200",
    "hover:bg-secondary hover:text-secondary-foreground",
    "focus:ring-2 focus:ring-secondary/20",
    "border-secondary/20 text-secondary-foreground",
  ),
  destructive: cn(
    "transition-all duration-200",
    "hover:bg-destructive hover:text-destructive-foreground",
    "focus:ring-2 focus:ring-destructive/20",
    "border-destructive/20 text-destructive",
  ),
} as const;
```

## 🏷️ 배지 스타일링 패턴

### 통일된 배지 스타일

```typescript
import {
  badgeStyles,
  getDifficultyBadgeVariant,
  getStatusBadgeVariant
} from "@/utils/commonStyles";

// ✅ 난이도 배지
<Badge
  variant={getDifficultyBadgeVariant("상")}
  className={badgeStyles[getDifficultyBadgeVariant("상")]}
>
  상
</Badge>

// ✅ 상태 배지
<Badge
  variant={getStatusBadgeVariant("완료")}
  className={badgeStyles[getStatusBadgeVariant("완료")]}
>
  완료
</Badge>
```

### 배지 스타일 상수

```typescript
// @/utils/commonStyles.ts
export const badgeStyles = {
  default: "font-medium",
  outline: "font-medium",
  secondary: "font-medium",
  destructive: "font-medium",
} as const;

export const getDifficultyBadgeVariant = (level: string) => {
  switch (level.toLowerCase()) {
    case "상":
      return "destructive" as const;
    case "중":
      return "default" as const;
    case "하":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};
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
      variant="outline"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "라이트 모드" : "다크 모드"}
    </Button>
  );
}
```

## 📐 레이아웃 패턴

### Flexbox 패턴

```typescript
// ✅ 기본 Flexbox
<div className="flex items-center justify-between">
  <div>왼쪽</div>
  <div>오른쪽</div>
</div>

// ✅ 중앙 정렬
<div className="flex items-center justify-center">
  <div>중앙</div>
</div>

// ✅ 세로 배치
<div className="flex flex-col space-y-4">
  <div>위</div>
  <div>아래</div>
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
- [ ] 공통 스타일 유틸리티 확인

### 개발 중

- [ ] cn() 함수로 클래스 조합
- [ ] shadcn/ui 컴포넌트 우선 사용
- [ ] 공통 스타일 시스템 활용
- [ ] 모바일 우선 반응형 설계
- [ ] 적절한 간격과 타이포그래피 적용

### 완료 후

- [ ] 다양한 화면 크기에서 테스트
- [ ] 다크 모드 동작 확인
- [ ] 접근성 테스트 (대비, 포커스)
- [ ] 성능 영향 확인
- [ ] 스타일 일관성 검토

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

// ❌ 공통 스타일 시스템 미사용
<div className="rounded-lg border bg-card shadow-sm"> // tableStyles.container 사용해야 함
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

// ✅ 공통 스타일 시스템 활용
<div className={tableStyles.container}>
  <Button className={buttonStyles.primary}>버튼</Button>
</div>
```

---

이 가이드를 따라 일관되고 유지보수하기 쉬운 스타일링을 구현해 주세요.
