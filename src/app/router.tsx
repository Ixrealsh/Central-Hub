import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import DashboardPage from "@/pages/DashboardPage";
import OperationsPage from "@/pages/OperationsPage";
import OperationDetailPage from "@/pages/OperationDetailPage";
import MapPage from "@/pages/MapPage";
import PersonnelPage from "@/pages/PersonnelPage";
import PersonnelDetailPage from "@/pages/PersonnelDetailPage";
import AssetsPage from "@/pages/AssetsPage";
import AssetDetailPage from "@/pages/AssetDetailPage";
import LocationsPage from "@/pages/LocationsPage";
import CommunicationsPage from "@/pages/CommunicationsPage";
import MedicalPage from "@/pages/MedicalPage";
import AuditLogsPage from "@/pages/AuditLogsPage";
import SettingsPage from "@/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/operations", element: <OperationsPage /> },
      { path: "/operations/:id", element: <OperationDetailPage /> },
      { path: "/map", element: <MapPage /> },
      { path: "/personnel", element: <PersonnelPage /> },
      { path: "/personnel/:id", element: <PersonnelDetailPage /> },
      { path: "/assets", element: <AssetsPage /> },
      { path: "/assets/:id", element: <AssetDetailPage /> },
      { path: "/locations", element: <LocationsPage /> },
      { path: "/communications", element: <CommunicationsPage /> },
      { path: "/medical", element: <MedicalPage /> },
      { path: "/audit-logs", element: <AuditLogsPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);

