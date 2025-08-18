import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div
      className={cn(
        "w-[98%] h-[90%] p-6 md:p-8 pb-16 md:pb-24 mx-auto my-auto flex flex-col",
        className,
      )}
    >
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
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        {/* 1행: 마감 임박 공지 + 중등 B반 평균 성적 추이 (반응형) */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 마감 임박 공지 (피그마 430:301 리스트 형태 반영) */}
          <Card className="flex min-w-0 flex-col w-full lg:w-[445px] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">마감 임박 공지</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <ul className="space-y-2.5">
                {[
                  { dday: 2, title: "중간고사 수학 시험", submitted: 12, total: 28 },
                  { dday: 5, title: "기말 대비 모의고사", submitted: 8, total: 28 },
                  { dday: 7, title: "연립방정식 단원평가", submitted: 15, total: 28 },
                  { dday: 10, title: "피타고라스의 정리 단원평가", submitted: 20, total: 28 },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 rounded-md border px-2 py-1 min-w-0">
                    <span className="shrink-0 rounded bg-neutral-700 px-2 py-0.5 text-xs font-medium text-white">D-{item.dday}</span>
                    <span className="text-xs font-medium truncate max-w-[40%] sm:max-w-[50%] md:max-w-[60%]">
                      {item.title}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      제출 {item.submitted}/{item.total}명 남음
                    </span>
                    <button
                      type="button"
                      className="ml-1 shrink-0 rounded border bg-white px-2 py-1 text-[10px] hover:bg-muted"
                    >
                      상세보기
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 중등 B반 평균 성적 추이 */}
          <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg md:text-xl font-semibold">중등 B반 평균 성적 추이</CardTitle>
                <Select defaultValue="middle-b">
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="반 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle-a">중등 A반</SelectItem>
                    <SelectItem value="middle-b">중등 B반</SelectItem>
                    <SelectItem value="middle-c">중등 C반</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="min-h-40 sm:min-h-60 md:min-h-72 w-full rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground">
                차트 영역
              </div>
            </CardContent>
          </Card>

        </div>

        {/* 2행: 좌측 2개(세로 스택) + 우측 1개(두 행 차지) 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:auto-rows-[1fr] gap-4 items-stretch pb-16">
          {/* 단원별 취약점 분석 (좌상단) */}
          <Card className="h-full flex min-w-0 flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">단원별 취약점 분석 (TOP 5)</CardTitle>
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
          {/* 성적 분포도 (우측, 두 행 차지) */}
          <Card className="h-full flex min-w-0 flex-col overflow-hidden lg:col-span-2 lg:row-span-2">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">성적 분포도</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="min-h-48 md:min-h-64 w-full rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground">
                막대 차트 영역
              </div>
            </CardContent>
          </Card>
          {/* 시험 제출 현황 (좌하단) */}
          <Card className="h-full flex min-w-0 flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">시험 제출 현황</CardTitle>
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
        </div>
      </div>
    </div>
  );
}

export default MainHome;


