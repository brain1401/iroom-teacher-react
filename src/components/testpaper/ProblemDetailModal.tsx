// src/components/testpaper/ProblemDetailModal.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types/test-paper";

/**
 * 문제 상세보기 모달 컴포넌트
 * @description 문제의 상세 정보를 표시하는 모달
 *
 * 주요 기능:
 * - 문제 내용 표시
 * - 문제 이미지 표시
 * - 객관식 보기 표시
 * - 문제 정보 (타입, 난이도, 배점)
 * - 닫기 버튼
 */
type ProblemDetailModalProps = {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 표시할 문제 데이터 */
  problem: Problem | null;
};

export function ProblemDetailModal({
  isOpen,
  onClose,
  problem,
}: ProblemDetailModalProps) {
  if (!isOpen || !problem) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sky-600">문제 상세보기</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* 문제 번호 및 제목 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {problem.number}번
              </Badge>
              <Badge
                variant={problem.type === "objective" ? "default" : "secondary"}
                className="text-sm"
              >
                {problem.type === "objective" ? "객관식" : "주관식"}
              </Badge>
              <Badge
                variant={
                  problem.difficulty === "high"
                    ? "destructive"
                    : problem.difficulty === "medium"
                      ? "default"
                      : "secondary"
                }
                className="text-sm"
              >
                {problem.difficulty === "high"
                  ? "상"
                  : problem.difficulty === "medium"
                    ? "중"
                    : "하"}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {problem.points}점
              </Badge>
            </div>
            <h3 className="text-lg font-semibold">{problem.title}</h3>
          </div>

          {/* 문제 내용 */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">문제 내용</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {problem.content}
              </p>
            </div>
          </div>

          {/* 문제 이미지 */}
          {problem.imageUrl && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">문제 이미지</h4>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={problem.imageUrl}
                  alt="문제 이미지"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            </div>
          )}

          {/* 객관식 보기 */}
          {problem.type === "objective" && problem.options && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">보기</h4>
              <div className="space-y-2">
                {problem.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-lg"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 문제 정보 */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">문제 정보</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">단원:</span>
                <span className="ml-2 font-medium">{problem.unitName}</span>
              </div>
              <div>
                <span className="text-gray-500">생성일:</span>
                <span className="ml-2 font-medium">
                  {problem.createdAt
                    ? new Date(problem.createdAt).toLocaleDateString()
                    : "정보 없음"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
