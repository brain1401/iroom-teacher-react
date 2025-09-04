import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect, useLayoutEffect } from "react";
import { z } from "zod";

import { useExamList } from "@/hooks/exam/useExamList";
import { ExamErrorBoundary } from "@/components/error-boundary/ExamErrorBoundary";
import { LoadingSpinner } from "@/components/loading/ExamLoadingStates";

// 검색 파라미터 스키마 정의 - 네비게이션 파라미터만 포함
const searchSchema = z.object({
  // 네비게이션 관련 파라미터만 - 시험 상세 페이지 이동에 필요
  selectedExam: z.string().optional(),
  examName: z.string().optional(),
});

export const Route = createFileRoute("/main/exam/manage")({
  validateSearch: searchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const searchParams = Route.useSearch();
  const { selectedExam, examName } = searchParams;

  /** 현재 활성 탭 값 상태 */
  const [activeTab, setActiveTab] = useState<string>("list");

  // 시험 목록 훅 사용
  const { addNewExam } = useExamList();

  const router = useRouter();

  // 선택된 시험이 있으면 상세 탭으로 자동 전환
  useLayoutEffect(() => {
    if (selectedExam && examName) {
      setActiveTab("list");
      // TODO: 선택된 시험의 상세 정보를 표시하는 로직 추가
      console.log("선택된 시험:", { selectedExam, examName });
    }
  }, [selectedExam, examName]);

  /**
   * 시험 출제 완료 후 목록 탭으로 이동하고 새로운 시험 추가
   */
  const handleExamCreated = (newExam: {
    examName: string;
    content: string;
    grade: number;
    qrCodeUrl: string | null;
    examSheetInfo: any | null;
  }) => {
    // 새로운 시험을 목록에 추가
    addNewExam(newExam);

    // 시험 목록 탭으로 이동
    setActiveTab("list");
  };

  return (
    <ExamErrorBoundary
      fallbackTitle="시험 관리 시스템 오류"
      fallbackDescription="시험 관리 페이지에서 문제가 발생했습니다."
      onError={(error, errorInfo) => {
        console.error("[ExamManageRoute] 에러 발생:", error, errorInfo);
        // TODO: 에러 모니터링 서비스 연동
      }}
    >
      <Card className="w-full h-full p-8 flex flex-col">
        {/* 선택된 시험 정보 표시 */}
        {selectedExam && examName && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">
                  선택된 시험
                </h3>
                <p className="text-blue-600">{examName}</p>
              </div>
              <button
                onClick={() => router.history.back()}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                뒤로가기
              </button>
            </div>
          </div>
        )}

        {/* 제어형 탭 구성 */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full flex flex-col"
        >
          {/* 탭 트랙 및 하단 보더 표시 */}
          <div className="flex-shrink-0">
            <TabsList className="relative grid w-[30rem] grid-cols-2 bg-white mt-2">
              {/* 목록 탭 트리거 */}
              <TabsTrigger
                value="list"
                className="relative px-6 py-3 text-muted-foreground data-[state=active]:text-sky-600 "
              >
                시험 목록
                {/* 활성 탭 하단 밑줄 애니메이션 렌더링 */}
                {activeTab === "list" && (
                  <motion.div
                    layoutId="tabs-underline"
                    className="absolute left-0 right-0 -bottom-[2px] h-[0.1rem] bg-sky-500"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </TabsTrigger>

              {/* 등록 탭 트리거 */}
              <TabsTrigger
                value="register"
                className="relative px-6 py-3 text-muted-foreground  data-[state=active]:text-sky-600"
              >
                시험 출제
                {/* 활성 탭 하단 밑줄 애니메이션 렌더링 */}
                {activeTab === "register" && (
                  <motion.div
                    layoutId="tabs-underline"
                    className="absolute left-0 right-0 -bottom-[2px] h-[0.1rem] bg-sky-500"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </TabsTrigger>
            </TabsList>
            <hr className="w-full" />
          </div>

          <div className="flex-1 min-h-0">
            <ExamErrorBoundary
              fallbackTitle="탭 컴포넌트 오류"
              shouldShowHomeButton={false}
              shouldShowBackButton={false}
            >
              <Outlet />
            </ExamErrorBoundary>
          </div>
        </Tabs>
      </Card>
    </ExamErrorBoundary>
  );
}
