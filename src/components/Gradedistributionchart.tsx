import { cn } from "@/lib/utils";

// 막대 그래프에 필요한 데이터
type ScoreItem = {
    // (0~39점)
    label : string;
    // 학생 수
    count : number;
    // 백분율(막대 높이)
    percentage : number;

}
// 컴포넌트 전체 props 타입

type ScoreChartProps = {
    title : string;
    data : ScoreItem[];
    className? : string;
}

export const ScoreDistributionItem = ({
    title,
    data,
    className,
}: ScoreChartProps) => {
    if (!data||data.length === 0) {
        return null;
    }

    return( <div
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
          className,
        )}
      >
        <h3 className="mb-6 text-lg font-bold text-gray-800">{title}</h3>
        <div className="flex h-48 items-end justify-around gap-2 text-center">
          {data.map((item) => {
            const barColor = {
              "상위권": "bg-blue-700", 
              "중위권": "bg-blue-500", 
              "하위권": "bg-blue-300", // 옅은 파란색
            }[item.label] || "bg-gray-200"; 
  
            return (
              <div key={item.label} className="flex h-full w-full flex-col items-center justify-end">
                <p className="text-xs font-medium text-gray-600">{item.count}명</p>
                <div
                  className={cn(
                    "mt-1 w-3/4 rounded-t-md transition-all duration-300",
                    barColor, 
                  )}
                  style={{ height: `${item.percentage}%` }}
                  aria-label={`${item.label}: ${item.count}명 (${item.percentage}%)`}
                />
                <p className="mt-2 text-xs font-semibold text-gray-700">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>);
}; 


