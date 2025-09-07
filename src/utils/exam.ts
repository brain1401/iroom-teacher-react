import type { ExamSubmitStatusDetail } from "@/types/exam";
import type { ServerRecentSubmission } from "@/types/server-exam";

/**
 * 서버 데이터를 컴포넌트에서 사용하는 타입으로 변환하는 함수
 * @description ServerRecentSubmission을 ExamSubmitStatusDetail로 변환
 */
export function mapRecentSubmissionToStatusDetail(
  recentSubmission: ServerRecentSubmission,
  examName: string,
): ExamSubmitStatusDetail {
  return {
    id: recentSubmission.submissionId,
    student: {
      id: recentSubmission.studentId.toString(),
      name: recentSubmission.studentName,
    },
    examName,
    submissionDate: new Date(recentSubmission.submittedAt).toLocaleDateString(
      "ko-KR",
    ),
    submittedAt: recentSubmission.submittedAt,
    score: null, // 서버에서 별도 제공 필요
    totalScore: 100, // 기본값, 서버에서 별도 제공 필요
    status: "submitted" as const,
    submissionStatus: "제출완료",
    correctAnswerCount: 0, // 서버에서 별도 제공 필요
    wrongAnswerCount: 0, // 서버에서 별도 제공 필요
  };
}
