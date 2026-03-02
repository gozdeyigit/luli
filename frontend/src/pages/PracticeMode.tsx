import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, Star, Sparkles, Mic, User } from 'lucide-react';
import { loadData, savePracticeSession, saveProgressRecord } from '@/utils/storage';
import { speakWord, isSpeechSupported } from '@/utils/speech';
import { compareSpelling } from '@/utils/validation';
import { shuffleArray } from '@/utils/array';
import { showSuccess, showError } from '@/utils/toast';
import { useApp } from '@/contexts/AppContext';
import { WordList, Attempt, ProgressRecord } from '@/types';

const PracticeMode = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const voiceType = searchParams.get('voice') as 'custom' | 'tts' | null;
  const { refreshData } = useApp();
  const [wordList, setWordList] = useState<WordList | null>(null);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [showVoiceSelection, setShowVoiceSelection] = useState(false);

  useEffect(() => {
    if (id) {
      const data = loadData();
      const list = data.wordLists.find(l => l.id === id);
      
      if (list) {
        setWordList(list);
        
        // Check if we need to show voice selection
        const hasCustomVoice = list.audioRecordings && Object.keys(list.audioRecordings).length > 0;
        if (!voiceType && hasCustomVoice) {
          setShowVoiceSelection(true);
          setLoading(false);
          return;
        }
        
        // Start practice
        const randomized = shuffleArray(list.words);
        setShuffledWords(randomized);
        const useCustom = voiceType === 'custom';
        const customAudio = useCustom ? list.audioRecordings?.[randomized[0]] : undefined;
        setTimeout(() => speakWord(randomized[0], customAudio), 500);
      } else {
        showError('Word list not found');
        navigate('/');
      }
      
      setLoading(false);
    }
  }, [id, navigate, voiceType]);

  const handleVoiceSelection = (selectedVoice: 'custom' | 'tts') => {
    navigate(`/practice/${id}?voice=${selectedVoice}`, { replace: true });
    setShowVoiceSelection(false);
  };

  const handleSubmit = () => {
    if (!wordList || !userInput.trim() || shuffledWords.length === 0) return;

    const currentWord = shuffledWords[currentIndex];
    const correct = compareSpelling(userInput, currentWord);
    
    const attempt: Attempt = {
      word: currentWord,
      userSpelling: userInput.trim(),
      correctSpelling: currentWord,
      isCorrect: correct,
      attemptNumber: 1,
    };

    setAttempts([...attempts, attempt]);
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    if (!wordList || shuffledWords.length === 0) return;

    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setShowResult(false);
      const nextWord = shuffledWords[currentIndex + 1];
      const useCustom = voiceType === 'custom';
      const customAudio = useCustom ? wordList.audioRecordings?.[nextWord] : undefined;
      setTimeout(() => speakWord(nextWord, customAudio), 300);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    if (!wordList || !id) return;

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const score = Math.round((attempts.filter(a => a.isCorrect).length / attempts.length) * 100);

    const session = {
      id: crypto.randomUUID(),
      listId: id,
      sessionDate: new Date().toISOString(),
      sessionType: 'practice' as const,
      attempts,
      score,
      durationSeconds,
      completed: true,
      createdDate: new Date().toISOString(),
    };

    savePracticeSession(session);

    const data = loadData();
    attempts.forEach(attempt => {
      const existingRecord = data.progressRecords.find(
        r => r.listId === id && r.word === attempt.word
      );

      let record: ProgressRecord;
      
      if (existingRecord) {
        record = {
          ...existingRecord,
          totalAttempts: existingRecord.totalAttempts + 1,
          correctAttempts: existingRecord.correctAttempts + (attempt.isCorrect ? 1 : 0),
          consecutiveCorrect: attempt.isCorrect ? existingRecord.consecutiveCorrect + 1 : 0,
          isMastered: attempt.isCorrect && existingRecord.consecutiveCorrect + 1 >= 3,
          lastPracticedDate: new Date().toISOString(),
          lastModifiedDate: new Date().toISOString(),
        };
      } else {
        record = {
          id: crypto.randomUUID(),
          listId: id,
          word: attempt.word,
          totalAttempts: 1,
          correctAttempts: attempt.isCorrect ? 1 : 0,
          consecutiveCorrect: attempt.isCorrect ? 1 : 0,
          isMastered: false,
          lastPracticedDate: new Date().toISOString(),
          createdDate: new Date().toISOString(),
          lastModifiedDate: new Date().toISOString(),
        };
      }

      saveProgressRecord(record);
    });

    refreshData();
    setSessionComplete(true);
  };

  const handleSpeak = () => {
    if (shuffledWords.length > 0 && wordList) {
      const currentWord = shuffledWords[currentIndex];
      const useCustom = voiceType === 'custom';
      const customAudio = useCustom ? wordList.audioRecordings?.[currentWord] : undefined;
      speakWord(currentWord, customAudio);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-200">
        <p className="text-2xl font-bold text-purple-700">Loading... 🌟</p>
      </div>
    );
  }

  if (!wordList) {
    return null;
  }

  // Voice Selection Screen
  if (showVoiceSelection) {
    const hasCustomVoice = wordList.audioRecordings && Object.keys(wordList.audioRecordings).length > 0;
    
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
            <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-t-lg">
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <Sparkles className="w-8 h-8" />
                Choose Your Practice Voice! 🎤
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                <p className="text-center text-xl text-purple-700 font-semibold mb-8">
                  How would you like to hear the words?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Computer Voice Option */}
                  <Card className="border-4 border-blue-300 hover:border-blue-500 transition-all cursor-pointer hover:shadow-xl"
                        onClick={() => handleVoiceSelection('tts')}>
                    <CardContent className="pt-8 pb-8 text-center">
                      <User className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                      <h3 className="text-2xl font-bold text-blue-700 mb-3">Computer Voice 🤖</h3>
                      <p className="text-lg text-blue-600 mb-4">
                        Practice with a clear, friendly computer voice
                      </p>
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white font-bold text-lg"
                      >
                        Use Computer Voice
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Custom Voice Option */}
                  <Card className={`border-4 transition-all ${hasCustomVoice ? 'border-pink-300 hover:border-pink-500 cursor-pointer hover:shadow-xl' : 'border-gray-300 opacity-50'}`}
                        onClick={() => hasCustomVoice && handleVoiceSelection('custom')}>
                    <CardContent className="pt-8 pb-8 text-center">
                      <Mic className="w-16 h-16 mx-auto mb-4 text-pink-500" />
                      <h3 className="text-2xl font-bold text-pink-700 mb-3">My Voice 🎤</h3>
                      <p className="text-lg text-pink-600 mb-4">
                        {hasCustomVoice 
                          ? 'Practice with your own recorded voice'
                          : 'No custom recordings available'}
                      </p>
                      <Button 
                        size="lg"
                        disabled={!hasCustomVoice}
                        className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold text-lg disabled:opacity-50"
                      >
                        {hasCustomVoice ? 'Use My Voice' : 'Not Available'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const score = Math.round((attempts.filter(a => a.isCorrect).length / attempts.length) * 100);
    const incorrectWords = attempts.filter(a => !a.isCorrect);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 dark:from-purple-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-4 border-yellow-400 shadow-2xl bg-gradient-to-br from-yellow-100 to-green-100">
            <CardHeader className="bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-t-lg">
              <CardTitle className="text-center text-4xl flex items-center justify-center gap-3">
                <Star className="w-10 h-10 animate-pulse" />
                Practice Complete! 🎉
                <Star className="w-10 h-10 animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="text-center">
                <div className="text-8xl font-bold text-purple-700 mb-4 drop-shadow-lg">{score}%</div>
                <p className="text-2xl text-purple-600 font-bold">
                  You got {attempts.filter(a => a.isCorrect).length} out of {attempts.length} correct! 🌟
                </p>
              </div>

              {incorrectWords.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-2xl text-purple-700">Words to Review: 📖</h3>
                  <div className="space-y-3">
                    {incorrectWords.map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl border-3 border-purple-300 shadow-md">
                        <div>
                          <p className="font-bold text-xl text-purple-700">{attempt.correctSpelling}</p>
                          <p className="text-lg text-purple-600">
                            You spelled: <span className="font-semibold">{attempt.userSpelling}</span>
                          </p>
                        </div>
                        {isSpeechSupported() && (
                          <Button
                            size="lg"
                            variant="ghost"
                            onClick={() => {
                              const useCustom = voiceType === 'custom';
                              const customAudio = useCustom ? wordList.audioRecordings?.[attempt.correctSpelling] : undefined;
                              speakWord(attempt.correctSpelling, customAudio);
                            }}
                            className="hover:bg-purple-200"
                          >
                            <Volume2 className="w-6 h-6 text-purple-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline" 
                  className="flex-1 border-4 border-blue-400 text-blue-700 hover:bg-blue-100 font-bold text-xl py-6"
                >
                  🏠 Back to Dashboard
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
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

  const progress = ((currentIndex + 1) / shuffledWords.length) * 100;
  const voiceLabel = voiceType === 'custom' ? '🎤 My Voice' : '🤖 Computer Voice';

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

        <Card className="mb-6 border-4 border-purple-400 shadow-xl bg-gradient-to-r from-purple-100 to-pink-100">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                Practice: {wordList.name} ✨
              </span>
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                {voiceLabel}
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
                {isSpeechSupported() && (
                  <Button
                    size="lg"
                    onClick={handleSpeak}
                    className="mb-6 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold text-xl px-8 py-6 shadow-lg transform hover:scale-110 transition-transform"
                  >
                    <Volume2 className="w-6 h-6 mr-2" />
                    🔊 Hear the Word!
                  </Button>
                )}
              </div>

              {!showResult ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Type the spelling here... ✏️"
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
                          🎉 Correct! 🎉
                        </h3>
                        <p className="text-2xl text-green-700 font-bold">
                          Great job spelling "{shuffledWords[currentIndex]}"! ⭐
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-24 h-24 mx-auto mb-4 text-red-600" />
                        <h3 className="text-4xl font-bold text-red-800 mb-4">
                          Not Quite! 💪
                        </h3>
                        <p className="text-2xl text-red-700 mb-3 font-bold">
                          You spelled: <span className="font-extrabold">{userInput}</span>
                        </p>
                        <p className="text-2xl text-red-700 font-bold">
                          Correct spelling: <span className="font-extrabold">{shuffledWords[currentIndex]}</span>
                        </p>
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

export default PracticeMode;