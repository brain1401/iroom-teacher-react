import type { AxiosRequestConfig } from "axios";
import { apiClient } from "@/api/client";
import type { Grade } from "@/types/grade";
import type {
  UnitsTreeResponse,
  UnitsTreeQueryParams,
} from "@/types/units-tree";
import type { BackendUnitsTreeResponse } from "@/types/units-tree-backend";
import { convertBackendResponseToUnitsTree } from "@/utils/unitsTreeAdapter";

/**
 * 단원 트리 API 클라이언트
 * @description 기본 API 클라이언트를 확장하여 단원 트리 API 전용으로 설정
 *
 * 주요 기능:
 * - 교육과정 계층적 단원 구조 조회
 * - 학년별 필터링 지원
 * - 문제 포함/미포함 옵션 지원
 * - httpOnly 쿠키 기반 인증 지원
 * - 백엔드 표준 응답 형식 자동 처리 (ApiResponse<T>)
 * - AbortController 지원으로 요청 취소 가능
 */
const unitsTreeApiClient = apiClient.create({
  baseURL: `${apiClient.defaults.baseURL}/units`,
});

/**
 * 단원 트리 API 공통 요청 함수
 * @description 모든 단원 트리 API 호출에서 공통으로 사용하는 요청 처리 함수
 * @template T API 응답 데이터 타입
 * @param config Axios 요청 설정 객체
 * @returns API 응답 데이터 (백엔드 표준 응답에서 data 부분만 추출)
 */
async function unitsTreeApiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await unitsTreeApiClient.request<T>(config);
  return response.data;
}

/**
 * 단원 트리 구조를 조회하는 함수
 * @description 교육과정의 계층적 단원 구조를 트리 형태로 조회하는 함수
 *
 * 주요 기능:
 * - 대분류 → 중분류 → 세부단원의 3계층 구조 반환
 * - displayOrder 순서로 정렬된 계층 구조
 * - 각 노드는 하위 children 배열 포함
 * - 세부단원(Unit)은 학년 정보 포함
 * - includeQuestions=true인 경우, 세부단원에 해당 문제 목록 포함
 * - AbortController를 통한 요청 취소 지원
 * - 백엔드 표준 응답 형식 자동 처리
 * - 방어적 프로그래밍으로 안전한 데이터 처리
 *
 * API 경로 예시:
 * - 전체 조회: GET /api/units/tree
 * - 학년별 조회: GET /api/units/tree?grade=1
 * - 문제 포함 조회: GET /api/units/tree?includeQuestions=true
 * - 학년별 + 문제 포함: GET /api/units/tree?grade=1&includeQuestions=true
 *
 * 사용 사례:
 * - 시험지 생성 시 문제 선택을 위한 단원 구조 표시
 * - 교육과정 관리 시스템에서 단원 탐색
 * - 통계 화면에서 단원별 데이터 필터링
 * - 문제 은행에서 단원별 문제 조회
 *
 * 성능 고려사항:
 * - 문제 포함 조회(includeQuestions=true)는 대용량 데이터이므로 CSR 권장
 * - 적절한 staleTime 설정으로 불필요한 재요청 방지
 * - 캐시 정책을 통한 사용자 경험 최적화
 *
 * @example
 * ```typescript
 * // 기본 사용법 - 전체 단원 트리 조회
 * const unitsTree = await fetchUnitsTree();
 *
 * // 학년별 조회
 * const grade1Units = await fetchUnitsTree({ grade: "1" });
 *
 * // 문제 포함 조회 (대용량 데이터)
 * const unitsWithProblems = await fetchUnitsTree({
 *   grade: "2",
 *   includeQuestions: true
 * });
 *
 * // 요청 취소 기능 포함
 * const controller = new AbortController();
 * const units = await fetchUnitsTree(
 *   { grade: "3", includeQuestions: true },
 *   { signal: controller.signal }
 * );
 *
 * // 컴포넌트에서 사용
 * const { data: unitsTree, isLoading, error } = useQuery({
 *   queryKey: ["units-tree", { grade: "1", includeQuestions: true }],
 *   queryFn: () => fetchUnitsTree({ grade: "1", includeQuestions: true })
 * });
 * ```
 *
 * @param params 단원 트리 조회 파라미터
 * @param params.grade 특정 학년으로 필터링 (선택사항)
 * @param params.includeQuestions 문제 목록 포함 여부 (기본값: false)
 * @param options 추가 옵션
 * @param options.signal 요청 취소를 위한 AbortSignal
 * @returns 계층적 단원 트리 구조 데이터
 * @throws {ApiResponseError} 백엔드에서 에러 응답을 반환한 경우
 * @throws {ApiError} 네트워크 오류 또는 인증 실패
 * @throws {Error} 기타 예상치 못한 오류
 */
