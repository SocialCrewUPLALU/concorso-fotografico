import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Vote from './pages/Vote';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-grow">
        {currentView === 'home' && <Home setCurrentView={setCurrentView} />}
        {currentView === 'gallery' && <Gallery />}
        {currentView === 'vote' && <Vote />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Concorso Fotografico – Racconta il tuo paese © 2026. Tutti i diritti riservati.
      </footer>
    </div>
  );
}