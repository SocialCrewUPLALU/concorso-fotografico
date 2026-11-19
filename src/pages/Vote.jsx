import { useState, useEffect } from 'react';
import { auth, db, collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from '../firebase/config';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';

const THEMES = ["Edifici / Costruzioni", "Natura", "Luce", "Gioia", "Strade / Sentieri"];

export default function Vote() {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selections, setSelections] = useState({}); // { themeName: [photoId1, photoId2, photoId3] }
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Controlla se ha già votato
        const voteDoc = await getDoc(doc(db, "votes", currentUser.uid));
        if (voteDoc.exists()) {
          setHasVoted(true);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchPhotos() {
      const snap = await getDocs(collection(db, "photos"));
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchPhotos();
  }, []);

  const handleSelectPhoto = (theme, photoId) => {
    if (hasVoted) return;
    const currentThemeSelections = selections[theme] || [];
    
    if (currentThemeSelections.includes(photoId)) {
      // Rimuovi selezione
      setSelections({
        ...selections,
        [theme]: currentThemeSelections.filter(id => id !== photoId)
      });
    } else {
      if (currentThemeSelections.length >= 3) {
        alert("Puoi selezionare al massimo 3 fotografie per questo tema.");
        return;
      }
      // Verifica unicità globale tra gli altri temi
      const allSelected = Object.values(selections).flat();
      if (allSelected.includes(photoId)) {
        alert("Hai già selezionato questa fotografia in un altro tema.");
        return;
      }
      setSelections({
        ...selections,
        [theme]: [...currentThemeSelections, photoId]
      });
    }
  };

  const getTotalSelectedCount = () => {
    return Object.values(selections).flat().length;
  };

  const handleSubmitVote = async () => {
    if (!user) {
      alert("Devi effettuare l'accesso con Google per votare.");
      return;
    }

    // Verifica che tutti i 5 temi abbiano esattamente 3 foto
    for (const theme of THEMES) {
      const count = (selections[theme] || []).length;
      if (count !== 3) {
        alert(`Devi selezionare esattamente 3 fotografie per il tema: ${theme}`);
        return;
      }
    }

    if (!confirm("Attenzione: una volta confermato, il voto è DEFINITIVO e non potrà più essere modificato. Vuoi procedere?")) {
      return;
    }

    setSubmitting(true);
    try {
      const allSelectedPhotos = Object.values(selections).flat();
      
      // Scrittura su Firestore (protetta dalle regole di sicurezza)
      await setDoc(doc(db, "votes", user.uid), {
        userId: user.uid,
        selectedPhotos: allSelectedPhotos,
        createdAt: serverTimestamp()
      });

      setHasVoted(true);
      alert("Voto registrato con successo e in modo definitivo!");
    } catch (error) {
      console.error("Errore nell'invio del voto:", error);
      alert("Errore durante l'invio del voto. Assicurati di non aver già votato.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20">Verifica stato in corso...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Accesso Richiesto</h2>
        <p className="text-slate-600 mt-2">Per accedere all'area di votazione è necessario effettuare l'accesso con il proprio account Google dalla barra in alto.</p>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center bg-white rounded-2xl card-shadow mt-10 border border-slate-100">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Hai già votato!</h2>
        <p className="text-slate-600 mt-2">Il tuo voto è stato registrato con successo. Come da regolamento, il voto è definitivo e non può essere modificato.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-indigo-900 text-white p-6 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Espprimi le tue preferenze</h1>
          <p className="text-indigo-200 text-sm mt-1">Seleziona 3 fotografie per ciascuno dei 5 temi (Totale: 15 foto).</p>
        </div>
        <div className="bg-indigo-800 px-4 py-2 rounded-xl text-center">
          <span className="block text-2xl font-extrabold">{getTotalSelectedCount()} / 15</span>
          <span className="text-xs text-indigo-300">Selezionate</span>
        </div>
      </div>

      {THEMES.map(theme => {
        const themePhotos = photos.filter(p => p.theme === theme);
        const selectedInTheme = selections[theme] || [];

        return (
          <div key={theme} className="mb-12 bg-white p-6 rounded-2xl card-shadow border border-slate-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">{theme}</h2>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${selectedInTheme.length === 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                Selezionate: {selectedInTheme.length} / 3
              </span>
            </div>

            {themePhotos.length === 0 ? (
              <p className="text-slate-500 text-sm">Nessuna foto disponibile per questo tema.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {themePhotos.map(photo => {
                  const isSelected = selectedInTheme.includes(photo.id);
                  return (
                    <div 
                      key={photo.id}
                      onClick={() => handleSelectPhoto(theme, photo.id)}
                      className={`border-2 rounded-xl overflow-hidden cursor-pointer transition relative ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="h-40 bg-slate-100">
                        <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{photo.title}</h4>
                        <p className="text-xs text-slate-500">{photo.photographer}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="sticky bottom-6 text-center">
        <button 
          onClick={handleSubmitVote}
          disabled={submitting || getTotalSelectedCount() !== 15}
          className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition flex items-center mx-auto ${getTotalSelectedCount() === 15 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
        >
          <Send className="mr-2 h-5 w-5" /> {submitting ? "Invio in corso..." : "Conferma e Invia Voto Definitivo"}
        </button>
      </div>
    </div>
  );
}