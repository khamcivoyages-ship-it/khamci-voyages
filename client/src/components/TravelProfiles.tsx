import { Palmtree, GraduationCap, Briefcase, Users, ArrowRight } from "lucide-react";

/**
 * TravelProfiles - KHAMCI VOYAGES (V2)
 * Segmentation par profil de voyageur : chaque visiteur se reconnaît dans une
 * carte, ce qui qualifie le lead avant même le formulaire.
 *
 * Tous les CTA pointent pour l'instant vers #contact (formulaire de devis en
 * bas de page). Le profil « Affaires » évoque la future offre entreprise mais
 * sans lien dédié tant que la page B2B n'existe pas — pas de lien mort.
 */

const profiles = [
  {
    icon: Palmtree,
    title: "Vacances",
    description:
      "Séjours détente, découvertes et escapades. On trouve le meilleur vol pour vos vacances de rêve.",
  },
  {
    icon: GraduationCap,
    title: "Études",
    description:
      "Départ pour les études à l'étranger ? Billets étudiants, bagages adaptés, accompagnement complet.",
  },
  {
    icon: Briefcase,
    title: "Affaires",
    description:
      "Déplacements professionnels optimisés : flexibilité, rapidité, gestion des imprévus. Voir notre offre entreprise.",
  },
  {
    icon: Users,
    title: "Famille",
    description:
      "Voyages en famille, regroupements, événements. On gère les groupes et les besoins de chacun.",
  },
];

export default function TravelProfiles() {
  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="heading-lg gradient-text mb-4">
            À chaque voyage son organisation
          </h2>
          <p className="text-body text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Quel que soit votre projet, Khamci vous accompagne.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {profiles.map((profile) => {
            const Icon = profile.icon;
            return (
              <div key={profile.title} className="service-card group flex flex-col">
                <div className="mb-4 inline-flex self-start p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon size={28} className="text-orange-500 dark:text-orange-400" />
                </div>

                <h3 className="heading-md mb-2 text-gray-900 dark:text-white">
                  {profile.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-grow">
                  {profile.description}
                </p>

                <a
                  href="#contact"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:gap-2.5 transition-all duration-300"
                >
                  Demander un devis
                  <ArrowRight size={16} aria-hidden="true" />
                  <span className="sr-only"> pour un voyage {profile.title.toLowerCase()}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
