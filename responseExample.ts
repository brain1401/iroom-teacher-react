type Response = {
  result: string;
  message: string;
  data: Datum[];
};

type Datum = {
  id: string;
  name: string;
  type: Type;
  grade: number | null;
  displayOrder: number;
  description: string;
  unitCode: null | string;
  children: Datum[];
  questions: Question[] | null;
};

type Question = {
  id: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  points: number;
  questionPreview: string;
  difficultyDisplayName: Difficulty;
  questionTypeDisplayName: QuestionTypeDisplayName;
};

type Difficulty = "하" | "중" | "상";

type QuestionType = "SUBJECTIVE" | "MULTIPLE_CHOICE";
type QuestionTypeDisplayName = "주관식" | "객관식";
type Type = "CATEGORY" | "SUBCATEGORY" | "UNIT";

export {};
