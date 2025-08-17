import { RiShieldCheckLine } from "react-icons/ri";
import { MdAutoAwesome, MdBarChart, MdEditNote } from "react-icons/md";

/**
 * 동기부여 섹션 컴포넌트
 * 그라디언트 배경과 동기부여 메시지를 포함하는 오른쪽 영역
 * 모바일에서는 숨겨짐 (md:block)
 */
export function ExplanationSection() {
  return (
    <div className="hidden bg-blue-600 text-white md:flex md:flex-col md:justify-center md:p-12">
      {/* 브랜딩 헤더 */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <RiShieldCheckLine size={26} className="text-white" />
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-3xl font-bold leading-tight">
            업무는 스마트하게,
          </h1>

          <h1 className="text-3xl font-bold leading-tight">
            교육은 더 깊이있게
          </h1>
        </div>

        <p className="text-sm leading-relaxed text-blue-100">
          러브버그는 반복적인 채점과 성적 관리 업무를 자동화하여 선생님이 교육
          본연의 가치에 더 집중할 수 있도록 도와줍니다.
        </p>
      </div>

      {/* 기능 목록 */}
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-white/20">
            <MdAutoAwesome size={18} className="text-white" />
          </div>
          <div>
            <div className="mb-1 font-semibold text-white">AI 자동 채점</div>
            <div className="text-blue-100">
              시험지 업로드만으로 객관식, 주관식 채점 일괄 처리
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-white/20">
            <MdBarChart size={18} className="text-white" />
          </div>
          <div>
            <div className="mb-1 font-semibold text-white">원생 성적 관리</div>
            <div className="text-blue-100">
              모든 성적 데이터 체계적 누적, 통계와 차트로 한눈 파악
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-white/20">
            <MdEditNote size={18} className="text-white" />
          </div>
          <div>
            <div className="mb-1 font-semibold text-white">맞춤형 피드백</div>
            <div className="text-blue-100">
              AI 분석 기반 학생별 맞춤 오답노트와 학습 리포트 제공
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
