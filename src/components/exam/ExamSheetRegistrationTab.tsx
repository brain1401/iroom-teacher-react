// src/components/exam/ExamRegistrationTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Users, Target } from "lucide-react";
import { useExamList } from "@/hooks/exam/useExamList";
import type { Exam, ExamLevel, ExamStatus } from "@/types/exam";

/**
 * 시험 출제 및 등록 탭 컴포넌트
 * @description 교사가 새로운 시험을 생성하고 출제하기 위한 종합적인 폼 컴포넌트
 *
 * 설계 원칙:
 * - 단계적 정보 입력: 학년 → 학생 수 → 시험명 순서로 직관적 입력 흐름
 * - 실시간 미리보기: 선택 정보에 따른 즉시 피드백 제공
 * - 사용자 경험 최우선: 복잡한 시험 출제 과정을 단순하게 추상화
 * - 데이터 검증: 모든 필수 정보 입력 완료 후에만 제출 가능
 * - 시각적 피드백: 선택 상태에 따른 미리보기 및 상태 표시
 *
 * 주요 기능:
 * - 학년 선택 시스템 (중1, 중2, 중3) - Select 드롭다운
 * - 학생 수 선택 옵션 (10, 15, 20, 25, 30명) - 유연한 클래스 크기 지원
 * - 시험명 선택 드롭다운 (8가지 사전 정의된 시험 유형)
 * - 실시간 시험 정보 미리보기 (3개 문제지 샘플 표시)
 * - 시험 구성 정보 표시 (문항 수, 객관식/주관식 비율, 시간, 난이도)
 * - 완전한 시험 출제 워크플로 (정보 입력 → 미리보기 → 출제 완료)
 * - 자동 시험 목록 업데이트 및 페이지 이동
 *
 * 워크플로:
 * 1. 기본 정보 입력 (학년, 학생 수, 시험명)
 * 2. 입력 정보 기반 미리보기 자동 생성
 * 3. 시험 구성 정보 확인 (문항 구성, 난이도 등)
 * 4. 시험 출제 버튼으로 최종 생성
 * 5. 시험 목록에 자동 추가 및 페이지 이동
 *
 * 상태 관리:
 * - selectedGrade: 현재 선택된 학년 ("중1", "중2", "중3")
 * - studentCount: 선택된 학생 수 (string 타입으로 Select 컴포넌트와 호환)
 * - selectedExamName: 선택된 시험명 (examNameOptions에서 선택)
 *
 * @example
 * ```tsx
 * // 기본 사용법 (탭 시스템 내에서)
 * <Tabs defaultValue="registration">
 *   <TabsList>
 *     <TabsTrigger value="list">시험 목록</TabsTrigger>
 *     <TabsTrigger value="registration">시험 출제</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="registration">
 *     <ExamRegistrationTab />
 *   </TabsContent>
 * </Tabs>
 *
 * // 독립적인 페이지로 사용
 * function ExamCreationPage() {
 *   return (
 *     <div className="container mx-auto py-6">
 *       <ExamRegistrationTab />
 *     </div>
 *   );
 * }
 * ```
 */
