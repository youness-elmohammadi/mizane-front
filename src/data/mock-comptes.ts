export interface ComptePcge {
  num: string;
  libelle: string;
}

export const MOCK_COMPTES: ComptePcge[] = [
  { num: '6111', libelle: 'Achats de marchandises' },
  { num: '6141', libelle: 'Loyers et charges locatives' },
  { num: '6171', libelle: 'Rémunérations du personnel' },
  { num: '3421', libelle: 'Clients' },
  { num: '3455', libelle: 'État — TVA récupérable' },
  { num: '4111', libelle: 'Fournisseurs — effets à payer' },
  { num: '4411', libelle: 'Fournisseurs' },
  { num: '4455', libelle: 'État — TVA facturée' },
  { num: '5141', libelle: 'Banque' },
  { num: '5161', libelle: 'Caisse' },
  { num: '7111', libelle: 'Ventes de marchandises' },
  { num: '7121', libelle: 'Ventes de biens produits' },
];