# 이룸클래스 교사용 React 프로젝트

> 현대적인 React 기술 스택을 활용한 교육 플랫폼 프론트엔드

[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://reactjs.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.131.16-green)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-blue)](https://tailwindcss.com/)

## ✨ 주요 특징

- 🚀 **React 19** - 최신 React 기능과 성능 개선
- ⚡ **TanStack Start** - React 19 기반 SSR 프레임워크
- 🗺️ **TanStack Router** - 타입 안전한 파일 기반 라우팅
- 🧠 **Jotai + TanStack Query** - 현대적인 상태 관리
- 🎨 **Tailwind CSS v4 + shadcn/ui** - 모던 디자인 시스템
- 📱 **반응형 디자인** - 모바일 우선 설계
- 🔧 **TypeScript** - 엄격한 타입 안전성
- 🧪 **Vitest + Testing Library** - 포괄적인 테스트 환경

## 🛠 기술 스택

### Core Framework

```
React 19 + TypeScript (strict mode)
├── TanStack Start (SSR)
├── TanStack Router (파일 기반)
└── Vite (개발 서버 & 빌드)
```

### 상태 관리

```
Jotai (원자적 상태 관리)
├── atomWithQuery (서버 상태)
├── atomWithStorage (영구 저장)
└── TanStack Query (캐싱 & 동기화)
```

### 스타일링 & UI

```
Tailwind CSS v4
├── shadcn/ui (컴포넌트 라이브러리)
├── Radix UI (접근성 기반)
├── Lucide React (아이콘)
└── Class Variance Authority (variant 시스템)
```

### 개발 도구

```
ESLint + Prettier (코드 품질)
├── Vitest (테스트 프레임워크)
├── Testing Library (컴포넌트 테스트)
└── TanStack DevTools (개발 도구)
```

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js**: 18.18+ 또는 20+
- **npm**: 9+ (또는 yarn, pnpm)

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd iroom-teacher-react

# 의존성 설치
npm install

# 개발 서버 실행 (포트 3012)
npm run dev

# 브라우저에서 확인
open http://localhost:3012
```

### 주요 명령어

```bash
# 개발
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행

# 코드 품질
npm run check        # Prettier + ESLint 자동 수정
npm run lint         # ESLint 실행
npm run format       # Prettier 실행

# 테스트
npm run test         # Vitest 테스트 실행

# UI 컴포넌트 추가
pnpx shadcn@latest add [컴포넌트명]
```

## 📂 프로젝트 구조

```
iroom-teacher-react/
├── docs/                    # 📚 개발 가이드 및 문서
│   ├── README.md           # 문서 개요
│   ├── architecture.md     # 시스템 아키텍처
│   ├── coding-conventions.md # 코딩 컨벤션
│   ├── collaboration-guide.md # 팀 협업 가이드
│   ├── component-guide.md  # 컴포넌트 개발 가이드
│   ├── state-management.md # 상태 관리 가이드
│   ├── styling-guide.md    # 스타일링 가이드
│   └── troubleshooting.md  # 트러블슈팅 가이드
├── src/
│   ├── api/                # 🌐 API 클라이언트 및 도메인별 API
│   │   ├── client/        # HTTP 클라이언트 (base, auth)
│   │   ├── health-check/  # 헬스체크 API
│   │   └── pokemon/       # 포켓몬 API (예시)
│   ├── atoms/             # 🧠 Jotai 상태 관리
│   ├── components/        # ⚛️ React 컴포넌트
│   │   ├── ui/           # shadcn/ui 기본 컴포넌트
│   │   ├── layout/       # 레이아웃 컴포넌트
│   │   ├── auth/         # 인증 관련 컴포넌트
│   │   ├── health-check/ # 헬스체크 컴포넌트
│   │   └── pokemon/      # 포켓몬 컴포넌트 (예시)
│   ├── hooks/            # 🪝 커스텀 훅
│   ├── routes/           # 🗺️ 파일 기반 라우팅
│   ├── utils/            # 🔧 유틸리티 함수
│   └── css/              # 🎨 전역 스타일
├── public/               # 📁 정적 파일
├── CLAUDE.md            # 🤖 Claude Code 가이드
└── package.json         # 📦 프로젝트 설정
```

## 🎯 핵심 아키텍처 패턴

### 1. API 클라이언트 시스템

```typescript
// 기본 API 호출 (인증 불필요)
import { baseApiClient } from "@/api/client";
const data = await baseApiClient.get("/api/public-data");

// 인증 API 호출 (httpOnly 쿠키 포함)
import { authApiClient } from "@/api/client";
const userData = await authApiClient.get("/api/user/profile");
```

### 2. 상태 관리 패턴

```typescript
// 서버 상태 + 클라이언트 상태 통합
export const pokemonListQueryAtom = atomWithQuery((get) => {
  const page = get(pokemonPageAtom); // 클라이언트 상태
  const limit = get(pokemonLimitAtom); // 영구 저장 상태
  return pokemonListQueryOptions({ page, limit }); // 서버 상태
});

// 사용
const pokemonList = useAtomValue(pokemonListQueryAtom);
```

### 3. 컴포넌트 개발 패턴

```typescript
// shadcn/ui + asChild 패턴
<Button variant="ghost" asChild>
  <Link to="/examples/pokemon">포켓몬</Link>
</Button>

// cn() 함수로 조건부 스타일링
<Card className={cn(
  "base-styles",
  isActive && "active-styles",
  hasError && "error-styles"
)}>
```

## 📖 개발 가이드

자세한 개발 가이드는 `docs/` 폴더를 참조하세요:

### 🚀 시작하기

- **[협업 가이드](./docs/collaboration-guide.md)** - 프로젝트 개요와 필수 규칙
- **[코딩 컨벤션](./docs/coding-conventions.md)** - 코드 스타일과 작성 규칙

### 🏗️ 아키텍처 & 설계

- **[아키텍처 가이드](./docs/architecture.md)** - 시스템 구조와 설계 패턴
- **[상태 관리 가이드](./docs/state-management.md)** - Jotai + React Query 패턴

### 💻 개발 실무

- **[컴포넌트 가이드](./docs/component-guide.md)** - React 컴포넌트 개발 패턴
- **[스타일링 가이드](./docs/styling-guide.md)** - Tailwind CSS + shadcn/ui 활용

### 🔧 문제 해결

- **[트러블슈팅 가이드](./docs/troubleshooting.md)** - 자주 발생하는 문제와 해결책

## 🌟 주요 기능

### 🔐 인증 시스템

- JWT 토큰 기반 인증
- httpOnly 쿠키를 통한 보안 강화
- 자동 토큰 갱신
- 접근 권한 기반 라우팅

### 📊 헬스체크 시스템

- 실시간 서버 상태 모니터링
- 시각적 상태 인디케이터
- 자동 재시도 메커니즘
- 에러 상태 추적

### 🎨 디자인 시스템

- 일관된 컴포넌트 라이브러리
- 다크/라이트 모드 지원
- 반응형 그리드 시스템
- 접근성 최적화

### ⚡ 성능 최적화

- SSR을 통한 초기 로딩 최적화
- 이미지 프리로딩
- 코드 스플리팅
- 지능형 캐싱 전략

## 🔧 개발 규칙

### 필수 준수사항

1. **API 호출 규칙**
   - ❌ `fetch` 직접 사용 금지
   - ✅ `baseApiClient` / `authApiClient` 사용 필수

2. **주석 작성 규칙**
   - 모든 주석은 **한국어 명사형** 작성
   - TSDoc 형식 적극 활용
   - React 초급자도 이해할 수 있도록 상세 설명

3. **타입 정의 규칙**
   - ❌ `interface` 사용 금지
   - ✅ `type` 사용 필수

4. **컴포넌트 작성 규칙**
   - 함수 컴포넌트만 사용
   - `cn()` 함수로 className 조합
   - 커스텀 훅으로 로직 분리

### 코드 품질 체크리스트

개발 완료 후 반드시 확인:

- [ ] `npm run check` 통과
- [ ] 타입 에러 해결
- [ ] 에러 처리 및 로딩 상태 포함
- [ ] 접근성 및 반응형 고려
- [ ] 커밋 메시지에 Claude 서명 제거

## 🌐 배포

### 프로덕션 빌드

```bash
# 빌드 생성
npm run build

# 프로덕션 서버 실행
npm run start

# 빌드 결과물은 .output 디렉토리에 생성됨
```

### 환경 변수

```env
# .env 파일 예시
VITE_API_BASE_URL=http://localhost:3057
VITE_APP_NAME=이룸클래스
```

## 🤝 기여하기

### 개발 워크플로우

1. **브랜치 생성**

   ```bash
   git checkout -b feature/새기능명
   ```

2. **개발 진행**
   - 코딩 컨벤션 준수
   - 주석은 한국어 명사형으로 작성
   - `npm run check` 정기적 실행

3. **커밋**

   ```bash
   # 코드 품질 검사
   npm run check

   # 커밋 (Claude 서명 제거 필수)
   git commit -m "feat: 새로운 기능 추가

   - 기능 상세 설명
   - 구현된 내용
   - 테스트 방법"
   ```

4. **PR 생성**
   - 변경사항 상세 설명
   - 테스트 결과 포함
   - 스크린샷 첨부 (UI 변경 시)

### 코드 리뷰 기준

- 코딩 컨벤션 준수 여부
- 타입 안전성 확보
- 성능 최적화 고려
- 접근성 준수
- 테스트 커버리지

## 📞 문의 및 지원

### 개발 관련 문의

- 코딩 컨벤션: [coding-conventions.md](./docs/coding-conventions.md)
- 아키텍처 문의: [architecture.md](./docs/architecture.md)
- 상태 관리: [state-management.md](./docs/state-management.md)
- 컴포넌트 개발: [component-guide.md](./docs/component-guide.md)
- 스타일링: [styling-guide.md](./docs/styling-guide.md)
- 문제 해결: [troubleshooting.md](./docs/troubleshooting.md)

### 추가 리소스

- [TanStack Start 공식 문서](https://tanstack.com/start/latest)
- [TanStack Router 가이드](https://tanstack.com/router/latest)
- [Jotai 상태 관리](https://jotai.org/)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE)를 따릅니다.

---

**💡 개발 팀을 위한 추가 정보**

이 프로젝트는 현대적인 React 생태계의 베스트 프랙티스를 적용하여 개발되었습니다.
새로운 기능 개발이나 문제 해결 시 `docs/` 폴더의 가이드를 먼저 확인해 주세요.

**Happy Coding! 🚀**
