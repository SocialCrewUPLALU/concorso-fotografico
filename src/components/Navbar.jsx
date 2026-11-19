import { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged} from '../firebase/config';
import { Camera, LogOut, Shield, Menu, X } from 'lucide-react';

export default function Navbar({ setCurrentView }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Verifica se l'utente è admin tramite i Custom Claims o documento dedicato
        const tokenResult = await currentUser.getIdTokenResult();
        setIsAdmin(tokenResult.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Errore durante il login:", error);
      alert("Errore durante l'accesso con Google.");
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
            <Camera className="h-8 w-8 text-indigo-600 mr-2" />
            <span className="font-bold text-xl text-slate-800">Concorso Fotografico</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => setCurrentView('home')} className="text-slate-600 hover:text-indigo-600 font-medium">Home</button>
            <button onClick={() => setCurrentView('gallery')} className="text-slate-600 hover:text-indigo-600 font-medium">Galleria</button>
            <button onClick={() => setCurrentView('vote')} className="text-slate-600 hover:text-indigo-600 font-medium">Vota</button>
            {isAdmin && (
              <button onClick={() => setCurrentView('admin')} className="flex items-center text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100">
                <Shield className="h-4 w-4 mr-1.5" /> Admin
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-3 border-l pl-6 border-slate-200">
                <span className="text-sm text-slate-700 font-medium">{user.displayName || user.email}</span>
                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100" title="Esci">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition">
                Accedi con Google
              </button>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-600">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          <button onClick={() => { setCurrentView('home'); setMenuOpen(false); }} className="block w-text-left py-2 text-slate-600 font-medium">Home</button>
          <button onClick={() => { setCurrentView('gallery'); setMenuOpen(false); }} className="block w-text-left py-2 text-slate-600 font-medium">Galleria</button>
          <button onClick={() => { setCurrentView('vote'); setMenuOpen(false); }} className="block w-text-left py-2 text-slate-600 font-medium">Vota</button>
          {isAdmin && (
            <button onClick={() => { setCurrentView('admin'); setMenuOpen(false); }} className="block w-text-left py-2 text-indigo-600 font-medium">Area Admin</button>
          )}
          {user ? (
            <button onClick={handleLogout} className="w-full text-left py-2 text-red-600 font-medium">Esci ({user.displayName})</button>
          ) : (
            <button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium">Accedi con Google</button>
          )}
        </div>
      )}
    </nav>
  );
}