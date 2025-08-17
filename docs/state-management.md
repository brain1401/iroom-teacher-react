# 🧠 상태 관리 가이드

Jotai + TanStack Query 통합 상태 관리 패턴과 베스트 프랙티스 가이드입니다.

## 🎯 상태 관리 원칙

### 1. 상태 분류
- **클라이언트 상태**: UI 상태, 임시 데이터 (`atom`)
- **서버 상태**: API 데이터, 캐시 (`atomWithQuery`)
- **영구 상태**: 사용자 설정, 테마 (`atomWithStorage`)
- **계산된 상태**: 파생 데이터 (`derived atom`)

### 2. 상태 계층
```
URL Parameters ──→ Atoms ──→ Derived Atoms ──→ Components
     ↓              ↓           ↓              ↓
   Router      Local State   Computed       UI
```

### 3. 성능 최적화
- 원자적 구독으로 불필요한 리렌더링 방지
- derived atom으로 계산 최적화
- 적절한 훅 선택 (useAtom vs useAtomValue vs useSetAtom)

## 🔄 Jotai 기본 패턴

### 기본 Atom

```typescript
import { atom } from "jotai";

// 📌 기본 클라이언트 상태
export const pokemonPageAtom = atom<number>(1);

// 📌 객체 상태
export const pokemonListFiltersAtom = atom<{
  search?: string;
}>({});

// 📌 배열 상태
export const selectedPokemonIdsAtom = atom<string[]>([]);
```

### 영구 저장 Atom

```typescript
import { atomWithStorage } from "jotai/utils";

// 📌 localStorage에 자동 저장
export const pokemonLimitAtom = atomWithStorage(
  "pokemon-limit",      // 저장 키
  24,                   // 기본값
);

// 📌 테마 설정
export const themeAtom = atomWithStorage<"light" | "dark">(
  "theme",
  "light"
);

// 📌 사용자 설정
export const userPreferencesAtom = atomWithStorage(
  "user-preferences",
  {
    language: "ko",
    notifications: true,
    autoSave: true,
  }
);
```

### 계산된 Atom (Derived Atom)

```typescript
// 📌 컴포넌트 useMemo 대신 derived atom 사용
export const filteredPokemonListAtom = atom((get) => {
  const { data, isPending, isError } = get(pokemonListQueryAtom);
  
  // 로딩 중이거나 에러인 경우 빈 배열 반환
  if (isPending || isError) {
    return {
      results: [],
      isPending,
      isError,
    };
  }

  // 서버에서 이미 필터링된 결과를 그대로 반환
  return {
    results: data.results,
    isPending,
    isError,
  };
});

// 📌 복잡한 계산 로직
export const pokemonStatsAtom = atom((get) => {
  const pokemon = get(selectedPokemonAtom);
  
  if (!pokemon) return null;
  
  // 능력치 총합 계산
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  
  // 능력치 평균
  const averageStats = totalStats / pokemon.stats.length;
  
  return {
    total: totalStats,
    average: Math.round(averageStats),
    maxStat: Math.max(...pokemon.stats.map(s => s.base_stat)),
    minStat: Math.min(...pokemon.stats.map(s => s.base_stat)),
  };
});
```

### 쓰기 가능한 Derived Atom

```typescript
// 📌 읽기/쓰기 모두 가능한 derived atom
export const pokemonSearchAtom = atom(
  // 읽기 함수
  (get) => {
    const filters = get(pokemonListFiltersAtom);
    return filters.search || "";
  },
  // 쓰기 함수
  (get, set, newSearch: string) => {
    const currentFilters = get(pokemonListFiltersAtom);
    set(pokemonListFiltersAtom, {
      ...currentFilters,
      search: newSearch,
    });
    
    // 검색 시 페이지를 1로 리셋
    set(pokemonPageAtom, 1);
  }
);
```

## 🔗 TanStack Query 통합

### atomWithQuery 패턴

