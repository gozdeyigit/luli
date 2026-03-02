import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Target, TrendingUp, Star, Sparkles } from 'lucide-react';
import { ProgressRecord } from '@/types';

interface WordProgressTableProps {
  progressRecords: ProgressRecord[];
  listName: string;
}

export const WordProgressTable: React.FC<WordProgressTableProps> = ({ progressRecords, listName }) => {
  if (progressRecords.length === 0) {
    return (
      <Card className="border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="pt-8 pb-8 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <p className="text-2xl font-bold text-blue-600">
            Start practicing to see your word progress! 🎯
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedRecords = [...progressRecords].sort((a, b) => {
    // Mastered words first, then by success rate
    if (a.isMastered !== b.isMastered) {
      return a.isMastered ? -1 : 1;
    }
    const aRate = a.totalAttempts > 0 ? a.correctAttempts / a.totalAttempts : 0;
    const bRate = b.totalAttempts > 0 ? b.correctAttempts / b.totalAttempts : 0;
    return bRate - aRate;
  });

  return (
    <Card className="border-4 border-purple-400 shadow-2xl bg-gradient-to-br from-white to-purple-50">
      <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-t-lg">
        <CardTitle className="text-3xl flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8" />
          Word Progress: {listName}
          <Star className="w-8 h-8" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {sortedRecords.map((record) => {
          const successRate = record.totalAttempts > 0 
            ? Math.round((record.correctAttempts / record.totalAttempts) * 100) 
            : 0;
          
          const getStatusEmoji = () => {
            if (record.isMastered) return '🌟';
            if (successRate >= 80) return '🎯';
            if (successRate >= 60) return '📚';
            if (successRate >= 40) return '💪';
            return '🌱';
          };

          const getStatusColor = () => {
            if (record.isMastered) return 'from-yellow-100 to-orange-100 border-yellow-400';
            if (successRate >= 80) return 'from-green-100 to-emerald-100 border-green-400';
            if (successRate >= 60) return 'from-blue-100 to-cyan-100 border-blue-400';
            if (successRate >= 40) return 'from-purple-100 to-pink-100 border-purple-400';
            return 'from-gray-100 to-gray-200 border-gray-400';
          };

          const getStatusText = () => {
            if (record.isMastered) return 'MASTERED!';
            if (successRate >= 80) return 'Almost There!';
            if (successRate >= 60) return 'Good Progress!';
            if (successRate >= 40) return 'Keep Trying!';
            return 'Just Started!';
          };

          return (
            <div
              key={record.id}
              className={`p-6 rounded-2xl border-4 bg-gradient-to-r ${getStatusColor()} shadow-lg transform hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{getStatusEmoji()}</div>
                  <div>
                    <h3 className="text-3xl font-bold text-purple-700">{record.word}</h3>
                    <Badge className={`text-lg px-4 py-1 mt-2 ${record.isMastered ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-blue-400 to-purple-400'} text-white font-bold`}>
                      {getStatusText()}
                    </Badge>
                  </div>
                </div>
                {record.isMastered && (
                  <CheckCircle2 className="w-16 h-16 text-green-600 animate-pulse" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-600">Success Rate:</span>
                  <span className="text-2xl font-bold text-purple-700">{successRate}%</span>
                </div>
                <Progress value={successRate} className="h-4 bg-purple-200" />

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-white/80 rounded-xl border-2 border-blue-300">
                    <div className="text-3xl font-bold text-blue-700">{record.totalAttempts}</div>
                    <div className="text-sm font-bold text-blue-600">Total Tries</div>
                  </div>
                  <div className="text-center p-3 bg-white/80 rounded-xl border-2 border-green-300">
                    <div className="text-3xl font-bold text-green-700">{record.correctAttempts}</div>
                    <div className="text-sm font-bold text-green-600">Correct! ✓</div>
                  </div>
                  <div className="text-center p-3 bg-white/80 rounded-xl border-2 border-orange-300">
                    <div className="text-3xl font-bold text-orange-700">{record.consecutiveCorrect}</div>
                    <div className="text-sm font-bold text-orange-600">In a Row! 🔥</div>
                  </div>
                </div>

                {record.consecutiveCorrect >= 1 && record.consecutiveCorrect < 3 && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-400 text-center">
                    <TrendingUp className="w-6 h-6 inline-block mr-2 text-orange-600" />
                    <span className="text-lg font-bold text-orange-700">
                      {3 - record.consecutiveCorrect} more correct in a row to master! 🎯
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};