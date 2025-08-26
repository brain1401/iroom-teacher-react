import { createFileRoute } from '@tanstack/react-router';
// 1. ExamSubmissionStatus 컴포넌트를 불러옵니다. (경로는 실제 위치에 맞게 수정)
import { ExamSubmissionStatus } from '../../components/ExamSubmissionStatus';

// 라우트 설정
export const Route = createFileRoute('/main/')({
  component: RouteComponent,
});


const examSubmissions = [
  {
    id: 1,
    unitName: "수학 단원 평가 : 연립방정식",
    submittedCount: 23,
    totalStudents: 28,
    submissionRate: 82,
  },
  {
    id: 2,
    unitName: "수학 복습시험 : 피타고라스의 정리",
    submittedCount: 18,
    totalStudents: 28,
    submissionRate: 65,
  },
  {
    id: 3,
    unitName: "모의고사 대비 문제 풀이",
    submittedCount: 26,
    totalStudents: 28,
    submissionRate: 93,
  },
];


function RouteComponent() {
  const handleCardClick = (unitName: string) => {
    alert(`${unitName} 카드를 클릭했습니다!`);
  };


  return (
    <div className="flex">
    <div className="mt-10 ml-10 p-8 bg-white min-h-screen shadow-lg">
      <h1 className="text-3xl font-bold mb-6">시험 제출 현황</h1> 
      <hr className="mb-6 border-gray-200" />
      
      <div className="space-y-4">
        {examSubmissions.map((submission) => (
          <ExamSubmissionStatus
            key={submission.id}
            unitName={submission.unitName}
            submittedCount={submission.submittedCount}
            totalStudents={submission.totalStudents}
            submissionRate={submission.submissionRate}
            onClick={() => handleCardClick(submission.unitName)}
          />
        ))}
      </div>
    </div>
    <div className="mt-10 ml-10 p-8 bg-white min-h-screen shadow-lg">
    <h1 className="text-3xl font-bold mb-6">성적 분포도</h1> 
    <hr className="mb-6 border-gray-200" />
      </div>
    
    </div>
  );
}