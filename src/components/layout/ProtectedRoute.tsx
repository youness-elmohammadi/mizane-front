import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute() {
    // On s'abonne au token lui-même : le composant se re-rend à la connexion
    // et à la déconnexion. S'abonner à la fonction isAuthenticated ne
    // déclencherait aucun re-render (sa référence ne change jamais).
    const token = useAuthStore((state) => state.token);
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location}} replace />;
    }

    return <Outlet />;
}