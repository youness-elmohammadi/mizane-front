import { useLocation, useNavigate } from 'react-router-dom';
import type { Journal } from '../../types/ecriture';
import { LIBELLES_JOURNAUX } from '../../types/ecriture';
import EcritureForm from '../../components/ecritures/EcritureForm';

export default function NouvelleEcriturePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { journal?: Journal; exercice?: string} | null;
    const journal: Journal = state?.journal ?? 'AC';
    const exercice = state?.exercice ?? '2026';

    return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Nouvelle écriture — Journal {LIBELLES_JOURNAUX[journal]} — Ex. {exercice}
      </h1>

      <EcritureForm
      journal={journal}
      exercice={exercice}
      onAnnuler={() => navigate('/saisie')}
      onValider={(payload) => {
        console.log('Écriture à envoyer (S2-F03) :', payload);
        navigate('/saisie');
      }}
      />
      </div>
    );
}