import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {
  calculerEquilibre,
  creerEcriture,
  prochainNumeroPiece,
} from '../../services/ecritureService';
import { JOURNAUX } from '../../types/ecriture.types';
import type { CodeJournal } from '../../types/ecriture.types';
import {
  formatMontant,
  parseMontant,
} from '../../utils/formatMontant';
import {
  chercherComptes,
  estNumeroCompteValide,
  libelleDuCompte,
} from '../../utils/pcgeUtils';

/**
 * Formulaire de création d'une écriture comptable.
 *
 * Les montants sont saisis en texte libre (« 12 000,00 ») et convertis en
 * centimes à chaque frappe pour recalculer l'équilibre en direct. Le bouton
 * de validation reste désactivé tant que débit ≠ crédit : il est impossible
 * d'enregistrer une écriture déséquilibrée.
 */

interface ModalEcritureProps {
  ouverte: boolean;
  onFermer: () => void;
  dossierId: string;
  exercice: number;
}

/** Une ligne du formulaire — les montants restent des chaînes tant qu'on saisit. */
interface LigneFormulaire {
  cle: string;
  compte: string;
  libelle: string;
  debit: string;
  credit: string;
}

function ligneVide(): LigneFormulaire {
  return {
    cle: crypto.randomUUID(),
    compte: '',
    libelle: '',
    debit: '',
    credit: '',
  };
}

