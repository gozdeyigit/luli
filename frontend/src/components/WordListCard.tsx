import { WordList } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit, Trash2, GraduationCap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface WordListCardProps {
  wordList: WordList;
  onDelete: (id: string) => void;
}

export const WordListCard: React.FC<WordListCardProps> = ({ wordList, onDelete }) => {
  const navigate = useNavigate();

  const cardColors = [
    'from-pink-300 to-purple-300',
    'from-blue-300 to-cyan-300',
    'from-green-300 to-teal-300',
    'from-yellow-300 to-orange-300',
    'from-red-300 to-pink-300',
  ];
  
  const colorIndex = wordList.id.charCodeAt(0) % cardColors.length;

  return (
    <Card className={`hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-purple-300 bg-gradient-to-br ${cardColors[colorIndex]}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <BookOpen className="w-6 h-6" />
          <span className="text-xl font-bold">{wordList.name}</span>
        </CardTitle>
        <CardDescription className="text-purple-700 font-semibold">
          Created {format(new Date(wordList.createdDate), 'MMM d, yyyy')}
          {wordList.lastPracticedDate && (
            <> • Last practiced {format(new Date(wordList.lastPracticedDate), 'MMM d, yyyy')}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {wordList.words.slice(0, 6).map((word, index) => (
            <span key={index} className="px-3 py-2 bg-white/80 text-purple-700 rounded-lg text-base font-bold shadow-md">
              {word}
            </span>
          ))}
          {wordList.words.length > 6 && (
            <span className="px-3 py-2 text-purple-700 text-base font-bold">
              +{wordList.words.length - 6} more
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate(`/teach/${wordList.id}`)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg shadow-lg"
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            Teach Me! 📖
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(`/practice/${wordList.id}`)}
            className="w-full border-4 border-blue-400 text-blue-700 hover:bg-blue-100 font-bold text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Practice! ✨
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/edit/${wordList.id}`)}
              className="flex-1 border-2 border-green-400 text-green-700 hover:bg-green-100"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(wordList.id)}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};