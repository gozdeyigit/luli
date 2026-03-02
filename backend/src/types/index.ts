export interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: Record<string, any>;
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt: Date;
}

export interface WordList {
  id: string;
  userId: string;
  name: string;
  words: string[];
  audioRecordings?: Record<string, string>;
  createdAt: Date;
  lastModifiedAt: Date;
  lastPracticedAt?: Date;
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
  userId: string;
  listId: string;
  sessionType: 'teaching' | 'practice';
  attempts: Attempt[];
  score: number;
  durationSeconds: number;
  completed: boolean;
  sessionDate: Date;
  createdAt: Date;
}

export interface ProgressRecord {
  id: string;
  userId: string;
  listId: string;
  word: string;
  totalAttempts: number;
  correctAttempts: number;
  consecutiveCorrect: number;
  isMastered: boolean;
  lastPracticedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}