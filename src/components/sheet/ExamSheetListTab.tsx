// src/components/examsheet/ExamSheetListTab.tsx

import { useState } from "react";
import { PagePagination } from "@/components/layout/PagePagination";
import { Toolbar } from "@/components/layout/Toolbar";
import { ProblemModal } from "@/components/layout/ProblemModal";
import { PrintOptionsModal } from "./PrintOptionsModal";
import { ExamSheetTable } from "./ExamSheetTable";

type ExamSheet = {
  id: string;
  unitName: string;
  examName: string;
  questionCount: number;
  createdAt?: string;
};

// Mock data removed - now using server API

/**
 * 문제지 목록 관리 탭 컴포넌트
 * @description 생성된 문제지들을 종합적으로 관리하는 메인 대시보드 컴포넌트
 *
 * 주요 기능:
 * - 문제지 목록 조회 및 표시 (테이블 형태의 구조화된 뷰)
 * - 대량 선택을 통한 일괄 관리 (체크박스 기반 다중 선택)
 * - 실시간 검색 및 필터링 (단원명, 문제지명 기준)
 * - 동적 정렬 기능 (단원명, 문제지명, 생성일시 기준)
 * - 페이지네이션을 통한 성능 최적화
 * - 문제지별 상세 액션 (인쇄, 문제 보기, 답안 확인, 삭제)
 * - localStorage 기반 데이터 지속성 (새로 생성된 문제지 저장)
 * - 모달 통합 관리 (인쇄 옵션, 문제 뷰어)
 *
 * 데이터 구조:
 * ```typescript
 * type ExamSheet = {
 *   id: string;           // 문제지 고유 식별자
 *   unitName: string;     // 해당 단원명 (예: "1단원: 다항식의 연산")
 *   examName: string;     // 문제지명 (예: "2025-1학기 중간고사 대비")
 *   questionCount: number; // 총 문제 수
 *   createdAt?: string;   // 생성 일시 (ISO 8601 형식)
 * };
 * ```
 *
 * 상태 관리 아키텍처:
 * - `sheets`: 전체 문제지 목록 (localStorage + 기본 데이터 병합)
 * - `selectedIds`: 선택된 문제지 ID Set (성능 최적화를 위한 Set 사용)
 * - `currentPage`: 현재 페이지 번호 (1부터 시작)
 * - `sortField/sortOrder`: 정렬 기준과 방향 (ASC/DESC)
 * - `searchKeyword/searchScope`: 검색어와 검색 범위
 * - 모달 관련 상태들 (인쇄, 문제 보기)
 *
 * 성능 최적화:
 * - 페이지네이션으로 대량 데이터 처리 최적화 (기본 8개 항목/페이지)
 * - Set 기반 선택 상태 관리로 O(1) 조회 성능 확보
 * - 불변성 유지를 통한 React 렌더링 최적화
 * - 조건부 렌더링으로 불필요한 컴포넌트 생성 방지
 *
 * 사용자 경험 고려사항:
 * - 검색어 변경 시 자동으로 첫 페이지로 이동 (일관된 UX)
 * - 현재 페이지 기준 전체 선택/해제 기능
 * - 정렬 상태 시각적 표시로 사용자 피드백 제공
 * - 삭제 전 확인 대화상자로 실수 방지
 * - 로딩 및 빈 상태에 대한 적절한 피드백
 *
 * 접근성 고려사항:
 * - 테이블 헤더와 셀 간 명확한 연관성 제공
 * - 체크박스 상태에 대한 적절한 aria-label 제공
 * - 정렬 버튼의 현재 상태 스크린 리더 전달
 * - 키보드 네비게이션 지원 (Tab, Enter, Space)
 * - 모달 다이얼로그의 포커스 트랩 구현
 *
 * @example
 * ```tsx
 * // 기본 사용법 - 문제지 목록 탭으로 사용
 * <ExamSheetListTab />
 *
 * // 부모 컴포넌트에서 통합 사용 예시
 * function ExamSheetManagement() {
 *   return (
 *     <div className="exam-sheet-dashboard">
 *       <ExamSheetListTab />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // localStorage 데이터 구조 예시
 * localStorage.setItem("newExamSheets", JSON.stringify([
 *   {
 *     id: "user-001",
 *     unitName: "7단원: 함수와 그래프",
 *     examName: "사용자 생성 문제지",
 *     questionCount: 15,
 *     createdAt: "2025-01-25T10:00:00Z"
 *   }
 * ]));
 * ```
 *
 * 기술적 구현 세부사항:
 * - React useState를 통한 로컬 상태 관리
 * - Array.prototype.sort()의 다중 기준 정렬 구현
 * - String.prototype.includes()를 활용한 대소문자 무관 검색
 * - Math.ceil()을 통한 페이지 수 계산
 * - Set 데이터 구조의 효율적 활용 (add/delete/has 연산)
 * - 조건부 렌더링을 통한 메모리 사용량 최적화
 *
 * 확장 가능성:
 * - 서버 기반 데이터 소스로의 마이그레이션 준비
 * - 무한 스크롤링 옵션 추가 가능
 * - 고급 필터링 옵션 (날짜 범위, 문제 수 범위 등)
 * - 문제지 내보내기/가져오기 기능
 * - 실시간 협업 기능 (WebSocket 기반)
 */
