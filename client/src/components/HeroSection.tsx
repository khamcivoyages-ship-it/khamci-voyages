import { Search, Handshake, LifeBuoy, Zap } from "lucide-react";
import HeroSearchCard from "./HeroSearchCard";

const trustArguments = [
  { icon: Search, label: "Recherche personnalisée" },
  { icon: Handshake, label: "Accompagnement humain" },
  { icon: LifeBuoy, label: "Assistance jusqu'au départ" },
  { icon: Zap, label: "Réponse rapide" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/hero-bg-world-travel.webp"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        {/* Overlay marine renforcé pour faire ressortir la carte blanche */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B3E]/90 via-[#0D1B3E]/80 to-[#0D1B3E]/90"></div>
      </div>

      {/* Logo Watermark */}
      <div className="absolute bottom-10 right-10 opacity-10 z-0 hidden md:block">
        <img
          src="/logo-khamci-officiel.png"
          alt=""
          className="w-40 md:w-56 h-auto"
        />
      </div>

      {/* Contenu centré */}
      <div className="relative z-10 container max-w-5xl mx-auto text-white py-16 md:py-20">
        <div className="animate-fade-in-up space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Votre prochain voyage commence ici
            </h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Trouvez le meilleur billet avec Khamci Voyages — accompagnement humain,
              réponse sous 24h, tarifs négociés.
            </p>
          </div>

          {/* Carte de recherche / devis */}
          <HeroSearchCard />

          {/* Arguments de confiance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-2">
            {trustArguments.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-center gap-2 text-sm text-white/90"
              >
                <Icon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
