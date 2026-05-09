export interface Topic {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Feedback {
  overallScore: number;
  relevance: number;
  clarity: number;
  structure: number;
  confidence: number;
  strengths: string[];
  mistakes: string[];
  missingPoints: string[];
  improvedAnswer: string;
  tips: string[];
}

export interface PracticeSession {
  id?: string;
  userId: string;
  topicId: string;
  topicTitle: string;
  topicCategory: string;
  answerText: string;
  durationSeconds: number;
  createdAt: any;
  feedback?: Feedback;
}
