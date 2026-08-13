import { useState, useRef, useEffect } from "react";
import { Menu, X, Phone, ChevronDown, Plane, Hotel, Car, Shield, FileText, Star, MessageCircle, Sun, Moon, BookOpen, Briefcase } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { trackPhoneClick, trackWhatsAppClick } from "@/lib/analytics";

const SERVICES_MENU = [
  { label: "Billetterie", href: "/services/billetterie", icon: Plane, desc: "Billets d'avion vers le monde entier" },
  { label: "Réservation d'hôtel", href: "/services/hotel", icon: Hotel, desc: "Hébergements en Guinée et à l'étranger" },
  { label: "Location de véhicule", href: "/services/location-vehicule", icon: Car, desc: "Voitures, SUV, minibus avec ou sans chauffeur" },
  { label: "Assurance voyage", href: "/services/assurance-voyage", icon: Shield, desc: "Couverture médicale et annulation" },
  { label: "Accompagnement visa", href: "/services/visa", icon: FileText, desc: "Dubaï, France, Canada, Chine et plus" },
  { label: "Hadj & Oumra", href: "/services/hadj-oumra", icon: Star, desc: "Pèlerinage vers La Mecque et Médine" },
];

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className="p-2 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-all duration-200"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [location] = useLocation();
  const servicesRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsServicesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsServicesOpen(false), 150);
  };

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
    if (href === "/#contact") {
      if (location === "/") {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#contact";
      }
    }
  };

  const isServiceActive = SERVICES_MENU.some(s => s.href === location);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800/50 border-b border-transparent dark:border-gray-700/50">
      <nav className="container flex items-center justify-between py-3">
        {/* Logo officiel */}
        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
          <img
            src="/logo-khamci-officiel.png"
            alt="KHAMCI VOYAGES - Agence de Voyages Guinée"
            className="h-10 md:h-14 w-auto"
          />
          <div className="hidden sm:block">
            {/* Pas de h1 : le h1 appartient au contenu de chaque page (le nom de marque reste porté par l'alt du logo) */}
            <span className="block text-base md:text-xl font-bold gradient-text leading-tight">KHAMCI VOYAGES</span>
            <p className="text-xs text-gray-500 font-medium hidden md:block">Agence de Voyages — Conakry, Guinée</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* Accueil */}
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              location === "/" ? "text-[#FF6B35] font-semibold" : "text-gray-700 dark:text-gray-200 hover:text-[#FF6B35]"
            }`}
          >
            Accueil
          </Link>

          {/* Menu déroulant Services */}
          <div
            ref={servicesRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setIsServicesOpen(prev => !prev)}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                isServiceActive ? "text-[#FF6B35] font-semibold" : "text-gray-700 dark:text-gray-200 hover:text-[#FF6B35]"
              }`}
            >
              Services
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${isServicesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {isServicesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2">
                  {SERVICES_MENU.map(service => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={() => setIsServicesOpen(false)}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-orange-50 group ${
                          location === service.href ? "bg-orange-50" : ""
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                          location === service.href
                            ? "bg-[#FF6B35] text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-[#FF6B35] group-hover:text-white"
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className={`text-sm font-semibold transition-colors ${
                            location === service.href ? "text-[#FF6B35]" : "text-[#0D1B3E] group-hover:text-[#FF6B35]"
                          }`}>
                            {service.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{service.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={() => {
                      setIsServicesOpen(false);
                      handleNavClick("/#contact");
                    }}
                    className="w-full text-center text-xs font-semibold text-[#FF6B35] hover:text-[#e85a2a] transition-colors"
                  >
                    Demander un service →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Team Building */}
          <Link
            href="/team-building"
            className={`text-sm font-medium transition-colors ${
              location === "/team-building" ? "text-[#FF6B35] font-semibold" : "text-gray-700 dark:text-gray-200 hover:text-[#FF6B35]"
            }`}
          >
            Team Building
          </Link>

          {/* Khamci Business (offre B2B) */}
          <Link
            href="/entreprises"
            className={`text-sm font-medium transition-colors ${
              location === "/entreprises" ? "text-[#FF6B35] font-semibold" : "text-gray-700 dark:text-gray-200 hover:text-[#FF6B35]"
            }`}
          >
            Khamci Business
          </Link>

          {/* Blog */}
          <Link
            href="/blog"
            className={`text-sm font-medium transition-colors ${
              location.startsWith("/blog") ? "text-[#FF6B35] font-semibold" : "text-gray-700 dark:text-gray-200 hover:text-[#FF6B35]"
            }`}
          >
            Blog
          </Link>

          {/* À propos */}
          <Link
            href="/a-propos"
            className={`text-sm font-medium transition-colors ${
              location === "/a-propos" ? "text-[#FF6B35] font-semibold" : "text-gray-700 dark:text-gray-200 hover:text-[#FF6B35]"
            }`}
          >
            À propos
          </Link>

          {/* Contact */}
          <button
            onClick={() => handleNavClick("/#contact")}
            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#FF6B35] transition-colors"
          >
            Contact
          </button>

          {/* Téléphone */}
          <a
            href="tel:+224611145892"
            onClick={() => trackPhoneClick(window.location.pathname)}
            className="flex items-center gap-1.5 text-[#0D1B3E] dark:text-gray-200 hover:text-[#FF6B35] transition-colors font-semibold text-sm border border-[#0D1B3E] dark:border-gray-500 hover:border-[#FF6B35] rounded-full px-3 py-1.5"
          >
            <Phone size={14} className="shrink-0" />
            <span>+224 611 145 892</span>
          </a>

          {/* Bouton bascule thème */}
          <ThemeToggleButton />

          {/* CTA */}
          <button
            onClick={() => handleNavClick("/#contact")}
            className="btn-cta text-sm"
          >
            Demander un Service
          </button>
        </div>

        {/* Mobile: bouton thème + menu */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggleButton />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="container py-4 flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-left text-gray-700 dark:text-gray-200 hover:text-[#FF6B35] transition-colors font-medium py-2.5 border-b border-gray-100 dark:border-gray-700 block"
            >
              Accueil
            </Link>

            {/* Mobile Services Accordion */}
            <div className="border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setIsMobileServicesOpen(prev => !prev)}
                className="w-full flex items-center justify-between text-gray-700 dark:text-gray-200 hover:text-[#FF6B35] transition-colors font-medium py-2.5"
              >
                <span>Services</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180 text-[#FF6B35]" : ""}`}
                />
              </button>
              {isMobileServicesOpen && (
                <div className="pb-2 pl-3 space-y-1">
                  {SERVICES_MENU.map(service => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={() => { setIsMenuOpen(false); setIsMobileServicesOpen(false); }}
                        className="flex items-center gap-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[#FF6B35] transition-colors"
                      >
                        <Icon size={15} className="text-[#FF6B35] shrink-0" />
                        {service.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/team-building"
              onClick={() => setIsMenuOpen(false)}
              className="text-left text-gray-700 dark:text-gray-200 hover:text-[#FF6B35] transition-colors font-medium py-2.5 border-b border-gray-100 dark:border-gray-700 block"
            >
              Team Building
            </Link>

            <Link
              href="/entreprises"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-[#FF6B35] transition-colors font-medium py-2.5 border-b border-gray-100 dark:border-gray-700 ${
                location === "/entreprises" ? "text-[#FF6B35] font-semibold" : ""
              }`}
            >
              <Briefcase size={16} className="text-[#FF6B35] shrink-0" />
              Khamci Business
            </Link>

            <Link
              href="/blog"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-[#FF6B35] transition-colors font-medium py-2.5 border-b border-gray-100 dark:border-gray-700 ${
                location.startsWith("/blog") ? "text-[#FF6B35] font-semibold" : ""
              }`}
            >
              <BookOpen size={16} className="text-[#FF6B35] shrink-0" />
              Blog
            </Link>

            <Link
              href="/a-propos"
              onClick={() => setIsMenuOpen(false)}
              className="text-left text-gray-700 dark:text-gray-200 hover:text-[#FF6B35] transition-colors font-medium py-2.5 border-b border-gray-100 dark:border-gray-700 block"
            >
              À propos
            </Link>

            <button
              onClick={() => handleNavClick("/#contact")}
              className="text-left text-gray-700 dark:text-gray-200 hover:text-[#FF6B35] transition-colors font-medium py-2.5 border-b border-gray-100 dark:border-gray-700"
            >
              Contact
            </button>

            <a
              href="tel:+224611145892"
              onClick={() => trackPhoneClick('mobile_menu')}
              className="flex items-center justify-center gap-2 bg-[#0D1B3E] text-white rounded-lg py-3 font-semibold hover:bg-[#1a3a6e] transition-colors mt-2"
            >
              <Phone size={16} />
              <span>Appeler : +224 611 145 892</span>
            </a>
            <a
              href="https://wa.me/224611145892?text=Bonjour%20KHAMCI%20VOYAGES%2C%20je%20souhaite%20un%20devis."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('mobile_menu')}
              className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-500 transition-colors mt-1"
            >
              <MessageCircle size={16} />
              <span>WhatsApp : +224 611 145 892</span>
            </a>
            <button
              onClick={() => handleNavClick("/#contact")}
              className="btn-cta w-full mt-1"
            >
              Demander un Service
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
