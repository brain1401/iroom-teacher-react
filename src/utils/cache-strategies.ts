/**
 * 고급 캐싱 전략 및 성능 최적화 유틸리티
 * @description TanStack Query 기반 지능형 캐싱 전략과 성능 모니터링 시스템
 *
 * 주요 기능:
 * - **캐시 워밍**: 사용자 행동 패턴 기반 사전 데이터 로드
 * - **지능형 프리페칭**: 예측 기반 데이터 미리 로드
 * - **백그라운드 업데이트**: 사용자 경험을 해치지 않는 실시간 동기화
 * - **성능 모니터링**: 캐시 적중률 및 성능 메트릭 추적
 * - **적응형 캐시 전략**: 사용 패턴에 따른 캐시 정책 동적 조정
 */

import { QueryClient } from "@tanstack/react-query";
import { 
  examListQueryOptions, 
  examDetailQueryOptions, 
  submissionStatusQueryOptions,
  examPreloadQueries,
  examKeys 
} from "@/api/exam";
import { 
  recentExamsStatusQueryOptions,
  scoreDistributionQueryOptions 
} from "@/api/dashboard";
import type { ExamListFilters } from "@/types/server-exam";

// ============================================================================
// 캐시 전략 타입 정의
// ============================================================================

type CacheStrategy = {
  /** 캐시 우선순위 (1: 높음, 3: 낮음) */
  priority: 1 | 2 | 3;
  /** staleTime (밀리초) */
  staleTime: number;
  /** gcTime (밀리초) */
  gcTime: number;
  /** 백그라운드 업데이트 여부 */
  backgroundSync: boolean;
  /** 프리페칭 여부 */
  prefetch: boolean;
};

type CacheMetrics = {
  /** 캐시 적중률 (%) */
  hitRate: number;
  /** 평균 응답 시간 (ms) */
  avgResponseTime: number;
  /** 캐시 미스 횟수 */
  missCount: number;
  /** 총 쿼리 횟수 */
  totalQueries: number;
  /** 마지막 업데이트 시간 */
  lastUpdated: Date;
};

// ============================================================================
// 동적 캐시 전략 시스템
// ============================================================================

/**
 * 데이터 타입별 최적화된 캐시 전략
 * @description 데이터의 특성에 따라 다른 캐시 전략 적용
 */
export const cacheStrategies: Record<string, CacheStrategy> = {
  // 🔥 실시간성 중요 (제출 현황, 알림 등)
  realTime: {
    priority: 1,
    staleTime: 30 * 1000, // 30초
    gcTime: 2 * 60 * 1000, // 2분
    backgroundSync: true,
    prefetch: false,
  },

  // ⚡ 자주 변경됨 (시험 목록, 대시보드)
  dynamic: {
    priority: 2,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    backgroundSync: true,
    prefetch: true,
  },

  // 📊 상대적으로 안정적 (시험 상세, 통계)
  stable: {
    priority: 2,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
    backgroundSync: false,
    prefetch: true,
  },

  // 💎 거의 변경되지 않음 (마스터 데이터, 설정)
  static: {
    priority: 3,
    staleTime: 60 * 60 * 1000, // 1시간
    gcTime: 24 * 60 * 60 * 1000, // 24시간
    backgroundSync: false,
    prefetch: false,
  },
};

/**
 * 사용자 행동 패턴 기반 적응형 캐시 전략
 * @description 사용자의 사용 패턴을 학습하여 캐시 전략을 동적으로 조정
 */
export class AdaptiveCacheStrategy {
  private metrics: Map<string, CacheMetrics> = new Map();
  private userPatterns: Map<string, number> = new Map(); // 접근 빈도

  /**
   * 쿼리 실행 메트릭 기록
   */
  recordQuery(queryKey: string[], responseTime: number, isCacheHit: boolean): void {
    const key = queryKey.join("-");
    const current = this.metrics.get(key) || {
      hitRate: 0,
      avgResponseTime: 0,
      missCount: 0,
      totalQueries: 0,
      lastUpdated: new Date(),
    };

    current.totalQueries += 1;
    if (!isCacheHit) {
      current.missCount += 1;
    }
    current.hitRate = ((current.totalQueries - current.missCount) / current.totalQueries) * 100;
    current.avgResponseTime = (current.avgResponseTime + responseTime) / 2;
    current.lastUpdated = new Date();

    this.metrics.set(key, current);

    // 사용자 패턴 기록
    const patternKey = queryKey[0]; // 첫 번째 키를 패턴 식별자로 사용
    this.userPatterns.set(patternKey, (this.userPatterns.get(patternKey) || 0) + 1);
  }

