import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Vote from './pages/Vote';
import AdminDashboard from './pages/AdminDashboard';
import Privacy from './pages/privacy';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-grow">
        {currentView === 'home' && <Home setCurrentView={setCurrentView} />}
        {currentView === 'gallery' && <Gallery />}
        {currentView === 'vote' && <Vote />}
        {currentView === 'privacy' && <Privacy />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Social Crew UPLALU - Concorso fotografico © 2026. Tutti i diritti riservati.
        <div className="mt-2">
          <button onClick={() => setCurrentView('privacy')} className="text-amber-700 hover:underline font-bold">
            Norme sulla Privacy
          </button>
        </div>
      </footer>
    </div>
  );
}