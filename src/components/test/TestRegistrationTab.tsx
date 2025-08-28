// src/routes/test-paper/_components/TestRegistrationTab.tsx
import { useState } from "react";
import { useAtom } from "jotai";
import { selectedGradeAtom } from "@/atoms/grade";
import type { Grade } from "@/types/grade";
import SelectGrade from "../layout/SelectGrade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "../ui/textarea";

export function TestRegistrationTab() {
  // useState로 상태(state기억해야 할 데이터/사용자가 입력하는 값) 관리 추가
  const [selectedGrade, setSelectedGrade] = useAtom(selectedGradeAtom); // 선택한 학년(공통)
  const [gradeCount, setGradeCount] = useState<string>(""); // 학년 수 / 이 컴포넌트 안에서만 사용되는 지역 상태
  const [selectedTestName, setSelectedTestName] = useState<string>(""); // 시험 명                    
  const [testContent, setTestContent] = useState<string>(""); // 시험 내용
  
  const TestNameOptions = [
    { value: "midterm", label: "중간고사" },
    { value: "final", label: "기말고사" },
    { value: "unit", label: "단원평가" },
    { value: "mock", label: "모의고사" }
  ];
  
  // 제출 핸들러 함수 추가 / 유효성 검사(모든 필드 채워졌는지 확인)
  const handleSubmit = () => {
    if(!selectedGrade || !gradeCount || !selectedTestName || !testContent) {
      alert("모든 필드를 입력해주세요");
      return;
    }
    
    // 모든 필드가 채워지면 모든 데이터 객체 형태로 콘솔에 출력
    console.log("시험 출제 데이터:", {
      grade: selectedGrade,
      gradeCount,
      testName: selectedTestName,
      content: testContent
    });
  };

  return (
    <div className="space-y-10 w-full">
      <div className="text-[2.5rem] font-bold">시험 출제</div>
      
      <div className="flex w-full gap-3">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold">학년 선택</div>
          <SelectGrade />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold">학년 수</div>
          <Input 
            value={gradeCount} // 입력창에 현재 상태 값 표시
            className="w-40"
            onChange={(e) => setGradeCount(e.target.value)} // 사용자가 글자 입력할 때마다 새로운 값으로 업데이트
            placeholder="학년 수 입력"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold">시험 명</div>
        <Select value={selectedTestName} onValueChange={setSelectedTestName}>
          {/* 사용자가 선택한 옵션을 표시 / 상태 업데이트 */}
          <SelectTrigger>
            <SelectValue placeholder="시험 명을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {TestNameOptions.map(option => (
              // TestNameOptions 배열을 가져와서 option이라는 변수에 담은 뒤 
              // SelectItem 컴포넌트를 만들어서 반복문으로 출력
              <SelectItem key={option.value} value={option.value}>
                {/* key를 사용하여 각 옵션을 고유하게 식별 */}
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 ">
        <div className="text-lg font-semibold">내용 입력</div>
      </div>
        <Textarea 
          className="w-full h-[16rem] "
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          placeholder="내용을 입력하세요"
        />
      <div className="flex items-center justify-center pt-6">
        <Button 
          className="w-100 bg-blue-500 text-white hover:bg-blue-600"
          onClick={handleSubmit}
          // 버튼 클릭시 함수 실행
        >
          시험 출제
        </Button>
      </div>
    </div>
  );
}