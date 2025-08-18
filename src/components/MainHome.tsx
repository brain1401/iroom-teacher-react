import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { BiBell } from "react-icons/bi";
import { LiaUserCircle } from "react-icons/lia";

type MainHomeProps = {
  /** 추가 CSS 클래스 */
  className?: string;
};

/**
 * 메인 홈 컴포넌트
 * @description 교사용 대시보드 홈 화면 구성
 *
 * 주요 구성:
 * - 상단 브랜딩 영역: 학원명, 교사명 표시
 * - 좌측 네비게이션: 홈, 반/학생 관리, 시험지/시험 관리, 통계/리포트
 * - 메인 콘텐츠: 시험 제출 현황, 마감 임박 공지, 성적 추이, 취약 단원 TOP5, 성적 분포도
 */
export function MainHome({ className }: MainHomeProps) {
  return (
    <div className={cn("w-[90%] h-[90%] p-6 md:p-8 mx-auto my-auto flex flex-col", className)}>
      {/* 상단 브랜딩 영역 */}
      <div className="mb-4 md:mb-6 flex-none">
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-3 md:gap-4">
            <h1 className="text-4xl md:text-5xl font-bold">모모학원</h1>
            <p className="text-2xl md:text-3xl font-semibold text-muted-foreground">모모 선생님</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button type="button" aria-label="알림" className="text-2xl md:text-3xl text-muted-foreground hover:text-foreground transition-colors">
              <BiBell />
            </button>
            <Link to="/mypage" aria-label="마이페이지" className="text-3xl md:text-4xl text-muted-foreground hover:text-foreground transition-colors">
              <LiaUserCircle />
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 (좌측 글로벌 사이드바 옆) */}
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {/* 상단 3열: 3fr : 4fr : 3fr */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_4fr_3fr] gap-6 h-1/2 min-h-0">
          {/* 마감 임박 공지 */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>마감 임박 공지</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground">공지</span>
                  <span>2학기 중간고사</span>
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground">공지</span>
                  <span>연립방정식 단원평가</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 중등 B반 평균 성적 추이 */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>중등 B반 평균 성적 추이</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full w-full rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground">
                차트 영역
              </div>
            </CardContent>
          </Card>

          {/* 단원별 취약점 분석 */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>단원별 취약점 분석 (TOP 5)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ol className="list-decimal pl-5 space-y-2">
                <li>피타고라스의 정리</li>
                <li>연립방정식의 활용</li>
                <li>삼각비의 활용</li>
                <li>인수분해</li>
                <li>확률과 통계</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* 하단 2열: 3fr : 7fr */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-6 h-1/2 min-h-0">
          {/* 시험 제출 현황 */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>시험 제출 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>수학 단원 평가 : 연립방정식</span>
                  <span>23/28</span>
                </div>
                <div className="h-2 w-full rounded bg-muted">
                  <div className="h-2 rounded bg-primary" style={{ width: "82%" }} />
                </div>
                <span className="text-xs text-muted-foreground">제출률 82%</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>수학 복습시험 : 피타고라스의 정리</span>
                  <span>18/28</span>
                </div>
                <div className="h-2 w-full rounded bg-muted">
                  <div className="h-2 rounded bg-primary/70" style={{ width: "65%" }} />
                </div>
                <span className="text-xs text-muted-foreground">제출률 65%</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>모의고사 대비 문제 풀이</span>
                  <span>26/28</span>
                </div>
                <div className="h-2 w-full rounded bg-muted">
                  <div className="h-2 rounded bg-primary/90" style={{ width: "93%" }} />
                </div>
                <span className="text-xs text-muted-foreground">제출률 93%</span>
              </div>
            </CardContent>
          </Card>

          {/* 성적 분포도 */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>성적 분포도</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full w-full rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground">
                막대 차트 영역
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MainHome;


