import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DossiersListPage from './pages/dossiers/DossiersListPage';
import EcrituresPage from './pages/saisie/EcrituresPage';
import BilanPage from './pages/etats/BilanPage';
import CpcPage from './pages/etats/CpcPage';
import PortailPage from './pages/portail/PortailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="dossiers" element={<DossiersListPage />} />
            <Route path="saisie" element={<EcrituresPage />} />
            <Route path="bilan" element={<BilanPage />} />
            <Route path="cpc" element={<CpcPage />} />
            <Route path="portail" element={<PortailPage />} />
          </Route>
        </Route>

        {/* Toute URL inconnue */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
