import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PagePagination } from "./PagePagination";
import { ProblemModal } from "./ProblemModal";

export function ExamList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProblemNumber, setCurrentProblemNumber] = useState(1);

  // 가상의 문제 데이터 (실제로는 API에서 가져올 데이터)
  const problemData = [
    {
      number: 1,
      text: "다음 그림의 원 O에서 AB = CD, OM⊥CD 이고 OA = 5√2cm, OM=5cm일 때, △OAB의 넓이는 몇 cm²인가?",
      image: "/path/to/problem1-image.png",
    },
    {
      number: 2,
      text: "이차함수 y = ax² + bx + c의 그래프가 점 (1, 2)를 지나고, x축과 두 점에서 만날 때, a + b + c의 값은?",
      image: "/path/to/problem2-image.png",
    },
    {
      number: 3,
      text: "삼각형 ABC에서 ∠A = 60°, ∠B = 45°, AB = 6cm일 때, BC의 길이는?",
      image: "/path/to/problem3-image.png",
    },
    {
      number: 4,
      text: "함수 f(x) = x³ - 3x² + 2x + 1의 극값을 구하시오.",
      image: "/path/to/problem4-image.png",
    },
    {
      number: 5,
      text: "수열 {an}이 a₁ = 1, an+1 = 2an + 1 (n ≥ 1)을 만족할 때, a₅의 값은?",
      image: "/path/to/problem5-image.png",
    },
  ];

  const handleOpenProblem = (problemNumber: number) => {
    setCurrentProblemNumber(problemNumber);
    setIsModalOpen(true);
  };

  const handlePrevious = () => {
    if (currentProblemNumber > 1) {
      setCurrentProblemNumber(currentProblemNumber - 1);
    }
  };

  const handleNext = () => {
    if (currentProblemNumber < problemData.length) {
      setCurrentProblemNumber(currentProblemNumber + 1);
    }
  };

  const currentProblem = problemData.find(
    (p) => p.number === currentProblemNumber,
  );

  return (
    <div className="w-full space-y-6">
      <div className="text-[1.6rem] font-bold">"입력한 시험지명" 문제 목록</div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[120px]">문제번호</TableHead>
                <TableHead>단원정보</TableHead>
                <TableHead>문항유형</TableHead>
                <TableHead>난이도</TableHead>
                <TableHead className="text-right pr-6">
                  문제 상세 보기
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problemData.map((problem) => (
                <TableRow key={problem.number}>
                  <TableCell className="w-[50px]"></TableCell>
                  <TableCell>{problem.number}번</TableCell>
                  <TableCell>r.unit</TableCell>
                  <TableCell>r.type</TableCell>
                  <TableCell>r.level</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenProblem(problem.number)}
                    >
                      문제 상세
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <PagePagination />
      </div>

      <div>
        <Button className="w-full h-11">시험지 생성</Button>
      </div>

      {/* 문제 상세 모달 */}
      {currentProblem && (
        <ProblemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          problemNumber={currentProblem.number}
          problemText={currentProblem.text}
          geometryImage={currentProblem.image}
          hasPrevious={currentProblemNumber > 1}
          hasNext={currentProblemNumber < problemData.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
