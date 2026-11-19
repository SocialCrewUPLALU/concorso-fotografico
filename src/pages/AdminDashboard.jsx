import { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from '../firebase/config';
import { PlusCircle, BarChart2, Shield, Trash2, Users } from 'lucide-react';

const THEMES = ["Edifici / Costruzioni", "Natura", "Luce", "Gioia", "Strade / Sentieri"];

export default function AdminDashboard() {
  const [photos, setPhotos] = useState([]);
  const [votes, setVotes] = useState([]);
  const [title, setTitle] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    // Recupera foto
    const photoSnap = await getDocs(collection(db, "photos"));
    setPhotos(photoSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // Recupera voti per la sezione admin
    try {
      const voteSnap = await getDocs(collection(db, "votes"));
      setVotes(voteSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Impossibile leggere i voti (verifica le regole di Firestore):", e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, []);

  // Conversione dell'immagine locale del PC in Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) { // Limite consigliato per Firestore (~800KB)
        alert("L'immagine è troppo grande. Scegli un file inferiore a 800 KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!title || !photographer || !imageBase64) {
      alert("Compila tutti i campi obbligatori e seleziona un'immagine dal PC.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "photos"), {
        title,
        photographer,
        classGroup,
        theme,
        description,
        imageUrl: imageBase64,
        voteCount: 0,
        createdAt: serverTimestamp()
      });
      alert("Fotografia caricata con successo dal PC!");
      setTitle("");
      setPhotographer("");
      setClassGroup("");
      setDescription("");
      setImageBase64("");
      fetchData();
    } catch (error) {
      console.error("Errore nell'aggiunta della foto:", error);
      alert("Errore durante il salvataggio su Firestore.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questa foto?")) {
      await deleteDoc(doc(db, "photos", id));
      fetchData();
    }
  };

  const handleDeleteVote = async (userId) => {
    if (window.confirm("Vuoi eliminare il voto di questo utente per permettergli di votare di nuovo?")) {
      await deleteDoc(doc(db, "votes", userId));
      alert("Voto eliminato con successo!");
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center space-x-3 mb-8">
        <Shield className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900">Area Amministratore</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Caricamento Foto da PC */}
        <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 lg:col-span-1">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-indigo-600" /> Carica da PC
          </h2>

          <form onSubmit={handleAddPhoto} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Titolo</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome Fotografo</label>
              <input type="text" value={photographer} onChange={e => setPhotographer(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Classe Scolastica</label>
              <input type="text" value={classGroup} onChange={e => setClassGroup(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tema</label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Seleziona Immagine dal PC</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-3 py-2 border rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descrizione</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows="2"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
              {loading ? "Caricamento in corso..." : "Carica Fotografia"}
            </button>
          </form>
        </div>

        {/* Gestione Foto e Voti */}
        <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-indigo-600" /> Gestione Foto Caricate ({photos.length})
            </h2>

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs uppercase text-slate-500 bg-slate-50 sticky top-0">
                    <th className="p-3">Titolo</th>
                    <th className="p-3">Tema</th>
                    <th className="p-3">Autore</th>
                    <th className="p-3 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {photos.map(p => (
                    <tr key={p.id} className="border-b hover:bg-slate-50 text-sm">
                      <td className="p-3 font-medium text-slate-800">{p.title}</td>
                      <td className="p-3 text-slate-600">{p.theme}</td>
                      <td className="p-3 text-slate-600">{p.photographer}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeletePhoto(p.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sezione Monitoraggio e Reset Voti */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-indigo-600" /> Situazione Voti Utenti ({votes.length} votanti)
            </h2>

            <div className="overflow-x-auto max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs uppercase text-slate-500 bg-slate-50 sticky top-0">
                    <th className="p-3">UID Utente</th>
                    <th className="p-3 text-center">Foto Selezionate</th>
                    <th className="p-3 text-center">Reset Test Voto</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map(v => (
                    <tr key={v.id} className="border-b hover:bg-slate-50 text-sm">
                      <td className="p-3 font-mono text-xs text-slate-600">{v.id}</td>
                      <td className="p-3 text-center font-bold text-indigo-600">{v.selectedPhotos?.length || 0} / 15</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteVote(v.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                          Elimina Voto
                        </button>
                      </td>
                    </tr>
                  ))}
                  {votes.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-slate-400 text-sm">Nessun voto registrato finora.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}