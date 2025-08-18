# 멀티 스테이지 빌드를 사용한 프로덕션 최적화 Dockerfile
# TanStack Start + Bun 런타임 환경

# ========================================
# Stage 1: Base - 기본 이미지 설정
# ========================================
FROM oven/bun:1-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필수 도구 설치
# dumb-init: 프로세스 관리를 위한 경량 init 시스템
RUN apk add --no-cache dumb-init

# ========================================
# Stage 2: Dependencies - 의존성 설치
# ========================================
FROM base AS deps

# 의존성 캐싱을 위한 임시 디렉토리 생성
RUN mkdir -p /temp/dev /temp/prod

# 개발 의존성 설치 (빌드에 필요)
COPY package.json bun.lockb* /temp/dev/
RUN cd /temp/dev && \
    bun install --frozen-lockfile

# 프로덕션 의존성만 설치
COPY package.json bun.lockb* /temp/prod/
RUN cd /temp/prod && \
    bun install --frozen-lockfile --production

# ========================================
# Stage 3: Build - 애플리케이션 빌드
# ========================================
FROM base AS build

# 개발 의존성 복사
COPY --from=deps /temp/dev/node_modules /app/node_modules

# 소스 코드 복사
COPY . .

# 환경 변수 설정
ENV NODE_ENV=production

# 타입 체크 및 빌드 실행
RUN bun run build

# 빌드 아티팩트 확인 (디버깅용, 프로덕션에서는 제거 가능)
RUN ls -la .output/server/ || echo "Build output directory check"

# ========================================
# Stage 4: Production - 최종 프로덕션 이미지
# ========================================
FROM base AS production

# 빌드 인자 설정 (포트 커스터마이징 가능)
ARG PORT=3012
ENV PORT=${PORT}

# 프로덕션 환경 변수 설정
ENV NODE_ENV=production \
    # Bun 런타임 최적화
    BUN_RUNTIME_TRANSPILER_CACHE_PATH=0 \
    # 메모리 제한 설정 (필요시 조정)
    BUN_JSC_memoryLimit=512

# dumb-init 복사 (PID 1 프로세스 관리)
COPY --from=base /usr/bin/dumb-init /usr/bin/dumb-init

# 프로덕션 의존성 복사
COPY --from=deps /temp/prod/node_modules /app/node_modules

# 빌드된 애플리케이션 복사
COPY --from=build /app/.output /app/.output

# package.json 복사 (스크립트 실행에 필요)
COPY package.json ./

# 정적 파일 및 public 디렉토리 복사 (있는 경우)
COPY --from=build /app/public /app/public 2>/dev/null || true

# 애플리케이션 실행 권한 설정
RUN chmod +x /app/.output/server/index.mjs

# 보안을 위한 non-root 사용자 전환
# Bun 이미지에는 이미 'bun' 사용자가 있음
USER bun

# 포트 노출
EXPOSE ${PORT}

# 헬스체크 설정
# 30초마다 체크, 3번 실패시 unhealthy 상태
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD bun -e "fetch('http://localhost:${PORT}/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))" \
    || exit 1

# 애플리케이션 시작
# dumb-init으로 시그널 처리 개선
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", ".output/server/index.mjs"]