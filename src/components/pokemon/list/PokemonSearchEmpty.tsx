import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, AlertCircle } from "lucide-react";

/**
 * 포켓몬 검색 결과가 없을 때 표시하는 컴포넌트
 * @description 검색어에 대한 결과가 없을 때 사용자에게 안내 메시지를 제공
 */
export function PokemonSearchEmpty({
  searchKeyword,
}: {
  searchKeyword: string;
}) {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Card className="max-w-md w-full border-muted bg-muted/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl text-muted-foreground">
            검색 결과가 없습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">
              '{searchKeyword}'
            </span>
            에 대한 포켓몬을 찾을 수 없습니다.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  검색 팁:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 포켓몬 이름을 정확히 입력해보세요</li>
                  <li>• 포켓몬 번호로 검색해보세요 (예: 25)</li>
                  <li>• 영어 이름으로 검색해보세요 (예: pikachu)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
