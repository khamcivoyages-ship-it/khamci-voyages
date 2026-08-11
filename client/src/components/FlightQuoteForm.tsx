import { useState } from 'react';
import { Loader2, Plane, ArrowRight, ArrowLeft, CheckCircle, Pencil, ChevronDown } from 'lucide-react';
import { majorCities, cabinClasses, majorAirlines } from '@/data/serviceTypes';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import CityCombobox from '@/components/CityCombobox';
import { trackDevisSubmission } from '@/lib/analytics';

/**
 * FlightQuoteForm - KHAMCI VOYAGES (V2)
 * Assistant de devis vol en 3 étapes + confirmation, reprenant l'identité
 * visuelle de HeroSearchCard.
 *
 * Ordre orienté conversion : on demande le voyage (engagement facile) AVANT
 * les coordonnées. Chaque soumission crée un lead via quotes.submit
 * (aucun changement backend). Mapping identique à HeroSearchCard :
 * destination = "Départ → Arrivée", serviceType = "vol". Les infos sans
 * colonne dédiée (classe, type, compagnies, budget) sont conservées dans
 * `message`. source = "page-vols" pour distinguer des leads du hero.
 *
 * Rendu à l'intérieur d'un conteneur déjà stylé (modal FlightsPage /
 * ServiceQuoteForm) : pas de wrapper carte ici pour éviter la double carte.
 */

interface FlightQuoteFormProps {
  onSubmit?: (data: any) => void;
  onClose?: () => void;
}

type TripType = 'round-trip' | 'one-way';
type Step = 1 | 2 | 3 | 'confirmation';

const WHATSAPP_NUMBER = '224611145892';

const budgetRanges = [
  { value: 'unknown', label: 'Je ne sais pas encore' },
  { value: 'lt5m', label: 'Moins de 5 000 000 GNF' },
  { value: '5to10m', label: '5 000 000 – 10 000 000 GNF' },
  { value: 'gt10m', label: 'Plus de 10 000 000 GNF' },
];

const stepTitles: Record<1 | 2 | 3, string> = {
  1: 'Votre voyage',
  2: 'Voyageurs & préférences',
  3: 'Vos coordonnées',
};

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function shortCity(city: string): string {
  return city.replace(/\s*\([^)]*\)\s*$/, '').trim() || city;
}

function formatDateFr(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

export default function FlightQuoteForm({ onSubmit, onClose }: FlightQuoteFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [tripType, setTripType] = useState<TripType>('round-trip');
  const [showAirlines, setShowAirlines] = useState(false);

  const [formData, setFormData] = useState({
    departureCity: 'Conakry (CKY)',
    arrivalCity: '',
    departureDate: '',
    returnDate: '',
    passengers: '1',
    cabinClass: 'economy',
    airlines: [] as string[],
    budget: 'unknown',
    firstName: '',
    lastName: '',
    email: '',
    phone: '+224 ',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isRoundTrip = tripType === 'round-trip';

  const setField = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleAirline = (airline: string) => {
    setFormData(prev => ({
      ...prev,
      airlines: prev.airlines.includes(airline)
        ? prev.airlines.filter(a => a !== airline)
        : [...prev.airlines, airline],
    }));
  };

  // ---------- Validation ----------
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.departureCity.trim()) e.departureCity = 'Ville de départ requise';
    if (!formData.arrivalCity.trim()) {
      e.arrivalCity = 'Destination requise';
    } else if (
      formData.departureCity.trim().toLowerCase() === formData.arrivalCity.trim().toLowerCase()
    ) {
      e.arrivalCity = 'Le départ et la destination doivent être différents';
    }
    if (!formData.departureDate) e.departureDate = 'Date de départ requise';
    if (isRoundTrip) {
      if (!formData.returnDate) {
        e.returnDate = 'Date de retour requise';
      } else if (new Date(formData.returnDate) <= new Date(formData.departureDate)) {
        e.returnDate = 'La date de retour doit être après le départ';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) e.lastName = 'Nom requis';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Email valide requis';
    }
    if (!formData.phone.trim() || formData.phone.trim() === '+224') e.phone = 'Téléphone requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  // ---------- Récapitulatif ----------
  const cabinLabel =
    cabinClasses.find(c => c.value === formData.cabinClass)?.label ?? 'Économique';
  const budgetLabel =
    budgetRanges.find(b => b.value === formData.budget)?.label ?? 'Je ne sais pas encore';
  const paxCount = parseInt(formData.passengers) || 1;

  const recap = [
    `${shortCity(formData.departureCity)} → ${shortCity(formData.arrivalCity)}`,
    isRoundTrip && formData.returnDate
      ? `${formatDateFr(formData.departureDate)} - ${formatDateFr(formData.returnDate)}`
      : formatDateFr(formData.departureDate),
    `${paxCount} voyageur${paxCount > 1 ? 's' : ''}`,
    cabinLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  // ---------- Soumission ----------
  const submitQuote = trpc.quotes.submit.useMutation({
    onSuccess: () => {
      trackDevisSubmission({
        service_type: 'vol',
        destination: formData.arrivalCity || formData.departureCity,
        source: 'page_vols',
      });
      toast.success('Votre demande a bien été envoyée ! Réponse sous 24h.');
      setStep('confirmation');
      if (onSubmit) onSubmit(formData);
    },
    onError: (err) => {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
      console.error(err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    const tripLabel = isRoundTrip ? 'Aller-retour' : 'Aller simple';
    const messageParts = [
      `Classe : ${cabinLabel}`,
      `Type : ${tripLabel}`,
      `Compagnies préférées : ${formData.airlines.length ? formData.airlines.join(', ') : 'aucune'}`,
      `Budget indicatif : ${budgetLabel}`,
    ];
    if (formData.message.trim()) messageParts.push(`Message client : ${formData.message.trim()}`);

    submitQuote.mutate({
      clientName: `${formData.firstName} ${formData.lastName}`.trim(),
      clientEmail: formData.email,
      clientPhone: formData.phone.trim() || undefined,
      destination: `${formData.departureCity} → ${formData.arrivalCity}`,
      departureDate: formData.departureDate || undefined,
      returnDate: isRoundTrip ? formData.returnDate || undefined : undefined,
      passengers: paxCount,
      serviceType: 'vol',
      message: messageParts.join(' | '),
      source: 'page_vols',
    });
  };

  const resetForm = () => {
    setStep(1);
    setTripType('round-trip');
    setShowAirlines(false);
    setFormData({
      departureCity: 'Conakry (CKY)',
      arrivalCity: '',
      departureDate: '',
      returnDate: '',
      passengers: '1',
      cabinClass: 'economy',
      airlines: [],
      budget: 'unknown',
      firstName: '',
      lastName: '',
      email: '',
      phone: '+224 ',
      message: '',
    });
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

  const currentStepNum = step === 'confirmation' ? 3 : step;

  return (
    <div className="text-left">
      {/* ===================== BARRE DE PROGRESSION ===================== */}
      {step !== 'confirmation' && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Étape {currentStepNum} sur 3
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {stepTitles[currentStepNum as 1 | 2 | 3]}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className={`h-1.5 rounded-full transition-colors ${
                  n < currentStepNum
                    ? 'bg-orange-300'
                    : n === currentStepNum
                    ? 'bg-[#E8621F]'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===================== ÉTAPE 1 : VOTRE VOYAGE ===================== */}
      {step === 1 && (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ville de départ
              </label>
              <CityCombobox
                value={formData.departureCity}
                onChange={(val) => setField('departureCity', val)}
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
                Ville d'arrivée
              </label>
              <CityCombobox
                value={formData.arrivalCity}
                onChange={(val) => setField('arrivalCity', val)}
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
                value={formData.departureDate}
                min={today()}
                onChange={(e) => setField('departureDate', e.target.value)}
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
                  value={formData.returnDate}
                  min={formData.departureDate || today()}
                  onChange={(e) => setField('returnDate', e.target.value)}
                  className={`${inputBase} ${inputBorder('returnDate')}`}
                />
                {errors.returnDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={goToStep2}
            className="w-full flex items-center justify-center gap-2 bg-[#E8621F] hover:bg-[#d4551a] text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg"
          >
            Suivant
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ============ ÉTAPE 2 : VOYAGEURS & PRÉFÉRENCES ============ */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de passagers
              </label>
              <select
                value={formData.passengers}
                onChange={(e) => setField('passengers', e.target.value)}
                className={`${inputBase} border-gray-300 dark:border-gray-600`}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
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
                value={formData.cabinClass}
                onChange={(e) => setField('cabinClass', e.target.value)}
                className={`${inputBase} border-gray-300 dark:border-gray-600`}
              >
                {cabinClasses.map(cls => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget indicatif (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget indicatif <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <select
              value={formData.budget}
              onChange={(e) => setField('budget', e.target.value)}
              className={`${inputBase} border-gray-300 dark:border-gray-600`}
            >
              {budgetRanges.map(b => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Compagnies préférées (optionnel, repliable) */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => setShowAirlines(prev => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span>
                Compagnies préférées <span className="text-gray-400 font-normal">(optionnel)</span>
                {formData.airlines.length > 0 && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                    {formData.airlines.length} sélectionnée{formData.airlines.length > 1 ? 's' : ''}
                  </span>
                )}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAirlines ? 'rotate-180' : ''}`}
              />
            </button>
            {showAirlines && (
              <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {majorAirlines.map(airline => (
                  <label
                    key={airline}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.airlines.includes(airline)}
                      onChange={() => toggleAirline(airline)}
                      className="w-4 h-4 text-orange-500 rounded flex-shrink-0"
                    />
                    <span>{airline}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-2 sm:w-auto px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#E8621F] hover:bg-[#d4551a] text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
            >
              Suivant
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ===================== ÉTAPE 3 : VOS COORDONNÉES ===================== */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Récap voyage */}
          <div className="flex items-center justify-between gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-200">{recap}</p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex-shrink-0"
            >
              <Pencil className="w-3 h-3" />
              Modifier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
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
                value={formData.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
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
                value={formData.email}
                onChange={(e) => setField('email', e.target.value)}
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
                value={formData.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="+224 XXX XXX XXX"
                className={`${inputBase} ${inputBorder('phone')}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message spécial <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setField('message', e.target.value)}
              placeholder="Demandes particulières..."
              rows={3}
              className={`${inputBase} border-gray-300 dark:border-gray-600`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center justify-center gap-2 sm:w-auto px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Précédent
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
                  <Plane className="w-5 h-5" />
                  Envoyer ma demande
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ===================== CONFIRMATION ===================== */}
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
              L'équipe Khamci vous prépare votre devis sous 24h.
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:underline"
            >
              Faire une nouvelle demande
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:underline"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
