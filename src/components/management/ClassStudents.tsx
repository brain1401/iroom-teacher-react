import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ClassStudentsProps = {
  /** 추가 CSS 클래스 */
  className?: string;
};

/**
 * 반 / 학생 관리 컴포넌트
 * @description 반 목록과 학생 관리를 위한 화면 골격 구성
 */
export function ClassStudents({ className }: ClassStudentsProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>반 / 학생 관리</CardTitle>
        </CardHeader>
        <CardContent>
          준비 중 화면
        </CardContent>
      </Card>
    </div>
  );
}

export default ClassStudents;


