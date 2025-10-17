import { useEffect, useState } from 'react';
import StarRatingInput from "./StarRatingInput";
import Checkbox from "./Checkbox";
import api from '../Api/axios';
import type { SportType } from '../Api/types/SportType.ts';
import type { SportObject } from '../Api/types/SportObject.ts';
const card = "bg-black border border-gray-600 rounded-xl px-4 pt-2 pb-4";

type FormErrors = {
  eventName?: string;
  sportId?: string;
  level?: string;
  price?: string;
  maxParticipants?: string;
  isPrivate?: string;
  eventDate?: string;
  eventTime?: string;
  placeId?: string;
};

export default function CreateEventForm() {
  const [eventName, setEventName] = useState("");
  const [sportId, setSportId] = useState<number>(0);
  const [level, setLevel] = useState(1);
  const [free, setFree] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [price, setPrice] = useState<number | "">(0);
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState(""); // HH:mm
  const [placeId, setPlaceId] = useState<number>(0);

  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [sportObjects, setSportObjects] = useState<SportObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState<string | null>(null);

  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);

  useEffect(() => {
    setOwnerEmail(localStorage.getItem('email'));
  }, []);

  useEffect(() => {
    api.get<SportType[]>('/sport-type')
      .then(res => setSportTypes(res.data))
      .catch(() => setFetchError("Nie udało się pobrać sportów."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get<SportObject[]>('/sport-object')
      .then(res => setSportObjects(res.data))
      .catch(() => setFetchError("Nie udało się pobrać obiektów sportowych."))
      .finally(() => setLoading(false));
  }, []);

  const isDateInPast = (d: string) => {
    if (!d) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const picked = new Date(d); picked.setHours(0,0,0,0);
    return picked < today;
  };

  const isDateTimeInPast = (date: string, time: string) => {
    if (!date || !time) return false;
    const dt = new Date(`${date}T${time}:00`);
    return dt.getTime() < Date.now();
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!eventName.trim() || eventName.trim().length < 3) newErrors.eventName = "Nazwa jest wymagana (min. 3 znaki).";
    if (!sportId || sportId <= 0) newErrors.sportId = "Wybierz sport.";
    if (level < 1 || level > 5) newErrors.level = "Poziom musi być w zakresie 1–5.";

    if (!free) {
      if (price === "" || Number.isNaN(Number(price))) newErrors.price = "Cena jest wymagana.";
      else if (Number(price) < 0) newErrors.price = "Cena nie może być ujemna.";
    }

    if (maxParticipants === "" || Number.isNaN(Number(maxParticipants))) newErrors.maxParticipants = "Podaj maksymalną liczbę uczestników.";
    else if (!Number.isInteger(Number(maxParticipants)) || Number(maxParticipants) < 1) newErrors.maxParticipants = "Musi być liczbą całkowitą ≥ 1.";

    if (!eventDate) newErrors.eventDate = "Wybierz datę wydarzenia.";
    else if (isDateInPast(eventDate)) newErrors.eventDate = "Data nie może być z przeszłości.";

    if (!eventTime) newErrors.eventTime = "Wybierz godzinę.";
    else if (!/^\d{2}:\d{2}$/.test(eventTime)) newErrors.eventTime = "Nieprawidłowy format godziny.";
    else if (eventDate && isDateTimeInPast(eventDate, eventTime)) newErrors.eventTime = "Termin nie może być z przeszłości.";

    if (!placeId || placeId <= 0) newErrors.placeId = "Wybierz miejsce.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toLocalDateTime = (dateOnly: string, timeHHmm: string) =>
    `${dateOnly}T${timeHHmm}:00`;

  const resetForm = () => {
    setEventName("");
    setSportId(0);
    setLevel(1);
    setFree(false);
    setIsPrivate(false);
    setPrice(0);
    setMaxParticipants("");
    setEventDate("");
    setEventTime("");
    setPlaceId(0);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerOk(null);

    if (!validate()) return;
    if (!ownerEmail) {
      setServerError("Brak emaila zalogowanego użytkownika w localStorage (klucz: 'email').");
      return;
    }

    const payload = {
      eventName: eventName.trim(),
      numberOfParticipants: Number(maxParticipants),
      cost: free ? 0 : Number(price),
      ownerEmail,
      sportObjectId: placeId,
      eventVisibilityId: isPrivate ? 2 : 1, // dopasuj do swojej tabeli visibility
      status: "PLANNED",                    // dopasuj do enuma po stronie BE
      eventDate: toLocalDateTime(eventDate, eventTime),
      sportTypeId: sportId,
      minLevel: level
    };

    try {
      setSubmitting(true);
      await api.post('/event', payload);
      setServerOk("Wydarzenie utworzone ✅");
      resetForm();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Nieznany błąd.";
      setServerError(`Nie udało się utworzyć wydarzenia: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputErrorStyle = "border-red-500 focus:ring-red-500";
  const errorText = (msg?: string) => msg ? <p className="mt-1 text-sm text-red-400">{msg}</p> : null;

  return (
    <div className="py-10 px-4 mx-auto max-w-6xl">
      <h1 className='text-3xl font-bold text-white mb-3'>
        <span className='text-purple-500'>Stwórz</span> nowe wydarzenie
      </h1>

      {fetchError && (
        <div className="mb-4 rounded border border-red-500 bg-red-900/30 text-red-200 px-4 py-2">
          {fetchError}
        </div>
      )}
      {serverError && (
        <div className="mb-4 rounded border border-red-500 bg-red-900/30 text-red-200 px-4 py-2">
          {serverError}
        </div>
      )}
      {serverOk && (
        <div className="mb-4 rounded border border-green-600 bg-green-900/30 text-green-200 px-4 py-2">
          {serverOk}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <div className={card}>
            <label className="text-gray-400 text-sm mb-1 block" htmlFor="eventName">Nazwa wydarzenia:</label>
            <input
              type="text"
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className={`w-full p-2 border border-gray-300 rounded bg-gray-100 ${errors.eventName ? inputErrorStyle : ""}`}
              placeholder="Wpisz nazwę wydarzenia"
              aria-invalid={!!errors.eventName}
              aria-describedby={errors.eventName ? "eventName-error" : undefined}
            />
            {errors.eventName && <div id="eventName-error">{errorText(errors.eventName)}</div>}
          </div>

          <div className={card}>
            <label className="text-gray-400 text-sm mb-1 block" htmlFor="sport">Sport:</label>
            <select
              id="sport"
              value={sportId}
              onChange={(e) => setSportId(Number(e.target.value))}
              className={`w-full p-2 border border-gray-300 rounded bg-gray-100 ${errors.sportId ? inputErrorStyle : ""}`}
              aria-invalid={!!errors.sportId}
              aria-describedby={errors.sportId ? "sport-error" : undefined}
            >
              <option value={0}>Wybierz sport</option>
              {sportTypes.map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
            {errors.sportId && <div id="sport-error">{errorText(errors.sportId)}</div>}
          </div>

          <div className={card}>
            <StarRatingInput
              label="Minimalny stopień zaawansowania:"
              value={level}
              onChange={setLevel}
              max={5}
              size={30}
            />
            {errors.level && errorText(errors.level)}
          </div>

          <div className={`${card} flex items-center`}>
            <Checkbox
              id="isFree"
              label="Bezpłatny udział:"
              checked={free}
              onChange={(checked) => {
                setFree(checked);
                if (checked) setPrice(0);
              }}
            />
          </div>

          <div className={card}>
            <label className="text-gray-400 text-sm mb-1 block" htmlFor="price">Cena (PLN):</label>
            <input
              type="number"
              id="price"
              value={free ? 0 : price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={free}
              className={`w-full p-2 border border-gray-300 rounded bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed ${errors.price ? inputErrorStyle : ""}`}
              placeholder="Podaj cenę"
              min={0}
              step={0.01}
              inputMode="decimal"
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? "price-error" : undefined}
            />
            {errors.price && <div id="price-error">{errorText(errors.price)}</div>}
          </div>

          <div className={card}>
            <label className="text-gray-400 text-sm mb-1 block" htmlFor="maxParticipants">Maksymalna liczba uczestników:</label>
            <input
              type="number"
              id="maxParticipants"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value === "" ? "" : Number(e.target.value))}
              className={`w-full p-2 border border-gray-300 rounded bg-gray-100 ${errors.maxParticipants ? inputErrorStyle : ""}`}
              placeholder="Np. 10"
              min={1}
              step={1}
              aria-invalid={!!errors.maxParticipants}
              aria-describedby={errors.maxParticipants ? "maxParticipants-error" : undefined}
            />
            {errors.maxParticipants && <div id="maxParticipants-error">{errorText(errors.maxParticipants)}</div>}
          </div>

          <div className={`${card} flex items-center`}>
            <Checkbox
              id="isPrivate"
              label="Wydarzenie prywatne:"
              checked={isPrivate}
              onChange={setIsPrivate}
            />
          </div>

          <div className={card}>
            <label className="text-gray-400 text-sm mb-1 block" htmlFor="eventDate">Data wydarzenia:</label>
            <input
              type="date"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={`w-full p-2 border border-gray-300 rounded bg-white ${errors.eventDate ? inputErrorStyle : ""}`}
              aria-invalid={!!errors.eventDate}
              aria-describedby={errors.eventDate ? "eventDate-error" : undefined}
            />
            {errors.eventDate && <div id="eventDate-error">{errorText(errors.eventDate)}</div>}
          </div>

          <div className={card}>
            <label className="text-gray-400 text-sm mb-1 block" htmlFor="eventTime">Godzina:</label>
            <input
              type="time"
              id="eventTime"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className={`w-full p-2 border border-gray-300 rounded bg-white ${errors.eventTime ? inputErrorStyle : ""}`}
              aria-invalid={!!errors.eventTime}
              aria-describedby={errors.eventTime ? "eventTime-error" : undefined}
            />
            {errors.eventTime && <div id="eventTime-error">{errorText(errors.eventTime)}</div>}
          </div>

          <div className={card}>
            <label className="text-gray-400 text-sm mb-1 block" htmlFor="place">Miejsce:</label>
            <select
              id="place"
              value={placeId}
              onChange={(e) => setPlaceId(Number(e.target.value))}
              className={`w-full p-2 border border-gray-300 rounded bg-gray-100 ${errors.placeId ? inputErrorStyle : ""}`}
              aria-invalid={!!errors.placeId}
              aria-describedby={errors.placeId ? "place-error" : undefined}
            >
              <option value={0}>Wybierz miejsce</option>
              {sportObjects.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}, {obj.city}, {obj.street} {obj.number}{obj.secondNumber ? `/${obj.secondNumber}` : ""}
                </option>
              ))}
            </select>
            {errors.placeId && <div id="place-error">{errorText(errors.placeId)}</div>}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="bg-purple-600 text-white px-8 py-2 rounded hover:bg-purple-700 transition-colors w-full disabled:opacity-60"
            disabled={loading || submitting}
          >
            {submitting ? "Tworzenie..." : "Stwórz Wydarzenie"}
          </button>
        </div>
      </form>
    </div>
  );
}
