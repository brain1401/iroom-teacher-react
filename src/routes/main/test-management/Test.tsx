import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Textarea 컴포넌트를 import 합니다.

export function TabsDemo() {
  return (
    // 전체적인 너비를 조정합니다.
    <div className="w-full max-w-2xl"> 
      <Card>
        <Tabs defaultValue="create-exam">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exam-list">시험 목록</TabsTrigger>
            <TabsTrigger value="create-exam">시험 출제</TabsTrigger>
          </TabsList>
          
          {/* 시험 목록 탭 */}
          <TabsContent value="exam-list">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mt-5">시험 목록</CardTitle>
              <CardDescription>
                여기에서 생성된 시험 목록을 관리할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* 시험 목록 내용이 여기에 들어갑니다. */}
            </CardContent>
          </TabsContent>

          {/* 시험 출제 탭 */}
          <TabsContent value="create-exam">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mt-5">시험 출제</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 학년 선택과 학생 수 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 mt-5">
                  <Label htmlFor="grade">학년 선택</Label>
                  <Select>
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="학년을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="middle1">중1</SelectItem>
                      <SelectItem value="middle2">중2</SelectItem>
                      <SelectItem value="middle3">중3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 mt-5">
                  <Label htmlFor="student-count">학생 수</Label>
                  <Input id="student-count" type="number" defaultValue="20" />
                </div>
              </div>

              {/* 시험명 */}
              <div className="space-y-2">
                <Label htmlFor="exam-name">시험명</Label>
                <Select>
                  <SelectTrigger id="exam-name">
                    <SelectValue placeholder="시험지명" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="midterm">중간고사</SelectItem>
                    <SelectItem value="final">기말고사</SelectItem>
                    <SelectItem value="mock">모의고사</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 내용 */}
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
            <CardFooter className="mt-10">
              {/* 버튼을 카드 너비에 꽉 채웁니다. */}
              <Button className="w-full h-10 ">시험 출제</Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}