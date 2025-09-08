# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ***** 중요! *****
- 하다가 잘 안 될 때 마다 반드시 context7을 사용해서 해결법을 받아서 해결하라. 처음 한번만 context7을 사용하는 것이 아니라 모든 thinking step의 중간중간에도 잘 안 될 때는 context7 사용하라.

- any 타입 금지
  
- 항상 어떤 작업이든지 구현, 수정, 개선 등등 작업 끝나면 bun run lint, bun run type-check, 테스트를 실행해서 에러가 없는지 확인하라.

# 추가 지침

- 코딩 컨벤션 - @docs/coding-conventions.md
- 콜라보레이션 가이드 - @docs/collaboration-guide.md
- 아키텍처 가이드 - @docs/architecture.md
- 상태 관리 가이드 - @docs/state-management.md
- 컴포넌트 가이드 - @docs/component-guide.md
- 스타일링 가이드 - @docs/styling-guide.md
- 문제 해결 가이드 - @docs/troubleshooting.md
- 프로젝트 문서 - @docs/README.md

# 주석
주석은 반드시 한국어 명사형으로 작성하고 존댓말 사용 금지



## 개발 명령어

### 핵심 명령어
- `npm run dev` - 개발 서버 실행 (포트 3011)
- `npm run build` - 프로덕션 빌드 (출력: .output 디렉토리)
- `npm run test` - Vitest를 사용한 테스트 실행
- `npm run lint` - ESLint 실행
- `npm run lint:fix` - ESLint 자동 수정 + Prettier 포맷팅 **코딩 완료 후 필수 실행**
- `npm run format` - Prettier 포맷팅만 실행
- `npm run format:check` - Prettier 포맷 체크만 실행
- `npm run type-check` - TypeScript 타입 체크

### 컴포넌트 및 도구
- `pnpx shadcn@latest add [컴포넌트명]` - shadcn/ui 컴포넌트 추가
- `pnpx shadcn@latest add [컴포넌트명] --overwrite` - 기존 컴포넌트 재설치

### 분석 및 디버깅
- `npm run build -- --analyze` - 번들 크기 분석
- `npm view [패키지명]` - 패키지 정보 확인
- `npm ls` - 설치된 패키지 목록 확인

## 아키텍처 개요

### 기술 스택
- **프레임워크**: TanStack Start (React 19 + SSR)
- **번들러**: Vite (포트 3011, Bun 타겟)
- **라우팅**: TanStack Router (파일 기반, 타입 안전)
- **상태 관리**: Jotai + TanStack Query 통합
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **테스트**: Vitest + Testing Library
- **타입스크립트**: 엄격 모드 활성화 (strict)

### 핵심 아키텍처 패턴

#### 1. API 클라이언트 시스템
- `src/api/client/index.ts`에서 두 가지 클라이언트 제공:
  - `baseApiClient`: 기본 API 호출용
  - `authApiClient`: 인증이 필요한 API 호출용 (httpOnly 쿠키)
- **중요**: fetch 대신 반드시 이 클라이언트들 사용

#### 2. 상태 관리 패턴 (Jotai + React Query)
- **Jotai Atoms**: 클라이언트 상태 (필터, 페이지 등)
- **atomWithQuery**: 서버 상태와 클라이언트 상태 통합
- **atomWithStorage**: localStorage 연동 (사용자 설정)
- 예시: `src/atoms/pokemon.ts`에서 포켓몬 관련 상태 관리

#### 3. 라우팅 구조
- **파일 기반 라우팅**: `src/routes/` 디렉토리
- **루트 레이아웃**: `src/routes/__root.tsx`
- **컨텍스트**: QueryClient가 모든 라우트에서 사용 가능
- **404 처리**: `src/components/errors/NotFound.tsx`

### 디렉토리 구조 가이드

