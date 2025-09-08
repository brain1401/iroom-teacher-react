# 🔧 트러블슈팅 가이드

자주 발생하는 문제와 해결 방법을 정리한 가이드입니다.

## 🚀 개발 환경 문제

### 포트 충돌 (Port Already in Use)

**문제**: `npm run dev` 실행 시 포트 3012가 이미 사용 중

```
Error: listen EADDRINUSE: address already in use :::3012
```

**해결책**:

```bash
# 1. 포트 사용 프로세스 확인
netstat -ano | findstr :3012

# 2. 프로세스 종료 (PID 확인 후)
taskkill /PID [PID번호] /F

# 3. 또는 다른 포트 사용
npm run dev -- --port 3013
```

### Node.js 버전 호환성

**문제**: React 19나 TanStack Start 호환성 이슈

```
Error: Unsupported Node.js version
```

**해결책**:

```bash
# Node.js 18.18+ 또는 20+ 사용 확인
node --version

# nvm 사용 시 (Windows는 nvm-windows)
nvm install 20.10.0
nvm use 20.10.0
```

### 의존성 설치 실패

**문제**: `npm install` 실패

```
Error: ERESOLVE unable to resolve dependency tree
```

**해결책**:

```bash
# 1. 캐시 정리
npm cache clean --force

# 2. node_modules와 lock 파일 삭제
rm -rf node_modules package-lock.json

# 3. 재설치
npm install

# 4. 그래도 안 되면 legacy-peer-deps 사용
npm install --legacy-peer-deps
```

## 📦 빌드 및 번들링 문제

### TypeScript 컴파일 에러

**문제**: 타입 에러로 빌드 실패

```
Type 'string | undefined' is not assignable to type 'string'
```

**해결책**:

```typescript
// ❌ 문제가 되는 코드
const name: string = props.name; // props.name이 undefined일 수 있음

// ✅ 해결책 1: 타입 가드
const name: string = props.name || "";

// ✅ 해결책 2: 옵셔널 체이닝
const name = props.name ?? "기본값";

// ✅ 해결책 3: 타입 단언 (확실한 경우만)
const name = props.name as string;
```

### Import 경로 문제

**문제**: 절대 경로 import가 동작하지 않음

```
Module not found: Can't resolve '@/components/ui/button'
```

**해결책**:

```typescript
// tsconfig.json 확인
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// vite.config.ts 확인
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
});
```

### Tailwind CSS 클래스가 적용되지 않음

**문제**: Tailwind 클래스가 화면에 반영되지 않음

**해결책**:

```css
/* src/css/root.css에 Tailwind 지시어 확인 */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```typescript
// vite.config.ts에 Tailwind 플러그인 확인
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

## 🔄 상태 관리 문제

### Jotai Atom 무한 리렌더링

**문제**: 컴포넌트가 무한히 리렌더링됨

```
Warning: Maximum update depth exceeded
```

**해결책**:

```typescript
// ❌ 문제가 되는 코드
function Component() {
  const [value, setValue] = useAtom(someAtom);

  // 매 렌더링마다 새로운 객체 생성
  setValue({ ...value, newProp: "value" });

  return <div>{value}</div>;
}

// ✅ 해결책: useEffect 사용
function Component() {
  const [value, setValue] = useAtom(someAtom);

  useEffect(() => {
    setValue({ ...value, newProp: "value" });
  }, []); // 의존성 배열 주의

  return <div>{value}</div>;
}
```

### React Query 캐시 문제

**문제**: 데이터가 캐시되지 않거나 stale 상태가 지속됨

**해결책**:

```typescript
// 1. Query Key 일관성 확인
export const pokemonKeys = {
  all: ["pokemon"] as const,
  lists: () => [...pokemonKeys.all, "list"] as const,
  list: (filters: any) => [...pokemonKeys.lists(), filters] as const,
};

// 2. staleTime과 gcTime 설정
export const pokemonListQueryOptions = (filters: any) => ({
  queryKey: pokemonKeys.list(filters),
  queryFn: () => fetchPokemonList(filters),
  staleTime: 5 * 60 * 1000, // 5분간 fresh
  gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
});

// 3. 수동으로 캐시 무효화
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: pokemonKeys.lists() });
```

### SSR 하이드레이션 불일치

**문제**: 서버와 클라이언트 렌더링 결과가 다름

```
Warning: Text content did not match. Server: "..." Client: "..."
```

**해결책**:

```typescript
// ✅ useHydrateAtoms로 초기 상태 동기화
function Component() {
  const { page, keyword } = Route.useSearch();

  // SSR 하이드레이션 (한번만)
  useHydrateAtoms([
    [pokemonPageAtom, page],
    [pokemonListFiltersAtom, { search: keyword }],
  ]);

  // URL 파라미터 동기화는 useEffect로 분리
  const setPage = useSetAtom(pokemonPageAtom);

  useEffect(() => {
    setPage(page);
  }, [page, setPage]);
}
```

## 🎨 UI 및 스타일링 문제

### shadcn/ui 컴포넌트 스타일 깨짐

**문제**: shadcn/ui 컴포넌트가 제대로 표시되지 않음

**해결책**:

