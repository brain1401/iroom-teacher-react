import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PagePagination } from "@/components/layout/PagePagination";

// 라우트 정의 - test-paper 하위 경로로 수정
export const Route = createFileRoute("/main/test-paper/draft/")({
  component: DraftPage,
  // 간단 검색값 검증 (선택)
  validateSearch: (search: Record<string, unknown>) => {
    return {
      examName: typeof search.examName === "string" ? search.examName : "",
      count: typeof search.count === "number" ? search.count : Number(search.count ?? 10),
      units: Array.isArray(search.units) ? (search.units as string[]) : [],
    };
  },
});

type DraftSearch = {
  examName: string;
  count: number;
  units: string[];
};

/**
 * 시험 문제 목록 초안 페이지
 * @description 등록 탭에서 전달된 시험지명/문항수/단원으로 임시 표 렌더링
 */
function DraftPage() {
  const navigate = useNavigate({ from: "/main/test-paper/draft" });
  const { examName, count } = useSearch({ from: "/main/test-paper/draft" }) as DraftSearch;

  const rows = Array.from({ length: Math.max(1, Math.min(20, count || 10)) }).map((_, i) => ({
    no: i + 1,
    unit: "단원명",
    type: "주관식",
    level: i < 3 ? "하" : i < 7 ? "중" : "상",
  }));

  return (
    <div className="w-full space-y-6">
      <div className="text-[1.6rem] font-bold">[{examName || "입력한 시험지명"}] 문제 목록</div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">문제번호</TableHead>
                <TableHead>단원정보</TableHead>
                <TableHead>문항유형</TableHead>
                <TableHead>난이도</TableHead>
                <TableHead className="text-right pr-6">문제 상세 보기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.no}>
                  <TableCell>{r.no}번</TableCell>
                  <TableCell>{r.unit}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.level}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button size="sm" variant="secondary">문제 상세</Button>
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
        <Button className="w-full h-11" onClick={() => navigate({ to: "/main/test-paper" })}>
          시험지 생성
        </Button>
      </div>
    </div>
  );
}

