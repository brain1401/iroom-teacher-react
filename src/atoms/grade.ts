import { atom } from "jotai";
import type { Grade } from "@/types/grade";

/**
 * 선택 학년 전역 상태 atom
 * @description 통계/시험지 등 학년 기반 화면에서 공통 사용
 *
 * 주요 기능:
 * - 기본값: "중1"
 * - Select 컴포넌트와 양방향 바인딩
 */
export const /**
 * Jotai 학년 상태 관리란?
 * - 전역 상태 관리 라이브러리로 Redux, Zustand와 비슷한 역할
 * - useState와 비슷하지만 여러 컴포넌트에서 공유 가능
 * - atom이라는 작은 상태 단위로 관리
 * - 학년별 데이터 필터링, 통계, 시험지 관리 등에서 공통 사용
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Grade } from "@/types/grade";

/**
 * 현재 선택된 학년을 관리하는 전역 상태 atom
 * @description 애플리케이션 전체에서 사용되는 학년 선택 상태를 관리
 *
 * 설계 원칙:
 * - 전역 상태: 여러 페이지/컴포넌트에서 공통 사용
 * - 기본값: "중1" (가장 일반적인 시작 학년)
 * - 타입 안전성: Grade 리터럴 타입으로 제한
 *
 * 주요 사용 사례:
 * - 시험지 목록 페이지: 학년별 시험지 필터링
 * - 통계 대시보드: 학년별 성적 분석
 * - 성적 분포 차트: 특정 학년 데이터 시각화
 * - 학생 관리: 학년별 학생 목록 조회
 *
 * 기존 useState와 비교:
 * ```typescript
 * // ❌ 기존 방식 (각 컴포넌트마다 따로 관리)
 * function TestPaperListPage() {
 *   const [selectedGrade, setSelectedGrade] = useState<Grade>("중1");
 *   // 다른 페이지로 이동하면 상태 소실됨
 * }
 *
 * function StatisticsPage() {
 *   const [selectedGrade, setSelectedGrade] = useState<Grade>("중1");
 *   // 시험지 페이지와 별개로 관리됨 - 일관성 문제
 * }
 *
 * // ✅ Jotai 방식 (전역에서 공유)
 * function TestPaperListPage() {
 *   // 📌 값과 설정 함수 모두 필요 - useAtom 사용
 *   const [selectedGrade, setSelectedGrade] = useAtom(selectedGradeAtom);
 * }
 *
 * function StatisticsPage() {
 *   // 📌 값만 읽는 경우 - useAtomValue 사용 (성능 최적화)
 *   const selectedGrade = useAtomValue(selectedGradeAtom);
 * }
 *
 * function GradeSelector() {
 *   // 📌 설정만 필요한 경우 - useSetAtom 사용 (렌더링 최적화)
 *   const setSelectedGrade = useSetAtom(selectedGradeAtom);
 * }
 * ```
 *
 * 활용 예시:
 * ```typescript
 * // 컴포넌트에서 학년 선택 처리
 * function GradeSelector() {
 *   const [selectedGrade, setSelectedGrade] = useAtom(selectedGradeAtom);
 *
 *   return (
 *     <Select
 *       value={selectedGrade}
 *       onValueChange={(value: Grade) => setSelectedGrade(value)}
 *     >
 *       <SelectItem value="중1">중학교 1학년</SelectItem>
 *       <SelectItem value="중2">중학교 2학년</SelectItem>
 *       <SelectItem value="중3">중학교 3학년</SelectItem>
 *     </Select>
 *   );
 * }
 *
 * // 다른 컴포넌트에서 선택된 학년 사용
 * function TestPaperList() {
 *   const selectedGrade = useAtomValue(selectedGradeAtom);
 *   
 *   const { data: testPapers } = useQuery({
 *     queryKey: ['testPapers', selectedGrade],
 *     queryFn: () => fetchTestPapersByGrade(selectedGrade),
 *   });
 *
 *   return (
 *     <div>
 *       <h2>{selectedGrade} 시험지 목록</h2>
 *       {testPapers?.map(paper => <TestPaperCard key={paper.id} {...paper} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export const selectedGradeAtom = atom<Grade>("중1");

/**
 * 학년별 선호 설정을 영구 저장하는 atom
 * @description 사용자별 학년 선택 기본값을 localStorage에 저장
 *
 * 설계 원칙:
 * - 영구 저장: 브라우저 재시작 후에도 유지
 * - 사용자 경험: 이전 선택한 학년을 기억
 * - 개인화: 사용자별 맞춤 설정
 *
 * 작동 방식:
 * 1. 최초 방문 시: "중1" 기본값 설정
 * 2. 학년 변경 시: localStorage에 자동 저장
 * 3. 재방문 시: 이전 선택 학년으로 자동 복구
 *
 * 사용 예시:
 * ```typescript
 * function App() {
 *   // 📌 영구 저장된 학년 설정을 기본값으로 사용
 *   const [preferredGrade, setPreferredGrade] = useAtom(preferredGradeAtom);
 *   const setSelectedGrade = useSetAtom(selectedGradeAtom);
 *
 *   // 앱 시작 시 이전 선택 학년으로 복구
 *   useEffect(() => {
 *     setSelectedGrade(preferredGrade);
 *   }, [preferredGrade, setSelectedGrade]);
 *
 *   // 학년 변경 시 영구 저장
 *   const handleGradeChange = (newGrade: Grade) => {
 *     setSelectedGrade(newGrade);
 *     setPreferredGrade(newGrade); // localStorage에 저장
 *   };
 * }
 * ```
 */
