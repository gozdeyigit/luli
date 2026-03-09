import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { WordListCard } from '@/components/WordListCard';
import { AchievementsCard } from '@/components/AchievementsCard';
import { WordProgressTable } from '@/components/WordProgressTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, BookOpen, Sparkles, Trophy, ListChecks, Flag } from 'lucide-react';
import { deleteWordList } from '@/utils/storage';
import { showSuccess } from '@/utils/toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { wordLists, progressRecords, refreshData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [selectedListForProgress, setSelectedListForProgress] = useState<string | null>(null);

  const filteredLists = wordLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setListToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (listToDelete) {
      deleteWordList(listToDelete);
      refreshData();
      showSuccess('Word list deleted successfully');
      setDeleteDialogOpen(false);
      setListToDelete(null);
      if (selectedListForProgress === listToDelete) {
        setSelectedListForProgress(null);
      }
    }
  };

  // Get progress for selected list
  const selectedListProgress = selectedListForProgress 
    ? progressRecords.filter(r => r.listId === selectedListForProgress)
    : [];
  
  const selectedList = selectedListForProgress 
    ? wordLists.find(l => l.id === selectedListForProgress)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
            <h1 className="text-6xl font-bold text-purple-700 dark:text-purple-300 drop-shadow-lg">
              Luli
            </h1>
            <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-xl text-purple-600 dark:text-purple-300 font-semibold">
            🌟 Learn to spell amazing words! 🌟
          </p>
          
          {/* Finnish Practice Button */}
          <div className="mt-6">
            <Button
              onClick={() => navigate('/finnish-practice')}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-xl px-8 py-6 shadow-2xl transform hover:scale-105 transition-transform border-4 border-white"
            >
              <Flag className="w-6 h-6 mr-2" />
              🇫🇮 Learn Finnish Words!
            </Button>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="lists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-16 bg-white/80 border-4 border-purple-300 rounded-2xl p-2">
            <TabsTrigger value="lists" className="text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl">
              <BookOpen className="w-5 h-5 mr-2" />
              My Lists 📚
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl">
              <Trophy className="w-5 h-5 mr-2" />
              Achievements 🏆
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl">
              <ListChecks className="w-5 h-5 mr-2" />
              Word Progress 📊
            </TabsTrigger>
          </TabsList>

          {/* Word Lists Tab */}
          <TabsContent value="lists" className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for your word lists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-lg border-4 border-purple-300 focus:border-purple-500 rounded-xl"
                />
              </div>
              <Button 
                onClick={() => navigate('/create')} 
                size="lg"
                className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
              >
                <Plus className="w-6 h-6 mr-2" />
                Create New List
              </Button>
            </div>

            {/* Word Lists Grid */}
            {filteredLists.length === 0 ? (
              <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl">
                <BookOpen className="w-24 h-24 mx-auto text-purple-400 mb-6" />
                <h2 className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-4">
                  {searchTerm ? '🔍 No lists found' : '📚 Ready to start?'}
                </h2>
                <p className="text-xl text-purple-600 dark:text-purple-400 mb-8">
                  {searchTerm
                    ? 'Try searching for something else!'
                    : 'Create your first word list and start learning!'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => navigate('/create')} 
                    size="lg"
                    className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold text-xl px-8 py-6 shadow-lg transform hover:scale-105 transition-transform"
                  >
                    <Plus className="w-6 h-6 mr-2" />
                    Create Your First List! 🎉
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLists.map(list => (
                  <WordListCard
                    key={list.id}
                    wordList={list}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsCard />
          </TabsContent>

          {/* Word Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {wordLists.length === 0 ? (
              <div className="text-center py-16 bg-white/80 rounded-3xl shadow-2xl">
                <ListChecks className="w-24 h-24 mx-auto text-purple-400 mb-6" />
                <h2 className="text-3xl font-bold text-purple-700 mb-4">
                  No word lists yet! 📚
                </h2>
                <p className="text-xl text-purple-600 mb-8">
                  Create a word list and start practicing to see your progress!
                </p>
                <Button 
                  onClick={() => navigate('/create')} 
                  size="lg"
                  className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold text-xl px-8 py-6 shadow-lg"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Create Your First List! 🎉
                </Button>
              </div>
            ) : (
              <>
                {/* List Selector */}
                <div className="flex flex-wrap gap-3">
                  {wordLists.map(list => {
                    const listProgress = progressRecords.filter(r => r.listId === list.id);
                    const hasPracticed = listProgress.length > 0;
                    
                    return (
                      <Button
                        key={list.id}
                        onClick={() => setSelectedListForProgress(list.id)}
                        variant={selectedListForProgress === list.id ? 'default' : 'outline'}
                        size="lg"
                        className={`text-lg font-bold ${
                          selectedListForProgress === list.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'border-4 border-purple-300 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        {list.name}
                        {hasPracticed && <Sparkles className="w-5 h-5 ml-2" />}
                      </Button>
                    );
                  })}
                </div>

                {/* Progress Table */}
                {selectedListForProgress && selectedList ? (
                  <WordProgressTable 
                    progressRecords={selectedListProgress}
                    listName={selectedList.name}
                  />
                ) : (
                  <div className="text-center py-16 bg-white/80 rounded-3xl shadow-2xl border-4 border-purple-300">
                    <ListChecks className="w-24 h-24 mx-auto text-purple-400 mb-6" />
                    <h2 className="text-3xl font-bold text-purple-700 mb-4">
                      Select a word list! 👆
                    </h2>
                    <p className="text-xl text-purple-600">
                      Click on a word list above to see your progress for each word!
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-4 border-red-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl text-red-600">Delete Word List?</AlertDialogTitle>
              <AlertDialogDescription className="text-lg">
                This will permanently delete this word list and all your practice history.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white text-lg">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Dashboard;