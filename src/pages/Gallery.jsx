import { useState, useEffect, useMemo } from 'react';
import { db, collection, getDocs } from '../firebase/config';
import { Search, Layers, Users, Camera } from 'lucide-react';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("theme"); // "theme" (default) | "classGroup" | "photographer"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const snap = await getDocs(collection(db, "photos"));
        setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Errore nel caricamento della galleria:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  // Filtra le foto in base alla ricerca testuale
  const filteredPhotos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return photos;
    return photos.filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.photographer && p.photographer.toLowerCase().includes(q)) ||
      (p.classGroup && p.classGroup.toLowerCase().includes(q)) ||
      (p.theme && p.theme.toLowerCase().includes(q))
    );
  }, [photos, searchQuery]);

  // Raggruppa le foto filtrate in base al filtro selezionato
  const groupedPhotos = useMemo(() => {
    return filteredPhotos.reduce((acc, photo) => {
      let key = "";
      if (groupBy === "theme") {
        key = photo.theme || "Senza Tema";
      } else if (groupBy === "classGroup") {
        key = photo.classGroup ? `Classe ${photo.classGroup}` : "Classe non specificata";
      } else if (groupBy === "photographer") {
        key = photo.photographer || "Autore Sconosciuto";
      }
      if (!acc[key]) acc[key] = [];
      acc[key].push(photo);
      return acc;
    }, {});
  }, [filteredPhotos, groupBy]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Caricamento galleria in corso...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Galleria Fotografica</h1>
          <p className="text-slate-500 text-sm mt-1">Esplora le opere in concorso suddivise per categoria</p>
        </div>

        {/* Barra di ricerca e pulsanti filtro */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca titolo, autore, classe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>

          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setGroupBy("theme")}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                groupBy === "theme" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" /> Tema
            </button>
            <button
              onClick={() => setGroupBy("classGroup")}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                groupBy === "classGroup" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 mr-1.5" /> Classe
            </button>
            <button
              onClick={() => setGroupBy("photographer")}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                groupBy === "photographer" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Camera className="w-3.5 h-3.5 mr-1.5" /> Fotografo
            </button>
          </div>
        </div>
      </div>

      {/* Elenco sezioni raggruppate */}
      {Object.keys(groupedPhotos).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400">
          Nessuna fotografia corrisponde ai criteri di ricerca.
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedPhotos).map(([groupName, groupItems]) => (
            <section key={groupName}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{groupName}</h2>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                  {groupItems.length} {groupItems.length === 1 ? "foto" : "foto"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupItems.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="bg-white rounded-2xl overflow-hidden card-shadow border border-slate-100 cursor-pointer group hover:-translate-y-1 transition duration-200"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                        {photo.theme}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{photo.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        di <span className="font-medium">{photo.photographer}</span>
                        {photo.classGroup && <span className="text-slate-400"> • Classe {photo.classGroup}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Modale ingrandimento immagine */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl"
          >
            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.title}
              className="w-full max-h-[70vh] object-contain bg-slate-900"
            />
            <div className="p-6 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-600">{selectedPhoto.theme}</span>
                <h3 className="text-2xl font-bold text-slate-900">{selectedPhoto.title}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Fotografo: <strong>{selectedPhoto.photographer}</strong>
                  {selectedPhoto.classGroup && ` (Classe ${selectedPhoto.classGroup})`}
                </p>
                {selectedPhoto.description && (
                  <p className="text-sm text-slate-500 mt-3">{selectedPhoto.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}