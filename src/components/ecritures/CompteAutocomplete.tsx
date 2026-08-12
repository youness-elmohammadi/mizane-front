import { useEffect, useMemo, useRef, useState } from 'react';
import { MOCK_COMPTES } from '../../data/mock-comptes';
import type { ComptePcge } from '../../data/mock-comptes';

interface CompteAutocompleteProps {
  compteNum: string;
  /** Remonte le n° saisi ET le libellé (vide si le compte n'est pas reconnu). */
  onChange: (num: string, libelle: string) => void;
}

export default function CompteAutocomplete({ compteNum, onChange }: CompteAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce 300 ms : on ne recalcule le dropdown que 300 ms après la dernière frappe.
  const debounced = useDebounce(compteNum, 300);

  const resultats = useMemo<ComptePcge[]>(() => {
    const q = debounced.trim().toLowerCase();
    if (q === '') return [];
    return MOCK_COMPTES
      .filter((c) => c.num.toLowerCase().startsWith(q) || c.libelle.toLowerCase().includes(q))
      .slice(0, 10); // max 10 résultats
  }, [debounced]);

  // Valide si vide OU si le n° correspond exactement à un compte connu.
  const valide =
    compteNum.trim() === '' || MOCK_COMPTES.some((c) => c.num === compteNum.trim());

  // Fermeture au clic extérieur / Escape.
  useEffect(() => {
    if (!open) return;
    const surClic = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', surClic);
    document.addEventListener('keydown', surTouche);
    return () => {
      document.removeEventListener('mousedown', surClic);
      document.removeEventListener('keydown', surTouche);
    };
  }, [open]);

  const saisir = (v: string) => {
    const match = MOCK_COMPTES.find((c) => c.num === v.trim());
    onChange(v, match ? match.libelle : ''); // remplit le libellé si reconnu
    setOpen(true);
  };

  const choisir = (c: ComptePcge) => {
    onChange(c.num, c.libelle); // sélection → remplit num ET libellé
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        value={compteNum}
        onChange={(e) => saisir(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Compte"
        aria-invalid={!valide}
        className={`w-24 border rounded px-2 py-1 text-xs font-mono focus:outline-none
                    focus:ring-1 focus:ring-indigo-500
                    ${valide ? 'border-gray-200' : 'border-red-400 bg-red-50'}`}
      />
      {!valide && (
        <p className="text-[11px] text-red-600 mt-0.5">Compte PCGE invalide</p>
      )}

      {open && resultats.length > 0 && (
        <ul className="absolute z-20 mt-1 w-64 bg-white border border-gray-200 rounded-lg
                       shadow-lg max-h-60 overflow-y-auto">
          {resultats.map((c) => (
            <li key={c.num}>
              <button
                type="button"
                onClick={() => choisir(c)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50 flex gap-2"
              >
                <span className="font-mono text-indigo-600">{c.num}</span>
                <span className="text-gray-600">{c.libelle}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Renvoie `value` mais seulement après `delay` ms sans changement (debounce). */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}