import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    // Nécessaire pour que le cookie httpOnly `refresh_token` posé par le
    // backend soit envoyé/reçu (le backend active allowCredentials côté CORS).
    withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/** Marqueur posé sur une requête déjà rejouée, pour ne jamais boucler. */
type RequeteRejouable = InternalAxiosRequestConfig & { _rejouee?: boolean };

/**
 * Rafraîchissement en cours, partagé entre tous les appels.
 *
 * Sans ce verrou, cinq requêtes qui échouent en 401 en même temps
 * déclencheraient cinq refresh concurrents : le backend révoquerait le
 * jeton au fur et à mesure et la plupart échoueraient.
 */
let refreshEnCours: Promise<string> | null = null;

/**
 * Demande un nouvel access token à partir du cookie httpOnly `refresh_token`.
 *
 * On utilise `axios` NU et non `api` : passer par l'instance déclencherait à
 * nouveau l'intercepteur de réponse en cas d'échec, donc une récursion.
 */
async function demanderNouveauToken(): Promise<string> {
    const { data } = await axios.post<{ data: { access_token: string } }>(
        `${BASE_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
    );
    return data.data.access_token;
}

function deconnecterEtRediriger(): void {
    useAuthStore.getState().clear();

    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

api.interceptors.response.use(
    (reponse) => reponse,
    async (error: AxiosError) => {
        const requete = error.config as RequeteRejouable | undefined;

        // Un 401 sur /api/auth/* n'est pas un token expiré : c'est un mauvais
        // identifiant ou un refresh token mort. Tenter un refresh n'aurait
        // aucun sens et masquerait l'erreur réelle.
        const estAppelAuth = requete?.url?.includes('/api/auth/') ?? false;

        if (
            error.response?.status !== 401 ||
            !requete ||
            requete._rejouee ||
            estAppelAuth
        ) {
            if (error.response?.status === 401) {
                deconnecterEtRediriger();
            }
            return Promise.reject(error);
        }

        requete._rejouee = true;

        try {
            if (!refreshEnCours) {
                refreshEnCours = demanderNouveauToken().finally(() => {
                    refreshEnCours = null;
                });
            }

            const nouveauToken = await refreshEnCours;
            useAuthStore.getState().setToken(nouveauToken);
            requete.headers.Authorization = `Bearer ${nouveauToken}`;

            // Rejoue la requête d'origine : l'appelant ne voit jamais le 401.
            return api(requete);
        } catch {
            deconnecterEtRediriger();
            return Promise.reject(error);
        }
    }
);

export default api;
