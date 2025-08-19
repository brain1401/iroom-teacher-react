import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 마이페이지 컴포넌트
 * @description 사용자 프로필/설정 진입 화면 골격 구성
 */
export function MyPage() {
  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>마이페이지</CardTitle>
        </CardHeader>
        <CardContent>
          준비 중 화면
        </CardContent>
      </Card>
    </div>
  );
}

export default MyPage;