export default function ModalEcriture({
  ouverte,
  onFermer,
  dossierId,
  exercice,
}: ModalEcritureProps) {
  const queryClient = useQueryClient();

  const [journal, setJournal] = useState<CodeJournal>('AC');
  const [date, setDate] = useState(`${exercice}-12-31`);
  const [libelle, setLibelle] = useState('');
  const [lignes, setLignes] = useState<LigneFormulaire[]>([
    ligneVide(),
    ligneVide(),
  ]);
  const [numeroPiece, setNumeroPiece] = useState('…');
  const [erreur, setErreur] = useState<string | null>(null);

  // Le n° de pièce dépend du journal : on le rafraîchit à chaque changement.
  useEffect(() => {
    if (!ouverte) return;

    let annule = false;
    prochainNumeroPiece(dossierId, exercice, journal).then((numero) => {
      if (!annule) setNumeroPiece(numero);
    });

    return () => {
      annule = true;
    };
  }, [ouverte, dossierId, exercice, journal]);

  /*
   * Pas d'effet de réinitialisation ici : le composant parent ne monte cette
   * modale que lorsqu'elle est ouverte. Chaque ouverture est donc un nouveau
   * montage, et les valeurs initiales de useState suffisent à repartir d'un
   * formulaire vierge — plus simple, et sans rendu en cascade.
   */

  /** Lignes converties en centimes — la source de vérité pour l'équilibre. */
  const lignesEnCentimes = useMemo(
    () =>
      lignes.map((l) => ({
        compte: l.compte.trim(),
        libelle: l.libelle.trim(),
        debit: parseMontant(l.debit),
        credit: parseMontant(l.credit),
      })),
    [lignes]
  );

  const equilibre = useMemo(
    () => calculerEquilibre(lignesEnCentimes),
    [lignesEnCentimes]
  );

  const mutation = useMutation({
    mutationFn: creerEcriture,
    onSuccess: () => {
      // Invalide le cache : la liste des écritures se recharge toute seule.
      queryClient.invalidateQueries({ queryKey: ['ecritures'] });
      onFermer();
    },
    onError: (e: Error) => setErreur(e.message),
  });

  const modifierLigne = (
    cle: string,
    champ: keyof Omit<LigneFormulaire, 'cle'>,
    valeur: string
  ) => {
    setLignes((precedentes) =>
      precedentes.map((ligne) => {
        if (ligne.cle !== cle) return ligne;

        const modifiee = { ...ligne, [champ]: valeur };

        // Une ligne est soit au débit, soit au crédit — jamais les deux.
        if (champ === 'debit' && valeur !== '') modifiee.credit = '';
        if (champ === 'credit' && valeur !== '') modifiee.debit = '';

        // Pré-remplit le libellé avec l'intitulé officiel du compte.
        if (champ === 'compte' && ligne.libelle === '') {
          const officiel = libelleDuCompte(valeur.trim());
          if (officiel) modifiee.libelle = officiel;
        }

        return modifiee;
      })
    );
  };

  const ajouterLigne = () =>
    setLignes((precedentes) => [...precedentes, ligneVide()]);

  const supprimerLigne = (cle: string) =>
    setLignes((precedentes) =>
      // On garde toujours au moins deux lignes : une écriture en a besoin.
      precedentes.length <= 2
        ? precedentes
        : precedentes.filter((l) => l.cle !== cle)
    );

  /** Contrôles bloquants, évalués avant l'envoi. */
  const problemes = useMemo(() => {
    const liste: string[] = [];

    if (libelle.trim() === '') liste.push("Le libellé de l'écriture est requis.");

    const lignesRenseignees = lignesEnCentimes.filter(
      (l) => l.compte !== '' || l.debit > 0 || l.credit > 0
    );

    if (lignesRenseignees.length < 2)
      liste.push('Une écriture doit comporter au moins deux lignes.');

    for (const ligne of lignesRenseignees) {
      if (!estNumeroCompteValide(ligne.compte)) {
        liste.push(`Numéro de compte invalide : « ${ligne.compte || '(vide)'} ».`);
        break;
      }
      if (ligne.debit === 0 && ligne.credit === 0) {
        liste.push(`La ligne du compte ${ligne.compte} n'a aucun montant.`);
        break;
      }
    }

    if (!equilibre.equilibre)
      liste.push(
        `Écriture déséquilibrée : écart de ${formatMontant(Math.abs(equilibre.ecart))} MAD.`
      );

    return liste;
  }, [libelle, lignesEnCentimes, equilibre]);

  const valider = () => {
    setErreur(null);
    if (problemes.length > 0) {
      setErreur(problemes[0]);
      return;
    }

    mutation.mutate({
      dossierId,
      exercice,
      journal,
      date,
      libelle: libelle.trim(),
      lignes: lignesEnCentimes.filter(
        (l) => l.compte !== '' && (l.debit > 0 || l.credit > 0)
      ),
    });
  };

  return (
    <Modal
      ouverte={ouverte}
      titre="Nouvelle écriture"
      onFermer={onFermer}
      largeur="max-w-4xl"
      pied={
        <>
          <Button variante="secondaire" onClick={onFermer}>
            Annuler
          </Button>
          <Button
            onClick={valider}
            chargement={mutation.isPending}
            disabled={problemes.length > 0}
            className="px-5"
          >
            Valider l'écriture
          </Button>
        </>
      }
    >
      {/* En-tête de l'écriture */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="ecr-journal"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Journal
          </label>
          <select
            id="ecr-journal"
            value={journal}
            onChange={(e) => setJournal(e.target.value as CodeJournal)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.entries(JOURNAUX).map(([code, nom]) => (
              <option key={code} value={code}>
                {code} — {nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ecr-date"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Date
          </label>
          <input
            id="ecr-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="ecr-piece"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            N° Pièce (auto)
          </label>
          <input
            id="ecr-piece"
            type="text"
            value={numeroPiece}
            disabled
            className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2
                       text-sm text-gray-400 font-mono"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="ecr-libelle"
          className="text-sm font-medium text-gray-700 mb-1 block"
        >
          Libellé de l'écriture
        </label>
        <input
          id="ecr-libelle"
          type="text"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          placeholder="Ex : Achat fournitures bureau — Facture F-2025-001"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Lignes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Lignes d'écriture
          </span>
          <button
            type="button"
            onClick={ajouterLigne}
            className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-800"
          >
            <i className="fa-solid fa-plus text-xs" aria-hidden="true" /> Ajouter
            une ligne
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs">
                <th className="px-3 py-2 text-left font-medium">Compte PCGE</th>
                <th className="px-3 py-2 text-left font-medium">Libellé ligne</th>
                <th className="px-3 py-2 text-right font-medium">Débit</th>
                <th className="px-3 py-2 text-right font-medium">Crédit</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lignes.map((ligne) => (
                <LigneSaisie
                  key={ligne.cle}
                  ligne={ligne}
                  onModifier={modifierLigne}
                  onSupprimer={supprimerLigne}
                  suppressionPossible={lignes.length > 2}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contrôle d'équilibre en direct */}
      <BandeauEquilibre
        totalDebit={equilibre.totalDebit}
        totalCredit={equilibre.totalCredit}
        equilibre={equilibre.equilibre}
      />

      {(erreur || problemes.length > 0) && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-amber-200
                     bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          <i className="fa-solid fa-circle-info mt-0.5" aria-hidden="true" />
          <span>{erreur ?? problemes[0]}</span>
        </div>
      )}
    </Modal>
  );
}

interface LigneSaisieProps {
  ligne: LigneFormulaire;
  onModifier: (
    cle: string,
    champ: keyof Omit<LigneFormulaire, 'cle'>,
    valeur: string
  ) => void;
  onSupprimer: (cle: string) => void;
  suppressionPossible: boolean;
}

function LigneSaisie({
  ligne,
  onModifier,
  onSupprimer,
  suppressionPossible,
}: LigneSaisieProps) {
  const suggestions = chercherComptes(ligne.compte, 5);
  const compteValide =
    ligne.compte === '' || estNumeroCompteValide(ligne.compte);

  // `list`/`datalist` donne l'autocomplétion native, sans dépendance externe.
  const idListe = `comptes-${ligne.cle}`;

  return (
    <tr>
      <td className="px-3 py-2">
        <input
          type="text"
          value={ligne.compte}
          list={idListe}
          onChange={(e) => onModifier(ligne.cle, 'compte', e.target.value)}
          placeholder="6111"
          aria-label="Compte PCGE"
          className={`w-24 border rounded px-2 py-1 text-xs font-mono
                      focus:outline-none focus:ring-1 focus:ring-indigo-500
                      ${compteValide ? 'border-gray-200' : 'border-red-300 bg-red-50'}`}
        />
        <datalist id={idListe}>
          {suggestions.map((c) => (
            <option key={c.numero} value={c.numero}>
              {c.libelle}
            </option>
          ))}
        </datalist>
      </td>

      <td className="px-3 py-2">
        <input
          type="text"
          value={ligne.libelle}
          onChange={(e) => onModifier(ligne.cle, 'libelle', e.target.value)}
          placeholder="Libellé"
          aria-label="Libellé de la ligne"
          className="w-full min-w-[160px] border border-gray-200 rounded px-2 py-1 text-xs
                     focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </td>

      <td className="px-3 py-2">
        <input
          type="text"
          inputMode="decimal"
          value={ligne.debit}
          onChange={(e) => onModifier(ligne.cle, 'debit', e.target.value)}
          placeholder="0,00"
          aria-label="Débit"
          className="w-28 border border-gray-200 rounded px-2 py-1 text-xs text-right
                     font-mono tabular focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </td>

      <td className="px-3 py-2">
        <input
          type="text"
          inputMode="decimal"
          value={ligne.credit}
          onChange={(e) => onModifier(ligne.cle, 'credit', e.target.value)}
          placeholder="0,00"
          aria-label="Crédit"
          className="w-28 border border-gray-200 rounded px-2 py-1 text-xs text-right
                     font-mono tabular focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </td>

      <td className="px-2 py-2">
        <button
          type="button"
          onClick={() => onSupprimer(ligne.cle)}
          disabled={!suppressionPossible}
          aria-label="Supprimer la ligne"
          className="text-red-400 hover:text-red-600 disabled:opacity-30
                     disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-trash text-xs" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

interface BandeauEquilibreProps {
  totalDebit: number;
  totalCredit: number;
  equilibre: boolean;
}

/** Bandeau vert/rouge résumant l'état de l'équilibre. */
export function BandeauEquilibre({
  totalDebit,
  totalCredit,
  equilibre,
}: BandeauEquilibreProps) {
  const ecart = Math.abs(totalDebit - totalCredit);
  // Formulaire encore vierge : ni équilibré ni en écart, on reste neutre.
  const vierge = totalDebit === 0 && totalCredit === 0;

  const styleConteneur = vierge
    ? 'bg-gray-50 border-gray-200'
    : equilibre
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200';

  return (
    <div
      className={`rounded-lg px-4 py-3 flex items-center justify-between flex-wrap gap-3 border ${styleConteneur}`}
    >
      <div className="flex gap-6 text-sm">
        <span className="text-gray-600">
          Débit :{' '}
          <strong className="text-gray-900 tabular">
            {formatMontant(totalDebit)} MAD
          </strong>
        </span>
        <span className="text-gray-600">
          Crédit :{' '}
          <strong className="text-gray-900 tabular">
            {formatMontant(totalCredit)} MAD
          </strong>
        </span>
      </div>

      {vierge ? (
        <span className="text-gray-500 text-sm flex items-center gap-1.5">
          <i className="fa-solid fa-keyboard" aria-hidden="true" /> Saisissez les
          montants
        </span>
      ) : equilibre ? (
        <span className="text-green-600 font-medium text-sm flex items-center gap-1.5">
          <i className="fa-solid fa-circle-check" aria-hidden="true" /> Équilibré
        </span>
      ) : (
        <span className="text-red-600 font-medium text-sm flex items-center gap-1.5">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          Écart de {formatMontant(ecart)} MAD
        </span>
      )}
    </div>
  );
}
