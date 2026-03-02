import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, Flame, Award, TrendingUp, Zap, Heart, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useMemo } from 'react';

export const AchievementsCard = () => {
  const { wordLists, practiceSessions, progressRecords } = useApp();

  const stats = useMemo(() => {
    const totalWords = wordLists.reduce((sum, list) => sum + list.words.length, 0);
    const masteredWords = progressRecords.filter(r => r.isMastered).length;
    const totalSessions = practiceSessions.length;
    const completedSessions = practiceSessions.filter(s => s.completed).length;
    
    const totalAttempts = progressRecords.reduce((sum, r) => sum + r.totalAttempts, 0);
    const correctAttempts = progressRecords.reduce((sum, r) => sum + r.correctAttempts, 0);
    const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Calculate streak (sessions in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSessions = practiceSessions.filter(s => 
      new Date(s.sessionDate) >= sevenDaysAgo
    ).length;

    // Calculate mastery percentage
    const masteryPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

    return {
      totalWords,
      masteredWords,
      totalSessions,
      completedSessions,
      successRate,
      recentSessions,
      masteryPercentage,
    };
  }, [wordLists, practiceSessions, progressRecords]);

  const achievements = useMemo(() => {
    const earned = [];

    if (stats.completedSessions >= 1) {
      earned.push({ icon: Star, title: 'First Steps!', description: 'Completed your first practice', color: 'from-yellow-400 to-orange-400', emoji: '⭐' });
    }
    if (stats.completedSessions >= 5) {
      earned.push({ icon: Flame, title: 'On Fire!', description: 'Completed 5 practice sessions', color: 'from-red-400 to-orange-500', emoji: '🔥' });
    }
    if (stats.completedSessions >= 10) {
      earned.push({ icon: Trophy, title: 'Practice Master!', description: 'Completed 10 practice sessions', color: 'from-purple-400 to-pink-500', emoji: '🏆' });
    }
    if (stats.masteredWords >= 5) {
      earned.push({ icon: Award, title: 'Word Wizard!', description: 'Mastered 5 words', color: 'from-blue-400 to-cyan-500', emoji: '🧙' });
    }
    if (stats.masteredWords >= 12) {
      earned.push({ icon: Target, title: 'Spelling Champion!', description: 'Mastered a full list', color: 'from-green-400 to-emerald-500', emoji: '🎯' });
    }
    if (stats.successRate >= 80) {
      earned.push({ icon: TrendingUp, title: 'Super Speller!', description: '80%+ success rate', color: 'from-indigo-400 to-purple-500', emoji: '🚀' });
    }
    if (stats.recentSessions >= 3) {
      earned.push({ icon: Zap, title: 'Weekly Warrior!', description: '3+ sessions this week', color: 'from-orange-400 to-red-500', emoji: '⚡' });
    }

    return earned;
  }, [stats]);

  // Determine level based on mastered words
  const getLevel = () => {
    if (stats.masteredWords === 0) return { level: 1, title: 'Beginner', emoji: '🌱', color: 'from-green-300 to-green-400' };
    if (stats.masteredWords < 5) return { level: 2, title: 'Learner', emoji: '🌿', color: 'from-blue-300 to-blue-400' };
    if (stats.masteredWords < 12) return { level: 3, title: 'Explorer', emoji: '🌟', color: 'from-purple-300 to-purple-400' };
    if (stats.masteredWords < 24) return { level: 4, title: 'Expert', emoji: '⭐', color: 'from-yellow-300 to-yellow-400' };
    return { level: 5, title: 'Master', emoji: '👑', color: 'from-pink-300 to-pink-400' };
  };

  const currentLevel = getLevel();

  if (wordLists.length === 0) {
    return null;
  }

  return (
    <Card className="border-4 border-yellow-400 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
        </div>
        <CardTitle className="text-4xl flex items-center justify-center gap-3 relative z-10">
          <Trophy className="w-10 h-10 animate-bounce" />
          <span>Your Amazing Progress!</span>
          <Sparkles className="w-10 h-10 animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 space-y-8">
        {/* Level Display */}
        <div className={`text-center p-8 rounded-3xl bg-gradient-to-r ${currentLevel.color} border-4 border-white shadow-2xl transform hover:scale-105 transition-transform`}>
          <div className="text-8xl mb-4 animate-bounce">{currentLevel.emoji}</div>
          <div className="text-4xl font-bold text-white mb-2">Level {currentLevel.level}</div>
          <div className="text-3xl font-bold text-white">{currentLevel.title}</div>
        </div>

        {/* Mastery Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-700 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Words Mastered
            </span>
            <span className="text-3xl font-bold text-purple-700">{stats.masteredWords}/{stats.totalWords}</span>
          </div>
          <Progress value={stats.masteryPercentage} className="h-8 bg-purple-200" />
          <div className="text-center text-xl font-bold text-purple-600">
            {stats.masteryPercentage}% Complete! 🎯
          </div>
        </div>

        {/* Stats Grid with Big Emojis */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl border-4 border-blue-300 shadow-lg transform hover:scale-105 transition-transform">
            <div className="text-6xl mb-3">📚</div>
            <div className="text-5xl font-bold text-blue-700 mb-2">{stats.totalWords}</div>
            <div className="text-lg font-bold text-blue-600">Total Words</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl border-4 border-green-300 shadow-lg transform hover:scale-105 transition-transform">
            <div className="text-6xl mb-3">⭐</div>
            <div className="text-5xl font-bold text-green-700 mb-2">{stats.masteredWords}</div>
            <div className="text-lg font-bold text-green-600">Mastered!</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl border-4 border-purple-300 shadow-lg transform hover:scale-105 transition-transform">
            <div className="text-6xl mb-3">🎮</div>
            <div className="text-5xl font-bold text-purple-700 mb-2">{stats.completedSessions}</div>
            <div className="text-lg font-bold text-purple-600">Sessions</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl border-4 border-pink-300 shadow-lg transform hover:scale-105 transition-transform">
            <div className="text-6xl mb-3">🎯</div>
            <div className="text-5xl font-bold text-pink-700 mb-2">{stats.successRate}%</div>
            <div className="text-lg font-bold text-pink-600">Success!</div>
          </div>
        </div>

        {/* Achievements/Badges */}
        {achievements.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-purple-700 flex items-center justify-center gap-3">
              <Award className="w-8 h-8" />
              Your Awesome Badges!
              <Award className="w-8 h-8" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border-4 border-white bg-gradient-to-r ${achievement.color} text-white shadow-2xl transform hover:scale-105 transition-transform hover:rotate-2`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-6xl">{achievement.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-2xl mb-1">{achievement.title}</div>
                        <div className="text-lg opacity-90">{achievement.description}</div>
                      </div>
                      <Icon className="w-12 h-12 opacity-50" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Motivational Message with Animation */}
        <div className="text-center p-8 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-3xl border-4 border-purple-300 shadow-xl">
          <div className="text-6xl mb-4 animate-bounce">
            {stats.masteredWords === 0 && "🌟"}
            {stats.masteredWords > 0 && stats.masteredWords < 5 && "🚀"}
            {stats.masteredWords >= 5 && stats.masteredWords < 12 && "⭐"}
            {stats.masteredWords >= 12 && "🎉"}
          </div>
          <p className="text-3xl font-bold text-purple-700">
            {stats.masteredWords === 0 && "Start practicing to earn your first badge!"}
            {stats.masteredWords > 0 && stats.masteredWords < 5 && "You're doing GREAT! Keep going!"}
            {stats.masteredWords >= 5 && stats.masteredWords < 12 && "WOW! You're a spelling STAR!"}
            {stats.masteredWords >= 12 && "AMAZING! You're a spelling CHAMPION!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};