import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import CreateWordList from "./pages/CreateWordList";
import EditWordList from "./pages/EditWordList";
import TeachingMode from "./pages/TeachingMode";
import PracticeMode from "./pages/PracticeMode";
import FinnishPractice from "./pages/FinnishPractice";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateWordList />} />
            <Route path="/edit/:id" element={<EditWordList />} />
            <Route path="/teach/:id" element={<TeachingMode />} />
            <Route path="/practice/:id" element={<PracticeMode />} />
            <Route path="/finnish-practice" element={<FinnishPractice />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;