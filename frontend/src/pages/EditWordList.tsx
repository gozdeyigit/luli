import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AudioRecorder } from '@/components/AudioRecorder';
import { ArrowLeft, Save, Sparkles, Mic } from 'lucide-react';
import { validateWordList } from '@/utils/validation';
import { saveWordList, loadData } from '@/utils/storage';
import { showSuccess, showError } from '@/utils/toast';
import { useApp } from '@/contexts/AppContext';
import { isAudioRecordingSupported } from '@/utils/speech';

const EditWordList = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { refreshData } = useApp();
  const [listName, setListName] = useState('');
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [useCustomVoice, setUseCustomVoice] = useState(false);
  const [audioRecordings, setAudioRecordings] = useState<{ [word: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = loadData();
      const list = data.wordLists.find(l => l.id === id);
      
      if (list) {
        setListName(list.name);
        setWords(list.words);
        if (list.audioRecordings) {
          setAudioRecordings(list.audioRecordings);
          setUseCustomVoice(true);
        }
      } else {
        showError('Word list not found');
        navigate('/');
      }
      
      setLoading(false);
    }
  }, [id, navigate]);

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    const oldWord = newWords[index];
    newWords[index] = value;
    setWords(newWords);

    // If word changed and had a recording, remove it
    if (oldWord && audioRecordings[oldWord] && oldWord !== value) {
      const newRecordings = { ...audioRecordings };
      delete newRecordings[oldWord];
      setAudioRecordings(newRecordings);
    }
  };

  const handleRecordingComplete = (word: string, audio: string) => {
    setAudioRecordings(prev => ({ ...prev, [word]: audio }));
  };

  const handleRecordingDelete = (word: string) => {
    const newRecordings = { ...audioRecordings };
    delete newRecordings[word];
    setAudioRecordings(newRecordings);
  };

  const handleSave = () => {
    const validation = validateWordList(listName, words);
    
    if (!validation.valid) {
      showError(validation.error || 'Invalid word list');
      return;
    }

    if (!id) return;

    const data = loadData();
    const existingList = data.wordLists.find(l => l.id === id);
    
    if (!existingList) {
      showError('Word list not found');
      return;
    }

    const updatedList = {
      ...existingList,
      name: listName.trim(),
      words: words.map(w => w.trim()),
      lastModifiedDate: new Date().toISOString(),
      audioRecordings: useCustomVoice ? audioRecordings : undefined,
    };

    saveWordList(updatedList);
    refreshData();
    showSuccess('Word list updated successfully!');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-200">
        <p className="text-2xl font-bold text-purple-700">Loading... 🌟</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200 dark:from-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-lg font-bold text-purple-700 hover:text-purple-900 hover:bg-purple-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-4 border-blue-400 shadow-2xl bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-t-lg">
            <CardTitle className="text-3xl flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              Edit Your Word List! ✏️
            </CardTitle>
            <CardDescription className="text-white text-lg font-semibold">
              Update your spelling practice list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="listName" className="text-xl font-bold text-blue-700">List Name</Label>
              <Input
                id="listName"
                placeholder="e.g., My Super Cool Words! 🌟"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                maxLength={100}
                className="text-xl border-4 border-blue-300 focus:border-blue-500 rounded-xl"
              />
            </div>

            {isAudioRecordingSupported() && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border-3 border-blue-300">
                <div className="flex items-center gap-3">
                  <Mic className="w-6 h-6 text-purple-600" />
                  <div>
                    <Label htmlFor="custom-voice" className="text-lg font-bold text-purple-700 cursor-pointer">
                      Use My Voice 🎤
                    </Label>
                    <p className="text-sm text-purple-600">Record your own pronunciation for each word</p>
                  </div>
                </div>
                <Switch
                  id="custom-voice"
                  checked={useCustomVoice}
                  onCheckedChange={setUseCustomVoice}
                />
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-xl font-bold text-blue-700">Your 12 Words (all required!)</Label>
              <div className="grid grid-cols-1 gap-4">
                {words.map((word, index) => (
                  <div key={index} className="space-y-2 p-4 bg-white rounded-lg border-2 border-purple-200">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`word-${index}`} className="text-lg font-semibold text-blue-600 min-w-[80px]">
                        Word {index + 1} 📝
                      </Label>
                      <Input
                        id={`word-${index}`}
                        placeholder={`Enter word ${index + 1}`}
                        value={word}
                        onChange={(e) => handleWordChange(index, e.target.value)}
                        maxLength={50}
                        className="text-lg border-2 border-purple-300 focus:border-purple-500 rounded-lg flex-1"
                      />
                    </div>
                    {useCustomVoice && word.trim() && (
                      <div className="ml-[88px]">
                        <AudioRecorder
                          word={word.trim()}
                          existingAudio={audioRecordings[word.trim()]}
                          onRecordingComplete={(audio) => handleRecordingComplete(word.trim(), audio)}
                          onRecordingDelete={() => handleRecordingDelete(word.trim())}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleSave} 
                className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-xl py-6 shadow-lg transform hover:scale-105 transition-transform"
              >
                <Save className="w-6 h-6 mr-2" />
                Save Changes! 🎉
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-4 border-red-400 text-red-700 hover:bg-red-100 font-bold text-xl py-6"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditWordList;