/**
 * Google Analytics 4 - Événements de conversion personnalisés
 * ID de mesure : G-9E2RM59EN1
 *
 * Ces événements permettent de suivre :
 * - Les soumissions de devis par type de service
 * - Les destinations les plus demandées
 * - Les interactions clés (WhatsApp, téléphone)
 */

// Déclaration du type gtag pour TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/**
 * Envoie un événement personnalisé à Google Analytics 4
 */
function sendEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

/**
 * Événement générique : permet d'envoyer un événement GA4 avec un nom et des paramètres personnalisés
 * Utilisé notamment pour le tracking des partages d'articles sur les réseaux sociaux
 */
export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  sendEvent(eventName, params);
}

/**
 * Événement : Soumission d'un devis
 * Déclenché quand un formulaire de devis est soumis avec succès
 */
export function trackDevisSubmission(params: {
  service_type: "vol" | "hotel" | "voiture" | "visa" | "team_building" | "autre";
  destination?: string;
  source: "contact_form" | "quick_quote" | "page_vols" | "page_hotels" | "page_voitures" | "page_service" | "hero-search" | "khamci-business";
}) {
  sendEvent("demande_devis", {
    service_type: params.service_type,
    destination: params.destination || "non_specifie",
    form_source: params.source,
    currency: "GNF",
  });
}

/**
 * Événement : Début de remplissage d'un formulaire
 * Déclenché quand l'utilisateur commence à remplir un formulaire
 */
export function trackFormStart(params: {
  form_name: string;
  service_type?: string;
}) {
  sendEvent("form_start", {
    form_name: params.form_name,
    service_type: params.service_type || "non_specifie",
  });
}

/**
 * Événement : Clic sur le bouton WhatsApp
 */
export function trackWhatsAppClick(page: string) {
  sendEvent("whatsapp_click", {
    page_source: page,
    contact_method: "whatsapp",
  });
}

/**
 * Événement : Clic sur le numéro de téléphone
 */
export function trackPhoneClick(page: string) {
  sendEvent("phone_click", {
    page_source: page,
    contact_method: "telephone",
  });
}

/**
 * Événement : Vue d'une page de destination
 */
export function trackDestinationView(destination: string) {
  sendEvent("destination_view", {
    destination_name: destination,
  });
}

/**
 * Événement : Inscription à la newsletter
 */
export function trackNewsletterSignup() {
  sendEvent("newsletter_signup", {
    method: "footer_form",
  });
}

/**
 * Événement : Ouverture du chatbot
 */
export function trackChatbotOpen() {
  sendEvent("chatbot_open", {
    interaction_type: "widget_click",
  });
}

/**
 * Événement : Clic sur "Demander un Service" (CTA principal)
 */
export function trackCTAClick(location: string) {
  sendEvent("cta_click", {
    cta_location: location,
    cta_text: "demander_un_service",
  });
}