```typescript
import { atomWithQuery } from "jotai-tanstack-query";

// 📌 서버 상태 관리
export const pokemonListQueryAtom = atomWithQuery((get) => {
  const page = get(pokemonPageAtom);
  const limit = get(pokemonLimitAtom);
  const { search } = get(pokemonListFiltersAtom);

  // 검색어가 있든 없든 동일한 방식으로 처리
  const offset = (page - 1) * limit;
  const filters = { limit, offset, search };
  
  return pokemonListQueryOptions(filters);
});

// 📌 상세 데이터 (조건부 활성화)
export const pokemonDetailQueryAtom = atomWithQuery((get) => {
  const idOrName = get(pokemonIdOrNameAtom);

  // idOrName이 없으면 쿼리를 비활성화
  if (!idOrName) {
    return {
      queryKey: pokemonKeys.detail("disabled"),
      queryFn: undefined as any,
      enabled: false,
    };
  }

  return pokemonDetailQueryOptions(idOrName);
});
```

### React Query 옵션 설정

```typescript
// 📌 api/pokemon/query.ts
export const pokemonKeys = {
  all: ["pokemon"] as const,
  lists: () => [...pokemonKeys.all, "list"] as const,
  list: (filters: ListFilters) => [...pokemonKeys.lists(), filters] as const,
  details: () => [...pokemonKeys.all, "detail"] as const,
  detail: (id: string) => [...pokemonKeys.details(), id] as const,
};

export const pokemonListQueryOptions = (filters: ListFilters) => ({
  queryKey: pokemonKeys.list(filters),
  queryFn: () => fetchPokemonList(filters),
  staleTime: 5 * 60 * 1000,     // 5분간 fresh 상태 유지
  gcTime: 10 * 60 * 1000,       // 10분간 캐시 유지
  retry: 3,                      // 3회 재시도
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

export const pokemonDetailQueryOptions = (idOrName: string | number) => ({
  queryKey: pokemonKeys.detail(String(idOrName)),
  queryFn: () => fetchPokemonDetail(idOrName),
  staleTime: 10 * 60 * 1000,    // 10분간 fresh (상세 데이터는 더 오래 유지)
  gcTime: 30 * 60 * 1000,       // 30분간 캐시
});
```

## 🎣 Atom 사용 패턴

### 올바른 훅 선택

```typescript
function PokemonListPage() {
  // ✅ 값만 읽기 (read-only) - 성능 최적화
  const pokemonList = useAtomValue(pokemonListQueryAtom);
  const filteredResults = useAtomValue(filteredPokemonListAtom);
  
  // ✅ 설정만 필요 (write-only) - 렌더링 최적화
  const setPokemonPage = useSetAtom(pokemonPageAtom);
  const setPokemonFilters = useSetAtom(pokemonListFiltersAtom);
  
  // ✅ 읽기 + 쓰기 모두 필요
  const [searchTerm, setSearchTerm] = useAtom(pokemonSearchAtom);
  
  return (
    <div>
      <SearchInput 
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <PokemonGrid items={filteredResults.results} />
      <Pagination 
        onPageChange={setPokemonPage}
      />
    </div>
  );
}
```

### 조건부 구독

```typescript
function PokemonDetail({ pokemonId }: { pokemonId?: string }) {
  // 📌 조건부로 atom 구독
  const pokemon = useAtomValue(
    useMemo(() => {
      if (!pokemonId) return nullAtom; // 빈 atom
      return pokemonDetailQueryAtom;
    }, [pokemonId])
  );
  
  if (!pokemonId) {
    return <div>포켓몬을 선택해주세요</div>;
  }
  
  return <PokemonDetailView pokemon={pokemon} />;
}

// 빈 atom (조건부 구독용)
const nullAtom = atom(null);
```

## 📡 SSR 최적화 패턴

### 하이드레이션 최적화

