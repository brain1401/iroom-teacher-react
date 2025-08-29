# 📝 코딩 컨벤션

이룸클래스 React 프로젝트의 코딩 스타일과 규칙 가이드입니다.

## 📋 목차

- [주석 작성 규칙](#-주석-작성-규칙)
- [타입 정의 규칙](#-타입-정의-규칙)
- [파일 명명 규칙](#-파일-명명-규칙)
- [Import/Export 규칙](#-importexport-규칙)
- [함수 작성 규칙](#-함수-작성-규칙)
- [컴포넌트 작성 규칙](#-컴포넌트-작성-규칙)
- [에러 처리 규칙](#-에러-처리-규칙)
- [설정 파일 규칙](#️-설정-파일-규칙)

## 💬 주석 작성 규칙

### 기본 원칙

- **한국어 명사형** 사용 (존댓말 사용 안함)
- **TSDoc 형식** 적극 활용
- **bullet point**로 가독성 향상
- **React 기초 수준 개발자**도 이해 가능하도록 상세 설명

### 함수 주석 템플릿

````typescript
/**
 * 포켓몬 상세 정보를 조회하는 함수
 * @description 특정 포켓몬의 모든 상세 정보를 가져오는 함수
 *
 * 주요 기능:
 * - ID 또는 이름으로 포켓몬 조회 지원
 * - 이미지, 능력치, 타입 정보 포함
 * - 요청 취소 기능으로 메모리 누수 방지
 * - 방어적 프로그래밍으로 안전한 데이터 처리
 *
 * @example
 * ```typescript
 * // ID로 조회
 * const pikachu = await fetchPokemonDetail(25);
 *
 * // 이름으로 조회
 * const charizard = await fetchPokemonDetail("charizard");
 *
 * // 요청 취소 기능 포함
 * const controller = new AbortController();
 * const pokemon = await fetchPokemonDetail(1, { signal: controller.signal });
 * ```
 *
 * @param idOrName 포켓몬 ID 번호 또는 이름
 * @param options 추가 옵션
 * @param options.signal 요청 취소를 위한 AbortSignal
 * @returns 포켓몬의 모든 상세 정보 (능력치, 이미지, 기술, 특성 등)
 * @throws {ApiError} 서버 응답 실패 또는 네트워크 오류 시
 */
export async function fetchPokemonDetail(
  idOrName: string | number,
  options?: { signal?: AbortSignal },
): Promise<Pokemon> {
  // 구현...
}
````

### 컴포넌트 주석 템플릿

````typescript
interface PokemonCardProps {
  /** 포켓몬 이름 */
  name: string;
  /** 포켓몬 API URL */
  url: string;
  /** 카드 클릭 시 이동할 경로 */
  href?: string;
}

/**
 * 포켓몬 카드 컴포넌트
 * 이미지, 이름, 번호를 표시하는 현대적인 카드 UI
 *
 * 설계 원칙:
 * - 목록에서는 기본 정보만 표시 (이름, 번호, 이미지)
 * - 상세 정보(타입, 능력치 등)는 상세 페이지에서 atom으로 관리
 * - 커스텀 훅을 통한 이미지 로딩 로직 캡슐화
 * - 단순하고 이해하기 쉬운 UI 컴포넌트
 *
 * @example
 * ```tsx
 * <PokemonCard
 *   name="pikachu"
 *   url="https://pokeapi.co/api/v2/pokemon/25/"
 * />
 * ```
 */
export function PokemonCard({ name, url, href }: PokemonCardProps) {
  // 구현...
}
````

### 훅 주석 템플릿

```typescript
interface UsePokemonCardImageProps {
  /** 포켓몬 이름 */
  name: string;
  /** 포켓몬 API URL */
  url: string;
}

/**
 * 포켓몬 카드 이미지 로딩 상태 관리 훅
 * @description 복잡한 이미지 로딩 로직을 캡슐화하여 재사용 가능하게 만든 커스텀 훅
 *
 * 주요 기능:
 * - 다단계 fallback 이미지 처리
 * - 타임아웃 기반 로딩 상태 관리
 * - 캐시된 이미지 즉시 감지 (성능 최적화)
 * - 메모리 누수 방지를 위한 정리 로직
 *
 * @param props 훅 설정 옵션
 * @returns 이미지 상태와 핸들러 객체
 */
export function usePokemonCardImage(props: UsePokemonCardImageProps) {
  // 구현...
}
```

### 타입 주석 규칙

```typescript
/**
 * 포켓몬 완전한 정보 타입
 * @description 포켓몬의 모든 상세 정보를 담는 메인 타입 (API에서 받는 전체 데이터)
 */
export type Pokemon = {
  /** 포켓몬 고유 ID 번호 */
  id: number;
  /** 포켓몬 이름 */
  name: string;
  /** 키 (데시미터 단위, 예: 7 = 0.7m) */
  height: number;
  /** 몸무게 (헥토그램 단위, 예: 69 = 6.9kg) */
  weight: number;
  /** 포켓몬 이미지들 (정면, 후면, 색칠 등) */
  sprites: PokemonSprites;
  /** 포켓몬 타입들 (불, 물, 풀 등) */
  types: PokemonType[];
};
```

## 🔤 타입 정의 규칙

### 기본 원칙

```typescript
// ✅ type 사용 (일관성)
type UserProfile = {
  id: number;
  name: string;
  email: string;
};

// ❌ interface 사용 금지
interface UserProfile {
  id: number;
  name: string;
}
```

### Props 타입 정의

```typescript
// ✅ 컴포넌트 위에 Props 타입 정의
type ButtonProps = {
  /** 버튼 텍스트 */
  children: React.ReactNode;
  /** 버튼 변형 */
  variant?: "default" | "ghost" | "outline";
  /** 클릭 이벤트 핸들러 */
  onClick?: () => void;
  /** 비활성화 여부 */
  disabled?: boolean;
};

export function Button({
  children,
  variant = "default",
  ...props
}: ButtonProps) {
  // 구현...
}
```

### API 응답 타입

```typescript
// ✅ 모든 필드를 상세히 정의
type PokemonListResponse = {
  /** 전체 포켓몬 개수 */
  count: number;
  /** 다음 페이지 URL (마지막 페이지면 null) */
  next: string | null;
  /** 이전 페이지 URL (첫 페이지면 null) */
  previous: string | null;
  /** 현재 페이지의 포켓몬 목록 */
  results: NamedAPIResource[];
};
```

### 유니온 타입과 리터럴 타입

```typescript
// ✅ 명확한 리터럴 타입 사용
type HealthStatus = "healthy" | "unhealthy" | "unknown";
type ButtonSize = "sm" | "default" | "lg";
type Theme = "light" | "dark";

// ✅ 조건부 타입 활용
type ApiResponse<T> = {
  data: T;
  status: "success" | "error";
  message?: string;
};
```

## 📁 파일 명명 규칙

### 컴포넌트 파일

```
✅ PascalCase 사용
- PokemonCard.tsx
- NavigationBar.tsx
- HealthCheckStatus.tsx

❌ 잘못된 예시
- pokemonCard.tsx
- pokemon-card.tsx
- POKEMON_CARD.tsx
```

### 훅 파일

```
✅ camelCase + use 접두사
- usePokemonCardImage.ts
- useMainBackground.ts
- useHealthCheck.ts

❌ 잘못된 예시
- PokemonCardImage.ts
- use-pokemon-image.ts
```

### 유틸리티 파일

```
✅ camelCase 사용
- helpers.ts
- constants.ts
- urlBuilder.ts
- errorHandling.ts

❌ 잘못된 예시
- Helpers.ts
- url-builder.ts
- error_handling.ts
```

### 타입 파일

```
✅ 도메인명 + types
- pokemon/types.ts
- health-check/types.ts
- auth/types.ts
```

## 📦 Import/Export 규칙

### Import 순서

```typescript
// 1. React 관련
import { useState, useEffect } from "react";
import type { FC, PropsWithChildren } from "react";

// 2. 외부 라이브러리
import { useAtom, useAtomValue } from "jotai";
import { Link } from "@tanstack/react-router";

// 3. 내부 모듈 (@ alias 사용)
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pokemonListAtom } from "@/atoms/pokemon";

// 4. 상대 경로 (같은 디렉토리)
import { PokemonCard } from "./PokemonCard";
import type { PokemonCardProps } from "./types";
```

### Export 규칙

```typescript
// ✅ named export 선호
export function PokemonCard() {}
export type PokemonCardProps = {};

// ✅ index.ts에서 re-export
export { PokemonCard } from "./PokemonCard";
export { PokemonList } from "./PokemonList";
export type { PokemonCardProps } from "./types";

// ❌ default export 최소화 (shadcn/ui 제외)
export default function Component() {}
```

### 절대 경로 사용

```typescript
// ✅ @ alias 사용
import { baseApiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { pokemonAtom } from "@/atoms/pokemon";

// ❌ 상대 경로 남용
import { baseApiClient } from "../../../api/client";
import { Button } from "../../ui/button";
```

## 🔧 함수 작성 규칙

### 순수 함수 선호

```typescript
// ✅ 순수 함수 (부작용 없음)
export function extractPokemonId(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? match[1] : "";
}

// ✅ 비동기 함수는 명확한 에러 처리
export async function fetchPokemonDetail(
  idOrName: string | number,
  options?: { signal?: AbortSignal },
): Promise<Pokemon> {
  try {
    // baseApiClient 직접 사용 (인터셉터가 자동으로 ApiResponse<T> 처리)
    const data = await baseApiClient.get<Pokemon>(`/pokemon/${idOrName}`, {
      signal: options?.signal,
    });
    return data;
  } catch (error) {
    console.error(`포켓몬 상세 조회 실패: ${idOrName}`, error);
    throw error;
  }
}
```

### 방어적 프로그래밍

```typescript
// ✅ 입력값 검증
export function getPokemonImageUrl(idOrName: string): string {
  // 방어적 프로그래밍: 입력값 검증 및 URL 인코딩 안전장치
  if (!idOrName || typeof idOrName !== "string") {
    return "";
  }

  // URL 안전한 문자열로 인코딩 (특수문자 처리)
  const safeIdOrName = encodeURIComponent(idOrName.trim().toLowerCase());

  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${safeIdOrName}.png`;
}
```

### 타입 가드 함수

```typescript
// ✅ 타입 가드로 타입 안전성 보장
export function isValidPokemonId(value: unknown): value is number {
  return typeof value === "number" && value > 0 && Number.isInteger(value);
}

export function isValidPokemonName(value: unknown): value is string {
  return (
    typeof value === "string" && value.length > 0 && /^[a-z-]+$/i.test(value)
  );
}
```

## ⚛️ 컴포넌트 작성 규칙

### 컴포넌트 구조

```typescript
// 1. Props 타입 정의
interface ComponentProps {
  /** prop 설명 */
  prop: string;
  /** 선택적 prop */
  optionalProp?: number;
}

// 2. 컴포넌트 주석
/**
 * 컴포넌트 설명
 */

// 3. 컴포넌트 구현
export function Component({ prop, optionalProp = 0 }: ComponentProps) {
  // 4. 커스텀 훅 (복잡한 로직 분리)
  const { state, handlers } = useComponentLogic();

  // 5. 이벤트 핸들러
  const handleClick = useCallback(() => {
    // 핸들러 로직
  }, []);

  // 6. 조건부 렌더링
  if (loading) {
    return <Skeleton />;
  }

  // 7. 메인 JSX
  return (
    <div className={cn("base-styles", conditionalClass)}>
      {/* JSX 내용 */}
    </div>
  );
}
```

### 함수 컴포넌트만 사용

```typescript
// ✅ 함수 컴포넌트
export function PokemonCard({ name, url }: PokemonCardProps) {
  return <Card>{/* 내용 */}</Card>;
}

// ❌ 클래스 컴포넌트 금지 (ESLint 규칙으로 차단)
class PokemonCard extends Component {
  render() {
    return <Card>{/* 내용 */}</Card>;
  }
}
```

### 조건부 렌더링 패턴

```typescript
// ✅ 명확한 조건부 렌더링
if (isPending) {
  return <PokemonListLoading />;
}

if (isError) {
  return <PokemonListError message={errorMessage} />;
}

if (filtered.length === 0) {
  return <PokemonSearchEmpty searchKeyword={keyword} />;
}

// ✅ 단순 조건은 && 연산자
{hasError && <ErrorMessage />}
{isLoading && <Spinner />}

// ❌ 복잡한 삼항 연산자 지양
{isLoading ? <Spinner /> : isError ? <Error /> : <Content />}
```

## 🚨 에러 처리 규칙

### 백엔드 표준 응답 에러 처리

백엔드의 `ApiResponse<T>` 형식을 자동으로 처리하는 통합 에러 시스템:

```typescript
// ✅ 백엔드 표준 응답 에러 (자동 처리)
import { ApiResponseError, getErrorMessage, logError } from "@/api/client";
import { getErrorMessage } from "@/utils/errorHandling";

// API 호출 시 인터셉터가 자동으로 처리
try {
  const userData = await authApiClient.get<User>("/api/user/profile");
  // SUCCESS인 경우: User 데이터 직접 반환
  console.log(userData.name);
} catch (error) {
  // ERROR인 경우: ApiResponseError 또는 기타 에러 발생
  
  if (error instanceof ApiResponseError) {
    // 백엔드에서 명시적으로 반환한 에러
    console.error("백엔드 에러:", error.message);
  }
  
  // 통합 에러 메시지 처리
  const friendlyMessage = getErrorMessage(error);
  showToast(friendlyMessage);
  
  // 구조화된 에러 로깅
  logError(error, "UserProfile 컴포넌트");
}
```

### 통합 에러 처리 패턴

```typescript
// ✅ 컴포넌트에서의 에러 처리
import { getErrorMessage, logError, isRetryableError } from "@/utils/errorHandling";

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUsers = async () => {
    try {
      setError(null);
      const data = await authApiClient.get<User[]>("/api/users");
      setUsers(data);
    } catch (err) {
      // 구조화된 에러 로깅
      logError(err, "UserList.fetchUsers");
      
      // 사용자 친화적 메시지
      const message = getErrorMessage(err);
      setError(message);
      
      // 재시도 가능한 에러인지 확인
      if (isRetryableError(err)) {
        setTimeout(() => fetchUsers(), 3000);
      }
    }
  };

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchUsers} />;
  }

  return <UserGrid users={users} />;
}
```

### 에러 타입별 처리

```typescript
// ✅ 에러 타입별 세밀한 처리
import { 
  ApiError, 
  ApiResponseError, 
  getErrorMessage,
  type UserFriendlyError 
} from "@/utils/errorHandling";

function handleApiError(error: unknown): UserFriendlyError {
  const errorInfo = getErrorMessage(error);
  
  // 에러 타입별 UI 처리
  switch (errorInfo.type) {
    case "network":
      return {
        ...errorInfo,
        retryable: true,
        showRetryButton: true,
      };
      
    case "server":
      if (errorInfo.status === 401) {
        // 인증 에러 - 로그인 페이지로 리다이렉트
        redirectToLogin();
      }
      return errorInfo;
      
    case "client":
      // 사용자 입력 오류 - 폼 검증 메시지 표시
      return {
        ...errorInfo,
        showInForm: true,
      };
      
    default:
      return errorInfo;
  }
}
```

### 컴포넌트 에러 처리

```typescript
// ✅ 에러 바운더리 활용
export function PokemonListPage() {
  const { data, isPending, isError } = useAtomValue(pokemonListQueryAtom);

  if (isPending) {
    return <PokemonListLoading />;
  }

  if (isError) {
    const errorMessage = getErrorMessage(isError);
    const errorSeverity = getErrorSeverity(isError);
    logError(isError, "PokemonListPage");
    return <PokemonListError message={errorMessage} severity={errorSeverity} />;
  }

  return <PokemonListGrid items={data.results} />;
}
```

### 로깅 규칙

```typescript
// ✅ 구조화된 로깅
console.log(`[PokemonCard] ${name} 이미지 로드 성공 ✅`);
console.warn(`[PokemonCard] 이미지 로딩 타임아웃: ${name}`);
console.error(`[API Error] ${method} ${url}`, error);

// ❌ 비구조화된 로깅
console.log("success");
console.log(error);
```

## ⚙️ 설정 파일 규칙

### ESLint 설정

```javascript
// ✅ 프로젝트 규칙 (eslint.config.js)
export default [
  ...tanstackConfig,
  {
    rules: {
      "@typescript-eslint/array-type": "off",
      "sort-imports": "off",
      "import/order": "off",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/prefer-stateless-function": [
        "error",
        { ignorePureComponents: false },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ClassDeclaration[superClass.name='Component']",
          message: "React 클래스 컴포넌트 금지. 함수 컴포넌트 사용",
        },
      ],
    },
  },
];
```

### Prettier 설정

```javascript
// ✅ 프로젝트 스타일 (prettier.config.js)
const config = {
  semi: true, // 세미콜론 사용
  singleQuote: false, // 더블 쿼트 사용
  trailingComma: "all", // 후행 쉼표 사용
};
```

### TypeScript 설정

```json
// ✅ 엄격한 타입 검사 (tsconfig.json)
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  }
}
```

## 📋 코드 리뷰 체크리스트

### 기본 체크 항목

- [ ] 한국어 명사형 주석 + TSDoc 작성
- [ ] `type` 사용 (`interface` 금지)
- [ ] `baseApiClient`/`authApiClient` 사용 (fetch 금지)
- [ ] 함수 컴포넌트 사용 (클래스 컴포넌트 금지)
- [ ] `cn()` 함수로 className 조합
- [ ] 절대 경로 import (`@/` 사용)

### 품질 체크 항목

- [ ] 방어적 프로그래밍 적용
- [ ] 에러 처리 및 로딩 상태 포함
- [ ] 타입 안전성 확보
- [ ] 성능 최적화 고려
- [ ] 접근성 고려 (alt, aria-\* 등)
- [ ] 테스트 가능한 구조

### 완료 후 검증

- [ ] `npm run check` 통과
- [ ] 타입 에러 해결
- [ ] 빌드 에러 없음
- [ ] 기능 동작 확인

---

이 컨벤션을 따라 일관되고 품질 높은 코드를 작성해 주세요.
