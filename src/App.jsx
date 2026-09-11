import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import RouteSeo from '@/components/Seo';
import { LOGO_URL } from '@/components/Logo';
// Add page imports here
import Home from '@/pages/Home';
import Estimator from '@/pages/Estimator';
import Funnel from '@/pages/Funnel';
import Results from '@/pages/Results';
import Book from '@/pages/Book';
import Booked from '@/pages/Booked';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import Leads from '@/pages/admin/Leads';
import LeadDetail from '@/pages/admin/LeadDetail';
import Pipeline from '@/pages/admin/Pipeline';
import Emails from '@/pages/admin/Emails';
import SettingsPage from '@/pages/admin/SettingsPage';
import PompanoBeach from '@/pages/seo/PompanoBeach';
import EpoxyGarageFloorCost from '@/pages/seo/EpoxyGarageFloorCost';
import TwoCarGarageEpoxyCost from '@/pages/seo/TwoCarGarageEpoxyCost';
import ThreeCarGarageEpoxyCost from '@/pages/seo/ThreeCarGarageEpoxyCost';
import GarageFloorCoatingCost from '@/pages/seo/GarageFloorCoatingCost';
import ColorCharts from '@/pages/ColorCharts';
import Locations from '@/pages/Locations';
import HowItWorksPage from '@/pages/HowItWorks';
import GalleryPage from '@/pages/Gallery';
import ReviewsPage from '@/pages/Reviews';
import AboutPage from '@/pages/About';
import ContactPage from '@/pages/Contact';
import Competitors from '@/pages/admin/Competitors';
import GoogleSeo from '@/pages/admin/GoogleSeo';
import LocationSeoPage from '@/pages/seo/LocationSeoPage';
import GeneratedPageView from '@/pages/seo/GeneratedPageView';
import Guides from '@/pages/seo/Guides';
import SeoFactory from '@/pages/admin/SeoFactory';
import SopSystem from '@/pages/admin/SopSystem';
import Reviews from '@/pages/admin/Reviews';
import AppOnboarding from '@/pages/AppOnboarding';
import EpoxyProAssistant from '@/pages/EpoxyProAssistant';
import DownloadPage from '@/pages/Download';
import ThankYou from '@/pages/ThankYou';
import Questionnaire from '@/pages/Questionnaire';
import AppSettings from '@/pages/AppSettings';
import ToolManager from '@/pages/admin/ToolManager';
import VisualizerTest from '@/pages/VisualizerTest';
import ToolHub from '@/pages/ToolHub';
import WebsiteFactory from '@/pages/admin/WebsiteFactory';
import AppFactory from '@/pages/admin/AppFactory';
import NationalLaunch from '@/pages/admin/NationalLaunch';
import SeoGenerator from '@/pages/admin/SeoGenerator';
import XtremeComms from '@/pages/admin/XtremeComms';
import LeadScraper from '@/pages/admin/LeadScraper';
import AdminResults from '@/pages/admin/Results';
import AgentBuilder from '@/pages/admin/AgentBuilder';
import VisionStrategy from '@/pages/admin/VisionStrategy';
import Intelligence from '@/pages/admin/Intelligence';
import ClientPackages from '@/pages/admin/ClientPackages';
import ApiKeyManager from '@/pages/admin/ApiKeyManager';
import SocialStudio from '@/pages/admin/SocialStudio';
import RebrandStudio from '@/pages/admin/RebrandStudio';
import LocationPerformance from '@/pages/admin/LocationPerformance';
import SwarmCommand from '@/pages/admin/SwarmCommand';
import SystemBlueprint from '@/pages/admin/SystemBlueprint';
import SystemOperator from '@/pages/admin/SystemOperator';
import WebsiteEmpire from '@/pages/admin/WebsiteEmpire';
import SiteHealthMonitor from '@/pages/admin/SiteHealthMonitor';
import UrlStrategy from '@/pages/admin/UrlStrategy';
import VoiceAssistant from '@/pages/admin/VoiceAssistant';
import AnalyticsDashboard from '@/pages/admin/AnalyticsDashboard';
import WebsiteQueue from '@/pages/admin/WebsiteQueue';
import RagConsole from '@/pages/admin/RagConsole';
import SystemHealth from '@/pages/admin/SystemHealth';
import Platform from '@/pages/admin/Platform';
import SeoSimulator from '@/pages/admin/SeoSimulator';
import DomainGoldRush from '@/pages/admin/DomainGoldRush';
import CrystalBall from '@/pages/admin/CrystalBall';
import Acquire from '@/pages/Acquire';
import GraphConsole from '@/pages/admin/GraphConsole';
import CustomerPortal from '@/pages/CustomerPortal';
import ContractorApp from '@/pages/ContractorApp';
import ContractorBid from '@/pages/ContractorBid';
import CodeStudio from '@/pages/admin/CodeStudio';
import DynamicPageView from '@/pages/DynamicPageView';
import CodeInjector from '@/components/codestudio/CodeInjector';


