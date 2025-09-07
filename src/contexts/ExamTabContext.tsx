import { createContext, useContext } from "react";
import type { ReactNode } from "react";

/**
 * 시험 탭 컨텍스트 타입
 * @description 시험 관리 페이지의 탭 상태 관리를 위한 컨텍스트
 */
type ExamTabContextType = {
  /** 현재 활성 탭 */
  activeTab: string;
  /** 탭 변경 함수 */
  setActiveTab: (tab: string) => void;
};

/**
 * 시험 탭 컨텍스트
 */
const ExamTabContext = createContext<ExamTabContextType | undefined>(undefined);

/**
 * 시험 탭 컨텍스트 프로바이더 Props
 */
type ExamTabProviderProps = {
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 현재 활성 탭 */
  activeTab: string;
  /** 탭 변경 함수 */
  setActiveTab: (tab: string) => void;
};

/**
 * 시험 탭 컨텍스트 프로바이더
 * @description 자식 컴포넌트에 탭 상태와 제어 함수 제공
 */
export function ExamTabProvider({
  children,
  activeTab,
  setActiveTab,
}: ExamTabProviderProps) {
  return (
    <ExamTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ExamTabContext.Provider>
  );
}

/**
 * 시험 탭 컨텍스트 훅
 * @description 시험 탭 상태와 제어 함수에 접근하는 커스텀 훅
 */
export function useExamTab() {
  const context = useContext(ExamTabContext);

  if (!context) {
    throw new Error("useExamTab must be used within ExamTabProvider");
  }

  return context;
}
