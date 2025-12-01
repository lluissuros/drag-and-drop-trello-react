import Board from '../components/board/Board';

const App = () => (
  <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
    <header className="flex items-center justify-between px-6 pb-2 pt-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">Tasks Board</p>
        <h1 className="text-3xl font-semibold text-slate-900">Keep work flowing</h1>
      </div>
      <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
        React • DnD Kit • shadcn/ui
      </div>
    </header>
    <main className="px-6 pb-10">
      <Board />
    </main>
  </div>
);

export default App;
