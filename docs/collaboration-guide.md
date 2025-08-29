# 🤝 팀 협업 가이드

이룸클래스 React 프로젝트의 팀 협업을 위한 종합 가이드입니다.

## 🚨 필수 준수사항

### 1. API 호출 규칙

```typescript
// ❌ 절대 금지: fetch 직접 사용
const response = await fetch("/api/data");

// ✅ 필수: API 클라이언트 사용
import { baseApiClient, authApiClient } from "@/api/client";

// 인증 불필요한 공개 API
const pokemonData = await baseApiClient.get("/api/v2/pokemon/25");

// 인증 필요한 API (httpOnly 쿠키 포함)
const userData = await authApiClient.get("/api/user/profile");
```

#### 백엔드 표준 응답 처리

백엔드에서 모든 API 응답은 `ApiResponse<T>` 형태로 래핑됩니다:

```typescript
// 백엔드 응답 형식
type ApiResponse<T> = {
  result: "SUCCESS" | "ERROR";  // 응답 결과
  message: string;              // 응답 메시지
  data: T;                      // 실제 데이터
};
```

**인터셉터 자동 처리**: API 클라이언트는 이 형식을 자동으로 처리합니다:

```typescript
// ✅ 인터셉터가 자동으로 처리
const userData = await authApiClient.get<User>("/api/user/profile");
// SUCCESS인 경우: data만 반환 (User 타입)
// ERROR인 경우: ApiResponseError 발생

// ✅ 에러 처리
import { ApiResponseError, getErrorMessage } from "@/api/client";

try {
  const userData = await authApiClient.get<User>("/api/user/profile");
  console.log(userData); // User 객체 직접 사용
} catch (error) {
  if (error instanceof ApiResponseError) {
    console.error("백엔드 에러:", error.message);
  }
  
  // 통합 에러 메시지 처리
  const friendlyMessage = getErrorMessage(error);
  showToast(friendlyMessage);
}
```

**수동 응답 처리** (특수한 경우):

```typescript
import { 
  extractResponseData, 
  safeExtractResponseData,
  type ApiResponse 
} from "@/api/client";

// 응답을 직접 처리해야 하는 경우
const response = await authApiClient.get<ApiResponse<User>>("/api/user/profile");

// 안전한 데이터 추출
const userData = extractResponseData(response); // 에러 시 throw
const userDataSafe = safeExtractResponseData(response, null); // 에러 시 기본값
```

### 2. 주석 작성 규칙

````typescript
/**
 * 포켓몬 상세 정보를 조회하는 함수
 * @description 특정 포켓몬의 모든 상세 정보를 가져오는 함수
 *
 * 주요 기능:
 * - ID 또는 이름으로 포켓몬 조회
 * - 이미지, 능력치, 타입 정보 포함
 * - 요청 취소 기능 지원
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
 */
export async function fetchPokemonDetail(
  idOrName: string | number,
  options?: { signal?: AbortSignal },
): Promise<Pokemon> {
  // 구현...
}
````

**주석 규칙:**

- 모든 주석은 **한국어 명사형** (존댓말 사용 안함)
- TSDoc 형식 적극 활용 (`@description`, `@param`, `@returns`, `@example`)
- bullet point로 가독성 향상
- React 기초 수준 개발자도 이해 가능하도록 상세 설명

### 3. 타입 정의 규칙

