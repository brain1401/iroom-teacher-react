import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ClassList from "@/components/management/ClassList";
import StudentsList from "@/components/management/StudentsList";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ClassStudentsProps = {
  /** 추가 CSS 클래스 */
  className?: string;
};

/**
 * 반 / 학생 관리 컴포넌트
 * @description 반 목록과 학생 관리를 위한 화면 골격 구성
 */
export function ClassStudents({ className }: ClassStudentsProps) {
  const [tab, setTab] = useState<"classes" | "students">("classes");
  const [selectedClass, setSelectedClass] = useState<string>("전체");
  return (
    <div className={cn("w-[100%] mx-auto px-8 md:px-12 mt-4 md:mt-6", className)}>
      <Card className="shadow-md w-full">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <CardHeader className="pb-5">
            <TabsList className="grid w-full grid-cols-2 p-0 bg-transparent rounded-none shadow-none h-auto">
              <TabsTrigger value="classes" className="rounded-none bg-transparent hover:bg-transparent data-[state=active]:bg-transparent shadow-none data-[state=active]:shadow-none text-muted-foreground border-0 border-b-2 border-transparent pb-2 md:pb-3 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:text-[var(--color-brand-point)] data-[state=active]:border-[var(--color-brand-point)]">반 목록</TabsTrigger>
              <TabsTrigger value="students" className="rounded-none bg-transparent hover:bg-transparent data-[state=active]:bg-transparent shadow-none data-[state=active]:shadow-none text-muted-foreground border-0 border-b-2 border-transparent pb-2 md:pb-3 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:text-[var(--color-brand-point)] data-[state=active]:border-[var(--color-brand-point)]">학생 목록</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="classes">
              <ClassList
                embedded
                onShowStudentsForClass={(className) => {
                  setSelectedClass(className);
                  setTab("students");
                }}
              />
            </TabsContent>
            <TabsContent value="students">
              <StudentsList embedded selectedClass={selectedClass} onSelectedClassChange={setSelectedClass} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default ClassStudents;