export async function fetchUnitsTree(
  params?: UnitsTreeQueryParams,
  options?: Pick<AxiosRequestConfig, "signal">,
): Promise<UnitsTreeResponse> {
  // 백엔드 API 호출
  const backendResponse = await unitsTreeApiRequest<BackendUnitsTreeResponse>({
    method: "GET",
    url: "/tree",
    params: {
      grade: params?.grade,
      includeQuestions: params?.includeQuestions || false,
    },
    signal: options?.signal,
  });

  // 백엔드 응답을 프론트엔드 타입으로 변환
  return convertBackendResponseToUnitsTree(
    backendResponse,
    params?.grade,
    params?.includeQuestions || false,
  );
}

/**
 * 특정 학년의 문제 포함 단원 트리를 조회하는 편의 함수
 * @description fetchUnitsTree의 래퍼로, 문제 포함 조회에 최적화된 함수
 *
 * 주요 용도:
 * - 시험지 생성 시 문제 선택용 단원 트리 조회
 * - CSR 방식으로 로딩 스피너와 함께 사용 권장
 * - 대용량 데이터이므로 적절한 캐싱 전략 필요
 *
 * @example
 * ```typescript
 * // 1 학년의 문제 포함 단원 트리 조회
 * const unitsWithProblems = await fetchUnitsTreeWithProblems("1");
 *
 * // React Query와 함께 사용
 * const { data, isLoading, error } = useQuery({
 *   queryKey: ["units-tree-with-problems", grade],
 *   queryFn: () => fetchUnitsTreeWithProblems(grade),
 *   staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
 * });
 * ```
 *
 * @param grade 조회할 학년
 * @param options 추가 옵션
 * @returns 문제가 포함된 해당 학년의 단원 트리
 */
export async function fetchUnitsTreeWithProblems(
  grade: Grade,
  options?: Pick<AxiosRequestConfig, "signal">,
): Promise<UnitsTreeResponse> {
  return fetchUnitsTree(
    {
      grade,
      includeQuestions: true,
    },
    options,
  );
}

/**
 * 단원 트리 기본 구조만 조회하는 편의 함수
 * @description 문제 없이 단원 구조만 빠르게 조회하는 함수
 *
 * 주요 용도:
 * - 초기 페이지 로딩 시 단원 구조 미리보기
 * - SSR에서 단원 목록 사전 로드
 * - 단원 선택 UI의 초기 상태 구성
 *
 * @example
 * ```typescript
 * // 전체 단원 구조만 조회
 * const basicUnitsTree = await fetchBasicUnitsTree();
 *
 * // 특정 학년 단원 구조만 조회
 * const grade2BasicTree = await fetchBasicUnitsTree("2");
 * ```
 *
 * @param grade 조회할 학년 (선택사항)
 * @param options 추가 옵션
 * @returns 기본 단원 트리 구조 (문제 미포함)
 */
export async function fetchBasicUnitsTree(
  grade?: Grade,
  options?: Pick<AxiosRequestConfig, "signal">,
): Promise<UnitsTreeResponse> {
  return fetchUnitsTree(
    {
      grade,
      includeQuestions: false,
    },
    options,
  );
}