```typescript
// ✅ type 사용 (일관성)
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

## 🏗️ 프로젝트 아키텍처

### 기술 스택

```
Frontend: React 19 + TypeScript (strict)
Framework: TanStack Start (SSR)
Routing: TanStack Router (파일 기반)
State: Jotai + TanStack Query
Styling: Tailwind CSS v4 + shadcn/ui
Build: Vite (포트 3012, Bun 타겟)
Test: Vitest + Testing Library
```

### 폴더 구조 원칙

```
src/
├── api/          # 도메인별 API 클라이언트
│   ├── client/   # 기본 HTTP 클라이언트 (baseClient, authClient)
│   └── [domain]/ # 도메인별 API (api.ts, types.ts, query.ts)
├── atoms/        # Jotai 상태 관리
├── components/   # React 컴포넌트
│   ├── ui/       # shadcn/ui 기본 컴포넌트
│   ├── layout/   # 레이아웃 컴포넌트
│   └── [domain]/ # 도메인별 컴포넌트
├── hooks/        # 커스텀 훅
├── routes/       # 파일 기반 라우팅
├── utils/        # 도메인별 유틸리티 함수
└── css/          # 전역 스타일
```

## 🔄 상태 관리 패턴

### Jotai + React Query 통합

```typescript
// 서버 상태: atomWithQuery
export const pokemonListQueryAtom = atomWithQuery((get) => {
  const page = get(pokemonPageAtom);
  const filters = get(pokemonListFiltersAtom);
  return pokemonListQueryOptions({ page, ...filters });
});

// 사용자 설정: atomWithStorage (localStorage 연동)
export const pokemonLimitAtom = atomWithStorage("pokemon-limit", 24);

// 임시 상태: 일반 atom
export const pokemonPageAtom = atom<number>(1);

// derived 상태: 계산된 값 (컴포넌트 useMemo 대신)
export const filteredPokemonListAtom = atom((get) => {
  const { data, isPending, isError } = get(pokemonListQueryAtom);
  return {
    results: data?.results || [],
    isPending,
    isError,
  };
});
```

### Atom 사용 패턴

```typescript
// ✅ 값 읽기 + 쓰기 모두 필요
const [page, setPage] = useAtom(pokemonPageAtom);

// ✅ 값만 읽기 (read-only) - 성능 최적화
const pokemonList = useAtomValue(pokemonListQueryAtom);

// ✅ 설정만 필요 (write-only) - 렌더링 최적화
const setFilters = useSetAtom(pokemonListFiltersAtom);
```

## 🧩 컴포넌트 개발 패턴

### 기본 컴포넌트 구조

```typescript
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
 * - 목록에서는 기본 정보만 표시
 * - 커스텀 훅으로 복잡한 로직 캡슐화
 * - asChild 패턴으로 컴포넌트 합성
 */
export function PokemonCard({ name, url, href = "/examples/pokemon/$id" }: PokemonCardProps) {
  // 커스텀 훅으로 복잡한 로직 분리
  const { finalImageUrl, isLoading, hasError } = usePokemonCardImage({ name, url });

  return (
    <Link to={href} params={{ id: name }}>
      <Card className={cn("base-styles", "hover:shadow-2xl")}>
        {/* JSX 내용 */}
      </Card>
    </Link>
  );
}
```

### 필수 패턴

- **함수 컴포넌트만 사용** (클래스 컴포넌트 금지)
- **asChild 패턴** 활용으로 컴포넌트 합성
- **cn() 함수**로 조건부 className 관리
- **커스텀 훅**으로 복잡한 로직 분리

### asChild 패턴 예시

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

## 🎨 스타일링 규칙

### Tailwind + shadcn/ui 패턴

```typescript
import { cn } from "@/lib/utils";

// ✅ cn() 함수로 조건부 스타일링
<Card
  className={cn(
    "base-styles",                    // 기본 스타일
    isActive && "active-styles",      // 조건부 스타일
    hasError && "error-styles",       // 에러 상태
    className                         // 외부 전달 클래스
  )}
>
```

### 컴포넌트 variant 시스템

```typescript
// shadcn/ui 컴포넌트는 variant prop 활용
<Button variant="ghost" size="sm">
  버튼
</Button>

<Alert variant="destructive">
  에러 메시지
</Alert>
```

## 🔧 개발 워크플로우

### 필수 명령어

```bash
# 개발 서버 실행 (포트 3012)
npm run dev

# 코드 품질 검사 및 자동 수정 (커밋 전 필수)
npm run check

