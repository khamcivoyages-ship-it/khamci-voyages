import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import Services from "@/components/Services";
import DiscoverGuinea from "@/components/DiscoverGuinea";
import HowItWorks from "@/components/HowItWorks";
import StatsBar from "@/components/StatsBar";
import TravelProfiles from "@/components/TravelProfiles";
import Blog from "@/components/Blog";
import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import PopularDestinations from "@/components/PopularDestinations";
import Testimonials from "@/components/Testimonials";
import TestimonialForm from "@/components/TestimonialForm";
import { Testimonial } from "@/data/testimonials";

/**
 * Home Page - KHAMCI VOYAGES
 *
 * Sections (ordre V2 : preuve sociale et processus tôt dans le tunnel) :
 * 1. Header - Navigation sticky
 * 2. Hero - Carte de recherche de vol (devis déguisé)
 * 3. Stats Bar - Chiffres clés (5+ ans, 100+ voyageurs, 10+ destinations)
 * 4. Why Choose Us - Arguments clés
 * 5. How It Works - Processus en 3 étapes
 * 6. Services - 6 services avec liens vers pages dédiées
 * 7. Discover Guinea - Carrousel destinations Guinée
 * 8. Popular Destinations - Paris, Dubaï, Casablanca
 * 9. Travel Profiles - Segmentation Vacances/Études/Affaires/Famille
 * 10. Testimonials - Avis clients
 * 11. Blog - Articles de voyage
 * 12. FAQ - Questions fréquentes
 * 13. Contact Form - Formulaire de demande de devis
 * 14. Footer
 */
export default function Home() {
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const handleAddTestimonial = (testimonial: Testimonial) => {
    setTestimonials(prev => [...prev, testimonial]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <StatsBar />
        <WhyChooseUs />
        <HowItWorks />
        <Services />
        <DiscoverGuinea />
        <PopularDestinations />
        <TravelProfiles />
        <Testimonials onAddTestimonial={() => setShowTestimonialForm(true)} />
        <Blog />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
      {showTestimonialForm && (
        <TestimonialForm
          onClose={() => setShowTestimonialForm(false)}
          onSubmit={handleAddTestimonial}
        />
      )}
    </div>
  );
}
