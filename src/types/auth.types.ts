export type Role = 'GERANT' | 'ASSISTANT' | 'CLIENT';

export interface Utilisateur {
    email: string;
    nom: string;
    id: string;
    role: Role;
    cabinetId: string;
}
