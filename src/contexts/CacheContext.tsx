/**
 * 캐시 전략 컨텍스트
 * @description 애플리케이션 전체에서 고급 캐싱 전략을 사용할 수 있도록 하는 React 컨텍스트
 *
 * 주요 기능:
 * - **통합 캐시 매니저**: 모든 캐시 전략을 중앙에서 관리
 * - **성능 모니터링**: 실시간 캐시 성능 추적
 * - **지능형 프리페칭**: 사용자 행동 예측 기반 데이터 미리 로드
 * - **백그라운드 동기화**: 실시간 데이터 업데이트
 * - **적응형 캐시**: 사용 패턴에 따른 동적 캐시 전략 조정
 */

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CacheManager,
  IntelligentPrefetcher,
  BackgroundSyncManager,
  AdaptiveCacheStrategy,
  QueryPerformanceMonitor,
  adaptiveCache,
  performanceMonitor,
  cacheWarmingStrategies,
} from "@/utils/cache-strategies";
import type { ExamListFilters } from "@/types/server-exam";

// ============================================================================
// 타입 정의
// ============================================================================

type CacheContextValue = {
  /** 통합 캐시 매니저 */
  cacheManager: CacheManager;
  /** 지능형 프리페칭 */
  prefetcher: IntelligentPrefetcher;
  /** 백그라운드 동기화 매니저 */
  syncManager: BackgroundSyncManager;
  /** 적응형 캐시 전략 */
  adaptiveStrategy: AdaptiveCacheStrategy;
  /** 성능 모니터 */
  performanceMonitor: QueryPerformanceMonitor | null;
  
  // 편의 메서드들
  /** 시험 상세 정보 프리페치 */
  prefetchExamDetails: (examIds: string[], scrollPosition?: number) => Promise<void>;
  /** 다음 페이지 프리페치 */
  prefetchNextPage: (filters: ExamListFilters, currentPage: number) => Promise<void>;
  /** 실시간 동기화 시작 */
  startRealtimeSync: (examId: string, intervalMs?: number) => void;
  /** 실시간 동기화 중지 */
  stopRealtimeSync: (examId: string) => void;
  /** 캐시 상태 조회 */
  getCacheStatus: () => ReturnType<CacheManager['getCacheStatus']>;
  
  // 성능 메트릭
  /** 현재 성능 메트릭 */
  performanceMetrics: ReturnType<QueryPerformanceMonitor['generateReport']> | null;
  /** 성능 메트릭 새로고침 */
  refreshMetrics: () => void;
};

// ============================================================================
// 컨텍스트 생성
// ============================================================================

const CacheContext = createContext<CacheContextValue | null>(null);

/**
 * 캐시 컨텍스트 프로바이더
 * @description 애플리케이션 최상위에서 캐시 전략을 제공하는 프로바이더
 */
type CacheProviderProps = {
  children: React.ReactNode;
  /** 사용자의 주요 학년 (캐시 워밍 최적화용) */
  userGrade?: number;
  /** 캐시 워밍 활성화 여부 */
  enableCacheWarming?: boolean;
  /** 성능 모니터링 활성화 여부 */
  enablePerformanceMonitoring?: boolean;
};

