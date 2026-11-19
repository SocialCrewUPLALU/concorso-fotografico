import { Camera, Award, Calendar, ArrowRight } from 'lucide-react';

export default function Home({ setCurrentView }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Concorso Fotografico Paesano
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Racconta il tuo paese attraverso gli scatti
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Esplora le bellezze, la natura, le strade e la gioia della nostra comunità. Sfoglia la galleria e vota le tue fotografie preferite suddivise nei cinque temi ufficiali.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => setCurrentView('gallery')}
            className="flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <Camera className="mr-2 h-5 w-5" /> Esplora la Galleria
          </button>
          <button 
            onClick={() => setCurrentView('vote')}
            className="flex items-center justify-center bg-white text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition"
          >
            Vota Ora <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Camera className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">5 Temi Ufficiali</h3>
          <p className="mt-2 text-slate-600 text-sm">Edifici, Natura, Luce, Gioia e Strade/Sentieri raccontati dagli obiettivi dei partecipanti.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Voto Consapevole</h3>
          <p className="mt-2 text-slate-600 text-sm">Seleziona 3 fotografie per ciascun tema (15 scatti in totale) e conferma la tua scelta in modo definitivo.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100">
          <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Trasparenza e Sicurezza</h3>
          <p className="mt-2 text-slate-600 text-sm">Accesso protetto tramite Google Account e votazioni gestite in modo sicuro tramite regole server-side.</p>
        </div>
      </div>
    </div>
  );
}