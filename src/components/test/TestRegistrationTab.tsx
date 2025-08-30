// src/components/test/TestRegistrationTab.tsx
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
import { useTestList } from "@/hooks/test/useTestList";
import type { Test, TestLevel, TestStatus } from "@/types/test";

/**
 * 시험 출제 탭 컴포넌트
 * @description 이미지와 동일한 구조로 시험 출제 정보 입력 및 미리보기 기능 제공
 *
 * 주요 기능:
 * - 학년 선택 (중1, 중2, 중3)
 * - 학생 수 선택 (10, 15, 20, 25, 30)
 * - 시험명 선택 (문제지명 선택)
 * - 시험 출제 미리보기 (3개의 문제지 미리보기)
 * - 시험 출제 실행 및 목록 탭으로 이동
 */
export function TestRegistrationTab() {
  const { addNewTest } = useTestList();

  // 상태 관리
  const [selectedGrade, setSelectedGrade] = useState<string>("중1");
  const [studentCount, setStudentCount] = useState<string>("20");
  const [selectedTestName, setSelectedTestName] = useState<string>("");

  // 시험명 옵션 (문제지명 선택)
  const testNameOptions = [
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
   * 시험 출제 핸들러
   * @description 시험 출제 완료 후 목록 탭으로 이동하고 새로운 시험을 목록에 추가
   */
  const handleSubmit = () => {
    if (!selectedGrade || !studentCount || !selectedTestName) {
      alert("모든 필드를 입력해주세요");
      return;
    }

    // 새로운 시험 정보 생성
    const newTest: Omit<
      Test,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "totalParticipants"
      | "actualParticipants"
    > = {
      unitName: `${selectedGrade} 수학 - ${selectedTestName}`,
      testName: selectedTestName,
      questionCount: 20, // 기본값
      questionLevel: "기초" as TestLevel,
      status: "승인대기" as TestStatus,
    };

    console.log("시험 출제 데이터:", {
      grade: selectedGrade,
      studentCount,
      testName: selectedTestName,
      newTest,
    });

    // 시험 목록에 추가
    addNewTest(newTest);

    alert("시험이 성공적으로 출제되었습니다! 시험 목록으로 이동합니다.");

    // 시험 목록 탭으로 이동
    window.location.href = "/main/test-management";
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
            <Label htmlFor="test-name" className="text-base font-medium">
              시험명
            </Label>
            <Select
              value={selectedTestName}
              onValueChange={setSelectedTestName}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="시험지명 선택" />
              </SelectTrigger>
              <SelectContent>
                {testNameOptions.map((option) => (
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
          {selectedTestName ? (
            <div className="space-y-6">
              {/* 시험 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="text-sm text-gray-600">시험명</div>
                    <div className="font-semibold">{selectedTestName}</div>
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
          disabled={!selectedGrade || !studentCount || !selectedTestName}
        >
          시험 출제
        </Button>
      </div>
    </div>
  );
}
