import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ConvexProvider } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/_core/lib/auth-client";
import { convex } from "@/_core/lib/convex";
import { Toaster } from "@/public_zone/ui/sonner";
import { TooltipProvider } from "@/public_zone/ui/tooltip";
import SignIn from "@/public_zone/auth/SignIn";
import AdminLayout from "@/shared_logic/layouts/AdminLayout";
import AdminGuard from "@/shared_logic/layouts/AdminGuard";
import BrokerGuard from "@/shared_logic/layouts/BrokerGuard";
import REDGuard from "@/shared_logic/layouts/REDGuard";
import UserGuard from "@/shared_logic/layouts/UserGuard";
import RequireAuth from "@/shared_logic/layouts/RequireAuth";
import Verification from "@/public_zone/auth/Verification";
import Overview from "@/admin_zone/pages/Overview";
import Agents from "@/admin_zone/pages/Agents";
import Users from "@/admin_zone/pages/Users";
import UserDetail from "@/admin_zone/pages/UserDetail";
import Customers from "@/admin_zone/pages/Customers";
import Partners from "@/admin_zone/pages/Partners";
import PartnerCreate from "@/admin_zone/pages/PartnerCreate";
import PartnerDetail from "@/admin_zone/pages/PartnerDetail";
import PartnerEdit from "@/admin_zone/pages/PartnerEdit";
import Properties from "@/admin_zone/pages/Properties";
import PropertyCreate from "@/admin_zone/pages/PropertyCreate";
import PropertyDetail from "@/admin_zone/pages/PropertyDetail";
import PropertyEdit from "@/admin_zone/pages/PropertyEdit";
import Banks from "@/admin_zone/pages/Banks";
import BankCreate from "@/admin_zone/pages/BankCreate";
import BankDetail from "@/admin_zone/pages/BankDetail";
import BankEdit from "@/admin_zone/pages/BankEdit";
import Knowledge from "@/admin_zone/pages/Knowledge";
import KnowledgeCreate from "@/admin_zone/pages/KnowledgeCreate";
import KnowledgeDetail from "@/admin_zone/pages/KnowledgeDetail";
import KnowledgeEdit from "@/admin_zone/pages/KnowledgeEdit";
import Pipeline from "@/admin_zone/pages/Pipeline";
import OrderDetail from "@/admin_zone/pages/OrderDetail";
import Notifications from "@/admin_zone/pages/Notifications";
import Activities from "@/admin_zone/pages/Activities";
import Charts from "@/admin_zone/pages/Charts";
import Developers from "@/admin_zone/pages/Developers";
import PropertyList from "@/shared_logic/properties/pages/PropertyList";
import ModulePropertyCreate from "@/shared_logic/properties/pages/PropertyCreate";
import ModulePropertyDetail from "@/shared_logic/properties/pages/PropertyDetail";
import ModulePropertyEdit from "@/shared_logic/properties/pages/PropertyEdit";

import { DashboardLayout } from "@/shared_logic/layouts/DashboardLayout";
import ModuleOverview from "@/shared_logic/general/pages/Overview";
import ModuleProjects from "@/red_zone/pages/Projects";
import ModuleCRM from "@/broker_zone/pages/CRM";
import ModuleOrganization from "@/shared_logic/general/pages/Organization";
import ModuleSettings from "@/shared_logic/general/pages/Settings";
import ModuleOffers from "@/broker_zone/pages/Offers";
import ModuleInbox from "@/shared_logic/general/pages/Inbox";
import ModuleOfferCreate from "@/shared_logic/offers/pages/OfferCreate";
import ModuleBrokers from "@/admin_zone/pages/Brokers";
import AssistantPage from "@/ai_zone/pages/AssistantPage";

import CustomersLanding from "@/public_zone/landing/CustomersLanding";
import BrokersLanding from "@/public_zone/landing/BrokersLanding";
import DevelopersLanding from "@/public_zone/landing/DevelopersLanding";
import Contact from "@/public_zone/landing/Contact";
import LocaleRoot from "@/_core/router/LocaleRoot";
import LegacyRedirect from "@/_core/router/LegacyRedirect";

import { AdminZoneErrorBoundary } from "@/admin_zone";
import { BrokerZoneErrorBoundary } from "@/broker_zone";
import { RedZoneErrorBoundary } from "@/red_zone";
import { PublicZoneErrorBoundary } from "@/public_zone";

