import { Fragment, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Ecriture } from '../../types/ecriture';

interface EcritureTableProps {
  ecritures: Ecriture[];
  loading: boolean;
  onContrepasser: (id: string) => void;
}

/** Formateur de montants créé une seule fois : 1440 → « 1 440,00 ». */
const fmt = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function EcritureTable({
  ecritures,
  loading,
  onContrepasser,
}: EcritureTableProps) {
  // Le badge « CP de [ref] » a besoin du pieceRef de l'écriture d'origine :
  // originalDe est un id, on construit donc un index id → pieceRef.
  const refParId = useMemo(() => {
    const map = new Map<string, string>();
    ecritures.forEach((e) => map.set(e.id, e.pieceRef));
    return map;
  }, [ecritures]);

  if (loading) return <SkeletonTable />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-gray-500 text-xs uppercase">
            <th className="px-4 py-3 text-left font-medium">Date</th>
            <th className="px-4 py-3 text-left font-medium">Pièce</th>
            <th className="px-4 py-3 text-left font-medium">Libellé</th>
            <th className="px-4 py-3 text-right font-medium">Débit</th>
            <th className="px-4 py-3 text-right font-medium">Crédit</th>
            <th className="px-4 py-3 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ecritures.map((e) => {
            const desactive = e.statut === 'CLOS' || e.contrepassePar !== null;

            return (
              <Fragment key={e.id}>
                {/* Ligne parente = l'écriture */}
                <tr>
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                    {e.dateEcriture}
                  </td>
                  <td className="px-4 py-2.5 font-mono whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{e.pieceRef}</span>
                      {e.statut === 'CLOS' && <Badge ton="gris">CLOS</Badge>}
                      {e.contrepassePar !== null && (
                        <Badge ton="orange">Contre-passée</Badge>
                      )}
                      {e.originalDe !== null && (
                        <Badge ton="violet">
                          CP de {refParId.get(e.originalDe) ?? e.originalDe}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">
                    {e.libelle}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {fmt.format(e.totalDebit)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {fmt.format(e.totalCredit)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => onContrepasser(e.id)}
                      disabled={desactive}
                      className="text-xs px-2 py-1 rounded border border-gray-200
                                 text-orange-600 hover:bg-orange-50
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Contre-passer
                    </button>
                  </td>
                </tr>

                {/* Lignes détaillées, imbriquées sous l'écriture */}
                {e.lignes.map((l) => (
                  <tr key={l.id} className="text-xs text-gray-600 bg-gray-50/40">
                    <td />
                    <td className="px-4 py-1.5 font-mono text-indigo-600">
                      {l.compteNum}
                    </td>
                    <td className="px-4 py-1.5">
                      {l.compteLib} — {l.libelle}
                    </td>
                    <td className="px-4 py-1.5 text-right font-mono">
                      {l.debit > 0 ? fmt.format(l.debit) : ''}
                    </td>
                    <td className="px-4 py-1.5 text-right font-mono">
                      {l.credit > 0 ? fmt.format(l.credit) : ''}
                    </td>
                    <td />
                  </tr>
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Ton = 'gris' | 'orange' | 'violet';

const TONS: Record<Ton, string> = {
  gris: 'bg-gray-100 text-gray-600',
  orange: 'bg-orange-100 text-orange-700',
  violet: 'bg-purple-100 text-purple-700',
};

function Badge({ ton, children }: { ton: Ton; children: ReactNode }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${TONS[ton]}`}
    >
      {children}
    </span>
  );
}

/** Skeleton de chargement : 5 barres animées. */
function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );
}