```
src/
├── api/          # API 관련 코드
│   ├── client/   # HTTP 클라이언트 (baseClient, authClient)
│   └── [domain]/ # 도메인별 API (types, queries, api)
├── atoms/        # Jotai 상태 관리
├── components/   # React 컴포넌트
│   ├── ui/       # shadcn/ui 기본 컴포넌트
│   ├── layout/   # 레이아웃 컴포넌트
│   └── [domain]/ # 도메인별 컴포넌트
├── hooks/        # 커스텀 훅
├── routes/       # 파일 기반 라우팅
├── utils/        # 유틸리티 함수
└── css/          # 전역 스타일
```

## 코드 스타일 가이드라인

### 주석 작성 규칙 (필수)
- **모든 코드 주석은 한국어 명사형**으로 작성 (존댓말 사용 안함)
- 영어 주석 사용 금지
- **TSDoc 형식 적극 활용** (`@description`, `@param`, `@returns`, `@example`)
- bullet point 적극 사용해서 가독성 향상
- React 기초 수준 개발자도 이해할 수 있도록 충분한 설명 제공

```typescript
/**
 * 포켓몬 카드 컴포넌트
 * @description 이미지, 이름, 번호를 표시하는 현대적인 카드 UI
 *
 * 주요 기능:
 * - 목록에서는 기본 정보만 표시
 * - 커스텀 훅으로 복잡한 로직 캡슐화
 * - asChild 패턴으로 컴포넌트 합성
 *
 * @example
 * ```tsx
 * <PokemonCard name="pikachu" url="..." />
 * ```
 */
```

### API 호출 규칙 (필수)
- **fetch 사용 절대 금지** → `src/api/client/index.ts`의 클라이언트만 사용
- 인증 필요: `authApiClient` (httpOnly 쿠키 포함)
- 일반 호출: `baseApiClient`

```typescript
// ❌ 절대 금지
const response = await fetch("/data");

// ✅ 필수
import { baseApiClient, authApiClient } from "@/api/client";
const data = await baseApiClient.get("/pokemon");
const userData = await authApiClient.get("/user/profile");
```

### 컴포넌트 작성 패턴

#### 기본 구조
```typescript
// 1. Props 타입 정의
type ComponentProps = {
  /** 필수 prop 설명 */
  requiredProp: string;
  /** 선택적 prop 설명 */
  optionalProp?: number;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 자식 요소 */
  children?: React.ReactNode;
};

// 2. 컴포넌트 구현 (함수 컴포넌트만 사용)
export function Component({ requiredProp, optionalProp = 0, className, children }: ComponentProps) {
  // 3. 커스텀 훅으로 복잡한 로직 분리
  const { state, handlers } = useComponentLogic();

  // 4. cn() 함수로 조건부 스타일링
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  );
}
```

#### asChild 패턴 (중요)
```typescript
// ✅ Button 스타일을 Link에 적용
<Button variant="ghost" asChild>
  <Link to="/examples/pokemon">포켓몬</Link>
</Button>

// ❌ 잘못된 방법: 중첩 구조
<Button variant="ghost">
  <Link to="/examples/pokemon">포켓몬</Link>
</Button>
```

### 상태 관리 패턴

#### Atom 분류 및 사용
```typescript
// 서버 상태: atomWithQuery (React Query + Jotai)
export const pokemonListQueryAtom = atomWithQuery((get) => {
  const page = get(pokemonPageAtom);
  const filters = get(pokemonListFiltersAtom);
  return pokemonListQueryOptions({ page, ...filters });
});

// 사용자 설정: atomWithStorage (localStorage 연동)
export const pokemonLimitAtom = atomWithStorage("pokemon-limit", 24);

// 임시 상태: 일반 atom
export const pokemonPageAtom = atom<number>(1);

// derived 상태: 계산된 값 (컴포넌트 useMemo 대신 사용)
export const filteredPokemonListAtom = atom((get) => {
  const { data, isPending, isError } = get(pokemonListQueryAtom);
  return {
    results: data?.results || [],
    isPending,
    isError,
  };
});
```

