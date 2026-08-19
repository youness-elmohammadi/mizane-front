import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useDossier } from '../../hooks/useDossier';
import { obtenirBalance, obtenirGrandLivre } from '../../services/etatsService';
import { formatMontantOuTiret } from '../../utils/formatMontant';
import { LIBELLES_CLASSES, type ClassePcge } from '../../utils/pcgeUtils';

import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import DossierSwitcher from '../../components/layout/DossierSwitcher';
import { Chargement, Erreur, Vide } from '../../components/ui/EtatChargement';

/**
 * Balance générale — le socle de tous les autres états.
 *
 * Le bandeau d'équilibre en tête n'est pas décoratif : si la somme des débits
 * diffère de celle des crédits, c'est qu'une écriture déséquilibrée est passée
 * en base, donc que la règle RM-01 a été contournée. Mieux vaut l'afficher en
 * rouge que de produire un bilan faux en silence.
 */
export default function BalancePage() {
  const { dossier, dossierId, isLoading: dossierEnCours } = useDossier();
  const [compteOuvert, setCompteOuvert] = useState<string | null>(null);

  const balance = useQuery({
    queryKey: ['balance', dossierId],
    queryFn: () => obtenirBalance(dossierId!),
    enabled: dossierId !== null,
  });

  const grandLivre = useQuery({
    queryKey: ['grand-livre', dossierId, compteOuvert],
    queryFn: () => obtenirGrandLivre(dossierId!, compteOuvert!),
    enabled: dossierId !== null && compteOuvert !== null,
  });

  if (dossierEnCours) return <Chargement />;

  return (
    <div className="p-6">
      <PageHeader titre="Balance générale" sousTitre={dossier?.raisonSociale} actions={<DossierSwitcher />} />

      {balance.isLoading ? (
        <Chargement />
      ) : balance.isError ? (
        <Erreur onReessayer={() => balance.refetch()} />
      ) : !balance.data || balance.data.lignes.length === 0 ? (
        <Vide titre="Aucun mouvement sur cet exercice." />
      ) : (
        <>
          {/* Contrôle d'équilibre */}
          <div
            className={`mb-4 rounded-lg border px-4 py-3 flex items-center justify-between ${
              balance.data.equilibree
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex gap-6 text-sm text-gray-700">
              <span>
                Total débit :{' '}
                <strong className="font-mono">
                  {formatMontantOuTiret(balance.data.totalDebit)}
                </strong>
              </span>
              <span>
                Total crédit :{' '}
                <strong className="font-mono">
                  {formatMontantOuTiret(balance.data.totalCredit)}
                </strong>
              </span>
            </div>
            <span
              className={`text-sm font-medium ${
                balance.data.equilibree ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {balance.data.equilibree
                ? '✅ Balance équilibrée'
                : '⚠️ Balance déséquilibrée — une écriture est incohérente'}
            </span>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500 text-xs uppercase">
                    <th className="px-4 py-3 text-left font-medium">Compte</th>
                    <th className="px-4 py-3 text-left font-medium">Intitulé</th>
                    <th className="px-4 py-3 text-right font-medium">Débit</th>
                    <th className="px-4 py-3 text-right font-medium">Crédit</th>
                    <th className="px-4 py-3 text-right font-medium">Solde débiteur</th>
                    <th className="px-4 py-3 text-right font-medium">Solde créditeur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {balance.data.lignes.map((l) => (
                    <tr
                      key={l.compteNum}
                      onClick={() =>
                        setCompteOuvert(compteOuvert === l.compteNum ? null : l.compteNum)
                      }
                      className="cursor-pointer hover:bg-indigo-50/40"
                      title="Afficher le grand livre de ce compte"
                    >
                      <td className="px-4 py-2 font-mono text-indigo-600">{l.compteNum}</td>
                      <td className="px-4 py-2 text-gray-900">
                        {l.compteLib}
                        <span className="ml-2 text-xs text-gray-400">
                          {LIBELLES_CLASSES[l.classe as ClassePcge]}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {formatMontantOuTiret(l.totalDebit)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {formatMontantOuTiret(l.totalCredit)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {formatMontantOuTiret(l.soldeDebiteur)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {formatMontantOuTiret(l.soldeCrediteur)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Grand livre du compte sélectionné */}
          {compteOuvert && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Grand livre — compte {compteOuvert}
                {grandLivre.data ? ` · ${grandLivre.data.compteLib}` : ''}
              </h2>

              {grandLivre.isLoading ? (
                <Chargement />
              ) : grandLivre.isError ? (
                <Erreur onReessayer={() => grandLivre.refetch()} />
              ) : !grandLivre.data || grandLivre.data.mouvements.length === 0 ? (
                <Vide titre="Aucun mouvement sur ce compte." />
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-gray-500 text-xs uppercase">
                          <th className="px-4 py-3 text-left font-medium">Date</th>
                          <th className="px-4 py-3 text-left font-medium">Pièce</th>
                          <th className="px-4 py-3 text-left font-medium">Jrn</th>
                          <th className="px-4 py-3 text-left font-medium">Libellé</th>
                          <th className="px-4 py-3 text-right font-medium">Débit</th>
                          <th className="px-4 py-3 text-right font-medium">Crédit</th>
                          <th className="px-4 py-3 text-right font-medium">Solde</th>
                          <th className="px-4 py-3 text-center font-medium">Let.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {grandLivre.data.mouvements.map((m, i) => (
                          <tr key={`${m.pieceRef}-${i}`}>
                            <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                              {m.date}
                            </td>
                            <td className="px-4 py-2 font-mono whitespace-nowrap">
                              {m.pieceRef}
                            </td>
                            <td className="px-4 py-2 text-gray-500">{m.journal}</td>
                            <td className="px-4 py-2">{m.libelle}</td>
                            <td className="px-4 py-2 text-right font-mono">
                              {formatMontantOuTiret(m.debit)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono">
                              {formatMontantOuTiret(m.credit)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-medium">
                              {formatMontantOuTiret(m.soldeProgressif)}
                            </td>
                            <td className="px-4 py-2 text-center text-xs text-gray-500">
                              {m.lettre ?? ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
