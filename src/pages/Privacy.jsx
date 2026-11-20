export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10 bg-white rounded-3xl border-2 border-slate-900 my-10">
      <h1 className="text-3xl font-black text-slate-900 mb-4">Norme sulla Privacy</h1>
      <p className="text-sm text-slate-600 mb-6">Ultimo aggiornamento: Novembre 2026</p>

      <div className="space-y-4 text-slate-800 text-sm leading-relaxed">
        <p>
          L'applicazione <strong>Social Crew UPLALU - Concorso fotografico</strong> raccoglie esclusivamente i dati necessari per gestire le votazioni e la partecipazione al concorso fotografico.
        </p>
        <h2 className="text-lg font-bold text-slate-900 pt-2">1. Dati raccolti tramite Google OAuth</h2>
        <p>
          Quando effettui l'accesso con Google, riceviamo unicamente il tuo <strong>nome</strong>, il tuo <strong>indirizzo email</strong> e l'<strong>identificativo univoco dell'account</strong>. Questi dati vengono utilizzati solo per garantire che ogni utente possa esprimere un solo voto per ciascuna categoria e per prevenire abusi.
        </p>
        <h2 className="text-lg font-bold text-slate-900 pt-2">2. Condivisione e conservazione</h2>
        <p>
          I tuoi dati non vengono venduti, ceduti a terzi né utilizzati per scopi pubblicitari. Vengono conservati in modo sicuro su database Firebase esclusivamente per la durata del concorso e verranno eliminati al termine delle premiazioni.
        </p>
        <h2 className="text-lg font-bold text-slate-900 pt-2">3. Contatti</h2>
        <p>
          Per qualsiasi richiesta di cancellazione dei dati o informazione, puoi contattare l'amministratore all'indirizzo: <strong>davidemeneghini3@gmail.com</strong>.
        </p>
      </div>
    </div>
  );
}