  /**
   * 쿼리별 최적화된 캐시 전략 추천
   */
  getOptimizedStrategy(queryKey: string[]): CacheStrategy {
    const key = queryKey.join("-");
    const metrics = this.metrics.get(key);
    const patternKey = queryKey[0];
    const accessCount = this.userPatterns.get(patternKey) || 0;

    // 기본 전략
    let strategy = cacheStrategies.dynamic;

    // 접근 빈도가 높으면 더 적극적인 캐싱
    if (accessCount > 10) {
      strategy = {
        ...strategy,
        staleTime: strategy.staleTime * 1.5,
        gcTime: strategy.gcTime * 2,
        prefetch: true,
      };
    }

    // 캐시 적중률이 낮으면 staleTime 단축
    if (metrics && metrics.hitRate < 60) {
      strategy = {
        ...strategy,
        staleTime: strategy.staleTime * 0.7,
        backgroundSync: true,
      };
    }

    // 응답 시간이 느리면 더 오래 캐시
    if (metrics && metrics.avgResponseTime > 1000) {
      strategy = {
        ...strategy,
        staleTime: strategy.staleTime * 1.3,
        gcTime: strategy.gcTime * 1.5,
      };
    }

    return strategy;
  }

  /**
   * 현재 캐시 성능 리포트 생성
   */
  getPerformanceReport(): Record<string, CacheMetrics> {
    return Object.fromEntries(this.metrics);
  }
}

// 전역 적응형 캐시 전략 인스턴스
export const adaptiveCache = new AdaptiveCacheStrategy();

// ============================================================================
// 지능형 프리페칭 시스템
// ============================================================================

/**
 * 사용자 행동 예측 기반 프리페칭 매니저
 * @description 사용자의 다음 행동을 예측하여 데이터를 미리 로드
 */
export class IntelligentPrefetcher {
  private queryClient: QueryClient;
  private prefetchQueue: Set<string> = new Set();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * 시험 목록에서 상세로 이동할 가능성이 높은 항목들 프리페치
   * @param examIds 현재 화면에 표시된 시험 ID들
   * @param userScrollPosition 사용자 스크롤 위치 (0-1)
   */
  async prefetchExamDetails(examIds: string[], userScrollPosition: number = 0): Promise<void> {
    // 화면 상단의 항목들을 우선적으로 프리페치
    const priorityCount = Math.max(1, Math.ceil(examIds.length * (1 - userScrollPosition)));
    const priorityExams = examIds.slice(0, priorityCount);

    for (const examId of priorityExams) {
      if (!this.prefetchQueue.has(`exam-detail-${examId}`)) {
        this.prefetchQueue.add(`exam-detail-${examId}`);
        
        try {
          await this.queryClient.prefetchQuery(examDetailQueryOptions(examId));
        } catch (error) {
          console.warn(`프리페치 실패 - 시험 상세 ${examId}:`, error);
        }

        this.prefetchQueue.delete(`exam-detail-${examId}`);
      }
    }
  }

  /**
   * 다음 페이지 데이터 프리페치
   * @param currentFilters 현재 필터 설정
   * @param currentPage 현재 페이지
   */
  async prefetchNextPage(currentFilters: ExamListFilters, currentPage: number): Promise<void> {
    const nextPageFilters = {
      ...currentFilters,
      page: currentPage + 1,
    };

    const prefetchKey = `exam-list-page-${currentPage + 1}`;
    
    if (!this.prefetchQueue.has(prefetchKey)) {
      this.prefetchQueue.add(prefetchKey);
      
      try {
        await this.queryClient.prefetchQuery(examListQueryOptions(nextPageFilters));
      } catch (error) {
        console.warn(`다음 페이지 프리페치 실패:`, error);
      }

      this.prefetchQueue.delete(prefetchKey);
    }
  }

