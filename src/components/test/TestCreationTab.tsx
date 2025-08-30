import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import type { TestPaper } from "@/types/test-paper";

/**
 * 시험 출제 탭 컴포넌트
 * @description 시험명 입력과 문제지 선택을 통해 시험을 출제하는 화면
 */
export function TestCreationTab() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    testName: "",
    selectedTestPaperId: "",
  });
  const [testPapers, setTestPapers] = useState<TestPaper[]>([]);

  // 문제지 목록 로드
  useEffect(() => {
    const loadTestPapers = () => {
      try {
        // localStorage에서 새로 생성된 문제지들 불러오기
        const newPapers = JSON.parse(
          localStorage.getItem("newTestPapers") || "[]",
        );
        // 기존 문제지 데이터와 합치기 (실제로는 API에서 가져올 것)
        const allPapers = [...newPapers, ...GetMockTestPapers()];
        setTestPapers(allPapers);
      } catch (error) {
        console.error("문제지 목록 로드 실패:", error);
        toast.error("문제지 목록을 불러오는데 실패했습니다.");
      }
    };

    loadTestPapers();
  }, []);

  // 선택된 문제지 정보
  const selectedTestPaper = testPapers.find(
    (paper) => paper.id === formData.selectedTestPaperId,
  );

  // 시험 출제 핸들러
  const handleCreateTest = async () => {
    if (!formData.testName.trim()) {
      toast.error("시험명을 입력해주세요.");
      return;
    }

    if (!formData.selectedTestPaperId) {
      toast.error("문제지를 선택해주세요.");
      return;
    }

    setIsCreating(true);

    try {
      // 시험 출제 로직 (실제로는 API 호출)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 성공 메시지 표시
      toast.success("시험이 성공적으로 출제되었습니다!");

      // 시험 목록 탭으로 이동
      setTimeout(() => {
        window.location.href = "/main/test-management";
      }, 1500);
    } catch (error) {
      toast.error("시험 출제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">시험 출제</h1>
        <p className="text-sm text-muted-foreground">
          시험명을 입력하고 문제지를 선택하여 시험을 출제할 수 있습니다.
        </p>
      </div>

      {/* 시험 출제 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>시험 정보 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 시험명 입력 */}
          <div className="space-y-2">
            <Label htmlFor="testName" className="text-base font-medium">
              시험명 *
            </Label>
            <Input
              id="testName"
              value={formData.testName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, testName: e.target.value }))
              }
              placeholder="시험명을 입력하세요"
              className="h-12"
            />
          </div>

          {/* 문제지 선택 */}
          <div className="space-y-2">
            <Label htmlFor="testPaper" className="text-base font-medium">
              문제지 선택 *
            </Label>
            <Select
              value={formData.selectedTestPaperId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, selectedTestPaperId: value }))
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="문제지를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {testPapers.map((paper) => (
                  <SelectItem key={paper.id} value={paper.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{paper.testName}</span>
                      <Badge variant="outline" className="ml-2">
                        {paper.questionCount}문항
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 선택된 문제지 정보 */}
          {selectedTestPaper && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">선택된 문제지 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">문제지명:</span>
                  <span>{selectedTestPaper.testName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">단원:</span>
                  <span className="truncate max-w-xs">
                    {selectedTestPaper.unitName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">문항 수:</span>
                  <span>{selectedTestPaper.questionCount}문항</span>
                </div>
                {selectedTestPaper.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">생성일:</span>
                    <span>
                      {new Date(
                        selectedTestPaper.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 시험 출제 버튼 */}
          <div className="flex justify-center pt-6">
            <Button
              size="lg"
              className="w-full max-w-md h-12 text-lg font-semibold"
              onClick={handleCreateTest}
              disabled={
                isCreating ||
                !formData.testName.trim() ||
                !formData.selectedTestPaperId
              }
            >
              {isCreating ? "출제 중..." : "시험 출제"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 임시 문제지 데이터 (실제로는 API에서 가져올 것)
function GetMockTestPapers(): TestPaper[] {
  return [
    {
      id: "mock-paper-1",
      testName: "1단원 기초 문제",
      unitName: "1단원 - 수와 연산",
      questionCount: 20,
      createdAt: "2024-01-15T00:00:00.000Z",
    },
    {
      id: "mock-paper-2",
      testName: "2단원 심화 문제",
      unitName: "2단원 - 방정식과 부등식",
      questionCount: 15,
      createdAt: "2024-01-16T00:00:00.000Z",
    },
    {
      id: "mock-paper-3",
      testName: "3단원 종합 문제",
      unitName: "3단원 - 함수",
      questionCount: 25,
      createdAt: "2024-01-17T00:00:00.000Z",
    },
  ];
}
