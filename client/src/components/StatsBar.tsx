import { useEffect, useRef, useState } from "react";

/**
 * StatsBar - KHAMCI VOYAGES (V2)
 * Bande de preuve sociale chiffrée placée juste après le hero.
 *
 * ⚠ Les chiffres sont RÉELS (fournis par le client) : 5 ans d'activité,
 * ~100 voyageurs accompagnés, ~10 destinations desservies. Le « + » signifie
 * « au moins » — ne pas les gonfler sans validation du client.
 */

const stats = [
  { value: 5, suffix: "+", label: "ANNÉES", sublabel: "d'expérience" },
  { value: 100, suffix: "+", label: "VOYAGEURS", sublabel: "accompagnés" },
  { value: 10, suffix: "+", label: "DESTINATIONS", sublabel: "desservies" },
];

const COUNT_DURATION = 1200; // ms

/** Compte de 0 à `target` une seule fois, quand `active` passe à true. */
function useCountUp(target: number, active: boolean): number {
  const [value, setValue] = useState(active ? target : 0);

  useEffect(() => {
    if (!active) return;

    // Respect des préférences d'accessibilité : pas d'animation.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / COUNT_DURATION, 1);
      // easeOutQuad : démarrage rapide, arrivée douce sur le chiffre final
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active]);

  return value;
}

function StatItem({ stat, visible }: { stat: (typeof stats)[number]; visible: boolean }) {
  const count = useCountUp(stat.value, visible);

  return (
    <div className="text-center px-4">
      <p className="text-4xl md:text-5xl font-black text-orange-400 tabular-nums">
        {count}
        {stat.suffix}
      </p>
      <p className="mt-2 text-sm md:text-base font-bold tracking-wide text-white">
        {stat.label}
      </p>
      <p className="text-xs md:text-sm text-white/70">{stat.sublabel}</p>
    </div>
  );
}

export default function StatsBar() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    // Pas d'IntersectionObserver (très vieux navigateur) : chiffres statiques.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="KHAMCI VOYAGES en chiffres"
      className="py-10 md:py-14 bg-gradient-to-br from-[#0D1B3E] to-[#1a3a6e] text-white"
    >
      <div className="container">
        <div className="grid grid-cols-3 divide-x divide-white/15">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
