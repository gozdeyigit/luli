export interface WordList {
  id: string;
  name: string;
  words: string[];
  createdDate: string;
  lastModifiedDate: string;
  lastPracticedDate?: string;
  audioRecordings?: { [word: string]: string }; // word -> base64 audio data
}

export interface Attempt {
  word: string;
  userSpelling: string;
  correctSpelling: string;
  isCorrect: boolean;
  attemptNumber: number;
}

export interface PracticeSession {
  id: string;
  listId: string;
  sessionDate: string;
  sessionType: 'teaching' | 'practice';
  attempts: Attempt[];
  score: number;
  durationSeconds: number;
  completed: boolean;
  createdDate: string;
}

export interface ProgressRecord {
  id: string;
  listId: string;
  word: string;
  totalAttempts: number;
  correctAttempts: number;
  consecutiveCorrect: number;
  isMastered: boolean;
  lastPracticedDate: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface AppData {
  wordLists: WordList[];
  practiceSessions: PracticeSession[];
  progressRecords: ProgressRecord[];
}