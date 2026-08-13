import { useState } from "react";
import { Facebook, Instagram, Twitter, MessageCircle, Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubscribed(true);
      setNewsletterEmail("");
      setNewsletterName("");
      toast.success("Inscription réussie ! Vous recevrez nos meilleures offres.");
    },
    onError: (err) => {
      toast.error(err.message || "Une erreur est survenue. Réessayez.");
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    subscribeMutation.mutate({ email: newsletterEmail, name: newsletterName || undefined });
  };

  return (
    <footer className="bg-[#0D1B3E] text-white">
      {/* Newsletter Banner */}
      <div className="bg-gradient-to-r from-[#FF6B35] to-[#e85a2a] py-10">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-white mb-1">
                ✈️ Restez informé des meilleures offres
              </h3>
              <p className="text-orange-100 text-sm">
                Recevez en avant-première nos promotions, conseils de voyage et destinations exclusives.
              </p>
            </div>

            {subscribed ? (
              <div className="flex items-center gap-3 bg-white/20 rounded-xl px-6 py-4 text-white font-semibold">
                <CheckCircle size={24} className="text-white" />
                <span>Vous êtes inscrit(e) ! Merci 🎉</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-[500px]">
                <input
                  type="text"
                  placeholder="Votre prénom (optionnel)"
                  value={newsletterName}
                  onChange={e => setNewsletterName(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-orange-200 focus:outline-none focus:border-white text-sm"
                />
                <input
                  type="email"
                  placeholder="Votre adresse email *"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-orange-200 focus:outline-none focus:border-white text-sm"
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#FF6B35] font-bold rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-70 whitespace-nowrap text-sm"
                >
                  {subscribeMutation.isPending ? (
                    <span className="animate-spin w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full" />
                  ) : (
                    <Send size={16} />
                  )}
                  S'inscrire
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-14">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* About with Logo */}
            <div>
              <a href="/" className="inline-block mb-5 hover:scale-105 transition-transform">
                <img
                  src="/logo-khamci.png"
                  alt="KHAMCI VOYAGES - Retour à l'Accueil"
                  className="h-14 w-auto"
                />
              </a>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                Votre partenaire de confiance pour tous vos voyages en Guinée et au-delà.
                Rapidité, fiabilité et expertise locale depuis 2021.
              </p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/share/16jVhSBqST/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#1a3a6e] hover:bg-[#FF6B35] transition-colors">
                  <Facebook size={16} />
                </a>
                <a href="https://www.instagram.com/khamcivoyages819?igsh=MWZlOXVnOG9jZ3hvZg==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#1a3a6e] hover:bg-[#FF6B35] transition-colors">
                  <Instagram size={16} />
                </a>
                <a href="#" aria-label="Twitter" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#1a3a6e] hover:bg-[#FF6B35] transition-colors">
                  <Twitter size={16} />
                </a>
                <a
                  href="https://wa.me/224611145892"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-600 hover:bg-green-500 transition-colors"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Services</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="/services/billetterie" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">✈</span> Billetterie</a></li>
                <li><a href="/services/hotel" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">🏨</span> Réservation d'Hôtel</a></li>
                <li><a href="/services/location-vehicule" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">🚗</span> Location de Véhicule</a></li>
                <li><a href="/services/assurance-voyage" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">🛡️</span> Assurance Voyage</a></li>
                <li><a href="/services/visa" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">📋</span> Accompagnement Visa</a></li>
                <li><a href="/services/hadj-oumra" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">🕌</span> Hadj &amp; Oumra</a></li>
                <li><a href="/entreprises" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">💼</span> Khamci Business (entreprises)</a></li>
              </ul>
            </div>

            {/* Destinations */}
            <div>
              <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Destinations</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="/destination/paris" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">🗼</span> Paris</a></li>
                <li><a href="/destination/dubai" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">🏙️</span> Dubaï</a></li>
                <li><a href="/destination/casablanca" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">🕌</span> Casablanca</a></li>
                <li><a href="/services/visa" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">🌍</span> Destinations Visa</a></li>
                <li><a href="/services/hadj-oumra" className="hover:text-[#FF6B35] transition-colors flex items-center gap-2"><span className="text-[#FF6B35]">🕌</span> La Mecque</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Contact</h3>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-start gap-3">
                  <Phone size={16} className="text-[#FF6B35] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Téléphone</p>
                    <a href="tel:+224611145892" className="hover:text-[#FF6B35] transition-colors">+224 611 145 892</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="text-[#FF6B35] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <a href="mailto:khamcivoyages@gmail.com" className="hover:text-[#FF6B35] transition-colors break-all">khamcivoyages@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#FF6B35] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Adresse</p>
                    <p>Almamya, commune de Kaloum</p>
                    <p>Conakry, Guinée</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#1a3a6e] mb-8"></div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-khamci.png" alt="" className="w-5 h-5 opacity-40" />
              <p>&copy; {currentYear} KHAMCI VOYAGES. Tous droits réservés.</p>
            </div>
            <div className="flex flex-wrap gap-5 justify-center">
              <a href="/mentions-legales" className="hover:text-[#FF6B35] transition-colors">Mentions Légales</a>
              <a href="/politique-confidentialite" className="hover:text-[#FF6B35] transition-colors">Politique de Confidentialité</a>
              <a href="/conditions-utilisation" className="hover:text-[#FF6B35] transition-colors">Conditions d'Utilisation</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