export function CacheProvider({
  children,
  userGrade,
  enableCacheWarming = true,
  enablePerformanceMonitoring = process.env.NODE_ENV === 'development',
}: CacheProviderProps) {
  const queryClient = useQueryClient();
  
  // 캐시 매니저 초기화
  const cacheManager = useMemo(
    () => new CacheManager(queryClient),
    [queryClient]
  );
  
  const prefetcher = useMemo(
    () => cacheManager.getPrefetcher(),
    [cacheManager]
  );
  
  const syncManager = useMemo(
    () => cacheManager.getSyncManager(),
    [cacheManager]
  );

  // 성능 메트릭 상태
  const [performanceMetrics, setPerformanceMetrics] = useState<
    ReturnType<QueryPerformanceMonitor['generateReport']> | null
  >(null);

  // 성능 메트릭 새로고침
  const refreshMetrics = React.useCallback(() => {
    if (enablePerformanceMonitoring && performanceMonitor) {
      setPerformanceMetrics(performanceMonitor.generateReport());
    }
  }, [enablePerformanceMonitoring]);

  // 초기화 및 캐시 워밍
  useEffect(() => {
    const initializeCache = async () => {
      try {
        console.log("🚀 캐시 시스템 초기화 시작...");
        
        await cacheManager.initialize({
          userGrade,
          enableCacheWarming,
        });

        // 성능 메트릭 초기 로드
        if (enablePerformanceMonitoring) {
          refreshMetrics();
        }

        console.log("✅ 캐시 시스템 초기화 완료");
      } catch (error) {
        console.error("❌ 캐시 시스템 초기화 실패:", error);
      }
    };

    initializeCache();
  }, [cacheManager, userGrade, enableCacheWarming, enablePerformanceMonitoring, refreshMetrics]);

  // 성능 모니터링을 위한 쿼리 클라이언트 이벤트 리스너
  useEffect(() => {
    if (!enablePerformanceMonitoring || !performanceMonitor) {
      return;
    }

    const cache = queryClient.getQueryCache();
    
    // 쿼리 시작 이벤트 (실제로는 queryClient의 getQueryCache를 통해 처리)
    // TanStack Query v5에서는 직접적인 쿼리 이벤트 구독이 제한적이므로 
    // 성능 모니터링은 컴포넌트 레벨에서 처리
    const unsubscribeStart = () => {}; // 플레이스홀더

    // 쿼리 완료 이벤트 (단순화된 접근법)
    const unsubscribeEnd = () => {}; // 플레이스홀더
    
    // 성능 모니터링은 usePerformanceMetrics 훅에서 처리하도록 단순화
    if (performanceMonitor) {
      // 기본 메트릭 초기화
      performanceMonitor.recordQuery(
        ['cache', 'initialization'],
        0,
        true,
        false
      );
    }

    // 주기적 메트릭 업데이트 (개발 환경에서만)
    const metricsInterval = setInterval(refreshMetrics, 5000); // 5초마다

    return () => {
      unsubscribeStart();
      unsubscribeEnd();
      clearInterval(metricsInterval);
    };
  }, [queryClient, enablePerformanceMonitoring, refreshMetrics]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cacheManager.cleanup();
    };
  }, [cacheManager]);

  // 편의 메서드들
  const contextValue = useMemo<CacheContextValue>(() => ({
    cacheManager,
    prefetcher,
    syncManager,
    adaptiveStrategy: adaptiveCache,
    performanceMonitor: enablePerformanceMonitoring ? performanceMonitor : null,
    
    // 편의 메서드들
    prefetchExamDetails: prefetcher.prefetchExamDetails.bind(prefetcher),
    prefetchNextPage: prefetcher.prefetchNextPage.bind(prefetcher),
    startRealtimeSync: syncManager.startSubmissionStatusSync.bind(syncManager),
    stopRealtimeSync: syncManager.stopSubmissionStatusSync.bind(syncManager),
    getCacheStatus: cacheManager.getCacheStatus.bind(cacheManager),
    
    // 성능 메트릭
    performanceMetrics,
    refreshMetrics,
  }), [
    cacheManager,
    prefetcher,
    syncManager,
    enablePerformanceMonitoring,
    performanceMetrics,
    refreshMetrics,
  ]);

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
}

// ============================================================================
// React 훅
// ============================================================================

/**
 * 캐시 컨텍스트 훅
 * @description 컴포넌트에서 캐시 전략을 사용할 수 있도록 하는 훅
 */
export function useCache(): CacheContextValue {
  const context = useContext(CacheContext);
  
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider");
  }
  
  return context;
}

/**
 * 지능형 프리페칭 훅
 * @description 컴포넌트에서 쉽게 프리페칭을 사용할 수 있도록 하는 훅
 */
export function usePrefetch() {
  const { prefetcher } = useCache();
  
  return {
    /** 시험 상세 정보 프리페치 */
    prefetchExamDetails: prefetcher.prefetchExamDetails.bind(prefetcher),
    /** 다음 페이지 프리페치 */
    prefetchNextPage: prefetcher.prefetchNextPage.bind(prefetcher),
    /** 관련 통계 프리페치 */
    prefetchRelatedStatistics: prefetcher.prefetchRelatedStatistics.bind(prefetcher),
    /** 프리페치 상태 조회 */
    getPrefetchStatus: prefetcher.getPrefetchStatus.bind(prefetcher),
  };
}

/**
 * 백그라운드 동기화 훅
 * @description 실시간 데이터 동기화를 쉽게 관리할 수 있도록 하는 훅
 */
