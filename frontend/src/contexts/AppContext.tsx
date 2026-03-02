import React, { createContext, useContext, useState, useEffect } from 'react';
import { WordList, PracticeSession, ProgressRecord, AppData } from '@/types';
import { loadData, saveData } from '@/utils/storage';

interface AppContextType {
  wordLists: WordList[];
  practiceSessions: PracticeSession[];
  progressRecords: ProgressRecord[];
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(loadData());

  const refreshData = () => {
    setData(loadData());
  };

  useEffect(() => {
    // Save data whenever it changes
    saveData(data);
  }, [data]);

  return (
    <AppContext.Provider
      value={{
        wordLists: data.wordLists,
        practiceSessions: data.practiceSessions,
        progressRecords: data.progressRecords,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};