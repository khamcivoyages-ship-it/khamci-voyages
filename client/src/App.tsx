import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ContactWidget from "./components/ContactWidget";
import AnnouncementBar from "@/components/AnnouncementBar";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ThankYou from "./pages/ThankYou";
import FlightsPage from "./pages/FlightsPage";
import HotelsPage from "./pages/HotelsPage";
import CarsPage from "./pages/CarsPage";
import ParisPage from "./pages/ParisPage";
import DubaiPage from "./pages/DubaiPage";
import NewYorkPage from "./pages/NewYorkPage";
import TeamBuildingPage from "./pages/TeamBuildingPage";
import KhamciBusinessPage from "./pages/KhamciBusinessPage";
import CasablancaPage from "./pages/CasablancaPage";
import BangkokPage from "./pages/BangkokPage";
import BarcelonaPage from "./pages/BarcelonaPage";
import AdminDashboardNew from "./pages/AdminDashboardNew";
import APropos from "./pages/APropos";
import BilletterieService from "./pages/services/BilletterieService";
import HotelService from "./pages/services/HotelService";
import LocationVehiculeService from "./pages/services/LocationVehiculeService";
import AssuranceVoyageService from "./pages/services/AssuranceVoyageService";
import VisaService from "./pages/services/VisaService";
import HadjOumraService from "./pages/services/HadjOumraService";
import GuineaDestinationPage from "./pages/GuineaDestinationPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import BlogPage from "./pages/BlogPage";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import ConditionsUtilisation from "./pages/ConditionsUtilisation";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/thank-you" component={ThankYou} />
        <Route path="/vols" component={FlightsPage} />
        <Route path="/hotels" component={HotelsPage} />
        <Route path="/voitures" component={CarsPage} />
        <Route path="/team-building" component={TeamBuildingPage} />
        <Route path="/entreprises" component={KhamciBusinessPage} />
        <Route path="/destination/paris" component={ParisPage} />
        <Route path="/destination/dubai" component={DubaiPage} />
        <Route path="/destination/new-york" component={NewYorkPage} />
        <Route path="/destination/casablanca" component={CasablancaPage} />
        <Route path="/destination/bangkok" component={BangkokPage} />
        <Route path="/destination/barcelona" component={BarcelonaPage} />
        <Route path="/guinee/:slug" component={GuineaDestinationPage} />
        <Route path="/admin" component={AdminDashboardNew} />
        <Route path="/a-propos" component={APropos} />
        <Route path="/services/billetterie" component={BilletterieService} />
        <Route path="/services/hotel" component={HotelService} />
        <Route path="/services/location-vehicule" component={LocationVehiculeService} />
        <Route path="/services/assurance-voyage" component={AssuranceVoyageService} />
        <Route path="/services/visa" component={VisaService} />
        <Route path="/services/hadj-oumra" component={HadjOumraService} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogArticlePage} />
        <Route path="/mentions-legales" component={MentionsLegales} />
        <Route path="/politique-confidentialite" component={PolitiqueConfidentialite} />
        <Route path="/conditions-utilisation" component={ConditionsUtilisation} />
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// Widget de contact flottant, masqué sur les routes admin
function FloatingContact() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return null;
  return <ContactWidget />;
}

// Bannière promotionnelle globale, masquée sur les routes admin
function GlobalAnnouncement() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return null;
  return <AnnouncementBar />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="system"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <GlobalAnnouncement />
          <Router />
          <FloatingContact />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