export const preferredGradeAtom = atomWithStorage<Grade>("preferred-grade", "중1");

/**
 * 학년별 표시 이름을 반환하는 derived atom
 * @description 선택된 학년의 한글 표시명을 계산하는 atom
 *
 * Jotai Best Practice 적용:
 * - 컴포넌트의 useMemo 대신 derived atom 사용
 * - 비즈니스 로직을 atom 레벨에서 처리
 * - 재사용 가능한 계산 로직 캡슐화
 *
 * 작동 방식:
 * 1. selectedGradeAtom의 값을 읽어옴
 * 2. Grade 타입에 따라 적절한 한글 표시명 반환
 * 3. selectedGradeAtom이 변경될 때마다 자동 재계산
 *
 * 사용 예시:
 * ```typescript
 * function GradeDisplay() {
 *   // 📌 derived atom은 값만 읽으므로 useAtomValue 사용
 *   const gradeDisplayName = useAtomValue(gradeDisplayNameAtom);
 *   
 *   return (
 *     <h1>현재 선택: {gradeDisplayName}</h1>
 *     // 출력 예시: "현재 선택: 중학교 1학년"
 *   );
 * }
 * ```
 */
export const gradeDisplayNameAtom = atom((get) => {
  const grade = get(selectedGradeAtom);
  
  const gradeNames: Record<Grade, string> = {
    "중1": "중학교 1학년",
    "중2": "중학교 2학년", 
    "중3": "중학교 3학년",
  };
  
  return gradeNames[grade];
});

/**
 * 학년별 통계 요약 정보를 관리하는 derived atom
 * @description 선택된 학년의 각종 통계 정보를 계산하는 atom
 *
 * 주요 기능:
 * - 학년별 학생 수 계산
 * - 시험지 개수 통계
 * - 평균 점수 계산
 * - 성적 분포 요약
 *
 * 설계 특징:
 * - 복잡한 계산 로직을 atom으로 캡슐화
 * - 여러 컴포넌트에서 재사용 가능
 * - 의존성 변경 시 자동 재계산
 *
 * 사용 예시:
 * ```typescript
 * function GradeStatistics() {
 *   const stats = useAtomValue(gradeStatsSummaryAtom);
 *   
 *   if (!stats) {
 *     return <div>통계 정보를 불러오는 중...</div>;
 *   }
 *   
 *   return (
 *     <div className="stats-grid">
 *       <StatCard title="총 학생 수" value={stats.totalStudents} />
 *       <StatCard title="시험지 개수" value={stats.totalTestPapers} />
 *       <StatCard title="평균 점수" value={`${stats.averageScore}점`} />
 *     </div>
 *   );
 * }
 * ```
 */
export const gradeStatsSummaryAtom = atom((get) => {
  const selectedGrade = get(selectedGradeAtom);
  
  // 실제 구현에서는 API 호출이나 다른 atom들의 데이터를 조합
  // 여기서는 예시를 위한 기본 구조만 제공
  return {
    grade: selectedGrade,
    totalStudents: 0,
    totalTestPapers: 0,
    averageScore: 0,
    lastUpdated: new Date().toISOString(),
  };
});

/**
 * 학년 변경 이벤트를 처리하는 action atom
 * @description 학년 변경 시 필요한 부수 효과들을 처리하는 atom
 *
 * 주요 처리 사항:
 * - 선택 학년 변경
 * - 영구 저장 설정 업데이트
 * - 관련 캐시 무효화
 * - 분석 이벤트 로깅
 *
 * 사용 예시:
 * ```typescript
 * function GradeSelector() {
 *   const changeGrade = useSetAtom(changeGradeActionAtom);
 *   
 *   const handleGradeChange = (newGrade: Grade) => {
 *     changeGrade(newGrade);
 *   };
 *   
 *   return (
 *     <Select onValueChange={handleGradeChange}>
 *       {/* 옵션들 */}
 *     </Select>
 *   );
 * }
 * ```
 */
export const changeGradeActionAtom = atom(
  null, // 읽기 함수는 null (write-only atom)
  (get, set, newGrade: Grade) => {
    // 1. 현재 선택 학년 업데이트
    set(selectedGradeAtom, newGrade);
    
    // 2. 영구 저장 설정 업데이트
    set(preferredGradeAtom, newGrade);
    
    // 3. 개발 환경에서 로깅
    if (import.meta.env.DEV) {
      console.log(`[Grade] 학년 변경: ${newGrade}`);
    }
    
    // 4. 실제 구현에서는 관련 쿼리 무효화 등 추가 처리
    // queryClient.invalidateQueries(['testPapers', newGrade]);
  }
);;