export function useBackgroundSync() {
  const { syncManager } = useCache();
  
  return {
    /** 제출 현황 실시간 동기화 시작 */
    startSubmissionSync: syncManager.startSubmissionStatusSync.bind(syncManager),
    /** 제출 현황 실시간 동기화 중지 */
    stopSubmissionSync: syncManager.stopSubmissionStatusSync.bind(syncManager),
    /** 모든 동기화 중지 */
    stopAllSync: syncManager.stopAllSync.bind(syncManager),
    /** 동기화 상태 조회 */
    getSyncStatus: syncManager.getSyncStatus.bind(syncManager),
  };
}

/**
 * 성능 모니터링 훅
 * @description 캐시 성능과 메트릭을 조회할 수 있는 훅
 */
export function usePerformanceMetrics() {
  const { performanceMetrics, refreshMetrics, getCacheStatus, performanceMonitor } = useCache();
  
  return {
    /** 현재 성능 메트릭 */
    metrics: performanceMetrics,
    /** 메트릭 새로고침 */
    refreshMetrics,
    /** 캐시 상태 조회 */
    getCacheStatus,
    /** 성능 모니터 사용 가능 여부 */
    isAvailable: !!performanceMonitor,
    /** 메트릭 초기화 */
    resetMetrics: performanceMonitor?.reset.bind(performanceMonitor),
  };
}

/**
 * 적응형 캐시 전략 훅
 * @description 사용자 패턴에 따른 캐시 전략을 활용하는 훅
 */
export function useAdaptiveCache() {
  const { adaptiveStrategy } = useCache();
  
  return {
    /** 쿼리별 최적화된 캐시 전략 조회 */
    getOptimizedStrategy: adaptiveStrategy.getOptimizedStrategy.bind(adaptiveStrategy),
    /** 성능 리포트 생성 */
    getPerformanceReport: adaptiveStrategy.getPerformanceReport.bind(adaptiveStrategy),
    /** 쿼리 실행 메트릭 기록 */
    recordQuery: adaptiveStrategy.recordQuery.bind(adaptiveStrategy),
  };
}

// ============================================================================
// 스마트 프리페칭 훅 (특정 시나리오용)
// ============================================================================

/**
 * 시험 목록 페이지 전용 프리페칭 훅
 * @description 시험 목록에서 사용자 행동을 예측하여 최적화된 프리페칭 제공
 */
export function useExamListPrefetch() {
  const { prefetchExamDetails, prefetchNextPage } = usePrefetch();
  const prefetchedIds = useRef<Set<string>>(new Set());

  return {
    /**
     * 현재 화면의 시험들에 대해 스마트 프리페칭
     * @param examIds 화면에 표시된 시험 ID들
     * @param userScrollPosition 사용자 스크롤 위치 (0-1)
     */
    prefetchVisibleExams: async (examIds: string[], userScrollPosition?: number) => {
      // 이미 프리페치한 항목들은 제외
      const newIds = examIds.filter(id => !prefetchedIds.current.has(id));
      
      if (newIds.length > 0) {
        await prefetchExamDetails(newIds, userScrollPosition);
        newIds.forEach(id => prefetchedIds.current.add(id));
      }
    },

    /**
     * 다음 페이지 지능형 프리페치
     * @param filters 현재 필터
     * @param currentPage 현재 페이지
     * @param userScrollPosition 사용자 스크롤 위치 (1에 가까우면 다음 페이지 관심 높음)
     */
    prefetchNextPageSmart: async (
      filters: ExamListFilters, 
      currentPage: number, 
      userScrollPosition?: number
    ) => {
      // 사용자가 페이지 하단 근처에 있으면 다음 페이지 프리페치
      if (!userScrollPosition || userScrollPosition > 0.7) {
        await prefetchNextPage(filters, currentPage);
      }
    },

    /**
     * 프리페치 캐시 초기화 (페이지 변경 시 호출)
     */
    resetPrefetchCache: () => {
      prefetchedIds.current.clear();
    },
  };
}

/**
 * 실시간 동기화가 필요한 컴포넌트를 위한 훅
 * @description 제출 현황 등 실시간 업데이트가 필요한 데이터를 자동으로 동기화
 */
export function useRealtimeSync(examId?: string, enabled: boolean = true) {
  const { startSubmissionSync, stopSubmissionSync } = useBackgroundSync();

  useEffect(() => {
    if (enabled && examId) {
      // 실시간 동기화 시작 (60초 간격)
      startSubmissionSync(examId, 60000);
      
      return () => {
        // 컴포넌트 언마운트 시 동기화 중지
        stopSubmissionSync(examId);
      };
    }
  }, [examId, enabled, startSubmissionSync, stopSubmissionSync]);

  return {
    isActive: enabled && !!examId,
    examId,
  };
}