import { AppData, WordList, PracticeSession, ProgressRecord } from '@/types';

const STORAGE_KEY = 'spelling-practice-data';

const getDefaultData = (): AppData => ({
  wordLists: [],
  practiceSessions: [],
  progressRecords: [],
});

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultData();
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading data:', error);
    return getDefaultData();
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const saveWordList = (wordList: WordList): void => {
  const data = loadData();
  const index = data.wordLists.findIndex(list => list.id === wordList.id);
  
  if (index >= 0) {
    data.wordLists[index] = wordList;
  } else {
    data.wordLists.push(wordList);
  }
  
  saveData(data);
};

export const deleteWordList = (listId: string): void => {
  const data = loadData();
  data.wordLists = data.wordLists.filter(list => list.id !== listId);
  data.practiceSessions = data.practiceSessions.filter(session => session.listId !== listId);
  data.progressRecords = data.progressRecords.filter(record => record.listId !== listId);
  saveData(data);
};

export const savePracticeSession = (session: PracticeSession): void => {
  const data = loadData();
  data.practiceSessions.push(session);
  saveData(data);
};

export const saveProgressRecord = (record: ProgressRecord): void => {
  const data = loadData();
  const index = data.progressRecords.findIndex(
    r => r.listId === record.listId && r.word === record.word
  );
  
  if (index >= 0) {
    data.progressRecords[index] = record;
  } else {
    data.progressRecords.push(record);
  }
  
  saveData(data);
};

export const getProgressForList = (listId: string): ProgressRecord[] => {
  const data = loadData();
  return data.progressRecords.filter(record => record.listId === listId);
};

export const getSessionsForList = (listId: string): PracticeSession[] => {
  const data = loadData();
  return data.practiceSessions.filter(session => session.listId === listId);
};