  /**
   * 관련 통계 데이터 프리페치
   * @param grade 현재 선택된 학년
   */
  async prefetchRelatedStatistics(grade?: number): Promise<void> {
    if (!grade) return;

    // 학년을 유효한 타입으로 변환
    const validGrade = [1, 2, 3].includes(grade) ? (grade as 1 | 2 | 3) : undefined;
    if (!validGrade) return;

    const prefetchKey = `dashboard-stats-${validGrade}`;
    
    if (!this.prefetchQueue.has(prefetchKey)) {
      this.prefetchQueue.add(prefetchKey);
      
      try {
        await Promise.all([
          this.queryClient.prefetchQuery(recentExamsStatusQueryOptions({ grade: validGrade })),
          this.queryClient.prefetchQuery(scoreDistributionQueryOptions({ grade: validGrade })),
        ]);
      } catch (error) {
        console.warn(`통계 데이터 프리페치 실패:`, error);
      }

      this.prefetchQueue.delete(prefetchKey);
    }
  }

  /**
   * 현재 프리페치 큐 상태 조회
   */
  getPrefetchStatus(): { queueSize: number; activeItems: string[] } {
    return {
      queueSize: this.prefetchQueue.size,
      activeItems: Array.from(this.prefetchQueue),
    };
  }
}

// ============================================================================
// 백그라운드 동기화 시스템
// ============================================================================

/**
 * 백그라운드에서 중요한 데이터를 주기적으로 동기화
 * @description 사용자 경험을 해치지 않으면서 데이터를 최신 상태로 유지
 */
export class BackgroundSyncManager {
  private queryClient: QueryClient;
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * 실시간성이 중요한 데이터의 백그라운드 동기화 시작
   * @param examId 동기화할 시험 ID
   */
  startSubmissionStatusSync(examId: string, intervalMs: number = 60000): void {
    const syncKey = `submission-${examId}`;
    
    if (this.syncIntervals.has(syncKey)) {
      return; // 이미 동기화 중
    }

    const interval = setInterval(async () => {
      try {
        // 현재 데이터가 있고 사용자가 해당 데이터를 보고 있는 경우에만 백그라운드 업데이트
        const queryKey = examKeys.submission(examId);
        const existingData = this.queryClient.getQueryData(queryKey);
        
        if (existingData) {
          await this.queryClient.invalidateQueries({ 
            queryKey,
            refetchType: 'active', // 활성 쿼리만 리페치
          });
        }
      } catch (error) {
        console.warn(`백그라운드 동기화 실패 - 제출 현황 ${examId}:`, error);
      }
    }, intervalMs);

    this.syncIntervals.set(syncKey, interval);
  }

  /**
   * 백그라운드 동기화 중지
   * @param examId 중지할 시험 ID
   */
  stopSubmissionStatusSync(examId: string): void {
    const syncKey = `submission-${examId}`;
    const interval = this.syncIntervals.get(syncKey);
    
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(syncKey);
    }
  }

  /**
   * 모든 백그라운드 동기화 중지
   */
  stopAllSync(): void {
    for (const [key, interval] of this.syncIntervals) {
      clearInterval(interval);
    }
    this.syncIntervals.clear();
  }

  /**
   * 현재 동기화 상태 조회
   */
  getSyncStatus(): { activeSync: string[]; count: number } {
    return {
      activeSync: Array.from(this.syncIntervals.keys()),
      count: this.syncIntervals.size,
    };
  }
}

// ============================================================================
// 캐시 워밍 전략
// ============================================================================

/**
 * 애플리케이션 시작 시 중요한 데이터를 미리 캐시에 로드
 * @description 초기 로딩 속도 향상을 위한 캐시 워밍 전략
 */
