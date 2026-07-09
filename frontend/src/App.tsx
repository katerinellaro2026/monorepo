import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import SeleccionarPlan from '@/pages/SeleccionarPlan';
import Checkout from '@/pages/Checkout';
import MiSuscripcion from '@/pages/MiSuscripcion';
import MiPerfil from '@/pages/MiPerfil';
import LeadsPage from '@/pages/LeadsPage';
import AcmPage from '@/pages/AcmPage';
import ComparadorPage from '@/pages/ComparadorPage';
import AlertasPage from '@/pages/AlertasPage';
import ApiAccessPage from '@/pages/ApiAccessPage';
import PublicChat from '@/pages/PublicChat';
import CommandCenter from '@/pages/CommandCenter';
import ProDashboard from '@/pages/ProDashboard';
import PlanEstrategico from '@/pages/PlanEstrategico';
import MapaProcesos from '@/pages/MapaProcesos';
import SimuladorBSC from '@/pages/SimuladorBSC';
import EstructuraIA from '@/pages/EstructuraIA';
import CulturaOrganizacional from '@/pages/CulturaOrganizacional';
import CadenaDeValor from '@/pages/CadenaDeValor';
import MonitorIA from '@/pages/MonitorIA';
import AdminSuscripciones from '@/pages/AdminSuscripciones';

function getRole(): string | null {
  return localStorage.getItem('inmodata_role');
}

function isAuthenticated(): boolean {
  return !!localStorage.getItem('inmodata_token');
}

function PrivateRoute({
  children,
  requiredRoles,
}: {
  children: React.ReactNode;
  requiredRoles: string[];
}) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const role = getRole() ?? '';
  if (!requiredRoles.includes(role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const CLIENT = ['BUYER', 'BROKER'];
const ADMIN = ['ADMIN'];
const ALL = ['BUYER', 'BROKER', 'ADMIN'];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<PublicChat />} />

        {/* Flujo de suscripción (autenticado, sin layout) */}
        <Route path="/seleccionar-plan" element={
          <PrivateRoute requiredRoles={CLIENT}><SeleccionarPlan /></PrivateRoute>
        } />
        <Route path="/checkout" element={
          <PrivateRoute requiredRoles={CLIENT}><Checkout /></PrivateRoute>
        } />

        {/* Cliente (con layout + chat lateral, gating de suscripción en AppLayout) */}
        <Route path="/mi-suscripcion" element={
          <PrivateRoute requiredRoles={ALL}><AppLayout><MiSuscripcion /></AppLayout></PrivateRoute>
        } />
        <Route path="/mi-perfil" element={
          <PrivateRoute requiredRoles={ALL}><AppLayout><MiPerfil /></AppLayout></PrivateRoute>
        } />
        {/* Funciones habilitadas por plan */}
        <Route path="/leads" element={
          <PrivateRoute requiredRoles={CLIENT}><AppLayout><LeadsPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/acm" element={
          <PrivateRoute requiredRoles={CLIENT}><AppLayout><AcmPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/comparador" element={
          <PrivateRoute requiredRoles={CLIENT}><AppLayout><ComparadorPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/alertas" element={
          <PrivateRoute requiredRoles={CLIENT}><AppLayout><AlertasPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/api-access" element={
          <PrivateRoute requiredRoles={CLIENT}><AppLayout><ApiAccessPage /></AppLayout></PrivateRoute>
        } />

        {/* Admin */}
        <Route path="/command-center" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><CommandCenter /></AppLayout></PrivateRoute>
        } />
        <Route path="/admin-suscripciones" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><AdminSuscripciones /></AppLayout></PrivateRoute>
        } />
        <Route path="/pro-dashboard" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><ProDashboard /></AppLayout></PrivateRoute>
        } />
        <Route path="/plan-estrategico" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><PlanEstrategico /></AppLayout></PrivateRoute>
        } />
        <Route path="/mapa-procesos" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><MapaProcesos /></AppLayout></PrivateRoute>
        } />
        <Route path="/simulador-bsc" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><SimuladorBSC /></AppLayout></PrivateRoute>
        } />
        <Route path="/estructura-ia" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><EstructuraIA /></AppLayout></PrivateRoute>
        } />
        <Route path="/cultura-organizacional" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><CulturaOrganizacional /></AppLayout></PrivateRoute>
        } />
        <Route path="/cadena-valor" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><CadenaDeValor /></AppLayout></PrivateRoute>
        } />
        <Route path="/monitor-ia" element={
          <PrivateRoute requiredRoles={ADMIN}><AppLayout><MonitorIA /></AppLayout></PrivateRoute>
        } />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
