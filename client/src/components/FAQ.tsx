import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Link } from "wouter";

type FaqQuestion = {
  q: string;
  a: string;
  /** Lien complémentaire affiché sous la réponse (optionnel). */
  link?: { label: string; href: string };
};

type FaqCategory = {
  category: string;
  questions: FaqQuestion[];
};

const FAQ_ITEMS: FaqCategory[] = [
  {
    category: "Devis & Réservation",
    questions: [
      {
        q: "Comment obtenir un devis pour un billet d'avion ?",
        a: "C'est simple et gratuit ! Remplissez le formulaire de demande de devis en bas de cette page ou accédez directement à notre page Billetterie. Indiquez votre ville de départ, votre destination, les dates et le nombre de passagers. Nous vous répondons sous 24h avec les meilleures offres disponibles.",
      },
      {
        q: "Combien de temps faut-il pour recevoir un devis ?",
        a: "Nous nous engageons à vous répondre dans un délai maximum de 24 heures ouvrées. En pratique, la plupart des devis sont envoyés dans les 2 à 4 heures suivant votre demande pendant les heures de bureau.",
      },
      {
        q: "Le devis est-il gratuit et sans engagement ?",
        a: "Oui, absolument. Toutes nos demandes de devis sont entièrement gratuites et sans aucun engagement de votre part. Vous êtes libre d'accepter ou de refuser l'offre proposée.",
      },
    ],
  },
  {
    category: "Paiement & Tarifs",
    questions: [
      {
        q: "Quels sont les modes de paiement acceptés ?",
        a: "Nous acceptons les paiements en espèces, par virement bancaire, et via les solutions de paiement mobile disponibles en Guinée. Des facilités de paiement échelonné sont également disponibles pour les billets d'avion — contactez-nous pour en savoir plus.",
      },
      {
        q: "Proposez-vous des réductions ou des offres spéciales ?",
        a: "Oui ! Nous proposons régulièrement des tarifs promotionnels sur certaines destinations. De plus, pour tout achat de billet via notre site, vous bénéficiez automatiquement d'une réduction de 5% dans le cadre de notre offre de lancement. Abonnez-vous à notre newsletter pour être informé en premier.",
      },
      {
        q: "Puis-je payer en plusieurs fois ?",
        a: "Oui, nous proposons des facilités de paiement pour les billets d'avion. Les modalités dépendent du montant total et de la date de voyage. Mentionnez votre souhait dans le champ 'message' de votre demande de devis et nous vous proposerons un plan adapté.",
      },
    ],
  },
  {
    category: "Services & Destinations",
    questions: [
      {
        q: "Quelles destinations couvrez-vous pour les visas ?",
        a: "Nous accompagnons les voyageurs pour l'obtention de visas vers 7 destinations : Dubaï (EAU), Chine, Inde, Maroc, Égypte, France (Schengen) et Canada. Nos experts préparent votre dossier complet et assurent le suivi de votre demande jusqu'à l'obtention du visa.",
      },
      {
        q: "Proposez-vous des services pour les entreprises ?",
        a: "Absolument. KHAMCI VOYAGES dispose d'une offre dédiée aux entreprises, Khamci Business : gestion des déplacements professionnels, billets d'avion en volume, réservations d'hôtels pour vos équipes, location de véhicules avec chauffeur et organisation de voyages de team building. Contactez-nous pour un partenariat sur mesure.",
        link: { label: "Découvrir Khamci Business →", href: "/entreprises" },
      },
      {
        q: "Puis-je réserver un hôtel sans passer par un billet d'avion ?",
        a: "Oui, tous nos services sont disponibles séparément. Vous pouvez réserver uniquement un hôtel, uniquement un billet d'avion, ou combiner plusieurs services. Chaque service dispose de sa propre page de demande de devis.",
      },
    ],
  },
  {
    category: "Assistance & Contact",
    questions: [
      {
        q: "Comment vous contacter en cas d'urgence pendant mon voyage ?",
        a: "Vous pouvez nous joindre à tout moment par téléphone au +224 611 145 892 ou par email à khamcivoyages@gmail.com. Notre équipe est disponible pour vous assister et vous orienter en cas de problème pendant votre voyage.",
      },
      {
        q: "Que faire si mon vol est annulé ou retardé ?",
        a: "En cas d'annulation ou de retard de vol, contactez-nous immédiatement. Nous intervenons auprès des compagnies aériennes pour vous proposer des solutions alternatives (vol de remplacement, remboursement, etc.) et vous accompagnons dans toutes les démarches nécessaires.",
      },
    ],
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>("Devis & Réservation");

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeItems = FAQ_ITEMS.find(c => c.category === activeCategory)?.questions || [];

  return (
    <section id="faq" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-orange-100 text-[#FF6B35] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            Questions fréquentes
          </span>
          <h2 className="heading-lg gradient-text mb-4">
            Tout ce que vous devez savoir
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Vous avez une question ? Retrouvez les réponses aux questions les plus fréquentes
            de nos clients. Vous ne trouvez pas votre réponse ? Notre équipe est disponible.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-8 md:mb-10">
          {FAQ_ITEMS.map(cat => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
                activeCategory === cat.category
                  ? "bg-[#FF6B35] text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {activeItems.map((item, index) => {
            const key = `${activeCategory}-${index}`;
            const isOpen = !!openItems[key];
            return (
              <div
                key={key}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen ? "border-[#FF6B35] shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <button
                  onClick={() => toggleItem(key)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className={`font-semibold text-sm md:text-base leading-snug ${
                    isOpen ? "text-[#FF6B35]" : "text-[#0D1B3E] dark:text-white"
                  }`}>
                    {item.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#FF6B35]" : "text-gray-400"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 bg-orange-50/30 dark:bg-orange-900/10 border-t border-orange-100 dark:border-orange-900/30">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pt-4">
                      {item.a}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link.href}
                        className="inline-block mt-3 text-sm font-semibold text-[#FF6B35] hover:underline"
                      >
                        {item.link.label}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-br from-[#0D1B3E] to-[#1a3a6e] rounded-2xl p-8 text-white">
          <MessageCircle size={32} className="mx-auto mb-3 text-[#FF6B35]" />
          <h3 className="text-xl font-bold mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-gray-300 text-sm mb-6">
            Notre équipe est disponible pour répondre à toutes vos questions personnalisées.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+224611145892"
              className="flex items-center justify-center gap-2 bg-white text-[#0D1B3E] font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              📞 Appeler maintenant
            </a>
            <Link
              href="/#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center justify-center gap-2 bg-[#FF6B35] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#e85a2a] transition-colors text-sm"
            >
              ✉️ Envoyer un message
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