export function ExamSheetRegistrationTab() {
  const { addNewExam } = useExamList();

  // 상태 관리
  const [selectedGrade, setSelectedGrade] = useState<string>("중1");
  const [studentCount, setStudentCount] = useState<string>("20");
  const [selectedExamName, setSelectedExamName] = useState<string>("");

  // 시험명 옵션 (문제지명 선택)
  const examNameOptions = [
    { value: "2025-1학기 중간고사 대비", label: "2025-1학기 중간고사 대비" },
    { value: "단원 평가 (A)", label: "단원 평가 (A)" },
    { value: "단원 평가 (B)", label: "단원 평가 (B)" },
    { value: "2025-1학기 기말고사 대비", label: "2025-1학기 기말고사 대비" },
    { value: "오답노트 클리닉", label: "오답노트 클리닉" },
    { value: "심화 문제 풀이", label: "심화 문제 풀이" },
    { value: "월말 평가", label: "월말 평가" },
    { value: "온라인 모의고사", label: "온라인 모의고사" },
  ];

  // 학생 수 옵션
  const studentCountOptions = [
    { value: "10", label: "10" },
    { value: "15", label: "15" },
    { value: "20", label: "20" },
    { value: "25", label: "25" },
    { value: "30", label: "30" },
  ];

  /**
   * 시험 출제 및 등록 처리 핸들러
   * @description 사용자가 입력한 시험 정보를 검증하고 새로운 시험을 생성하여 시스템에 등록
   *
   * 처리 과정:
   * 1. 입력 데이터 유효성 검증 (학년, 학생수, 시험명 필수 확인)
   * 2. Exam 객체 생성 (기본값 포함한 완전한 시험 정보 구성)
   * 3. useExamList 훅을 통한 시험 목록 상태 업데이트
   * 4. 사용자 피드백 (성공 알림 메시지 표시)
   * 5. 시험 관리 페이지로 자동 리다이렉션
   *
   * 데이터 변환:
   * - 폼 입력값들을 Exam 타입 스키마에 맞게 변환
   * - 기본값 자동 설정 (문항수 20개, 난이도 "기초", 상태 "승인대기")
   * - unitName 자동 생성 (학년 + 과목 + 시험명 조합)
   *
   * 에러 처리:
   * - 필수 필드 누락 시 사용자 친화적 알림
   * - 조기 리턴을 통한 안전한 실행 흐름
   *
   * 사이드 이펙트:
   * - 전역 시험 목록 상태 업데이트 (useExamList.addNewExam)
   * - 브라우저 페이지 이동 (window.location.href)
   * - 사용자 알림 (alert - 향후 Toast로 개선 가능)
   *
   * 성능 고려사항:
   * - 폼 검증 로직이 가볍고 동기적 처리
   * - 페이지 이동으로 현재 컴포넌트 언마운트되어 메모리 정리
   *
   * 향후 개선 방안:
   * - alert 대신 Toast 컴포넌트 사용
   * - window.location.href 대신 React Router 사용
   * - 서버 API 연동으로 실제 시험 생성 처리
   * - 로딩 상태 표시 및 에러 처리 강화
   */
  const handleSubmit = () => {
    if (!selectedGrade || !studentCount || !selectedExamName) {
      alert("모든 필드를 입력해주세요");
      return;
    }

    // 새로운 시험 정보 생성
    const newExam: Omit<
      Exam,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "totalParticipants"
      | "actualParticipants"
    > = {
      unitName: `${selectedGrade} 수학 - ${selectedExamName}`,
      examName: selectedExamName,
      questionCount: 20, // 기본값
      questionLevel: "기초" as ExamLevel,
      status: "승인대기" as ExamStatus,
    };

    console.log("시험 출제 데이터:", {
      grade: selectedGrade,
      studentCount,
      examName: selectedExamName,
      newExam,
    });

    // 시험 목록에 추가
    addNewExam(newExam);

    alert("시험이 성공적으로 출제되었습니다! 시험 목록으로 이동합니다.");

    // 시험 목록 탭으로 이동
    window.location.href = "/main/exam-management";
  };

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">시험 출제</h1>
        <p className="text-sm text-muted-foreground">
          학년, 학생 수, 시험명을 선택하여 시험을 출제할 수 있습니다.
        </p>
      </div>

      {/* 시험 정보 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sky-600">시험 정보 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 학년 선택 */}
          <div className="space-y-2">
            <Label htmlFor="grade-select" className="text-base font-medium">
              학년 선택
            </Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="중1">중1</SelectItem>
                <SelectItem value="중2">중2</SelectItem>
                <SelectItem value="중3">중3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 학생 수 선택 */}
          <div className="space-y-2">
            <Label htmlFor="student-count" className="text-base font-medium">
              학생 수
            </Label>
            <Select value={studentCount} onValueChange={setStudentCount}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {studentCountOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 시험명 선택 */}
          <div className="space-y-2">
            <Label htmlFor="exam-name" className="text-base font-medium">
              시험명
            </Label>
            <Select
              value={selectedExamName}
              onValueChange={setSelectedExamName}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="시험지명 선택" />
              </SelectTrigger>
              <SelectContent>
                {examNameOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 미리보기 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sky-600 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            미리보기
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedExamName ? (
            <div className="space-y-6">
              {/* 시험 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="text-sm text-gray-600">시험명</div>
                    <div className="font-semibold">{selectedExamName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="text-sm text-gray-600">대상 학년</div>
                    <div className="font-semibold">{selectedGrade}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Target className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="text-sm text-gray-600">학생 수</div>
                    <div className="font-semibold">{studentCount}명</div>
                  </div>
                </div>
              </div>

              {/* 문제지 미리보기 (3개) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="text-center mb-3">
                      <h3 className="font-semibold text-sm text-gray-700">
                        ○○시험 문제지
                      </h3>
                    </div>

                    {/* 문제 예시 */}
                    <div className="space-y-3">
                      <div className="border-b pb-2">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium">1.</span>
                          <div className="text-xs text-gray-600 flex-1">
                            다음 중 올바른 것은?
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="text-xs">① 20</div>
                          <div className="text-xs">② 20√2</div>
                          <div className="text-xs">③ 25</div>
                          <div className="text-xs">④ 20√3</div>
                          <div className="text-xs">⑤ 30</div>
                        </div>
                      </div>

                      <div className="border-b pb-2">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium">2.</span>
                          <div className="text-xs text-gray-600 flex-1">
                            다음 도형의 넓이는?
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium">3.</span>
                          <div className="text-xs text-gray-600 flex-1">
                            다음 방정식을 풀어라.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 시험 상세 정보 */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3 text-gray-800">시험 구성</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">총 문항 수</div>
                    <Badge variant="outline" className="mt-1">
                      20문항
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">객관식</div>
                    <Badge
                      variant="outline"
                      className="mt-1 bg-blue-50 text-blue-700"
                    >
                      17문항
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">주관식</div>
                    <Badge
                      variant="outline"
                      className="mt-1 bg-green-50 text-green-700"
                    >
                      3문항
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">시험 시간</div>
                    <Badge variant="outline" className="mt-1">
                      60분
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">난이도</div>
                    <Badge
                      variant="outline"
                      className="mt-1 bg-orange-50 text-orange-700"
                    >
                      기초
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                시험명을 선택하면 미리보기가 표시됩니다
              </p>
              <p className="text-sm mt-2">위에서 시험 정보를 입력해주세요</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 시험 출제 버튼 */}
      <div className="flex justify-center pt-6">
        <Button
          className="w-full max-w-md h-12 text-lg font-semibold bg-sky-500 hover:bg-sky-600"
          onClick={handleSubmit}
          disabled={!selectedGrade || !studentCount || !selectedExamName}
        >
          시험 출제
        </Button>
      </div>
    </div>
  );
}