#### Atom 사용 최적화
```typescript
// ✅ 값만 읽기 (read-only) - 성능 최적화
const pokemonList = useAtomValue(pokemonListQueryAtom);

// ✅ 설정만 필요 (write-only) - 렌더링 최적화
const setFilters = useSetAtom(pokemonListFiltersAtom);

// ✅ 읽기 + 쓰기 모두 필요
const [page, setPage] = useAtom(pokemonPageAtom);
```

### 스타일링 규칙

#### cn() 함수 활용 (필수)
```typescript
import { cn } from "@/lib/utils";

// ✅ 기본 사용법
<div className={cn(
  "base-styles",                    // 기본 스타일
  isActive && "active-styles",      // 조건부 스타일
  hasError && "error-styles",       // 에러 상태
  className                         // 외부 전달 클래스
)} />
```

#### shadcn/ui 컴포넌트 활용 (필수)
shadcn/ui는 이 프로젝트의 **핵심 UI 시스템**입니다. 모든 UI 컴포넌트는 shadcn/ui를 기반으로 작성해야 합니다.

```typescript
// ✅ 올바른 shadcn/ui 사용법
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

// ✅ variant 시스템 적극 활용
<Button variant="outline" size="lg">큰 아웃라인 버튼</Button>
<Button variant="destructive" size="sm">작은 위험 버튼</Button>
<Alert variant="destructive">에러 메시지</Alert>
<Badge variant="secondary">보조 배지</Badge>

// ✅ asChild 패턴 (매우 중요)
<Button variant="ghost" asChild>
  <Link to="/examples/pokemon">포켓몬 목록</Link>
</Button>

// ❌ 잘못된 중첩 구조 (절대 금지)
<Button variant="ghost">
  <Link to="/examples/pokemon">포켓몬 목록</Link>
</Button>

// ✅ className으로 스타일 확장
<Button
  variant="outline"
  className={cn(
    "border-2 transition-all duration-200", // 기본 확장 스타일
    isLoading && "opacity-50 cursor-not-allowed", // 조건부 스타일
    hasError && "border-red-500 text-red-500", // 에러 상태
    className // 외부에서 전달받은 추가 클래스
  )}
>
  커스텀 버튼
</Button>
```

#### 반응형 디자인 (모바일 우선)
```typescript
// ✅ 모바일 우선 접근법
<div className={cn(
  "flex flex-col space-y-4 p-4",        // 모바일 기본
  "md:flex-row md:space-y-0 md:space-x-4", // 태블릿 이상
  "lg:p-8"                             // 데스크톱
)}>
```

### 타입 정의 규칙
- **interface 사용 금지** → **type만 사용**
- 모든 Props에 JSDoc 주석 포함

```typescript
// ✅ type 사용
type PokemonCardProps = {
  /** 포켓몬 이름 */
  name: string;
  /** 포켓몬 API URL */
  url: string;
  /** 카드 클릭 시 이동할 경로 */
  href?: string;
};

// ❌ interface 사용 금지
interface PokemonCardProps {
  name: string;
  url: string;
}
```

## 성능 최적화 가이드라인

### 렌더링 최적화
- **derived atom 활용**: 컴포넌트 내 `useMemo` 대신 derived atom 사용
- **올바른 훅 선택**: 읽기 전용 → `useAtomValue`, 쓰기 전용 → `useSetAtom`
- **조건부 구독**: 불필요한 atom 구독 방지

### 번들 최적화
- **동적 import**: 무거운 컴포넌트는 `lazy()` 사용
- **코드 분할**: 라우트별 자동 분할 (TanStack Router)
- **이미지 최적화**: preload 설정 및 다단계 fallback

