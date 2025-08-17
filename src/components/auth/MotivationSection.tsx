import { Lightbulb } from "lucide-react";

/**
 * 동기부여 섹션 컴포넌트
 * 그라디언트 배경과 동기부여 메시지를 포함하는 오른쪽 영역
 * 모바일에서는 숨겨짐 (md:block)
 */
export function MotivationSection() {
  return (
    <div className="relative hidden md:block">
      {/* 그라디언트 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500" />

      {/* 컨텐츠 영역 */}
      <div className="relative flex h-full flex-col items-center justify-center p-10 text-center text-white">
        {/* 아이콘 */}
        <div className="mb-6 rounded-full bg-white/20 p-4">
          <Lightbulb size={36} />
        </div>

        {/* 메인 타이틀 */}
        <h2 className="mb-2 text-2xl font-bold">너의 가능성을 믿어봐!</h2>

        {/* 설명 텍스트 */}
        <p className="leading-relaxed text-white/85">
          로그인하고 너를 위해 준비된 맞춤 학습 리포트와 아웃풋들을 확인해봐.
        </p>
        <p className="leading-relaxed text-white/85">
          어제의 너보다 더 성장할 수 있을 거야!
        </p>
      </div>
    </div>
  );
}
