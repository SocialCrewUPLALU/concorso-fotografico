import { useState, useEffect, useMemo } from 'react';
import { db, collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from '../firebase/config';
import { PlusCircle, Shield, Trash2, Users, Trophy, FolderOpen } from 'lucide-react';

const THEMES = ["Edifici / Costruzioni", "Natura", "Luce", "Gioia", "Strade / Sentieri"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("manage"); // "manage" | "ranking"
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
    const photoSnap = await getDocs(collection(db, "photos"));
    setPhotos(photoSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    try {
      const voteSnap = await getDocs(collection(db, "votes"));
      setVotes(voteSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Impossibile leggere i voti:", e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, []);

  // Calcolo reale dei voti per ogni foto basato sulle schede voto attive
  const photosWithRealVotes = useMemo(() => {
    const voteCounts = {};
    votes.forEach(voteDoc => {
      if (Array.isArray(voteDoc.selectedPhotos)) {
        voteDoc.selectedPhotos.forEach(photoId => {
          voteCounts[photoId] = (voteCounts[photoId] || 0) + 1;
        });
      }
    });

    return photos.map(p => ({
      ...p,
      realVotes: voteCounts[p.id] || 0
    }));
  }, [photos, votes]);

  // Foto suddivise per tema
  const photosByTheme = useMemo(() => {
    return THEMES.reduce((acc, t) => {
      acc[t] = photosWithRealVotes.filter(p => p.theme === t);
      return acc;
    }, {});
  }, [photosWithRealVotes]);

  // Classifica ordinata per numero di voti decrescente
  const rankedPhotos = useMemo(() => {
    return [...photosWithRealVotes].sort((a, b) => b.realVotes - a.realVotes);
  }, [photosWithRealVotes]);

  // Compressione automatica immagine dal PC
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        setImageBase64(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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
      alert("Fotografia caricata con successo!");
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
      {/* Intestazione e Navigazione Schede Interne */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900">Area Amministratore</h1>
        </div>

        <div className="inline-flex bg-slate-100 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === "manage" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderOpen className="w-4 h-4 mr-2" /> Gestione Foto e Voti
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === "ranking" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Trophy className="w-4 h-4 mr-2" /> Classifica ({rankedPhotos.length})
          </button>
        </div>
      </div>

      {/* SCHEDA 1: GESTIONE FOTO (SUDDIVISE PER TEMA) E VOTANTI */}
      {activeTab === "manage" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Caricamento Foto da PC */}
          <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 lg:col-span-1 h-fit">
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

          {/* Colonna Destra: Foto per Tema + Situazione Votanti */}
          <div className="lg:col-span-2 space-y-8">
            {/* Elenco Foto Suddivise per Tema */}
            <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Foto Caricate per Tema ({photos.length} totali)
              </h2>

              <div className="space-y-6">
                {THEMES.map(themeName => {
                  const themePhotos = photosByTheme[themeName] || [];
                  return (
                    <div key={themeName} className="border border-slate-100 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2.5 flex justify-between items-center border-b border-slate-100">
                        <span className="font-bold text-slate-700 text-sm">{themeName}</span>
                        <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                          {themePhotos.length} foto
                        </span>
                      </div>

                      {themePhotos.length === 0 ? (
                        <p className="p-4 text-xs text-slate-400">Nessuna foto caricata in questo tema.</p>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <tbody>
                            {themePhotos.map(p => (
                              <tr key={p.id} className="border-b last:border-b-0 hover:bg-slate-50 text-sm">
                                <td className="p-3 w-14">
                                  <img src={p.imageUrl} alt={p.title} className="w-10 h-10 object-cover rounded-lg" />
                                </td>
                                <td className="p-3 font-medium text-slate-800">{p.title}</td>
                                <td className="p-3 text-slate-600">{p.photographer}</td>
                                <td className="p-3 text-center font-bold text-indigo-600">{p.realVotes} voti</td>
                                <td className="p-3 text-right">
                                  <button onClick={() => handleDeletePhoto(p.id)} className="text-red-500 hover:text-red-700 p-1">
                                    <Trash2 size={17} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Situazione Voti Utenti con Nome Google + UID */}
            <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5 text-indigo-600" /> Situazione Voti Utenti ({votes.length} votanti)
              </h2>

              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-xs uppercase text-slate-500 bg-slate-50 sticky top-0">
                      <th className="p-3">Utente Google</th>
                      <th className="p-3">UID Utente</th>
                      <th className="p-3 text-center">Voti</th>
                      <th className="p-3 text-center">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map(v => (
                      <tr key={v.id} className="border-b hover:bg-slate-50 text-sm">
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{v.userName || "Nome non registrato"}</div>
                          {v.userEmail && <div className="text-xs text-slate-400">{v.userEmail}</div>}
                        </td>
                        <td className="p-3 font-mono text-xs text-slate-500">{v.id}</td>
                        <td className="p-3 text-center font-bold text-indigo-600">
                          {v.selectedPhotos?.length || 0} / 15
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteVote(v.id)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                          >
                            Elimina Voto
                          </button>
                        </td>
                      </tr>
                    ))}
                    {votes.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-slate-400 text-sm">
                          Nessun voto registrato finora.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDA 2: CLASSIFICA GENERALE DELLE FOTO */}
      {activeTab === "ranking" && (
        <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <Trophy className="mr-2.5 h-6 w-6 text-amber-500" /> Classifica Generale Fotografie
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Ordinata dal punteggio più alto in base ai voti attualmente registrati ({votes.length} schede valide)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500 bg-slate-50">
                  <th className="p-4 w-16 text-center">Pos.</th>
                  <th className="p-4 w-20">Foto</th>
                  <th className="p-4">Titolo Opera</th>
                  <th className="p-4">Fotografo</th>
                  <th className="p-4">Tema</th>
                  <th className="p-4 text-center">Voti Ricevuti</th>
                </tr>
              </thead>
              <tbody>
                {rankedPhotos.map((photo, index) => (
                  <tr key={photo.id} className="border-b hover:bg-slate-50 transition">
                    <td className="p-4 text-center font-bold">
                      {index === 0 && <span className="inline-block w-8 h-8 leading-8 rounded-full bg-amber-100 text-amber-700">1°</span>}
                      {index === 1 && <span className="inline-block w-8 h-8 leading-8 rounded-full bg-slate-200 text-slate-700">2°</span>}
                      {index === 2 && <span className="inline-block w-8 h-8 leading-8 rounded-full bg-orange-100 text-orange-700">3°</span>}
                      {index > 2 && <span className="text-slate-500">{index + 1}°</span>}
                    </td>
                    <td className="p-4">
                      <img src={photo.imageUrl} alt={photo.title} className="w-14 h-14 object-cover rounded-xl shadow-sm" />
                    </td>
                    <td className="p-4 font-bold text-slate-900">{photo.title}</td>
                    <td className="p-4 text-slate-700">
                      <div className="font-medium">{photo.photographer}</div>
                      {photo.classGroup && <div className="text-xs text-slate-400">Classe {photo.classGroup}</div>}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                        {photo.theme}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-lg font-extrabold text-indigo-600">{photo.realVotes}</span>
                    </td>
                  </tr>
                ))}
                {rankedPhotos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      Nessuna fotografia presente nel concorso.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}