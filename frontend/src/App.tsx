import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import WorldDetailPage from "./pages/WorldDetailPage";
import MaintenancePage from "./pages/MaintenancePage";

export default function App() {
    const maintenanceMode = (import.meta.env.VITE_MAINTENANCE_MODE || "").toLowerCase() === "true";
    if (maintenanceMode) return <MaintenancePage />;

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />

            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/world/:id" element={<WorldDetailPage />} />
            </Route>
        </Routes>
    );
}