export const cacheWarmingStrategies = {
  /**
   * 메인 대시보드 캐시 워밍
   * @param queryClient TanStack Query 클라이언트
   * @param userGrade 사용자의 주요 학년 (선택사항)
   */
  async warmDashboard(queryClient: QueryClient, userGrade?: number): Promise<void> {
    // 유효한 학년만 필터링하여 사용
    const validUserGrade = userGrade && [1, 2, 3].includes(userGrade) ? (userGrade as 1 | 2 | 3) : undefined;
    const grades = validUserGrade ? [validUserGrade] : ([1, 2, 3] as const); // 기본적으로 모든 학년
    
    try {
      // 병렬로 주요 대시보드 데이터 로드
      await Promise.allSettled(
        grades.map(async (grade) => [
          queryClient.prefetchQuery(recentExamsStatusQueryOptions({ grade, limit: 5 })),
          queryClient.prefetchQuery(scoreDistributionQueryOptions({ grade })),
        ]).flat()
      );
    } catch (error) {
      console.warn("대시보드 캐시 워밍 실패:", error);
    }
  },

  /**
   * 시험 목록 페이지 캐시 워밍
   * @param queryClient TanStack Query 클라이언트  
   * @param commonFilters 자주 사용되는 필터 조합들
   */
  async warmExamList(
    queryClient: QueryClient, 
    commonFilters: ExamListFilters[] = [
      { page: 0, size: 20 }, // 첫 페이지
      { page: 0, size: 20, sort: "createdAt,desc" }, // 최신순
    ]
  ): Promise<void> {
    try {
      await Promise.allSettled(
        commonFilters.map(filters =>
          queryClient.prefetchQuery(examListQueryOptions(filters))
        )
      );
    } catch (error) {
      console.warn("시험 목록 캐시 워밍 실패:", error);
    }
  },

  /**
   * 전체 애플리케이션 캐시 워밍
   * @param queryClient TanStack Query 클라이언트
   * @param options 워밍 옵션
   */
  async warmApplication(
    queryClient: QueryClient,
    options: {
      userGrade?: number;
      enableExamListWarming?: boolean;
      enableDashboardWarming?: boolean;
    } = {}
  ): Promise<void> {
    const {
      userGrade,
      enableExamListWarming = true,
      enableDashboardWarming = true,
    } = options;

    console.log("🔥 캐시 워밍 시작...");

    const warmingTasks = [];

    if (enableDashboardWarming) {
      warmingTasks.push(
        cacheWarmingStrategies.warmDashboard(queryClient, userGrade)
      );
    }

    if (enableExamListWarming) {
      warmingTasks.push(
        cacheWarmingStrategies.warmExamList(queryClient)
      );
    }

    const startTime = Date.now();
    await Promise.allSettled(warmingTasks);
    const duration = Date.now() - startTime;

    console.log(`✅ 캐시 워밍 완료 (${duration}ms)`);
  },
};

// ============================================================================
// 성능 모니터링 유틸리티
// ============================================================================

/**
 * 쿼리 성능 모니터링 및 분석
 * @description 캐시 효율성과 쿼리 성능을 실시간으로 모니터링
 */
export class QueryPerformanceMonitor {
  private metrics: Map<string, {
    totalRequests: number;
    cacheHits: number;
    avgResponseTime: number;
    errorCount: number;
    lastErrorTime?: Date;
  }> = new Map();

  /**
   * 쿼리 실행 메트릭 기록
   */
  recordQuery(
    queryKey: readonly unknown[], 
    responseTime: number, 
    isFromCache: boolean,
    hasError: boolean = false
  ): void {
    const key = JSON.stringify(queryKey);
    const current = this.metrics.get(key) || {
      totalRequests: 0,
      cacheHits: 0,
      avgResponseTime: 0,
      errorCount: 0,
    };

    current.totalRequests += 1;
    
    if (isFromCache) {
      current.cacheHits += 1;
    }
    
    if (hasError) {
      current.errorCount += 1;
      current.lastErrorTime = new Date();
    }

    current.avgResponseTime = (current.avgResponseTime * (current.totalRequests - 1) + responseTime) / current.totalRequests;

    this.metrics.set(key, current);
  }

