import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, Star, Sparkles, Flag, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { shuffleArray } from '@/utils/array';
import { speakWord } from '@/utils/speech';
import { showSuccess, showError } from '@/utils/toast';

interface FinnishWord {
  id: string;
  english: string;
  finnish: string;
}

interface Attempt {
  english: string;
  finnish: string;
  userAnswer: string;
  isCorrect: boolean;
}

const DEFAULT_FINNISH_WORDS: Omit<FinnishWord, 'id'>[] = [
  { english: 'hello', finnish: 'hei' },
  { english: 'goodbye', finnish: 'näkemiin' },
  { english: 'thank you', finnish: 'kiitos' },
  { english: 'yes', finnish: 'kyllä' },
  { english: 'no', finnish: 'ei' },
  { english: 'water', finnish: 'vesi' },
  { english: 'food', finnish: 'ruoka' },
  { english: 'house', finnish: 'talo' },
  { english: 'cat', finnish: 'kissa' },
  { english: 'dog', finnish: 'koira' },
  { english: 'friend', finnish: 'ystävä' },
  { english: 'love', finnish: 'rakkaus' },
];

const STORAGE_KEY = 'finnish_words';

const loadFinnishWords = (): FinnishWord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading Finnish words:', error);
  }
  // Initialize with default words
  const defaultWords = DEFAULT_FINNISH_WORDS.map(word => ({
    ...word,
    id: crypto.randomUUID(),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWords));
  return defaultWords;
};

const saveFinnishWords = (words: FinnishWord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
};

