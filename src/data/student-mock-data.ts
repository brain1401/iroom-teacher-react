import type {
  Student,
  ExamSubmitStatusDetail,
  SubmissionStatus,
} from "@/types/exam";

/**
 * 학생 가데이터
 * @description 시험 제출 현황에서 사용할 학생 정보
 */
export const studentMockData: Student[] = [
  {
    id: "student-001",
    name: "김철수",
    phoneNumber: "010-1234-5678",
    grade: "중1",
    class: "1반",
    number: 1,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-002",
    name: "이영희",
    phoneNumber: "010-2345-6789",
    grade: "중1",
    class: "1반",
    number: 2,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-003",
    name: "박민수",
    phoneNumber: "010-3456-7890",
    grade: "중1",
    class: "1반",
    number: 3,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-004",
    name: "정수진",
    phoneNumber: "010-4567-8901",
    grade: "중1",
    class: "1반",
    number: 4,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-005",
    name: "윤아연",
    phoneNumber: "010-9185-8023",
    grade: "중1",
    class: "1반",
    number: 5,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-006",
    name: "최동현",
    phoneNumber: "010-5678-9012",
    grade: "중1",
    class: "2반",
    number: 1,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-007",
    name: "한소영",
    phoneNumber: "010-6789-0123",
    grade: "중1",
    class: "2반",
    number: 2,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-008",
    name: "송태현",
    phoneNumber: "010-7890-1234",
    grade: "중1",
    class: "2반",
    number: 3,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-009",
    name: "임지원",
    phoneNumber: "010-8901-2345",
    grade: "중1",
    class: "2반",
    number: 4,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-010",
    name: "강현우",
    phoneNumber: "010-9012-3456",
    grade: "중1",
    class: "2반",
    number: 5,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-011",
    name: "조은영",
    phoneNumber: "010-0123-4567",
    grade: "중2",
    class: "1반",
    number: 1,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-012",
    name: "오승준",
    phoneNumber: "010-1234-5679",
    grade: "중2",
    class: "1반",
    number: 2,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-013",
    name: "신미래",
    phoneNumber: "010-2345-6780",
    grade: "중2",
    class: "1반",
    number: 3,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-014",
    name: "류준호",
    phoneNumber: "010-3456-7891",
    grade: "중2",
    class: "1반",
    number: 4,
    registeredAt: "2024-09-01",
  },
  {
    id: "student-015",
    name: "백서연",
    phoneNumber: "010-4567-8902",
    grade: "중2",
    class: "1반",
    number: 5,
    registeredAt: "2024-09-01",
  },
];

/**
 * 시험 제출 현황 가데이터 생성 함수
 * @param examName 시험명
 * @param studentCount 생성할 학생 수 (기본값: 15)
 * @returns 시험 제출 현황 데이터 배열
 */
export function generateExamSubmissionData(
  examName: string,
  studentCount: number = 15,
): ExamSubmitStatusDetail[] {
  const statuses: SubmissionStatus[] = ["미제출", "제출완료"];
  const submissionDates = [
    "2025-01-15",
    "2025-01-16",
    "2025-01-17",
    "2025-01-18",
    "2025-01-19",
  ];

  return studentMockData.slice(0, studentCount).map((student, index) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const submissionDate =
      submissionDates[Math.floor(Math.random() * submissionDates.length)];

    // 제출 완료된 경우에만 점수 정보 추가
    const hasScore = status === "제출완료";
    const totalScore = hasScore ? 100 : undefined;
    const earnedScore = hasScore
      ? Math.floor(Math.random() * 100) + 1
      : undefined;
    const submissionTime = hasScore
      ? Math.floor(Math.random() * 60) + 10
      : undefined;
    const wrongAnswerCount = hasScore
      ? Math.floor(Math.random() * 20)
      : undefined;

    return {
      student,
      examName,
      submissionDate,
      submissionStatus: status,
      totalScore,
      earnedScore,
      submissionTime,
      wrongAnswerCount,
    };
  });
}

/**
 * 특정 시험의 제출 현황 가데이터
 */
export const examSubmissionMockData: ExamSubmitStatusDetail[] = [
  // 중간고사 대비 시험 제출 현황
  ...generateExamSubmissionData("2025-1학기 중간고사 대비", 10),

  // 기말고사 대비 시험 제출 현황
  ...generateExamSubmissionData("2025-1학기 기말고사 대비", 8),

  // 단원 평가 제출 현황
  ...generateExamSubmissionData("단원 평가 (A)", 12),
];

/**
 * 학생 검색 함수
 * @param keyword 검색 키워드
 * @returns 검색 결과 학생 배열
 */
export function searchStudents(keyword: string): Student[] {
  if (!keyword.trim()) return studentMockData;

  const lowerKeyword = keyword.toLowerCase();
  return studentMockData.filter(
    (student) =>
      student.name.toLowerCase().includes(lowerKeyword) ||
      student.phoneNumber.includes(keyword) ||
      student.grade.toLowerCase().includes(lowerKeyword) ||
      student.class.includes(keyword),
  );
}

/**
 * 학년별 학생 필터링 함수
 * @param grade 학년
 * @returns 해당 학년 학생 배열
 */
export function filterStudentsByGrade(grade: string): Student[] {
  if (!grade || grade === "전체") return studentMockData;
  return studentMockData.filter((student) => student.grade === grade);
}

/**
 * 반별 학생 필터링 함수
 * @param grade 학년
 * @param className 반
 * @returns 해당 반 학생 배열
 */
export function filterStudentsByClass(
  grade: string,
  className: string,
): Student[] {
  if (!grade || !className) return studentMockData;
  return studentMockData.filter(
    (student) => student.grade === grade && student.class === className,
  );
}
