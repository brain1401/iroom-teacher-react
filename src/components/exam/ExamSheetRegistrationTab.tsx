// src/components/exam/ExamRegistrationTab.tsx
import { useState } from "react";
import { useAtomValue } from "jotai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  FileText,
  Target,
  BookOpen,
  Calculator,
} from "lucide-react";
import {
  UnitsTreeProblemSelector,
  SelectedProblemsPanel,
} from "@/components/units-tree";
import {
  selectedProblemsStatsAtom,
  selectedProblemsDetailAtom,
} from "@/atoms/unitsTree";

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
 * - 학년 선택 시스템 (1, 2, 3) - Select 드롭다운
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
 * - selectedGrade: 현재 선택된 학년 ("1", "2", "3")
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
  const stats = useAtomValue(selectedProblemsStatsAtom);
  const selectedProblemsDetail = useAtomValue(selectedProblemsDetailAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examName, setExamName] = useState<string>("");

  /**
   * 선택된 문제들에서 학년 자동 추출
   * @description 선택된 문제들이 속한 단원의 학년 정보를 자동으로 추출
   * 모든 문제는 동일한 학년이어야 함
   */
  const extractGradeFromProblems = (): number => {
    // 여기서는 일단 기본값 1을 반환 (나중에 문제 데이터에서 학년 정보 추출)
    // TODO: 실제 구현 시 문제 데이터에서 학년 정보 추출
    return 1;
  };

  /**
   * 선택된 문제들을 API 요청 형식으로 변환
   * @description selectedProblemsDetail의 데이터를 API 요청 형식에 맞게 변환
   */
  const prepareQuestionsForAPI = () => {
    const questions: Array<{
      questionId: string;
      questionOrder: number;
      points: number;
    }> = [];

    let questionOrder = 1;
    selectedProblemsDetail.forEach((unit) => {
      unit.problems.forEach((problem) => {
        questions.push({
          questionId: problem.id,
          questionOrder: questionOrder++,
          points: problem.points || 10, // 기본 배점 10점
        });
      });
    });

    return questions;
  };

  /**
   * 시험지 생성 처리 핸들러
   * @description 입력된 정보와 선택된 문제들로 시험지 생성
   */
  const handleSubmit = async () => {
    if (!examName.trim()) {
      alert("시험지명을 입력해주세요");
      return;
    }

    if (stats.totalCount === 0) {
      alert("문제를 선택해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      const { createExamSheet } = await import("@/api/exam-sheet/api");
      
      const requestData = {
        examName: examName.trim(),
        grade: extractGradeFromProblems(),
        questions: prepareQuestionsForAPI(),
      };

      console.log("시험지 생성 요청 데이터:", requestData);

      const result = await createExamSheet(requestData);
      
      console.log("시험지 생성 성공:", result);
      alert("시험지가 성공적으로 생성되었습니다!");
      
      // 시험지 목록 페이지로 이동
      window.location.href = "/main/exam/sheet/manage?tab=list";
    } catch (error) {
      console.error("시험지 생성 실패:", error);
      
      // 에러 메시지 처리
      let errorMessage = "시험지 생성에 실패했습니다.";
      if (error instanceof Error) {
        errorMessage += ` (${error.message})`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">문제지 등록</h1>
        <p className="text-sm text-muted-foreground">
          문제를 선택하여 새로운 시험지를 생성할 수 있습니다.
        </p>
      </div>

      {/* 시험지명 입력 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sky-600">시험지 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="exam-name" className="text-base font-medium">
              시험지명
            </Label>
            <Input
              id="exam-name"
              type="text"
              placeholder="예: 2025-1학기 중간고사"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="h-12 max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* 문제 선택 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sky-600 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            문제 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 문제 트리 선택기 */}
            <div>
              <h3 className="text-sm font-semibold mb-3">단원별 문제 목록</h3>
              <UnitsTreeProblemSelector />
            </div>

            {/* 선택된 문제 패널 */}
            <div>
              <h3 className="text-sm font-semibold mb-3">선택된 문제</h3>
              <SelectedProblemsPanel />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시험 정보 요약 */}
      {stats.totalCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sky-600 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              시험지 정보 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="text-sm text-gray-600">시험지명</div>
                    <div className="font-semibold">{examName || "미입력"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Target className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="text-sm text-gray-600">총 문항</div>
                    <div className="font-semibold">{stats.totalCount}문항</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calculator className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="text-sm text-gray-600">총 배점</div>
                    <div className="font-semibold">{stats.totalPoints}점</div>
                  </div>
                </div>
              </div>

              {/* 문제 구성 정보 */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3 text-gray-800">문제 구성</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">총 문항 수</div>
                    <Badge variant="outline" className="mt-1">
                      {stats.totalCount}문항
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">객관식</div>
                    <Badge
                      variant="outline"
                      className="mt-1 bg-blue-50 text-blue-700"
                    >
                      {stats.objectiveCount}문항
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">주관식</div>
                    <Badge
                      variant="outline"
                      className="mt-1 bg-green-50 text-green-700"
                    >
                      {stats.subjectiveCount}문항
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">단원 수</div>
                    <Badge variant="outline" className="mt-1">
                      {stats.unitCount}개
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 단원별 문제 분포 */}
              {selectedProblemsDetail.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3 text-gray-800">
                    단원별 문제 분포
                  </h3>
                  <div className="space-y-2">
                    {selectedProblemsDetail.map((unit) => (
                      <div
                        key={unit.unitId}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {unit.categoryName}
                          </Badge>
                          <span className="text-sm">{unit.unitName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {unit.problemCount}문제
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {unit.totalPoints}점
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 시험지 생성 버튼 */}
      <div className="flex justify-center pt-6">
        <Button
          className="w-full max-w-md h-12 text-lg font-semibold bg-sky-500 hover:bg-sky-600"
          onClick={handleSubmit}
          disabled={
            !examName.trim() ||
            stats.totalCount === 0 ||
            isSubmitting
          }
        >
          {isSubmitting ? "생성 중..." : "시험지 생성"}
        </Button>
      </div>
    </div>
  );
}