```bash
# 1. 컴포넌트 재설치
pnpx shadcn@latest add button --overwrite

# 2. components.json 설정 확인
{
  "style": "new-york",
  "tailwind": {
    "css": "src/css/root.css",
    "cssVariables": true
  }
}
```

```css
/* 3. CSS 변수 확인 (src/css/root.css) */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... 기타 변수들 */
}
```

### 반응형 디자인 문제

**문제**: 모바일에서 레이아웃이 깨짐

**해결책**:

```typescript
// ✅ 모바일 우선 접근법
<div className={cn(
  // 모바일 기본
  "flex flex-col space-y-4 p-4",
  // 태블릿 이상
  "md:flex-row md:space-y-0 md:space-x-4 md:p-6",
  // 데스크톱
  "lg:p-8"
)}>

// ✅ 컨테이너 사용
<div className="container mx-auto px-4 max-w-7xl">
  내용
</div>
```

### 다크 모드 스타일 문제

**문제**: 다크 모드에서 색상이 적절하지 않음

**해결책**:

```typescript
// ✅ CSS 변수 활용 (권장)
<div className="bg-background text-foreground border-border">
  자동 테마 적용
</div>

// ✅ 조건부 클래스 (필요한 경우만)
<div className={cn(
  "bg-white text-black",
  "dark:bg-gray-900 dark:text-white"
)}>
  수동 테마 설정
</div>
```

## 🔌 API 및 네트워크 문제

### CORS 에러

**문제**: API 요청 시 CORS 에러 발생

```
Access to fetch at 'API_URL' from origin 'localhost:3012' has been blocked by CORS policy
```

**해결책**:

```typescript
// vite.config.ts에 프록시 설정
export default defineConfig({
  server: {
    proxy: {
      "": {
        target: "http://localhost:3055",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

### API 클라이언트 에러

**문제**: baseApiClient나 authApiClient 사용 시 에러

**해결책**:

```typescript
// ✅ 에러 타입 확인
try {
  const data = await baseApiClient.get("/data");
} catch (error) {
  if (error instanceof ApiError) {
    console.error("API 에러:", error.status, error.message);
  } else {
    console.error("네트워크 에러:", error);
  }
}

// ✅ 타임아웃 설정 확인
const client = axios.create({
  timeout: 10000, // 10초
  headers: {
    "Content-Type": "application/json",
  },
});
```

### 환경 변수 문제

**문제**: 환경 변수가 인식되지 않음

**해결책**:

```typescript
// ✅ Vite 환경 변수는 VITE_ 접두사 필요
// .env
VITE_API_BASE_URL=http://localhost:3055
VITE_APP_NAME=이룸클래스

// 사용
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 🧪 테스트 관련 문제

### Vitest 설정 문제

**문제**: 테스트 실행 시 모듈 해석 실패

**해결책**:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [viteTsConfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

### React Testing Library 문제

**문제**: 컴포넌트 테스트 시 atom 에러

**해결책**:

```typescript
// ✅ Provider로 감싸기
import { Provider } from 'jotai';

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <Provider>
      {ui}
    </Provider>
  );
}

// 테스트에서 사용
test('컴포넌트 렌더링', () => {
  renderWithProvider(<MyComponent />);
  // 테스트 로직
});
```

## ⚡ 성능 문제

### 번들 크기 문제

**문제**: 빌드 결과물이 너무 큼

**해결책**:

```bash
# 번들 분석
npm run build
npm install -g serve
serve -s .output

# 코드 스플리팅 확인
import { lazy } from 'react';
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 메모리 누수

**문제**: 페이지 이동 후에도 메모리 사용량이 계속 증가

**해결책**:

```typescript
// ✅ 이벤트 리스너 정리
useEffect(() => {
  const handleResize = () => {
    /* ... */
  };
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

// ✅ AbortController 사용
useEffect(() => {
  const controller = new AbortController();

  fetchData({ signal: controller.signal });

  return () => {
    controller.abort();
  };
}, []);
```

## 🔍 디버깅 도구

### 개발자 도구 활용

```typescript
// ✅ Jotai DevTools
import { DevTools } from 'jotai-devtools';

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && <DevTools />}
    </>
  );
}

// ✅ React Query DevTools (이미 설정됨)
// TanStack DevTools에서 확인 가능
```

### 로깅 및 디버깅

```typescript
// ✅ 구조화된 로깅
console.log(`[${componentName}] ${action}:`, data);

// ✅ 조건부 로깅
if (import.meta.env.DEV) {
  console.log("디버그 정보:", debugData);
}

// ✅ 에러 경계
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary:", error, errorInfo);
  }
}
```

## 📞 도움 요청하기

### 문제 보고 시 포함할 정보

1. **환경 정보**
   - Node.js 버전: `node --version`
   - 패키지 버전: `npm list`
   - 운영 체제 정보

2. **에러 정보**
   - 정확한 에러 메시지
   - 스택 트레이스
   - 재현 단계

3. **코드 예시**
   - 문제가 발생하는 코드
   - 설정 파일 (tsconfig.json, vite.config.ts 등)

### 추가 리소스

- [TanStack Start 문서](https://tanstack.com/start/latest)
- [Jotai 문서](https://jotai.org/)
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [Tailwind CSS 문서](https://tailwindcss.com/)

---

문제가 해결되지 않으면 팀 채널에서 위 정보와 함께 문의해 주세요.
