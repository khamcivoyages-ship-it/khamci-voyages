import { useState } from "react";
import {
  Plane,
  BedDouble,
  FileCheck,
  Receipt,
  Zap,
  Headset,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { trackDevisSubmission } from "@/lib/analytics";

/**
 * KhamciBusinessPage — Page dédiée /entreprises
 * Sous-marque « Khamci Business » : l'offre B2B (billetterie corporate,
 * hôtels, visas pro) présentée comme une solution de gestion des
 * déplacements professionnels.
 *
 * Le formulaire « Devenez partenaire » n'a pas d'endpoint dédié : il est
 * aplati dans le contrat quotes.submit existant (serviceType "entreprise",
 * source "khamci-business", champs B2B regroupés dans `message`). Aucun
 * changement backend ni DB n'est nécessaire.
 */

const WHATSAPP_NUMBER = "224611145892";
const GUIDE_URL =
  "/blog/guide-2026-comment-optimiser-la-gestion-des-deplacements-professionnels-de-votre-entreprise";

const PAGE_METADATA = {
  title: "Khamci Business — Solutions voyage d'affaires pour entreprises",
  description:
    "Gestion centralisée des déplacements professionnels : billetterie corporate, hôtels, visas pro. Devis sous 24h. Khamci Voyages.",
  ogTitle: "Khamci Business — Solutions voyage d'affaires pour entreprises",
  ogDescription:
    "Gestion centralisée des déplacements professionnels : billetterie corporate, hôtels, visas pro. Devis sous 24h. Khamci Voyages.",
  canonicalUrl: "https://khamci-voyages.com/entreprises",
  ogUrl: "https://khamci-voyages.com/entreprises",
};

const CORPORATE_SERVICES = [
  {
    icon: Plane,
    title: "Billetterie corporate",
    description: "Réservation de vols optimisée selon votre politique voyage.",
  },
  {
    icon: BedDouble,
    title: "Hôtels & Hébergements",
    description: "Sélection d'établissements premium adaptés aux professionnels.",
  },
  {
    icon: FileCheck,
    title: "Visas pro express",
    description: "Assistance complète et traitement prioritaire pour les visas d'affaires.",
  },
];

const ADVANTAGES = [
  {
    icon: Receipt,
    title: "Facturation simplifiée",
    description:
      "Relevés détaillés, facturation centralisée et intégration facile avec vos outils comptables.",
  },
  {
    icon: Zap,
    title: "Réactivité 24/7",
    description:
      "Une équipe dédiée disponible à tout moment pour gérer les modifications et les urgences.",
  },
  {
    icon: Headset,
    title: "Gestion des urgences",
    description:
      "Protocoles stricts pour assurer la sécurité et le rapatriement de vos collaborateurs si nécessaire.",
  },
];

const SECTORS = [
  "Mines & Extraction",
  "ONG - Humanitaire",
  "Télécoms",
  "Banque - Finance",
  "BTP - Construction",
  "Import-Export - Commerce",
  "Administration - Public",
  "Santé",
  "Autre",
];

const VOLUMES = ["1-5", "6-20", "21-50", "50+"];

const EMPTY_FORM = {
  companyName: "",
  sector: "",
  contactName: "",
  email: "",
  phone: "+224 ",
  frequentDestinations: "",
  volume: "",
};

export default function KhamciBusinessPage() {
  usePageMetadata(PAGE_METADATA);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  // Conservé après reset du formulaire pour personnaliser le message WhatsApp.
  const [confirmedCompany, setConfirmedCompany] = useState("");

  const setField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const scrollToForm = () => {
    document.getElementById("partenaire")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = "Nom de l'entreprise requis";
    if (!form.sector) e.sector = "Secteur d'activité requis";
    if (form.contactName.trim().length < 2) e.contactName = "Nom du responsable requis";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Email professionnel valide requis";
    }
    if (!form.phone.trim() || form.phone.trim() === "+224") e.phone = "Téléphone requis";
    if (!form.volume) e.volume = "Volume mensuel estimé requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitQuote = trpc.quotes.submit.useMutation({
    onSuccess: () => {
      trackDevisSubmission({
        // L'union analytics n'a pas de valeur "entreprise" : on agrège en
        // "autre" et on distingue la page B2B via la source.
        service_type: "autre",
        destination: form.frequentDestinations.trim() || undefined,
        source: "khamci-business",
      });
      toast.success("Votre demande a bien été envoyée ! Réponse sous 24h.");
      setConfirmedCompany(form.companyName.trim());
      setSubmitted(true);
      setForm(EMPTY_FORM);
      setErrors({});
    },
    onError: (err) => {
      // Les données saisies sont conservées : l'utilisateur peut réessayer.
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
      console.error(err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const destinations = form.frequentDestinations.trim();
    const message = [
      "DEMANDE B2B — KHAMCI BUSINESS",
      `Entreprise : ${form.companyName.trim()}`,
      `Secteur : ${form.sector}`,
      `Responsable : ${form.contactName.trim()}`,
      `Destinations fréquentes : ${destinations || "non précisé"}`,
      `Volume mensuel estimé : ${form.volume}`,
    ].join("\n");

    submitQuote.mutate({
      clientName: form.contactName.trim(),
      clientEmail: form.email.trim(),
      clientPhone: form.phone.trim() || undefined,
      destination: destinations || undefined,
      serviceType: "entreprise",
      message,
      source: "khamci-business",
    });
  };

  const whatsappUrl = () => {
    const text = `Bonjour, je représente ${confirmedCompany || "mon entreprise"} et souhaite en savoir plus sur Khamci Business`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const inputBase =
    "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white";
  const inputBorder = (field: string) =>
    errors[field] ? "border-red-500" : "border-gray-300 dark:border-gray-600";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden">
        <img
          src="/images/team-building-corporate.webp"
          alt="Collaborateurs en déplacement professionnel organisé par Khamci Voyages"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[#0D1B3E]/85" aria-hidden="true" />

        <div className="relative container py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Colonne gauche */}
            <div className="text-white">
              <span className="inline-block bg-[#FF6B35] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5">
                ◆ Solution B2B
              </span>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">
                Simplifiez les déplacements de votre entreprise.
              </h1>
              <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                Une gestion centralisée, un accompagnement sur-mesure et une réactivité sans
                faille pour vos collaborateurs. Libérez-vous de la logistique du voyage
                d'affaires.
              </p>
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#e85a2a] text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg"
              >
                Demander un rendez-vous
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Colonne droite : carte services corporate */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8">
              <h2 className="text-white text-lg font-bold mb-6">Nos services corporate</h2>
              <ul className="space-y-5">
                {CORPORATE_SERVICES.map(service => {
                  const Icon = service.icon;
                  return (
                    <li key={service.title} className="flex items-start gap-4">
                      <span className="shrink-0 p-2.5 rounded-lg bg-[#FF6B35]/20 text-[#FF6B35]">
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-white font-semibold text-sm md:text-base">
                          {service.title}
                        </h3>
                        <p className="text-gray-300 text-sm mt-0.5 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== POURQUOI KHAMCI BUSINESS ==================== */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-lg gradient-text mb-4">Pourquoi choisir Khamci Business ?</h2>
            <p className="text-body text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Des solutions conçues pour répondre aux exigences des grandes entreprises et des
              PME dynamiques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ADVANTAGES.map(advantage => {
              const Icon = advantage.icon;
              return (
                <div key={advantage.title} className="service-card group flex flex-col">
                  <div className="mb-4 inline-flex self-start p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon size={28} className="text-orange-500 dark:text-orange-400" aria-hidden="true" />
                  </div>
                  <h3 className="heading-md mb-2 text-gray-900 dark:text-white">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {advantage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== RESSOURCE : GUIDE TRAVEL MANAGEMENT ==================== */}
      <section className="py-14 md:py-16 bg-white dark:bg-gray-900">
        <div className="container">
          <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-white dark:from-gray-800 dark:to-gray-800/50 border border-orange-100 dark:border-gray-700 p-8 md:p-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <span className="shrink-0 inline-flex p-3 rounded-xl bg-[#0D1B3E] text-white self-start">
              <BookOpen size={24} aria-hidden="true" />
            </span>
            <div className="flex-grow">
              <h2 className="text-xl md:text-2xl font-bold text-[#0D1B3E] dark:text-white mb-2">
                Aller plus loin
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                Découvrez notre guide complet : 10 leviers concrets et un plan d'action sur 30
                jours pour optimiser les déplacements professionnels de votre entreprise.
              </p>
            </div>
            <a
              href={GUIDE_URL}
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-[#0D1B3E] hover:bg-[#1a3a6e] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Lire le guide
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FORMULAIRE DEVENEZ PARTENAIRE ==================== */}
      <section id="partenaire" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="container max-w-3xl">
          <div className="rounded-2xl shadow-xl bg-white dark:bg-gray-900 p-6 md:p-10">
            {submitted ? (
              /* ---------- Confirmation ---------- */
              <div className="text-center space-y-5 py-2">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Merci ! Votre demande a bien été reçue.
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
                    Un expert Khamci Business vous contacte sous 24h pour étudier vos besoins.
                  </p>
                </div>

                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Discuter maintenant sur WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:underline"
                >
                  Faire une nouvelle demande
                </button>
              </div>
            ) : (
              /* ---------- Formulaire ---------- */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center mb-2">
                  <h2 className="heading-lg gradient-text mb-3">Devenez partenaire</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    Remplissez ce formulaire pour qu'un de nos experts B2B vous contacte et
                    étudie vos besoins.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyName" className={labelClass}>
                      Nom de l'entreprise *
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setField("companyName", e.target.value)}
                      placeholder="Ex : SOGEFEL"
                      className={`${inputBase} ${inputBorder("companyName")}`}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="sector" className={labelClass}>
                      Secteur d'activité *
                    </label>
                    <select
                      id="sector"
                      value={form.sector}
                      onChange={(e) => setField("sector", e.target.value)}
                      className={`${inputBase} ${inputBorder("sector")}`}
                    >
                      <option value="">Sélectionnez un secteur</option>
                      {SECTORS.map(sector => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                    {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector}</p>}
                  </div>

                  <div>
                    <label htmlFor="contactName" className={labelClass}>
                      Nom du responsable *
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      value={form.contactName}
                      onChange={(e) => setField("contactName", e.target.value)}
                      placeholder="Ex : Mariama Diallo"
                      className={`${inputBase} ${inputBorder("contactName")}`}
                    />
                    {errors.contactName && (
                      <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email professionnel *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="contact@entreprise.com"
                      className={`${inputBase} ${inputBorder("email")}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Téléphone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="+224 XXX XXX XXX"
                      className={`${inputBase} ${inputBorder("phone")}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="frequentDestinations" className={labelClass}>
                      Destinations fréquentes
                    </label>
                    <input
                      id="frequentDestinations"
                      type="text"
                      value={form.frequentDestinations}
                      onChange={(e) => setField("frequentDestinations", e.target.value)}
                      placeholder="Ex : Paris, Dakar, Dubaï..."
                      className={`${inputBase} border-gray-300 dark:border-gray-600`}
                    />
                  </div>
                </div>

                <fieldset>
                  <legend className={labelClass}>Volume de voyages estimé par mois *</legend>
                  <div className="flex flex-wrap gap-2">
                    {VOLUMES.map(volume => {
                      const isActive = form.volume === volume;
                      return (
                        <button
                          key={volume}
                          type="button"
                          onClick={() => setField("volume", volume)}
                          aria-pressed={isActive}
                          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                            isActive
                              ? "bg-[#FF6B35] border-[#FF6B35] text-white shadow-md"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                          }`}
                        >
                          {volume}
                        </button>
                      );
                    })}
                  </div>
                  {errors.volume && <p className="text-red-500 text-xs mt-1">{errors.volume}</p>}
                </fieldset>

                <button
                  type="submit"
                  disabled={submitQuote.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-[#0D1B3E] hover:bg-[#1a3a6e] disabled:opacity-70 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg"
                >
                  {submitQuote.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer la demande
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Réponse garantie sous 24h par un expert Khamci Business.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