```typescript
import { useHydrateAtoms } from "jotai-ssr";

function PokemonListPage() {
  const { page, keyword } = Route.useSearch();

  // ✅ SSR 초기 hydration (한번만 실행)
  // 무한 리렌더링 방지를 위해 enableReHydrate 사용 안함
  useHydrateAtoms([
    [pokemonPageAtom, page],
    [pokemonListFiltersAtom, { search: keyword }],
  ]);

  // ✅ URL 파라미터 동기화 (useEffect로 분리)
  const setPokemonPage = useSetAtom(pokemonPageAtom);
  const setPokemonFilters = useSetAtom(pokemonListFiltersAtom);

  useEffect(() => {
    setPokemonPage(page);
  }, [page, setPokemonPage]);

  useEffect(() => {
    setPokemonFilters({ search: keyword });
  }, [keyword, setPokemonFilters]);

  // 컴포넌트 로직...
}
```

### 서버 데이터 프리로드

```typescript
// 📌 라우트 로더에서 데이터 사전 로드
export const Route = createFileRoute("/examples/pokemon/")({
  loader: async (ctx) => {
    const { queryClient } = ctx.context;
    const { page, keyword } = ctx.deps;
    
    // 서버에서 데이터 미리 로드
    const data = await queryClient.ensureQueryData(
      pokemonListQueryOptions({ page, keyword })
    );
    
    // 이미지 프리로드 URL 생성
    const preloadImages = data.results
      .slice(0, 12)
      .map(p => getPokemonImageUrl(extractPokemonId(p.url)))
      .filter(Boolean);
    
    return { preloadImages };
  },
});
```

## 🔄 비동기 상태 관리

### 낙관적 업데이트

```typescript
// 📌 낙관적 업데이트 atom
export const optimisticPokemonAtom = atom(
  (get) => get(pokemonListQueryAtom),
  async (get, set, newPokemon: Pokemon) => {
    // 1. 즉시 UI 업데이트 (낙관적)
    const currentList = get(pokemonListQueryAtom);
    set(pokemonListQueryAtom, {
      ...currentList,
      data: {
        ...currentList.data,
        results: [newPokemon, ...currentList.data.results],
      },
    });
    
    try {
      // 2. 서버에 실제 요청
      const saved = await createPokemon(newPokemon);
      
      // 3. 성공 시 실제 데이터로 교체
      set(pokemonListQueryAtom, (prev) => ({
        ...prev,
        data: {
          ...prev.data,
          results: prev.data.results.map(p => 
            p.id === newPokemon.id ? saved : p
          ),
        },
      }));
    } catch (error) {
      // 4. 실패 시 롤백
      set(pokemonListQueryAtom, currentList);
      throw error;
    }
  }
);
```

### 에러 상태 관리

```typescript
// 📌 에러 상태 atom
export const pokemonErrorAtom = atom<Error | null>(null);

// 📌 에러가 포함된 derived atom
export const pokemonWithErrorAtom = atom((get) => {
  const { data, error, isPending } = get(pokemonListQueryAtom);
  const customError = get(pokemonErrorAtom);
  
  return {
    data,
    error: customError || error,
    isPending,
    hasError: Boolean(customError || error),
  };
});

// 사용 예시
function PokemonList() {
  const { data, error, isPending, hasError } = useAtomValue(pokemonWithErrorAtom);
  const setError = useSetAtom(pokemonErrorAtom);
  
  const handleCustomError = (error: Error) => {
    setError(error);
    
    // 3초 후 에러 자동 제거
    setTimeout(() => setError(null), 3000);
  };
  
  if (isPending) return <Loading />;
  if (hasError) return <ErrorDisplay error={error} />;
  
  return <PokemonGrid items={data.results} />;
}
```

## 🎛️ 복잡한 상태 패턴

### 상태 머신 패턴