# shadcn/ui 컴포넌트 추가
pnpx shadcn@latest add [컴포넌트명]

# 테스트 실행
npm run test

# 프로덕션 빌드
npm run build
```

### Git 워크플로우

```bash
# 1. 작업 브랜치 생성
git checkout -b feature/새기능명

# 2. 개발 진행
# ... 코딩 ...

# 3. 코드 품질 검사 (필수)
npm run check

# 4. 커밋 (Claude 서명 추가 금지)
git add .
git commit -m "feat: 새로운 기능 추가

- 기능 상세 설명
- 구현된 내용
- 테스트 방법"

# 5. 푸시 및 PR 생성
git push origin feature/새기능명
```

## ⚠️ 자주 발생하는 실수와 주의사항

### 1. API 호출 실수

```typescript
// ❌ 잘못된 예시
const response = await fetch("/api/pokemon"); // fetch 직접 사용
const data = await response.json();

// ✅ 올바른 예시 - 기본 API 호출
const data = await baseApiClient.get("/api/pokemon");

// ✅ 올바른 예시 - 에러 처리 포함
import { getErrorMessage, logError } from "@/utils/errorHandling";

try {
  const data = await authApiClient.get<User[]>("/api/users");
  return data;
} catch (error) {
  logError(error, "UserList 컴포넌트");
  const message = getErrorMessage(error);
  showErrorToast(message);
  throw error;
}
```

### 2. 상태 관리 실수

```typescript
// ❌ 잘못된 예시: 불필요한 useState
const [pokemonList, setPokemonList] = useState([]);

useEffect(() => {
  fetchPokemonList().then(setPokemonList);
}, []);

// ✅ 올바른 예시: atomWithQuery 사용
const pokemonList = useAtomValue(pokemonListQueryAtom);
```

### 3. 컴포넌트 구조 실수

```typescript
// ❌ 잘못된 예시: 클래스 컴포넌트
class PokemonCard extends Component {
  render() { /* ... */ }
}

// ✅ 올바른 예시: 함수 컴포넌트
function PokemonCard({ name, url }: PokemonCardProps) {
  return <Card>{/* ... */}</Card>;
}
```

### 4. 타입 정의 실수

```typescript
// ❌ 잘못된 예시: interface 사용
interface Props {
  name: string;
}

// ✅ 올바른 예시: type 사용
type Props = {
  name: string;
};
```

## 📋 새 기능 개발 체크리스트

### 개발 시작 전

- [ ] 기존 패턴 및 라이브러리 확인
- [ ] 도메인별 폴더 구조 준수 계획
- [ ] API 클라이언트 사용 방법 확인

### 개발 중

- [ ] 한국어 명사형 주석 + TSDoc 작성
- [ ] `type` 사용 (`interface` 금지)
- [ ] `baseApiClient`/`authApiClient` 사용
- [ ] 커스텀 훅으로 복잡한 로직 분리
- [ ] `cn()` 함수로 스타일링
- [ ] 함수 컴포넌트만 사용

### 완료 후

- [ ] `npm run check` 통과
- [ ] 타입 에러 해결
- [ ] 에러 처리 및 로딩 상태 포함
- [ ] 접근성 고려 (alt 텍스트, 키보드 네비게이션)
- [ ] 반응형 디자인 적용
- [ ] 커밋 메시지에 Claude 서명 제거

## 🆘 도움이 필요할 때

1. **코딩 컨벤션**: [coding-conventions.md](./coding-conventions.md)
2. **아키텍처 문의**: [architecture.md](./architecture.md)
3. **상태 관리**: [state-management.md](./state-management.md)
4. **컴포넌트 개발**: [component-guide.md](./component-guide.md)
5. **스타일링**: [styling-guide.md](./styling-guide.md)
6. **문제 해결**: [troubleshooting.md](./troubleshooting.md)

---

**💡 질문이나 개선 제안이 있다면 팀 채널에서 논의해 주세요.**
