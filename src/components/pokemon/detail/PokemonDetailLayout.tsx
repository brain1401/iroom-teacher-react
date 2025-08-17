import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

type Props = {
  left: ReactNode;
  right: ReactNode;
};

/** 상세 레이아웃 래퍼 컴포넌트 -함 */
export function PokemonDetailLayout({ left, right }: Props) {
  return (
    <Card className="overflow-hidden shadow-2xl border-2 py-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {left}
        <div className="p-8 lg:p-12 bg-white">{right}</div>
      </div>
    </Card>
  );
}
