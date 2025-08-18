# 📚 프로젝트 문서

이룸클래스 React 프로젝트의 개발 가이드와 문서 모음입니다.

## 🚀 빠른 시작

새로운 팀원이라면 다음 순서로 문서를 읽어보세요:

1. **[협업 가이드](./collaboration-guide.md)** - 프로젝트 개요와 필수 규칙
2. **[코딩 컨벤션](./coding-conventions.md)** - 코드 스타일과 작성 규칙
3. **[아키텍처 가이드](./architecture.md)** - 프로젝트 구조와 설계 원칙
4. **[컴포넌트 가이드](./component-guide.md)** - 컴포넌트 개발 패턴

## 📖 문서 목록

### 🤝 협업 & 규칙

- **[협업 가이드](./collaboration-guide.md)** - 팀 협업을 위한 종합 가이드
- **[코딩 컨벤션](./coding-conventions.md)** - 주석, 타입, 명명 규칙 등

### 🏗️ 아키텍처 & 설계

- **[아키텍처 가이드](./architecture.md)** - 프로젝트 구조와 설계 패턴
- **[상태 관리 가이드](./state-management.md)** - Jotai + React Query 패턴

### 💻 개발 가이드

- **[컴포넌트 가이드](./component-guide.md)** - React 컴포넌트 개발 패턴
- **[스타일링 가이드](./styling-guide.md)** - Tailwind CSS + shadcn/ui 활용

### 🔧 문제 해결

- **[트러블슈팅 가이드](./troubleshooting.md)** - 자주 발생하는 문제와 해결책

## 🎯 핵심 기술 스택

```
┌─ React 19 + TypeScript (strict)
├─ TanStack Start (SSR)
├─ TanStack Router (파일 기반)
├─ Jotai + TanStack Query (상태 관리)
├─ Tailwind CSS v4 + shadcn/ui
├─ Vite (번들러, 포트 3012)
└─ Vitest (테스트)
```

## 📋 개발 체크리스트

새 기능 개발 시 반드시 확인해야 할 사항들:

### 시작 전

- [ ] 기존 패턴 및 라이브러리 확인
- [ ] 도메인별 폴더 구조 준수 계획
- [ ] API 클라이언트 사용 방법 확인

### 개발 중

- [ ] 한국어 명사형 주석 + TSDoc 작성
- [ ] `type` 사용 (`interface` 금지)
- [ ] `baseApiClient`/`authApiClient` 사용 (fetch 금지)
- [ ] 커스텀 훅으로 복잡한 로직 분리
- [ ] `cn()` 함수로 스타일링

### 완료 후

- [ ] `npm run check` 통과
- [ ] 타입 에러 해결
- [ ] 에러 처리 및 로딩 상태 포함
- [ ] 접근성 및 반응형 고려

## ⚡ 빠른 명령어

```bash
# 개발 서버 실행
npm run dev

# 코드 품질 검사 및 자동 수정
npm run check

# shadcn/ui 컴포넌트 추가
pnpx shadcn@latest add [컴포넌트명]

# 테스트 실행
npm run test

# 프로덕션 빌드
npm run build
```

## 🔗 유용한 링크

- [TanStack Start 공식 문서](https://tanstack.com/start/latest)
- [TanStack Router 가이드](https://tanstack.com/router/latest)
- [Jotai 상태 관리](https://jotai.org/)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📝 문서 업데이트

문서는 프로젝트 변경사항에 맞춰 지속적으로 업데이트됩니다.
새로운 패턴이나 규칙이 생기면 해당 문서를 업데이트해 주세요.

---

**💡 문의사항이나 개선 제안이 있다면 팀 채널에서 논의해 주세요.**
