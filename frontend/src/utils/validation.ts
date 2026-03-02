export const validateWord = (word: string): { valid: boolean; error?: string } => {
  if (!word || word.trim().length === 0) {
    return { valid: false, error: 'Word cannot be empty' };
  }
  
  if (word.length > 50) {
    return { valid: false, error: 'Word must be 50 characters or less' };
  }
  
  // Allow letters, hyphens, apostrophes, and spaces
  const validPattern = /^[a-zA-Z\s'-]+$/;
  if (!validPattern.test(word)) {
    return { valid: false, error: 'Word can only contain letters, hyphens, and apostrophes' };
  }
  
  return { valid: true };
};

export const validateWordList = (name: string, words: string[]): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'List name is required' };
  }
  
  if (name.length > 100) {
    return { valid: false, error: 'List name must be 100 characters or less' };
  }
  
  if (words.length !== 12) {
    return { valid: false, error: 'List must contain exactly 12 words' };
  }
  
  for (let i = 0; i < words.length; i++) {
    const validation = validateWord(words[i]);
    if (!validation.valid) {
      return { valid: false, error: `Word ${i + 1}: ${validation.error}` };
    }
  }
  
  return { valid: true };
};

export const compareSpelling = (userSpelling: string, correctSpelling: string): boolean => {
  const normalize = (str: string) => str.trim().toLowerCase();
  return normalize(userSpelling) === normalize(correctSpelling);
};