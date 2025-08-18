import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ExamPapersProps = {
  /** 추가 CSS 클래스 */
  className?: string;
};

/**
 * 시험지 관리 컴포넌트
 * @description 시험지 업로드/목록/검색 등을 위한 관리 화면 골격 구성
 */
export function ExamPapers({ className }: ExamPapersProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>시험지 관리</CardTitle>
        </CardHeader>
        <CardContent>
          준비 중 화면
        </CardContent>
      </Card>
    </div>
  );
}

export default ExamPapers;


