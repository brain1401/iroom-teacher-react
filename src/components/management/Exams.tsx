import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ExamsProps = {
  /** 추가 CSS 클래스 */
  className?: string;
};

/**
 * 시험 관리 컴포넌트
 * @description 시험 생성/배포/채점 현황 관리를 위한 화면 골격 구성
 */
export function Exams({ className }: ExamsProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>시험 관리</CardTitle>
        </CardHeader>
        <CardContent>
          준비 중 화면
        </CardContent>
      </Card>
    </div>
  );
}

export default Exams;