### 메모리 관리
```typescript
// ✅ 이벤트 리스너 정리
useEffect(() => {
  const handleResize = () => { /* ... */ };
  window.addEventListener("resize", handleResize);
  
  return () => window.removeEventListener("resize", handleResize);
}, []);

// ✅ API 요청 취소
useEffect(() => {
  const controller = new AbortController();
  fetchData({ signal: controller.signal });
  
  return () => controller.abort();
}, []);
```

## 자주 발생하는 문제 및 해결법

### TypeScript 컴파일 에러
```typescript
// ❌ 문제: undefined 가능한 값
const name: string = props.name;

// ✅ 해결: 타입 가드 또는 기본값
const name = props.name || "";
const name = props.name ?? "기본값";
```

### Atom 무한 리렌더링
```typescript
// ❌ 문제: 렌더링 중 state 변경
function Component() {
  const [value, setValue] = useAtom(someAtom);
  setValue({ ...value, newProp: "value" }); // 무한 루프
}

// ✅ 해결: useEffect 사용
function Component() {
  const [value, setValue] = useAtom(someAtom);
  
  useEffect(() => {
    setValue({ ...value, newProp: "value" });
  }, []); // 의존성 배열 주의
}
```

### shadcn/ui 스타일 깨짐
```bash
# 컴포넌트 재설치
pnpx shadcn@latest add button --overwrite

# CSS 변수 확인 (src/css/root.css)
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}
```

### 포트 충돌 해결
```bash
# 포트 사용 프로세스 확인
netstat -ano | findstr :3011

# 프로세스 종료
taskkill /PID [PID번호] /F

# 다른 포트 사용
npm run dev -- --port 3013
```

## 코드 품질 체크리스트

### 코딩 완료 후 필수 검증 (ESLint 자동 실행 필수)

**⚠️ 모든 작업 완료 후 반드시 다음 명령어를 순서대로 실행:**

```bash
# 1. ESLint + Prettier 자동 수정 (필수)
npm run lint:fix

# 2. TypeScript 타입 체크 (필수)
npm run type-check

# 3. 테스트 실행 (해당하는 경우)
npm run test
```

**코드 품질 체크리스트:**
- [ ] **`npm run lint:fix` 실행 및 모든 에러 해결 (절대 필수)**
- [ ] **`npm run type-check` 실행 및 타입 에러 완전 해결**
- [ ] 모든 주석이 한국어 명사형으로 작성됨 (존댓말 금지)
- [ ] `fetch` 대신 API 클라이언트 사용 확인
- [ ] `interface` 대신 `type` 사용 확인
- [ ] shadcn/ui 컴포넌트 사용 및 `cn()` 함수로 className 조합 확인
- [ ] asChild 패턴 올바르게 사용 확인

**⚠️ 중요: ESLint 에러가 남아있으면 작업 완료로 간주하지 않습니다.**

### 컴포넌트 품질 검증
- [ ] Props에 JSDoc 주석 포함
- [ ] 함수 컴포넌트만 사용 (클래스 컴포넌트 금지)
- [ ] 복잡한 로직이 커스텀 훅으로 분리됨
- [ ] `cn()` 함수로 className 조합
- [ ] 에러 처리 및 로딩 상태 포함

### 성능 및 접근성 검증
- [ ] 반응형 디자인 적용 (모바일 우선)
- [ ] 접근성 고려 (alt 텍스트, 키보드 네비게이션)
- [ ] 불필요한 리렌더링 방지
- [ ] 이벤트 리스너 정리 로직 포함

### 사용자 확인 사항
다음 항목들은 사용자에게 확인받을 것:
- [ ] 새로운 라이브러리 추가 필요 여부
- [ ] 기존 디자인 시스템과의 일관성
- [ ] 특별한 성능 요구사항
- [ ] 접근성 특별 요구사항

## Git 커밋 규칙

### 커밋 메시지 형식
- 불렛 포인트 사용해서 가독성 높이기
- 타입: feat, fix, docs, style, refactor, test, chore