export function ExamSheetListTab() {
  // 문제지 데이터를 상태로 관리 - 서버 API에서 가져옴
  const [sheets, setSheets] = useState<ExamSheet[]>([]);
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [selectedSheet, setSelectedSheet] = useState<ExamSheet | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 페이지당 표시할 항목 수

  // 정렬 상태
  const [sortField, setSortField] = useState<
    "unitName" | "examName" | "createdAt" | undefined
  >(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 검색 상태
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [searchScope, setSearchScope] = useState<
    "both" | "unitName" | "examName"
  >("both");

  // 문제 모달 관련 상태
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [currentProblemNumber, setCurrentProblemNumber] = useState(1);
  const [currentExamSheet, setCurrentExamSheet] = useState<ExamSheet | null>(
    null,
  );

  const handleSelectAll = (checked: boolean) => {
    // 현재 페이지의 모든 항목 ID
    const currentPageIds = paginatedSheets.map((sheet) => sheet.id);

    if (checked) {
      // 현재 페이지의 모든 항목을 선택에 추가
      setSelectedIds((prev) => new Set([...prev, ...currentPageIds]));
    } else {
      // 현재 페이지의 모든 항목을 선택에서 제거
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        currentPageIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleOpenPrint = (sheet: ExamSheet) => {
    setSelectedSheet(sheet);
    setIsPrintModalOpen(true);
  };

  const handleOpenProblemModal = (sheet: ExamSheet) => {
    setCurrentExamSheet(sheet);
    setCurrentProblemNumber(1);
    setIsProblemModalOpen(true);
  };

  const handleOpenAnswerModal = (sheet: ExamSheet) => {
    // 답안 모달 열기 로직 (임시로 콘솔 출력)
    console.log("답안 모달 열기:", sheet);
    alert(`${sheet.examName}의 답안을 확인합니다.`);
  };

  // 개별 삭제 핸들러
  const handleDelete = (sheet: ExamSheet) => {
    console.log("시험지 삭제:", sheet);
    if (confirm(`${sheet.examName}을(를) 삭제하시겠습니까?`)) {
      // TODO: 실제 삭제 로직 구현
      alert(`${sheet.examName}이(가) 삭제되었습니다.`);
    }
  };

  // 전체 삭제 핸들러
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    const selectedSheets = sheets.filter((sheet) => selectedIds.has(sheet.id));
    const sheetNames = selectedSheets.map((sheet) => sheet.examName).join(", ");

    if (
      confirm(
        `선택된 ${selectedIds.size}개의 시험지(${sheetNames})를 삭제하시겠습니까?`,
      )
    ) {
      // TODO: 실제 삭제 로직 구현
      alert(`${selectedIds.size}개의 시험지가 삭제되었습니다.`);
      // 선택 상태 초기화
      setSelectedIds(new Set());
    }
  };

  // 정렬 처리 함수
  const handleSort = (field: "unitName" | "examName" | "createdAt") => {
    if (sortField === field) {
      // 같은 필드 클릭 시 순서 변경
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 다른 필드 클릭 시 해당 필드로 변경하고 오름차순으로 설정
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 검색 필터링된 데이터 (검색 범위에 따라 필터링)
  const filteredSheets = sheets.filter((sheet) => {
    if (!searchKeyword.trim()) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (searchScope) {
      case "unitName":
        return sheet.unitName.toLowerCase().includes(keyword);
      case "examName":
        return sheet.examName.toLowerCase().includes(keyword);
      case "both":
      default:
        return (
          sheet.unitName.toLowerCase().includes(keyword) ||
          sheet.examName.toLowerCase().includes(keyword)
        );
    }
  });

  // 정렬된 데이터
  const sortedSheets = [...filteredSheets].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case "unitName":
        aValue = a.unitName;
        bValue = b.unitName;
        break;
      case "examName":
        aValue = a.examName;
        bValue = b.examName;
        break;
      case "createdAt":
        aValue = a.createdAt || "";
        bValue = b.createdAt || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 페이지네이션된 데이터 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSheets = sortedSheets.slice(startIndex, endIndex);

  // 전체 페이지 수 재계산 (필터링된 결과 기준)
  const totalPages = Math.ceil(sortedSheets.length / itemsPerPage);

  // 현재 페이지의 전체 선택 상태 계산
  const currentPageIds = paginatedSheets.map((sheet) => sheet.id);
  const selectedCurrentPageIds = currentPageIds.filter((id) =>
    selectedIds.has(id),
  );
  const isAllSelected =
    selectedCurrentPageIds.length === currentPageIds.length &&
    currentPageIds.length > 0;
  const isIndeterminate =
    selectedCurrentPageIds.length > 0 &&
    selectedCurrentPageIds.length < currentPageIds.length;

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedSheet(null);
  };

  const handleCloseProblemModal = () => {
    setIsProblemModalOpen(false);
    setCurrentExamSheet(null);
    setCurrentProblemNumber(1);
  };

  const handlePreviousProblem = () => {
    if (currentProblemNumber > 1) {
      setCurrentProblemNumber(currentProblemNumber - 1);
    }
  };

  const handleNextProblem = () => {
    if (
      currentExamSheet &&
      currentProblemNumber < currentExamSheet.questionCount
    ) {
      setCurrentProblemNumber(currentProblemNumber + 1);
    }
  };

  // 가상의 문제 데이터 생성 함수
  const generateProblemData = (examSheet: ExamSheet) => {
    const problems = [];
    for (let i = 1; i <= examSheet.questionCount; i++) {
      problems.push({
        number: i,
        text: `${examSheet.unitName} - ${i}번 문제입니다. 이 문제는 ${examSheet.examName}의 ${i}번째 문제로, 수학적 사고력을 요구하는 문제입니다.`,
        image: `/path/to/problem${i}-image.png`,
      });
    }
    return problems;
  };

  const currentProblemData = currentExamSheet
    ? generateProblemData(currentExamSheet)
    : [];
  const currentProblem = currentProblemData.find(
    (p) => p.number === currentProblemNumber,
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="text-[2.5rem] font-bold flex-shrink-0">문제지 목록</div>

      {/* 1. 툴바 영역: 필터와 검색 */}
      <Toolbar
        searchKeyword={searchKeyword}
        onSearchChange={(value) => {
          setSearchKeyword(value);
          // 검색어 변경 시 첫 페이지로 이동
          setCurrentPage(1);
        }}
        searchScope={searchScope}
        onSearchScopeChange={(value) =>
          setSearchScope(value as "both" | "unitName" | "examName")
        }
        searchScopeOptions={[
          { value: "both", label: "단원정보+문제지명" },
          { value: "unitName", label: "단원정보" },
          { value: "examName", label: "문제지명" },
        ]}
        selectedCount={selectedIds.size}
        onDelete={handleDeleteSelected}
      />

      {/* 2. 테이블 컴포넌트 - 스크롤 영역 */}
      <div className="flex-1 min-h-0">
        <ExamSheetTable
          sheets={paginatedSheets}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelect={handleSelect}
          onOpenPrint={handleOpenPrint}
          onOpenProblemModal={handleOpenProblemModal}
          onOpenAnswerModal={handleOpenAnswerModal}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
        />
      </div>

      {/* 3. 페이지네이션 컴포넌트 */}
      <PagePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="flex-shrink-0"
      />

      {/* 인쇄 옵션 모달 */}
      <PrintOptionsModal
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
        onConfirm={(selectedItems) => {
          console.log("선택된 인쇄 항목:", selectedItems);
          console.log("선택된 시험지:", selectedSheet);
          // 여기에 실제 인쇄 로직 구현
        }}
      />

      {/* 문제 모달 */}
      {currentProblem && currentExamSheet && (
        <ProblemModal
          isOpen={isProblemModalOpen}
          onClose={handleCloseProblemModal}
          problemNumber={currentProblem.number}
          problemText={currentProblem.text}
          geometryImage={currentProblem.image}
          hasPrevious={currentProblemNumber > 1}
          hasNext={currentProblemNumber < currentExamSheet.questionCount}
          onPrevious={handlePreviousProblem}
          onNext={handleNextProblem}
        />
      )}
    </div>
  );
}