  /**
   * 성능 리포트 생성
   */
  generateReport(): {
    overallCacheHitRate: number;
    slowQueries: Array<{ queryKey: string; avgResponseTime: number }>;
    errorPronQueries: Array<{ queryKey: string; errorRate: number }>;
    totalQueries: number;
  } {
    const entries = Array.from(this.metrics.entries());
    
    if (entries.length === 0) {
      return {
        overallCacheHitRate: 0,
        slowQueries: [],
        errorPronQueries: [],
        totalQueries: 0,
      };
    }

    const totalQueries = entries.reduce((sum, [, metrics]) => sum + metrics.totalRequests, 0);
    const totalCacheHits = entries.reduce((sum, [, metrics]) => sum + metrics.cacheHits, 0);
    const overallCacheHitRate = (totalCacheHits / totalQueries) * 100;

    const slowQueries = entries
      .filter(([, metrics]) => metrics.avgResponseTime > 1000)
      .map(([key, metrics]) => ({
        queryKey: key,
        avgResponseTime: metrics.avgResponseTime,
      }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, 5);

    const errorPronQueries = entries
      .filter(([, metrics]) => metrics.errorCount > 0)
      .map(([key, metrics]) => ({
        queryKey: key,
        errorRate: (metrics.errorCount / metrics.totalRequests) * 100,
      }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5);

    return {
      overallCacheHitRate: Math.round(overallCacheHitRate * 100) / 100,
      slowQueries,
      errorPronQueries,
      totalQueries,
    };
  }

  /**
   * 성능 메트릭 초기화
   */
  reset(): void {
    this.metrics.clear();
  }
}

// 전역 성능 모니터 인스턴스 (개발 환경에서만 활성화)
export const performanceMonitor = process.env.NODE_ENV === 'development' 
  ? new QueryPerformanceMonitor() 
  : null;

// ============================================================================
// 통합 캐시 매니저
// ============================================================================

/**
 * 모든 캐시 전략을 통합 관리하는 매니저 클래스
 * @description 애플리케이션 전체의 캐시 전략을 중앙에서 관리
 */
export class CacheManager {
  private queryClient: QueryClient;
  private prefetcher: IntelligentPrefetcher;
  private syncManager: BackgroundSyncManager;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.prefetcher = new IntelligentPrefetcher(queryClient);
    this.syncManager = new BackgroundSyncManager(queryClient);
  }

  /**
   * 애플리케이션 시작 시 초기화
   */
  async initialize(options?: {
    userGrade?: number;
    enableCacheWarming?: boolean;
  }): Promise<void> {
    if (options?.enableCacheWarming !== false) {
      await cacheWarmingStrategies.warmApplication(this.queryClient, {
        userGrade: options?.userGrade,
      });
    }
  }

  /**
   * 프리페처 인스턴스 반환
   */
  getPrefetcher(): IntelligentPrefetcher {
    return this.prefetcher;
  }

  /**
   * 백그라운드 동기화 매니저 반환
   */
  getSyncManager(): BackgroundSyncManager {
    return this.syncManager;
  }

  /**
   * 전체 캐시 상태 조회
   */
  getCacheStatus(): {
    prefetch: ReturnType<IntelligentPrefetcher['getPrefetchStatus']>;
    sync: ReturnType<BackgroundSyncManager['getSyncStatus']>;
    performance?: ReturnType<QueryPerformanceMonitor['generateReport']>;
  } {
    return {
      prefetch: this.prefetcher.getPrefetchStatus(),
      sync: this.syncManager.getSyncStatus(),
      performance: performanceMonitor?.generateReport(),
    };
  }

  /**
   * 정리 작업 (컴포넌트 언마운트 시 호출)
   */
  cleanup(): void {
    this.syncManager.stopAllSync();
  }
}

// ============================================================================
// React 훅 통합
// ============================================================================

/**
 * 캐시 매니저를 React 컴포넌트에서 쉽게 사용할 수 있도록 하는 훅
 * @description 컴포넌트 레벨에서 캐시 전략을 활용할 수 있는 편의 훅
 */
export function useCacheManager(queryClient: QueryClient) {
  const cacheManager = new CacheManager(queryClient);
  
  return {
    cacheManager,
    
    // 편의 메서드들
    prefetchExamDetails: cacheManager.getPrefetcher().prefetchExamDetails.bind(cacheManager.getPrefetcher()),
    prefetchNextPage: cacheManager.getPrefetcher().prefetchNextPage.bind(cacheManager.getPrefetcher()),
    startRealtimeSync: cacheManager.getSyncManager().startSubmissionStatusSync.bind(cacheManager.getSyncManager()),
    stopRealtimeSync: cacheManager.getSyncManager().stopSubmissionStatusSync.bind(cacheManager.getSyncManager()),
    getCacheStatus: cacheManager.getCacheStatus.bind(cacheManager),
  };
}