const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-stone-50">
        <img src={LOGO_URL} alt="Xtreme Polishing Systems" className="h-72 w-72 object-contain" />
        <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
    <CodeInjector />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/estimate" element={<Estimator />} />
      <Route path="/funnel" element={<Funnel />} />
      <Route path="/results/:id" element={<Results />} />
      <Route path="/book/:id" element={<Book />} />
      <Route path="/booked/:id" element={<Booked />} />
      <Route path="/fl/pompano-beach" element={<PompanoBeach />} />
      <Route path="/epoxy-garage-floor-cost" element={<EpoxyGarageFloorCost />} />
      <Route path="/2-car-garage-epoxy-cost" element={<TwoCarGarageEpoxyCost />} />
      <Route path="/3-car-garage-epoxy-cost" element={<ThreeCarGarageEpoxyCost />} />
      <Route path="/garage-floor-coating-cost" element={<GarageFloorCoatingCost />} />
      <Route path="/color-charts" element={<ColorCharts />} />
      <Route path="/locations" element={<Locations />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/guides" element={<Guides />} />
      <Route path="/app-onboarding" element={<AppOnboarding />} />
      <Route path="/elite" element={<EpoxyProAssistant />} />
      <Route path="/download" element={<DownloadPage />} />
      <Route path="/ThankYou" element={<ThankYou />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
      <Route path="/app-settings" element={<AppSettings />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="emails" element={<Emails />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="google" element={<GoogleSeo />} />
        <Route path="factory" element={<SeoFactory />} />
        <Route path="sop" element={<SopSystem />} />
        <Route path="tools" element={<ToolManager />} />
        <Route path="tool-hub" element={<ToolHub />} />
        <Route path="website-factory" element={<WebsiteFactory />} />
        <Route path="app-factory" element={<AppFactory />} />
        <Route path="national-launch" element={<NationalLaunch />} />
        <Route path="seo-generator" element={<SeoGenerator />} />
        <Route path="xtreme-comms" element={<XtremeComms />} />
        <Route path="lead-scraper" element={<LeadScraper />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="agent-builder" element={<AgentBuilder />} />
        <Route path="vision-strategy" element={<VisionStrategy />} />
        <Route path="intelligence" element={<Intelligence />} />
        <Route path="client-packages" element={<ClientPackages />} />
        <Route path="api-keys" element={<ApiKeyManager />} />
        <Route path="social-studio" element={<SocialStudio />} />
        <Route path="rebrand-studio" element={<RebrandStudio />} />
        <Route path="location-performance" element={<LocationPerformance />} />
        <Route path="swarm" element={<SwarmCommand />} />
        <Route path="blueprint" element={<SystemBlueprint />} />
        <Route path="operator" element={<SystemOperator />} />
        <Route path="code-studio" element={<CodeStudio />} />
        <Route path="empire" element={<WebsiteEmpire />} />
        <Route path="site-health" element={<SiteHealthMonitor />} />
        <Route path="url-strategy" element={<UrlStrategy />} />
        <Route path="voice-assistant" element={<VoiceAssistant />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="queue" element={<WebsiteQueue />} />
        <Route path="rag" element={<RagConsole />} />
        <Route path="graph" element={<GraphConsole />} />
        <Route path="system-health" element={<SystemHealth />} />
        <Route path="platform" element={<Platform />} />
        <Route path="seo-simulator" element={<SeoSimulator />} />
        <Route path="domain-rush" element={<DomainGoldRush />} />
        <Route path="crystal-ball" element={<CrystalBall />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/:state/:citySlug" element={<LocationSeoPage />} />
      <Route path="/:slug" element={<GeneratedPageView />} />
      <Route path="/visualizer-test" element={<VisualizerTest />} />
      <Route path="/tool-hub" element={<ToolHub />} />
      <Route path="/portal" element={<CustomerPortal />} />
      <Route path="/acquire" element={<Acquire />} />
      <Route path="/contractor" element={<ContractorApp />} />
      <Route path="/contractor/bid" element={<ContractorBid />} />
      <Route path="/p/:slug" element={<DynamicPageView />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <RouteSeo />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App