const FinnishPractice = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'practice' | 'complete'>('list');
  const [finnishWords, setFinnishWords] = useState<FinnishWord[]>([]);
  const [shuffledWords, setShuffledWords] = useState<FinnishWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  
  // Edit mode states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEnglish, setEditEnglish] = useState('');
  const [editFinnish, setEditFinnish] = useState('');
  
  // Add mode states
  const [isAdding, setIsAdding] = useState(false);
  const [newEnglish, setNewEnglish] = useState('');
  const [newFinnish, setNewFinnish] = useState('');

  useEffect(() => {
    const words = loadFinnishWords();
    setFinnishWords(words);
  }, []);

  const handleAddWord = () => {
    if (!newEnglish.trim() || !newFinnish.trim()) {
      showError('Please enter both English and Finnish words');
      return;
    }

    const newWord: FinnishWord = {
      id: crypto.randomUUID(),
      english: newEnglish.trim(),
      finnish: newFinnish.trim(),
    };

    const updatedWords = [...finnishWords, newWord];
    setFinnishWords(updatedWords);
    saveFinnishWords(updatedWords);
    setNewEnglish('');
    setNewFinnish('');
    setIsAdding(false);
    showSuccess('Word added successfully!');
  };

  const handleEditWord = (word: FinnishWord) => {
    setEditingId(word.id);
    setEditEnglish(word.english);
    setEditFinnish(word.finnish);
  };

  const handleSaveEdit = () => {
    if (!editEnglish.trim() || !editFinnish.trim()) {
      showError('Please enter both English and Finnish words');
      return;
    }

    const updatedWords = finnishWords.map(word =>
      word.id === editingId
        ? { ...word, english: editEnglish.trim(), finnish: editFinnish.trim() }
        : word
    );
    setFinnishWords(updatedWords);
    saveFinnishWords(updatedWords);
    setEditingId(null);
    setEditEnglish('');
    setEditFinnish('');
    showSuccess('Word updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditEnglish('');
    setEditFinnish('');
  };

  const handleDeleteWord = (id: string) => {
    const updatedWords = finnishWords.filter(word => word.id !== id);
    setFinnishWords(updatedWords);
    saveFinnishWords(updatedWords);
    showSuccess('Word deleted successfully!');
  };

  const startPractice = () => {
    if (finnishWords.length === 0) {
      showError('Please add some words first!');
      return;
    }
    const randomized = shuffleArray([...finnishWords]);
    setShuffledWords(randomized);
    setView('practice');
    setStartTime(Date.now());
    setCurrentIndex(0);
    setAttempts([]);
    setShowResult(false);
  };

  const normalizeText = (text: string): string => {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const handleSubmit = () => {
    if (!userInput.trim() || shuffledWords.length === 0) return;

    const currentWord = shuffledWords[currentIndex];
    const correct = normalizeText(userInput) === normalizeText(currentWord.finnish);
    
    const attempt: Attempt = {
      english: currentWord.english,
      finnish: currentWord.finnish,
      userAnswer: userInput.trim(),
      isCorrect: correct,
    };

    setAttempts([...attempts, attempt]);
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    if (shuffledWords.length === 0) return;

    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setShowResult(false);
    } else {
      setView('complete');
    }
  };

  const handleSpeak = (text: string) => {
    speakWord(text);
  };

  const resetToList = () => {
    setView('list');
    setCurrentIndex(0);
    setAttempts([]);
    setShowResult(false);
    setUserInput('');
  };

  // Word List View
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-purple-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-lg font-bold text-purple-700 hover:text-purple-900 hover:bg-purple-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-4 border-purple-400 shadow-2xl bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-center text-4xl flex items-center justify-center gap-3">
                <Flag className="w-10 h-10" />
                My Finnish Words 🇫🇮
                <BookOpen className="w-10 h-10" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-xl text-purple-700 font-bold">
                    {finnishWords.length} word{finnishWords.length !== 1 ? 's' : ''} 📚
                  </p>
                  <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Word
                  </Button>
                </div>

                {/* Add New Word Form */}
                {isAdding && (
                  <Card className="border-3 border-green-300 bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-purple-700 mb-1 block">
                            English Word
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter English word..."
                            value={newEnglish}
                            onChange={(e) => setNewEnglish(e.target.value)}
                            className="text-lg border-2 border-blue-300"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-purple-700 mb-1 block">
                            Finnish Translation
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter Finnish translation..."
                            value={newFinnish}
                            onChange={(e) => setNewFinnish(e.target.value)}
                            className="text-lg border-2 border-blue-300"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAddWord}
                            className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setIsAdding(false);
                              setNewEnglish('');
                              setNewFinnish('');
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Word List */}
                {finnishWords.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                    <p className="text-xl text-purple-600 font-bold">
                      No words yet! Add your first Finnish word to get started. 🌟
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {finnishWords.map((word) => (
                      <div key={word.id}>
                        {editingId === word.id ? (
                          <Card className="border-3 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-semibold text-purple-700 mb-1 block">
                                    English Word
                                  </label>
                                  <Input
                                    type="text"
                                    value={editEnglish}
                                    onChange={(e) => setEditEnglish(e.target.value)}
                                    className="text-lg border-2 border-blue-300"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-semibold text-purple-700 mb-1 block">
                                    Finnish Translation
                                  </label>
                                  <Input
                                    type="text"
                                    value={editFinnish}
                                    onChange={(e) => setEditFinnish(e.target.value)}
                                    className="text-lg border-2 border-blue-300"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleSaveEdit}
                                    className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    onClick={handleCancelEdit}
                                    variant="outline"
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border-3 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-lg text-blue-600 font-semibold mb-1">
                                  {word.english}
                                </p>
                                <p className="text-2xl text-purple-700 font-bold">
                                  {word.finnish}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSpeak(word.finnish)}
                                  className="hover:bg-purple-200"
                                >
                                  <Volume2 className="w-5 h-5 text-purple-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditWord(word)}
                                  className="hover:bg-blue-200"
                                >
                                  <Edit className="w-5 h-5 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteWord(word.id)}
                                  className="hover:bg-red-200"
                                >
                                  <Trash2 className="w-5 h-5 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {finnishWords.length > 0 && (
                  <div className="mt-8">
                    <Button
                      onClick={startPractice}
                      className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-2xl py-8 shadow-lg transform hover:scale-105 transition-transform"
                      size="lg"
                    >
                      <Sparkles className="w-6 h-6 mr-2" />
                      Start Practice! 🚀
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Complete View
  if (view === 'complete') {
    const score = Math.round((attempts.filter(a => a.isCorrect).length / attempts.length) * 100);
    const incorrectWords = attempts.filter(a => !a.isCorrect);
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 dark:from-purple-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-4 border-yellow-400 shadow-2xl bg-gradient-to-br from-yellow-100 to-green-100">
            <CardHeader className="bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-t-lg">
              <CardTitle className="text-center text-4xl flex items-center justify-center gap-3">
                <Star className="w-10 h-10 animate-pulse" />
                Finnish Practice Complete! 🎉
                <Star className="w-10 h-10 animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="text-center">
                <div className="text-8xl font-bold text-purple-700 mb-4 drop-shadow-lg">{score}%</div>
                <p className="text-2xl text-purple-600 font-bold">
                  You got {attempts.filter(a => a.isCorrect).length} out of {attempts.length} correct! 🌟
                </p>
                <p className="text-xl text-purple-600 mt-2">
                  Time: {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')} ⏱️
                </p>
              </div>

              {incorrectWords.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-2xl text-purple-700">Words to Review: 📖</h3>
                  <div className="space-y-3">
                    {incorrectWords.map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl border-3 border-purple-300 shadow-md">
                        <div className="flex-1">
                          <p className="font-bold text-xl text-purple-700">
                            {attempt.english} → {attempt.finnish}
                          </p>
                          <p className="text-lg text-purple-600">
                            You wrote: <span className="font-semibold">{attempt.userAnswer}</span>
                          </p>
                        </div>
                        <Button
                          size="lg"
                          variant="ghost"
                          onClick={() => handleSpeak(attempt.finnish)}
                          className="hover:bg-purple-200"
                        >
                          <Volume2 className="w-6 h-6 text-purple-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={resetToList} 
                  variant="outline" 
                  className="flex-1 border-4 border-blue-400 text-blue-700 hover:bg-blue-100 font-bold text-xl py-6"
                >
                  📚 Back to Word List
                </Button>
                <Button 
                  onClick={startPractice} 
                  className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-xl py-6 shadow-lg transform hover:scale-105 transition-transform"
                >
                  🔄 Practice Again!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Practice View
  const progress = ((currentIndex + 1) / shuffledWords.length) * 100;
  const currentWord = shuffledWords[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={resetToList}
          className="mb-6 text-lg font-bold text-purple-700 hover:text-purple-900 hover:bg-purple-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Word List
        </Button>

        <Card className="mb-6 border-4 border-purple-400 shadow-xl bg-gradient-to-r from-purple-100 to-pink-100">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Flag className="w-6 h-6" />
                Finnish Practice 🇫🇮
              </span>
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                English → Finnish
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold text-purple-700">
                <span>Word {currentIndex + 1} of {shuffledWords.length} 📝</span>
                <span>{Math.round(progress)}% Complete 🎯</span>
              </div>
              <Progress value={progress} className="h-4 bg-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-blue-400 shadow-2xl bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div className="text-center">
                <Badge className="mb-4 text-xl px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Word {currentIndex + 1}
                </Badge>
                
                <div className="mb-6 p-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl border-4 border-blue-300">
                  <p className="text-sm text-blue-600 font-semibold mb-2">Translate to Finnish:</p>
                  <h2 className="text-5xl font-bold text-blue-800 mb-4">{currentWord.english}</h2>
                  <Button
                    size="lg"
                    onClick={() => handleSpeak(currentWord.english)}
                    className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold text-lg px-6 py-4 shadow-lg transform hover:scale-110 transition-transform"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    🔊 Hear English
                  </Button>
                </div>
              </div>

              {!showResult ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Type the Finnish translation... ✏️"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    className="text-3xl text-center py-8 border-4 border-purple-300 focus:border-purple-500 rounded-xl font-bold"
                    autoFocus
                  />
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-2xl py-8 shadow-lg transform hover:scale-105 transition-transform" 
                    size="lg"
                  >
                    ✅ Submit Answer!
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`text-center p-8 rounded-2xl border-4 ${isCorrect ? 'bg-gradient-to-br from-green-200 to-green-300 border-green-400' : 'bg-gradient-to-br from-red-200 to-red-300 border-red-400'}`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-24 h-24 mx-auto mb-4 text-green-600 animate-bounce" />
                        <h3 className="text-4xl font-bold text-green-800 mb-4">
                          🎉 Oikein! (Correct!) 🎉
                        </h3>
                        <p className="text-2xl text-green-700 font-bold">
                          {currentWord.english} = {currentWord.finnish} ⭐
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-24 h-24 mx-auto mb-4 text-red-600" />
                        <h3 className="text-4xl font-bold text-red-800 mb-4">
                          Not Quite! 💪
                        </h3>
                        <p className="text-2xl text-red-700 mb-3 font-bold">
                          You wrote: <span className="font-extrabold">{userInput}</span>
                        </p>
                        <p className="text-2xl text-red-700 font-bold mb-4">
                          Correct answer: <span className="font-extrabold">{currentWord.finnish}</span>
                        </p>
                        <Button
                          size="lg"
                          onClick={() => handleSpeak(currentWord.finnish)}
                          className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold text-lg px-6 py-3"
                        >
                          <Volume2 className="w-5 h-5 mr-2" />
                          🔊 Hear Finnish
                        </Button>
                      </>
                    )}
                  </div>
                  <Button 
                    onClick={handleNext} 
                    className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold text-2xl py-8 shadow-lg transform hover:scale-105 transition-transform" 
                    size="lg"
                  >
                    {currentIndex < shuffledWords.length - 1 ? '➡️ Next Word!' : '🎊 Finish Practice!'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinnishPractice;