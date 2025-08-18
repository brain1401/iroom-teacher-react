# 🐳 Docker 배포 가이드

이룸클래스 React 애플리케이션의 Docker 컨테이너화 및 배포 가이드입니다.

## 📋 전제 조건

- Docker Desktop 또는 Docker Engine 설치
- Docker Compose 설치 (선택사항)
- Bun 1.0 이상 (로컬 개발용)

## 🏗️ Docker 구성

### 파일 구조

```
├── Dockerfile           # 멀티스테이지 프로덕션 빌드
├── .dockerignore       # 빌드 컨텍스트 최적화
├── docker-compose.yml  # 오케스트레이션 설정
└── package.json        # Docker 스크립트 포함
```

### Dockerfile 특징

- **멀티스테이지 빌드**: 4단계 최적화 (base → deps → build → production)
- **Alpine Linux 기반**: 최소 이미지 크기 (약 150MB)
- **Bun 런타임**: Node.js 대비 3-5배 빠른 시작 시간
- **보안 강화**: non-root 사용자, dumb-init 프로세스 관리
- **헬스체크**: 자동 상태 모니터링

## 🚀 빠른 시작

### 1. Docker 이미지 빌드

```bash
# 프로덕션 이미지 빌드
npm run docker:build

# 개발 이미지 빌드 (hot reload 지원)
npm run docker:build:dev
```

### 2. 컨테이너 실행

```bash
# 프로덕션 컨테이너 실행
npm run docker:run

# 개발 컨테이너 실행
npm run docker:run:dev
```

### 3. Docker Compose 사용

```bash
# 프로덕션 환경 시작
npm run compose:up

# 개발 환경 시작
npm run compose:up:dev

# 서비스 중지
npm run compose:down
```

## 📝 주요 Docker 명령어

| 명령어                    | 설명                         |
| ------------------------- | ---------------------------- |
| `npm run docker:build`    | 프로덕션 이미지 빌드         |
| `npm run docker:run`      | 프로덕션 컨테이너 실행       |
| `npm run docker:stop`     | 컨테이너 중지 및 제거        |
| `npm run docker:logs`     | 컨테이너 로그 확인           |
| `npm run docker:shell`    | 컨테이너 쉘 접속             |
| `npm run compose:up`      | Docker Compose로 서비스 시작 |
| `npm run compose:logs`    | Compose 로그 확인            |
| `npm run compose:restart` | 앱 서비스 재시작             |

## 🔧 환경 변수 설정

### .env 파일 생성

```bash
# .env
NODE_ENV=production
PORT=3012
API_BASE_URL=http://api.example.com
```

### Docker Compose에서 사용

```yaml
environment:
  - NODE_ENV=${NODE_ENV:-production}
  - PORT=${PORT:-3012}
  - API_BASE_URL=${API_BASE_URL:-http://localhost:3055}
```

## 🏭 프로덕션 배포

### 1. CI/CD 파이프라인 예시 (GitHub Actions)

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            username/iroom-teacher:latest
            username/iroom-teacher:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 2. 클라우드 배포

#### AWS ECS/Fargate

```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin [ECR_URI]

# 이미지 태그 및 푸시
docker tag iroom-teacher:latest [ECR_URI]/iroom-teacher:latest
docker push [ECR_URI]/iroom-teacher:latest
```

#### Google Cloud Run

```bash
# 이미지 빌드 및 푸시
gcloud builds submit --tag gcr.io/[PROJECT_ID]/iroom-teacher

# Cloud Run 배포
gcloud run deploy iroom-teacher \
  --image gcr.io/[PROJECT_ID]/iroom-teacher \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated
```

#### Azure Container Instances

```bash
# Azure Container Registry 로그인
az acr login --name [REGISTRY_NAME]

# 이미지 푸시
docker tag iroom-teacher:latest [REGISTRY_NAME].azurecr.io/iroom-teacher:latest
docker push [REGISTRY_NAME].azurecr.io/iroom-teacher:latest

# 컨테이너 인스턴스 생성
az container create \
  --resource-group [RESOURCE_GROUP] \
  --name iroom-teacher \
  --image [REGISTRY_NAME].azurecr.io/iroom-teacher:latest \
  --ports 3012
```

## 🔍 디버깅 및 문제 해결

### 컨테이너 로그 확인

```bash
# 실시간 로그
npm run docker:logs

# 최근 100줄 로그
docker logs --tail 100 iroom-teacher-app
```

### 컨테이너 내부 접속

```bash
# 쉘 접속
npm run docker:shell

# 명령 실행
docker exec iroom-teacher-app bun --version
```

### 리소스 사용량 확인

```bash
# CPU/메모리 사용량
docker stats iroom-teacher-app

# 디스크 사용량
docker system df
```

### 일반적인 문제 해결

#### 포트 충돌

```bash
# 3012 포트 사용 확인
netstat -an | grep 3012

# 다른 포트로 실행
docker run -p 3013:3012 iroom-teacher:latest
```

#### 메모리 부족

```yaml
# docker-compose.yml에서 메모리 제한 조정
deploy:
  resources:
    limits:
      memory: 2G # 증가
```

#### 빌드 캐시 문제

```bash
# 캐시 없이 빌드
docker build --no-cache -t iroom-teacher:latest .

# 모든 빌드 캐시 삭제
docker builder prune -a
```

## 📊 성능 최적화

### 이미지 크기 최적화

- Alpine Linux 사용: ~70% 크기 감소
- 멀티스테이지 빌드: 불필요한 빌드 도구 제외
- .dockerignore 활용: 빌드 컨텍스트 최소화

### 빌드 시간 최적화

- 레이어 캐싱 활용
- 의존성 변경 최소화
- BuildKit 캐시 마운트 사용

### 런타임 성능

- Bun 런타임: Node.js 대비 3-5배 빠른 시작
- dumb-init: 좀비 프로세스 방지
- 헬스체크: 자동 재시작으로 가용성 향상

## 🔐 보안 고려사항

1. **Non-root 사용자 실행**: `USER bun`
2. **최소 권한 원칙**: 필요한 파일만 복사
3. **민감한 정보 제외**: .dockerignore로 환경 파일 제외
4. **정기적인 이미지 업데이트**: 보안 패치 적용
5. **스캔 도구 사용**:
   ```bash
   # Trivy로 보안 스캔
   trivy image iroom-teacher:latest
   ```

## 📈 모니터링

### Prometheus + Grafana 연동

```yaml
# docker-compose.yml에 추가
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

### 로그 수집 (ELK Stack)

```yaml
services:
  elasticsearch:
    image: elasticsearch:8.11.0

  logstash:
    image: logstash:8.11.0

  kibana:
    image: kibana:8.11.0
```

## 📚 추가 리소스

- [Bun Docker 공식 문서](https://bun.sh/guides/ecosystem/docker)
- [Docker 베스트 프랙티스](https://docs.docker.com/develop/dev-best-practices/)
- [TanStack Start 배포 가이드](https://tanstack.com/start/latest/docs/framework/react/guide/deployment)

## 🤝 지원

문제가 발생하거나 도움이 필요한 경우:

1. [GitHub Issues](https://github.com/your-repo/issues) 생성
2. Docker 로그 첨부
3. 환경 정보 제공 (OS, Docker 버전 등)
