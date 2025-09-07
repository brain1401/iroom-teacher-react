import type { AxiosRequestConfig } from "axios";
import { apiClient } from "@/api/client";
import type { Grade } from "@/types/grade";
import type { UnitsByGradeData } from "./types";
import type { ExamSheetListResponse } from "@/types/exam-sheet";

/**
 * 시험지 전용 API 클라이언트
 * @description 기본 인증 API 클라이언트를 확장하여 시험지 API 전용으로 설정
 *
 * 주요 기능:
 * - httpOnly 쿠키 기반 인증 지원
 * - 백엔드 표준 응답 형식 자동 처리 (ApiResponse<T>)
 * - 자동 에러 처리 및 토큰 갱신
 * - AbortController 지원으로 요청 취소 가능
 */
const examSheetApiClient = apiClient.create({
  baseURL: `${apiClient.defaults.baseURL}/exam-sheet`,
});

/**
 * 시험지 API 공통 요청 함수
 * @description 모든 시험지 API 호출에서 공통으로 사용하는 요청 처리 함수
 * @template T API 응답 데이터 타입
 * @param config Axios 요청 설정 객체
 * @returns API 응답 데이터 (백엔드 표준 응답에서 data 부분만 추출)
 */
async function examSheetApiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await examSheetApiClient.request<T>(config);
  return response.data;
}

/**
 * 학년별 단원 목록을 조회하는 함수
 * @description 선택한 학년에 해당하는 모든 단원 목록을 가져오는 함수
 *
 * 주요 기능:
 * - 학년별로 필터링된 단원 목록 반환
 * - httpOnly 쿠키를 통한 자동 인증 처리
 * - AbortController를 통한 요청 취소 지원
 * - 백엔드 표준 응답 형식 자동 처리
 * - 방어적 프로그래밍으로 안전한 데이터 처리
 *
 * 사용 사례:
 * - 시험지 생성 시 단원 선택
 * - 통계 화면에서 학년별 단원 필터링
 * - 문제 은행에서 단원별 문제 조회
 *
 * @example
 * ```typescript
 * // 기본 사용법
 * const units = await getUnitsByGrade("1");
 *
 * // 요청 취소 기능 포함
 * const controller = new AbortController();
 * const units = await getUnitsByGrade("고2", { signal: controller.signal });
 *
 * // 컴포넌트에서 사용
 * const { data: units, isLoading, error } = useQuery({
 *   queryKey: ["units", selectedGrade],
 *   queryFn: () => getUnitsByGrade(selectedGrade)
 * });
 * ```
 *
 * @param grade 조회하고자 하는 학년 ("1" ~ "3")
 * @param options 추가 옵션
 * @param options.signal 요청 취소를 위한 AbortSignal
 * @returns 해당 학년의 단원 목록 데이터
 * @throws {ApiResponseError} 백엔드에서 에러 응답을 반환한 경우
 * @throws {ApiError} 네트워크 오류 또는 인증 실패
 * @throws {Error} 기타 예상치 못한 오류
 */
export async function getUnitsByGrade(
  grade: Grade,
  options?: Pick<AxiosRequestConfig, "signal">,
): Promise<UnitsByGradeData> {
  return examSheetApiRequest<UnitsByGradeData>({
    method: "GET",
    url: "/units",
    params: { grade },
    signal: options?.signal,
  });
}

/**
 * 시험지 목록을 조회하는 함수
 * @description 페이징, 정렬, 필터링이 적용된 시험지 목록을 가져오는 함수
 *
 * 주요 기능:
 * - 페이징 지원 (page, size)
 * - 정렬 지원 (sort, direction)
 * - 학년별 필터링 (grade)
 * - 검색어 필터링 (search - 시험지명, 단원명)
 * - httpOnly 쿠키를 통한 자동 인증 처리
 * - AbortController를 통한 요청 취소 지원
 * - 백엔드 표준 응답 형식 자동 처리
 * - 방어적 프로그래밍으로 안전한 데이터 처리
 *
 * 사용 사례:
 * - 시험지 목록 페이지에서 목록 조회
 * - 검색 및 필터링된 시험지 조회
 * - 페이지네이션을 통한 대량 데이터 처리
 * - SSR에서 초기 데이터 사전 로드
 *
 * @example
 * ```typescript
 * // 기본 목록 조회
 * const sheets = await getExamSheetsList({
 *   page: 0,
 *   size: 10,
 *   sort: "createdAt",
 *   direction: "DESC"
 * });
 *
 * // 필터링과 검색
 * const filteredSheets = await getExamSheetsList({
 *   page: 0,
 *   size: 20,
 *   sort: "examName",
 *   direction: "ASC",
 *   grade: "1",
 *   search: "중간고사"
 * });
 *
 * // 요청 취소 기능 포함
 * const controller = new AbortController();
 * const sheets = await getExamSheetsList(params, { signal: controller.signal });
 * ```
 *
 * @param params 시험지 목록 조회 파라미터
 * @param params.page 현재 페이지 (0부터 시작)
 * @param params.size 페이지당 항목 수 (1-100)
 * @param params.sort 정렬 필드 (createdAt, examName, totalQuestions 등)
 * @param params.direction 정렬 방향 ("ASC" | "DESC")
 * @param params.grade 학년 필터 (선택사항)
 * @param params.search 검색 키워드 (선택사항, 시험지명/단원명 통합 검색)
 * @param options 추가 옵션
 * @param options.signal 요청 취소를 위한 AbortSignal
 * @returns 페이지네이션된 시험지 목록 데이터
 * @throws {ApiResponseError} 백엔드에서 에러 응답을 반환한 경우
 * @throws {ApiError} 네트워크 오류 또는 인증 실패
 * @throws {Error} 기타 예상치 못한 오류
 */
export async function getExamSheetsList(
  params: {
    page: number;
    size: number;
    sort: string;
    direction: "desc" | "asc";
    grade?: number;
    search?: string;
  },
  options?: Pick<AxiosRequestConfig, "signal">,
): Promise<ExamSheetListResponse> {
  // 새 API 엔드포인트 /exam-sheets 사용
  return apiClient
    .request<ExamSheetListResponse>({
      method: "GET",
      url: "/exam-sheets",
      params: {
        page: params.page,
        size: params.size,
        sort: params.sort,
        direction: params.direction,
        grade: params.grade,
        search: params.search?.trim() || undefined,
      },
      signal: options?.signal,
    })
    .then((response) => response.data);
}
