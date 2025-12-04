import Board from "../components/board/Board";
import { Toaster } from "sonner";

const App = () => (
  <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
    <header className="flex items-center justify-between px-6 pb-6 pt-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Do the work!</h1>
      </div>
      <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
        React • DnD Kit • shadcn/ui
      </div>
    </header>
    <main className="px-6 pb-10">
      <Board />
    </main>
    <Toaster richColors position="top-center" />
  </div>
);

export default App;
