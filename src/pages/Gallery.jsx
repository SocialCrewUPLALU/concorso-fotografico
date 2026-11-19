import { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../firebase/config';
import { Search, X } from 'lucide-react';

const THEMES = ["Tutti i temi", "Edifici / Costruzioni", "Natura", "Luce", "Gioia", "Strade / Sentieri"];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("Tutti i temi");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const querySnapshot = await getDocs(collection(db, "photos"));
        const photosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPhotos(photosList);
      } catch (error) {
        console.error("Errore nel recupero delle foto:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPhotos();
  }, []);

  const filteredPhotos = photos.filter(photo => {
    const matchesTheme = selectedTheme === "Tutti i temi" || photo.theme === selectedTheme;
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          photo.photographer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Galleria Fotografica</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cerca per titolo o autore..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
            />
          </div>
          
          <select 
            value={selectedTheme} 
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Caricamento fotografie in corso...</div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-100">Nessuna fotografia trovata.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map(photo => (
            <div 
              key={photo.id} 
              onClick={() => setSelectedImage(photo)}
              className="bg-white rounded-2xl overflow-hidden card-shadow border border-slate-100 cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="h-56 overflow-hidden bg-slate-100">
                <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{photo.theme}</span>
                <h3 className="mt-2 text-lg font-bold text-slate-800">{photo.title}</h3>
                <p className="text-sm text-slate-500">Autore: {photo.photographer} {photo.classGroup && `(${photo.classGroup})`}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modale */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden relative">
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-slate-900/50 text-white p-2 rounded-full hover:bg-slate-900 transition">
              <X className="h-6 w-6" />
            </button>
            <div className="max-h-[60vh] bg-black flex items-center justify-center">
              <img src={selectedImage.imageUrl} alt={selectedImage.title} className="max-h-[60vh] object-contain" />
            </div>
            <div className="p-6">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{selectedImage.theme}</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">{selectedImage.title}</h2>
              <p className="text-slate-600 mt-1">Fotografo: <span className="font-medium text-slate-800">{selectedImage.photographer}</span> {selectedImage.classGroup && `- Classe ${selectedImage.classGroup}`}</p>
              {selectedImage.description && <p className="mt-4 text-slate-600 text-sm bg-slate-50 p-3 rounded-xl">{selectedImage.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}