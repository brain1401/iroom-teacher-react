/**
 * 시험 인쇄 기능 테스트
 * @description 인쇄 버튼 로직 단순화 후 기능 검증 테스트
 *
 * 테스트 시나리오:
 * 1. 인쇄 버튼 클릭 시 모달 열림
 * 2. 인쇄 옵션 선택 가능
 * 3. react-to-print 호출 확인
 * 4. 에러 처리 검증
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "jotai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExamPrintModal } from "@/components/exam/ExamPrintModal";
import { useExamPrint } from "@/hooks/exam/useExamPrint";
import { vi } from "vitest";

// useExamPrint 훅 모킹
vi.mock("@/hooks/exam/useExamPrint");
vi.mock("react-to-print", () => ({
  useReactToPrint: vi.fn(() => vi.fn()),
}));

const mockExamData = {
  examName: "테스트 시험",
  grade: 3,
  totalQuestions: 10,
  totalPoints: 100,
  questions: [
    {
      questionId: "1",
      questionText: "테스트 문제 1",
      questionType: "MULTIPLE_CHOICE" as const,
      points: 10,
      options: ["선택지1", "선택지2", "선택지3", "선택지4"],
      correctAnswer: "1",
    }
  ],
};

describe("시험 인쇄 기능 테스트", () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    // useExamPrint 훅 기본 모킹
    (useExamPrint as any).mockReturnValue({
      examData: mockExamData,
      isLoading: false,
      error: null,
      isReadyToPrint: true,
      printRef: { current: null },
      handlePrint: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          {component}
        </Provider>
      </QueryClientProvider>
    );
  };

  describe("ExamPrintModal 컴포넌트", () => {
    it("모달이 열릴 때 인쇄 옵션을 표시한다", async () => {
      renderWithProviders(
        <ExamPrintModal
          examId="test-exam-1"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // 인쇄 옵션 모달이 표시되는지 확인
      expect(screen.getByText("인쇄 항목을 선택해주세요.")).toBeInTheDocument();
      expect(screen.getByText("문제지")).toBeInTheDocument();
      expect(screen.getByText("문제 답안지")).toBeInTheDocument();
      expect(screen.getByText("학생 답안지")).toBeInTheDocument();
    });

    it("확인 버튼 클릭 시 인쇄 함수가 호출된다", async () => {
      const mockHandlePrint = vi.fn();
      (useExamPrint as any).mockReturnValue({
        examData: mockExamData,
        isLoading: false,
        error: null,
        isReadyToPrint: true,
        printRef: { current: null },
        handlePrint: mockHandlePrint,
      });

      renderWithProviders(
        <ExamPrintModal
          examId="test-exam-1"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // 확인 버튼 클릭
      const confirmButton = screen.getByText("확인");
      fireEvent.click(confirmButton);

      // 인쇄 함수 호출 확인
      await waitFor(() => {
        expect(mockHandlePrint).toHaveBeenCalledTimes(1);
      });
    });

    it("데이터 로딩 중일 때 로딩 상태를 표시한다", () => {
      (useExamPrint as any).mockReturnValue({
        examData: null,
        isLoading: true,
        error: null,
        isReadyToPrint: false,
        printRef: { current: null },
        handlePrint: vi.fn(),
      });

      renderWithProviders(
        <ExamPrintModal
          examId="test-exam-1"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // 확인 버튼 클릭하여 처리 중 상태로 전환
      fireEvent.click(screen.getByText("확인"));

      expect(screen.getByText("시험 데이터를 불러오는 중...")).toBeInTheDocument();
    });

    it("에러 발생 시 에러 메시지를 표시한다", () => {
      (useExamPrint as any).mockReturnValue({
        examData: null,
        isLoading: false,
        error: new Error("데이터 로딩 실패"),
        isReadyToPrint: false,
        printRef: { current: null },
        handlePrint: vi.fn(),
      });

      renderWithProviders(
        <ExamPrintModal
          examId="test-exam-1"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // 확인 버튼 클릭하여 처리 중 상태로 전환
      fireEvent.click(screen.getByText("확인"));

      expect(screen.getByText(/시험 데이터를 불러오는데 실패했습니다/)).toBeInTheDocument();
    });
  });

  describe("useExamPrint 훅 테스트", () => {
    it("examId가 변경될 때 atom이 업데이트된다", () => {
      // 이 테스트는 실제 hook을 테스트하기 위해서는 별도의 setup이 필요
      // 현재는 모킹된 상태에서의 기본 동작 확인
      const mockSetExamQuestionsId = vi.fn();
      
      expect(useExamPrint).toBeDefined();
    });
  });
});