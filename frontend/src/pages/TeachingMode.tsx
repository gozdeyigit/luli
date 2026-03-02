import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Volume2, GraduationCap, Star, Sparkles, Mic, User } from 'lucide-react';
import { loadData } from '@/utils/storage';
import { speakWord, isSpeechSupported } from '@/utils/speech';
import { showError } from '@/utils/toast';
import { WordList } from '@/types';

const TeachingMode = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const voiceType = searchParams.get('voice') as 'custom' | 'tts' | null;
  const [wordList, setWordList] = useState<WordList | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
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
        }
      } else {
        showError('Word list not found');
        navigate('/');
      }
      
      setLoading(false);
    }
  }, [id, navigate, voiceType]);

  const handleVoiceSelection = (selectedVoice: 'custom' | 'tts') => {
    navigate(`/teach/${id}?voice=${selectedVoice}`, { replace: true });
    setShowVoiceSelection(false);
  };

  const handleNext = () => {
    if (wordList && currentIndex < wordList.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSpeak = () => {
    if (wordList) {
      const currentWord = wordList.words[currentIndex];
      const useCustom = voiceType === 'custom';
      const customAudio = useCustom ? wordList.audioRecordings?.[currentWord] : undefined;
      speakWord(currentWord, customAudio);
    }
  };

  const handleFinish = () => {
    navigate(`/practice/${id}${voiceType ? `?voice=${voiceType}` : ''}`);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 to-purple-300 dark:from-purple-900 dark:to-blue-900">
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
                Choose Your Teaching Voice! 🎤
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
                        Learn with a clear, friendly computer voice
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
                          ? 'Learn with your own recorded voice'
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

  const currentWord = wordList.words[currentIndex];
  const progress = ((currentIndex + 1) / wordList.words.length) * 100;
  const isLastWord = currentIndex === wordList.words.length - 1;
  const voiceLabel = voiceType === 'custom' ? '🎤 My Voice' : '🤖 Computer Voice';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 to-purple-300 dark:from-purple-900 dark:to-blue-900">
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
            <CardTitle className="flex items-center justify-between text-2xl text-purple-700">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-8 h-8" />
                Teaching Mode: {wordList.name} 📚
              </span>
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                {voiceLabel}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-lg font-bold text-purple-700">
                <span>Word {currentIndex + 1} of {wordList.words.length} ⭐</span>
                <span>{Math.round(progress)}% Complete 🎯</span>
              </div>
              <Progress value={progress} className="h-4 bg-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-4 border-yellow-400 shadow-2xl bg-gradient-to-br from-yellow-100 to-orange-100">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-8">
              <div className="flex justify-center gap-2 mb-4">
                <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-7xl font-bold text-purple-700 mb-4 drop-shadow-lg">
                  {currentWord}
                </h2>
                <p className="text-2xl text-purple-600 font-semibold">
                  Study this word carefully! 👀
                </p>
              </div>

              {isSpeechSupported() && (
                <Button
                  size="lg"
                  onClick={handleSpeak}
                  className="mx-auto bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold text-xl px-8 py-6 shadow-lg transform hover:scale-110 transition-transform"
                >
                  <Volume2 className="w-6 h-6 mr-2" />
                  🔊 Hear the Word!
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 border-4 border-blue-400 text-blue-700 hover:bg-blue-100 font-bold text-lg py-6 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ⬅️ Previous
          </Button>
          
          {isLastWord ? (
            <Button 
              onClick={handleFinish} 
              className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-lg py-6 shadow-lg transform hover:scale-105 transition-transform"
            >
              Start Practice! 🎉
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              className="flex-1 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold text-lg py-6 shadow-lg transform hover:scale-105 transition-transform"
            >
              Next Word ➡️
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachingMode;