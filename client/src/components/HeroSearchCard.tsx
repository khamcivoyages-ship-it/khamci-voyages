import { useState } from 'react';
import { Loader2, Plane, ArrowRight, CheckCircle, Pencil } from 'lucide-react';
import { majorCities, cabinClasses } from '@/data/serviceTypes';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import CityCombobox from '@/components/CityCombobox';
import { trackDevisSubmission } from '@/lib/analytics';

/**
 * HeroSearchCard - KHAMCI VOYAGES (V2)
 * Carte de recherche de vol style comparateur (Booking/Expedia) qui est en
 * réalité un formulaire de devis déguisé : chaque soumission crée un lead
 * Khamci via l'endpoint quotes.submit existant (aucune API de tarifs réels).
 *
 * Parcours en 2 étapes :
 *  1. Itinéraire (engagement faible) : villes, dates, voyageurs, classe.
 *  2. Coordonnées : nom, email, téléphone → soumission quotes.submit.
 * Puis état de confirmation rassurant.
 *
 * Mapping vers quotes.submit : identique à FlightQuoteForm pour rester
 * cohérent avec les leads déjà générés (destination = "Départ → Arrivée",
 * serviceType = "vol"). La classe et le type de trajet, qui n'ont pas de
 * colonne dédiée, sont ajoutés dans `message` pour ne rien perdre.
 */

type TripType = 'round-trip' | 'one-way';
type Step = 'itinerary' | 'contact' | 'confirmation';

const WHATSAPP_NUMBER = '224611145892';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** "Conakry (CKY)" → "Conakry" pour un récap plus léger */
function shortCity(city: string): string {
  return city.replace(/\s*\([^)]*\)\s*$/, '').trim() || city;
}

function formatDateFr(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

export default function HeroSearchCard() {
  const [step, setStep] = useState<Step>('itinerary');
  const [tripType, setTripType] = useState<TripType>('round-trip');

  const [itinerary, setItinerary] = useState({
    departureCity: 'Conakry (CKY)',
    arrivalCity: '', // vide au départ : évite un Conakry → Conakry
    departureDate: '',
    returnDate: '',
    passengers: '1',
    cabinClass: 'economy',
  });

  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+224 ',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isRoundTrip = tripType === 'round-trip';

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ---------- Étape 1 : validation itinéraire ----------
  const validateItinerary = () => {
    const e: Record<string, string> = {};
    if (!itinerary.departureCity.trim()) e.departureCity = 'Ville de départ requise';
    if (!itinerary.arrivalCity.trim()) {
      e.arrivalCity = 'Destination requise';
    } else if (
      itinerary.departureCity.trim().toLowerCase() === itinerary.arrivalCity.trim().toLowerCase()
    ) {
      e.arrivalCity = 'Le départ et la destination doivent être différents';
    }
    if (!itinerary.departureDate) e.departureDate = 'Date de départ requise';
    if (isRoundTrip) {
      if (!itinerary.returnDate) {
        e.returnDate = 'Date de retour requise';
      } else if (new Date(itinerary.returnDate) <= new Date(itinerary.departureDate)) {
        e.returnDate = 'La date de retour doit être après le départ';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validateItinerary()) return;
    setStep('contact');
  };

  // ---------- Étape 2 : validation coordonnées ----------
  const validateContact = () => {
    const e: Record<string, string> = {};
    if (!contact.firstName.trim()) e.firstName = 'Prénom requis';
    if (!contact.lastName.trim()) e.lastName = 'Nom requis';
    if (!contact.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      e.email = 'Email valide requis';
    }
    if (!contact.phone.trim() || contact.phone.trim() === '+224') e.phone = 'Téléphone requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------- Récapitulatif itinéraire ----------
  const cabinLabel =
    cabinClasses.find(c => c.value === itinerary.cabinClass)?.label ?? 'Économique';
  const paxCount = parseInt(itinerary.passengers) || 1;

  const recap = [
    `${shortCity(itinerary.departureCity)} → ${shortCity(itinerary.arrivalCity)}`,
    isRoundTrip && itinerary.returnDate
      ? `${formatDateFr(itinerary.departureDate)} - ${formatDateFr(itinerary.returnDate)}`
      : formatDateFr(itinerary.departureDate),
    `${paxCount} voyageur${paxCount > 1 ? 's' : ''}`,
    cabinLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  // ---------- Soumission quotes.submit ----------
  const submitQuote = trpc.quotes.submit.useMutation({
    onSuccess: () => {
      trackDevisSubmission({
        service_type: 'vol',
        destination: itinerary.arrivalCity || itinerary.departureCity,
        source: 'hero-search',
      });
      toast.success('Votre demande a bien été envoyée ! Réponse sous 24h.');
      setStep('confirmation');
    },
    onError: (err) => {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
      console.error(err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContact()) return;

    const tripLabel = isRoundTrip ? 'Aller-retour' : 'Aller simple';
    // Infos sans colonne dédiée conservées dans le message.
    const messageParts = [
      `Classe : ${cabinLabel}`,
      `Type : ${tripLabel}`,
    ];
    if (contact.message.trim()) messageParts.push(`Message client : ${contact.message.trim()}`);

    submitQuote.mutate({
      clientName: `${contact.firstName} ${contact.lastName}`.trim(),
      clientEmail: contact.email,
      clientPhone: contact.phone.trim() || undefined,
      // Même convention que FlightQuoteForm : "Départ → Arrivée" dans destination.
      destination: `${itinerary.departureCity} → ${itinerary.arrivalCity}`,
      departureDate: itinerary.departureDate || undefined,
      returnDate: isRoundTrip ? itinerary.returnDate || undefined : undefined,
      passengers: paxCount,
      serviceType: 'vol',
      message: messageParts.join(' | '),
      source: 'hero-search',
    });
  };

  const resetCard = () => {
    setStep('itinerary');
    setTripType('round-trip');
    setItinerary({
      departureCity: 'Conakry (CKY)',
      arrivalCity: '',
      departureDate: '',
      returnDate: '',
      passengers: '1',
      cabinClass: 'economy',
    });
    setContact({ firstName: '', lastName: '', email: '', phone: '+224 ', message: '' });
    setErrors({});
  };

  const whatsappUrl = () => {
    const text = `Bonjour KHAMCI VOYAGES, je souhaite un devis pour un vol : ${recap}.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const inputBase =
    'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
  const inputBorder = (field: string) =>
    errors[field] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600';

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl bg-white dark:bg-gray-900 p-6 text-left">
      {/* ===================== ÉTAPE 1 : ITINÉRAIRE ===================== */}
      {step === 'itinerary' && (
        <div className="space-y-5">
          {/* Onglets */}
          <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700">
            {([
              ['round-trip', 'Aller-retour'],
              ['one-way', 'Aller simple'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTripType(value)}
                className={`pb-2 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                  tripType === value
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Champs itinéraire */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${
              isRoundTrip ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            } gap-4`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Départ
              </label>
              <CityCombobox
                value={itinerary.departureCity}
                onChange={(val) => {
                  setItinerary(prev => ({ ...prev, departureCity: val }));
                  clearError('departureCity');
                }}
                placeholder="Ville de départ"
                cities={majorCities}
                error={errors.departureCity}
              />
              {errors.departureCity && (
                <p className="text-red-500 text-xs mt-1">{errors.departureCity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Destination
              </label>
              <CityCombobox
                value={itinerary.arrivalCity}
                onChange={(val) => {
                  setItinerary(prev => ({ ...prev, arrivalCity: val }));
                  clearError('arrivalCity');
                }}
                placeholder="Où allez-vous ?"
                cities={majorCities}
                error={errors.arrivalCity}
              />
              {errors.arrivalCity && (
                <p className="text-red-500 text-xs mt-1">{errors.arrivalCity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de départ
              </label>
              <input
                type="date"
                value={itinerary.departureDate}
                min={today()}
                onChange={(e) => {
                  setItinerary(prev => ({ ...prev, departureDate: e.target.value }));
                  clearError('departureDate');
                }}
                className={`${inputBase} ${inputBorder('departureDate')}`}
              />
              {errors.departureDate && (
                <p className="text-red-500 text-xs mt-1">{errors.departureDate}</p>
              )}
            </div>

            {isRoundTrip && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de retour
                </label>
                <input
                  type="date"
                  value={itinerary.returnDate}
                  min={itinerary.departureDate || today()}
                  onChange={(e) => {
                    setItinerary(prev => ({ ...prev, returnDate: e.target.value }));
                    clearError('returnDate');
                  }}
                  className={`${inputBase} ${inputBorder('returnDate')}`}
                />
                {errors.returnDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>
                )}
              </div>
            )}
          </div>

          {/* Voyageurs & Classe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Voyageurs
              </label>
              <select
                value={itinerary.passengers}
                onChange={(e) => setItinerary(prev => ({ ...prev, passengers: e.target.value }))}
                className={`${inputBase} border-gray-300 dark:border-gray-600`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <option key={n} value={n}>
                    {n} voyageur{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Classe
              </label>
              <select
                value={itinerary.cabinClass}
                onChange={(e) => setItinerary(prev => ({ ...prev, cabinClass: e.target.value }))}
                className={`${inputBase} border-gray-300 dark:border-gray-600`}
              >
                {cabinClasses
                  .filter(c => c.value === 'economy' || c.value === 'business')
                  .map(cls => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 bg-[#E8621F] hover:bg-[#d4551a] text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg"
          >
            <Plane className="w-5 h-5" />
            Demander mon devis gratuit
          </button>
        </div>
      )}

      {/* ===================== ÉTAPE 2 : COORDONNÉES ===================== */}
      {step === 'contact' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Récap itinéraire */}
          <div className="flex items-center justify-between gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-200">{recap}</p>
            <button
              type="button"
              onClick={() => setStep('itinerary')}
              className="flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex-shrink-0"
            >
              <Pencil className="w-3 h-3" />
              Modifier
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Presque terminé ! Où envoyer votre devis ?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              L'équipe Khamci vous répond sous 24h.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={contact.firstName}
                onChange={(e) => {
                  setContact(prev => ({ ...prev, firstName: e.target.value }));
                  clearError('firstName');
                }}
                placeholder="Jean"
                className={`${inputBase} ${inputBorder('firstName')}`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={contact.lastName}
                onChange={(e) => {
                  setContact(prev => ({ ...prev, lastName: e.target.value }));
                  clearError('lastName');
                }}
                placeholder="Dupont"
                className={`${inputBase} ${inputBorder('lastName')}`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => {
                  setContact(prev => ({ ...prev, email: e.target.value }));
                  clearError('email');
                }}
                placeholder="jean@example.com"
                className={`${inputBase} ${inputBorder('email')}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => {
                  setContact(prev => ({ ...prev, phone: e.target.value }));
                  clearError('phone');
                }}
                placeholder="+224 XXX XXX XXX"
                className={`${inputBase} ${inputBorder('phone')}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message (optionnel)
            </label>
            <textarea
              value={contact.message}
              onChange={(e) => setContact(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Précisions sur votre voyage..."
              rows={3}
              className={`${inputBase} border-gray-300 dark:border-gray-600`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setStep('itinerary')}
              className="sm:w-auto px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={submitQuote.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-[#E8621F] hover:bg-[#d4551a] disabled:opacity-70 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
            >
              {submitQuote.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Envoyer ma demande
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ===================== ÉTAPE 3 : CONFIRMATION ===================== */}
      {step === 'confirmation' && (
        <div className="text-center space-y-5 py-2">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Merci ! Votre demande est bien reçue.
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
              L'équipe Khamci vous prépare votre devis personnalisé et vous répond sous 24h.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm font-medium text-orange-800 dark:text-orange-200">
            🎉 Profitez de -10% sur votre billet — offre valable jusqu'au 20 août 2026.
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
            onClick={resetCard}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:underline"
          >
            Faire une nouvelle demande
          </button>
        </div>
      )}
    </div>
  );
}