function renderAppRoutes() {
  return (
    <>
      <Route index element={<CustomersLanding />} />
      <Route path="brokers" element={<BrokersLanding />} />
      <Route path="developers" element={<DevelopersLanding />} />
      <Route path="contact" element={<Contact />} />
      <Route path="signin" element={<SignIn />} />

      <Route
        path="admin"
        element={
          <AdminZoneErrorBoundary>
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          </AdminZoneErrorBoundary>
        }
      >
        <Route index element={<Overview />} />
        <Route path="agents" element={<Agents />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="customers" element={<Customers />} />
        <Route path="partners" element={<Partners />} />
        <Route path="partners/create" element={<PartnerCreate />} />
        <Route path="partners/:id" element={<PartnerDetail />} />
        <Route path="partners/:id/edit" element={<PartnerEdit />} />
        <Route path="properties" element={<Properties />} />
        <Route path="properties/create" element={<PropertyCreate />} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        <Route path="properties/:id/edit" element={<PropertyEdit />} />
        <Route path="banks" element={<Banks />} />
        <Route path="banks/create" element={<BankCreate />} />
        <Route path="banks/:id" element={<BankDetail />} />
        <Route path="banks/:id/edit" element={<BankEdit />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="knowledge/create" element={<KnowledgeCreate />} />
        <Route path="knowledge/:id" element={<KnowledgeDetail />} />
        <Route path="knowledge/:id/edit" element={<KnowledgeEdit />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="pipeline/:id" element={<OrderDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="activities" element={<Activities />} />
        <Route path="charts" element={<Charts />} />
        <Route path="developers" element={<Developers />} />
      </Route>

      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<ModuleOverview />} />
        <Route path="verification" element={<Verification />} />

        <Route
          path="broker"
          element={
            <BrokerZoneErrorBoundary>
              <BrokerGuard>
                <Outlet />
              </BrokerGuard>
            </BrokerZoneErrorBoundary>
          }
        >
          <Route index element={<ModuleOverview />} />
          <Route path="projects" element={<ModuleProjects />} />
          <Route path="crm" element={<ModuleCRM />} />
          <Route path="organization" element={<ModuleOrganization />} />
          <Route path="settings" element={<ModuleSettings />} />
          <Route path="properties" element={<PropertyList />} />
          <Route path="offers" element={<ModuleOffers />} />
          <Route path="offers/create" element={<ModuleOfferCreate />} />
          <Route path="inbox" element={<ModuleInbox />} />
          <Route path="brokers" element={<ModuleBrokers />} />
          <Route path="properties/create" element={<ModulePropertyCreate />} />
          <Route path="properties/:id" element={<ModulePropertyDetail />} />
          <Route path="properties/:id/edit" element={<ModulePropertyEdit />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="profile" element={<Navigate to="../settings" replace />} />
        </Route>

        <Route
          path="red"
          element={
            <RedZoneErrorBoundary>
              <REDGuard>
                <Outlet />
              </REDGuard>
            </RedZoneErrorBoundary>
          }
        >
          <Route index element={<ModuleOverview />} />
          <Route path="projects" element={<ModuleProjects />} />
          <Route path="crm" element={<ModuleCRM />} />
          <Route path="organization" element={<ModuleOrganization />} />
          <Route path="settings" element={<ModuleSettings />} />
          <Route path="properties" element={<PropertyList />} />
          <Route path="offers" element={<ModuleOffers />} />
          <Route path="offers/create" element={<ModuleOfferCreate />} />
          <Route path="inbox" element={<ModuleInbox />} />
          <Route path="brokers" element={<ModuleBrokers />} />
          <Route path="properties/create" element={<ModulePropertyCreate />} />
          <Route path="properties/:id" element={<ModulePropertyDetail />} />
          <Route path="properties/:id/edit" element={<ModulePropertyEdit />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="profile" element={<Navigate to="../settings" replace />} />
        </Route>

        <Route
          path="user"
          element={
            <UserGuard>
              <Outlet />
            </UserGuard>
          }
        >
          <Route index element={<ModuleOverview />} />
          <Route path="projects" element={<ModuleProjects />} />
          <Route path="crm" element={<ModuleCRM />} />
          <Route path="organization" element={<ModuleOrganization />} />
          <Route path="settings" element={<ModuleSettings />} />
        </Route>

        <Route path="RED/*" element={<LegacyRedirect to="/dashboard/red" />} />
        <Route path="developer/*" element={<LegacyRedirect to="/dashboard/red" />} />
      </Route>

      <Route path="broker/*" element={<LegacyRedirect to="/dashboard/broker" />} />
      <Route path="developer/*" element={<LegacyRedirect to="/dashboard/red" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  );
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        <TooltipProvider>
          <BrowserRouter>
            <PublicZoneErrorBoundary>
              <Routes>
                <Route path="/" element={<LocaleRoot />}>
                  {renderAppRoutes()}
                </Route>
                <Route path="/:lang" element={<LocaleRoot />}>
                  {renderAppRoutes()}
                </Route>
              </Routes>
            </PublicZoneErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
        <Toaster />
      </ConvexBetterAuthProvider>
    </ConvexProvider>
  );
}

export default App;
