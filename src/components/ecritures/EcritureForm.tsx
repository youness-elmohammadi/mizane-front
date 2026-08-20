import { useMemo, useState } from 'react';
import type { Journal } from '../../types/ecriture';
import CompteAutocomplete from './CompteAutocomplete';

interface LigneForm {
  key: string;
  compteNum: string;
  compteLib: string;
  libelle: string;
  debit: string;   // string tant qu'on saisit
  credit: string;
}

interface EcritureFormProps {
  journal: Journal;
  exercice: string;
  onAnnuler: () => void;
  onValider: (payload: { date: string; libelle: string; lignes: LigneForm[] }) => void;
}

const fmt = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "1 200,50" → 1200.5 ; "" → 0. */
function parseMontant(s: string): number {
  const n = Number(s.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function genKey(): string {
  // crypto.randomUUID() requiert un contexte sécurisé (HTTPS) — indisponible
  // en HTTP sur le VPS. On utilise un fallback compatible avec tous les contextes.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function ligneVide(): LigneForm {
  return { key: genKey(), compteNum: '', compteLib: '', libelle: '', debit: '', credit: '' };
}

export default function EcritureForm({ exercice, onAnnuler, onValider }: EcritureFormProps) {
  const [date, setDate] = useState(`${exercice}-01-15`);
  const [libelle, setLibelle] = useState('');
  const [lignes, setLignes] = useState<LigneForm[]>([ligneVide(), ligneVide()]);

  // --- Équilibre temps réel ---
  const { totalDebit, totalCredit, equilibre, ecart } = useMemo(() => {
    const td = lignes.reduce((s, l) => s + parseMontant(l.debit), 0);
    const tc = lignes.reduce((s, l) => s + parseMontant(l.credit), 0);
    // Comparaison en centimes pour éviter les erreurs de virgule flottante.
    const ecartCentimes = Math.round(td * 100) - Math.round(tc * 100);
    return {
      totalDebit: td,
      totalCredit: tc,
      ecart: Math.abs(ecartCentimes) / 100,
      equilibre: ecartCentimes === 0 && td > 0,
    };
  }, [lignes]);

  // --- Modifs de lignes ---
  const modifier = (key: string, champ: 'libelle' | 'debit' | 'credit', valeur: string) => {
    setLignes((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const maj = { ...l, [champ]: valeur };
        if (champ === 'debit' && valeur !== '') maj.credit = '';   // débit OU crédit
        if (champ === 'credit' && valeur !== '') maj.debit = '';
        return maj;
      })
    );
  };

  const modifierCompte = (key: string, num: string, lib: string) => {
    setLignes((prev) => prev.map((l) => (l.key === key ? { ...l, compteNum: num, compteLib: lib } : l)));
  };

  const ajouter = () => setLignes((prev) => [...prev, ligneVide()]);
  const supprimer = (key: string) =>
    setLignes((prev) => (prev.length <= 2 ? prev : prev.filter((l) => l.key !== key)));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      {/* En-tête */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Date *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">N° pièce</label>
          <input value="Sera généré automatiquement" disabled
            className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400" />
        </div>
        <div className="col-span-3">
          <label className="text-sm font-medium text-gray-700 block mb-1">Libellé *</label>
          <input value={libelle} onChange={(e) => setLibelle(e.target.value)}
            placeholder="Ex : Facture fournisseur Dupont"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Lignes */}
      <table className="w-full text-sm border border-gray-100 rounded-lg">
        <thead className="bg-gray-50 text-xs text-gray-500">
          <tr>
            <th className="px-3 py-2 text-left">Compte *</th>
            <th className="px-3 py-2 text-left">Libellé ligne</th>
            <th className="px-3 py-2 text-right">Débit</th>
            <th className="px-3 py-2 text-right">Crédit</th>
            <th className="px-2 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {lignes.map((l) => (
            <tr key={l.key}>
              <td className="px-3 py-2 align-top">
                <CompteAutocomplete compteNum={l.compteNum}
                  onChange={(num, lib) => modifierCompte(l.key, num, lib)} />
              </td>
              <td className="px-3 py-2">
                <input value={l.libelle || l.compteLib}
                  onChange={(e) => modifier(l.key, 'libelle', e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs" />
              </td>
              <td className="px-3 py-2">
                <input inputMode="decimal" value={l.debit}
                  onChange={(e) => modifier(l.key, 'debit', e.target.value)}
                  className="w-28 border border-gray-200 rounded px-2 py-1 text-xs text-right font-mono" />
              </td>
              <td className="px-3 py-2">
                <input inputMode="decimal" value={l.credit}
                  onChange={(e) => modifier(l.key, 'credit', e.target.value)}
                  className="w-28 border border-gray-200 rounded px-2 py-1 text-xs text-right font-mono" />
              </td>
              <td className="px-2 py-2 text-center">
                <button type="button" onClick={() => supprimer(l.key)} disabled={lignes.length <= 2}
                  aria-label="Supprimer la ligne"
                  className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed">
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" onClick={ajouter}
        className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-800">
        <i className="fa-solid fa-plus text-xs" aria-hidden="true" /> Ajouter une ligne
      </button>

      {/* Indicateur d'équilibre temps réel */}
      <div className={`rounded-lg px-4 py-3 flex items-center justify-between border
        ${equilibre ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex gap-6 text-sm text-gray-600">
          <span>Débit : <strong>{fmt.format(totalDebit)}</strong></span>
          <span>Crédit : <strong>{fmt.format(totalCredit)}</strong></span>
        </div>
        {equilibre ? (
          <span className="text-green-600 font-medium text-sm">✅ Écriture équilibrée</span>
        ) : (
          <span className="text-red-600 font-medium text-sm">⚠️ Déséquilibre : {fmt.format(ecart)} MAD</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onAnnuler}
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
          Annuler
        </button>
        <button type="button" disabled={!equilibre}
          onClick={() => onValider({ date, libelle, lignes })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed">
          ✓ Valider l'écriture
        </button>
      </div>
    </div>
  );
}