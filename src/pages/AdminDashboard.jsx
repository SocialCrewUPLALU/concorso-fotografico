import { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, serverTimestamp } from '../firebase/config';
import { PlusCircle, BarChart2, Shield } from 'lucide-react';

const THEMES = ["Edifici / Costruzioni", "Natura", "Luce", "Gioia", "Strade / Sentieri"];

export default function AdminDashboard() {
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPhotos = async () => {
    const snap = await getDocs(collection(db, "photos"));
    setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    // Spostiamo l'esecuzione in modo asincrono per evitare il conflitto di React
    const loadData = async () => {
      await fetchPhotos();
    };
    loadData();
  }, []);

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!title || !photographer || !imageUrl) {
      alert("Compila tutti i campi obbligatori (Titolo, Fotografo, URL Immagine).");
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
        imageUrl,
        voteCount: 0,
        createdAt: serverTimestamp()
      });
      alert("Fotografia aggiunta con successo!");
      setTitle("");
      setPhotographer("");
      setClassGroup("");
      setDescription("");
      setImageUrl("");
      fetchPhotos();
    } catch (error) {
      console.error("Errore nell'aggiunta della foto:", error);
      alert("Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center space-x-3 mb-8">
        <Shield className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900">Area Amministratore</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Aggiunta Foto */}
        <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 lg:col-span-1">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-indigo-600" /> Aggiungi Fotografia
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
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Classe Scolastica (Facoltativa)</label>
              <input type="text" value={classGroup} onChange={e => setClassGroup(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tema</label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">URL Immagine (es. link pubblico)</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descrizione (Facoltativa)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows="2"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
              {loading ? "Caricamento..." : "Carica Fotografia"}
            </button>
          </form>
        </div>

        {/* Gestione e Statistiche */}
        <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-indigo-600" /> Foto Caricate ({photos.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500 bg-slate-50">
                  <th className="p-3">Titolo</th>
                  <th className="p-3">Tema</th>
                  <th className="p-3">Autore</th>
                  <th className="p-3 text-center">Voti Ricevuti</th>
                </tr>
              </thead>
              <tbody>
                {photos.map(p => (
                  <tr key={p.id} className="border-b hover:bg-slate-50 text-sm">
                    <td className="p-3 font-medium text-slate-800">{p.title}</td>
                    <td className="p-3 text-slate-600">{p.theme}</td>
                    <td className="p-3 text-slate-600">{p.photographer}</td>
                    <td className="p-3 text-center font-bold text-indigo-600">{p.voteCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}