```typescript
type LoadingState = "idle" | "loading" | "success" | "error";

// 📌 상태 머신 atom
export const pokemonLoadingStateAtom = atom<LoadingState>("idle");

// 📌 상태 전환 함수들
export const pokemonActionsAtom = atom(
  null,
  (get, set) => ({
    startLoading: () => {
      const currentState = get(pokemonLoadingStateAtom);
      if (currentState === "idle" || currentState === "error") {
        set(pokemonLoadingStateAtom, "loading");
      }
    },
    
    setSuccess: () => {
      set(pokemonLoadingStateAtom, "success");
    },
    
    setError: () => {
      set(pokemonLoadingStateAtom, "error");
    },
    
    reset: () => {
      set(pokemonLoadingStateAtom, "idle");
    },
  })
);

// 사용 예시
function PokemonComponent() {
  const loadingState = useAtomValue(pokemonLoadingStateAtom);
  const actions = useAtomValue(pokemonActionsAtom);
  
  const handleLoad = async () => {
    actions.startLoading();
    
    try {
      await loadPokemonData();
      actions.setSuccess();
    } catch (error) {
      actions.setError();
    }
  };
  
  return (
    <div>
      {loadingState === "loading" && <Spinner />}
      {loadingState === "error" && <ErrorMessage />}
      <button onClick={handleLoad}>데이터 로드</button>
    </div>
  );
}
```

### 폼 상태 관리

```typescript
// 📌 폼 상태 atom
export const pokemonFormAtom = atom({
  name: "",
  type: "",
  level: 1,
});

// 📌 폼 검증 atom
export const pokemonFormValidationAtom = atom((get) => {
  const form = get(pokemonFormAtom);
  const errors: Record<string, string> = {};
  
  if (!form.name.trim()) {
    errors.name = "이름은 필수입니다";
  }
  
  if (!form.type) {
    errors.type = "타입을 선택해주세요";
  }
  
  if (form.level < 1 || form.level > 100) {
    errors.level = "레벨은 1-100 사이여야 합니다";
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
});

// 📌 폼 제출 atom
export const submitPokemonFormAtom = atom(
  null,
  async (get, set) => {
    const form = get(pokemonFormAtom);
    const validation = get(pokemonFormValidationAtom);
    
    if (!validation.isValid) {
      throw new Error("폼 데이터가 유효하지 않습니다");
    }
    
    try {
      const result = await submitPokemonForm(form);
      
      // 성공 시 폼 리셋
      set(pokemonFormAtom, {
        name: "",
        type: "",
        level: 1,
      });
      
      return result;
    } catch (error) {
      console.error("폼 제출 실패", error);
      throw error;
    }
  }
);
```

## 📊 디버깅과 개발 도구

### Atom 디버깅

```typescript
// 📌 디버깅용 atom (개발 환경에서만)
export const debugAtom = atom((get) => {
  if (process.env.NODE_ENV !== "development") return null;
  
  return {
    pokemonPage: get(pokemonPageAtom),
    pokemonFilters: get(pokemonListFiltersAtom),
    pokemonList: get(pokemonListQueryAtom),
  };
});

// 사용 예시 (개발 환경에서만)
function DebugPanel() {
  const debug = useAtomValue(debugAtom);
  
  if (!debug) return null;
  
  return (
    <pre>{JSON.stringify(debug, null, 2)}</pre>
  );
}
```

### 성능 모니터링

```typescript
// 📌 성능 측정 atom
export const performanceAtom = atom((get) => {
  const start = performance.now();
  const data = get(pokemonListQueryAtom);
  const end = performance.now();
  
  return {
    data,
    renderTime: end - start,
    timestamp: new Date().toISOString(),
  };
});
```

## 📋 상태 관리 체크리스트

### 설계 단계
- [ ] 상태 타입 분류 (클라이언트/서버/영구/계산)
- [ ] Atom 의존성 그래프 설계
- [ ] 캐시 전략 결정
- [ ] SSR 요구사항 확인

### 구현 단계
- [ ] 적절한 atom 타입 선택
- [ ] Query key 설계
- [ ] 에러 처리 구현
- [ ] 로딩 상태 관리

### 최적화 단계
- [ ] 불필요한 리렌더링 확인
- [ ] derived atom으로 계산 최적화
- [ ] 적절한 훅 사용 (useAtomValue vs useAtom)
- [ ] 메모리 누수 방지

### 테스트 단계
- [ ] Atom 단위 테스트
- [ ] 상태 전환 테스트
- [ ] 에러 시나리오 테스트
- [ ] 성능 테스트

---

이 가이드를 따라 효율적이고 안정적인 상태 관리를 구현해 주세요.