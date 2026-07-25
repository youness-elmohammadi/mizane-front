import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { CLES_DOSSIERS } from '../../hooks/useDossier';
import { creerDossier } from '../../services/dossierService';
import type { CreationDossier } from '../../services/dossierService';
import type { FormeJuridique, RegimeTva } from '../../types/dossier.types';

/**
 * Formulaire de création d'un dossier client.
 *
 * Présenté en modale — même patron que « Nouvelle écriture » (composant
 * `Modal` + `Button` + `Input`/`Select` réutilisables). La soumission passe
 * par `creerDossier` (mock ou API selon `USE_MOCKS`) via une mutation React
 * Query, puis invalide le cache des dossiers pour rafraîchir la liste.
 */

interface ModalDossierProps {
  ouverte: boolean;
  onFermer: () => void;
}

const FORMES: Array<{ valeur: FormeJuridique; label: string }> = [
  { valeur: 'SARL', label: 'SARL' },
  { valeur: 'SA', label: 'SA' },
  { valeur: 'SNC', label: 'SNC' },
  { valeur: 'AUTO_ENTREPRENEUR', label: 'Auto-entrepreneur' },
  { valeur: 'SASU', label: 'SASU' },
];

const REGIMES: Array<{ valeur: RegimeTva; label: string }> = [
  { valeur: 'MENSUEL', label: 'Mensuel' },
  { valeur: 'TRIMESTRIEL', label: 'Trimestriel' },
  { valeur: 'NON_ASSUJETTI', label: 'Non assujetti' },
];

export default function ModalDossier({ ouverte, onFermer }: ModalDossierProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [raisonSociale, setRaisonSociale] = useState('');
  const [formeJuridique, setFormeJuridique] = useState<FormeJuridique>('SARL');
  const [regimeTva, setRegimeTva] = useState<RegimeTva>('MENSUEL');
  const [ice, setIce] = useState('');
  // Responsable pré-rempli avec l'utilisateur courant, modifiable.
  const [responsable, setResponsable] = useState(user?.nom ?? '');
  const [erreurs, setErreurs] = useState<{ raisonSociale?: string; ice?: string }>(
    {}
  );

  const mutation = useMutation({
    mutationFn: creerDossier,
    onSuccess: () => {
      // Rafraîchit la liste : listerDossiers se recharge et voit le nouveau dossier.
      queryClient.invalidateQueries({ queryKey: CLES_DOSSIERS.liste });
      onFermer();
    },
  });

  const valider = () => {
    // Contrôles bloquants (mêmes règles que le backend : ICE = 15 chiffres).
    const errs: typeof erreurs = {};
    if (raisonSociale.trim() === '') {
      errs.raisonSociale = 'La raison sociale est requise.';
    }
    if (ice.trim() !== '' && !/^\d{15}$/.test(ice.trim())) {
      errs.ice = "L'ICE doit contenir exactement 15 chiffres.";
    }
    setErreurs(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: CreationDossier = {
      raisonSociale: raisonSociale.trim(),
      formeJuridique,
      regimeTva,
      ice: ice.trim() || null,
      responsableNom: responsable.trim() || '—',
    };
    mutation.mutate(payload);
  };

  return (
    <Modal
      ouverte={ouverte}
      titre="Nouveau dossier"
      onFermer={onFermer}
      largeur="max-w-lg"
      pied={
        <>
          <Button variante="secondaire" onClick={onFermer}>
            Annuler
          </Button>
          <Button
            onClick={valider}
            chargement={mutation.isPending}
            className="px-5"
          >
            Créer le dossier
          </Button>
        </>
      }
    >
      <Input
        label="Raison sociale"
        value={raisonSociale}
        onChange={(e) => setRaisonSociale(e.target.value)}
        erreur={erreurs.raisonSociale}
        placeholder="Ex : SARL Bensalah Import-Export"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Forme juridique"
          value={formeJuridique}
          onChange={(e) => setFormeJuridique(e.target.value as FormeJuridique)}
        >
          {FORMES.map((f) => (
            <option key={f.valeur} value={f.valeur}>
              {f.label}
            </option>
          ))}
        </Select>

        <Select
          label="Régime TVA"
          value={regimeTva}
          onChange={(e) => setRegimeTva(e.target.value as RegimeTva)}
        >
          {REGIMES.map((r) => (
            <option key={r.valeur} value={r.valeur}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="ICE (optionnel)"
        value={ice}
        onChange={(e) => setIce(e.target.value)}
        erreur={erreurs.ice}
        inputMode="numeric"
        placeholder="15 chiffres — laisser vide si non assujetti"
      />

      <Input
        label="Responsable"
        value={responsable}
        onChange={(e) => setResponsable(e.target.value)}
        placeholder="Nom de l'assistant en charge"
      />

      {mutation.isError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200
                     bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <i className="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true" />
          <span>Impossible de créer le dossier. Réessayez.</span>
        </div>
      )}
    </Modal>
  );
}
