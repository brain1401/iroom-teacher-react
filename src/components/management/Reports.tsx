import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportsProps = {
  /** 추가 CSS 클래스 */
  className?: string;
};

/**
 * 통계 / 리포트 컴포넌트
 * @description 성적 통계와 리포트 탐색을 위한 화면 골격 구성
 */
export function Reports({ className }: ReportsProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>통계 / 리포트</CardTitle>
        </CardHeader>
        <CardContent>
          준비 중 화면
        </CardContent>
      </Card>
    </div>
  );
}

export default Reports;


