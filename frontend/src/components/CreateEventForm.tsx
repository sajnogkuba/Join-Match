import { useEffect, useState } from 'react'
import StarRatingInput from './StarRatingInput'
import Checkbox from './Checkbox'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'
import api from '../Api/axios'
import type { SportType } from '../Api/types/SportType.ts'
import type { SportObject } from '../Api/types/SportObject.ts'
import { motion } from 'framer-motion'
import { Upload, CalendarDays, MapPin, DollarSign, Users, AlignLeft } from 'lucide-react'
import PlaceAutocomplete from './PlaceAutocomplete'
import SportObjectSelector from './SportObjectSelector'
import { getCookie } from '../utils/cookies'

const inputBase =
    'w-full px-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent transition'
const card = 'bg-black/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.3)]'

type FormErrors = {
    eventName?: string
    sportId?: string
    level?: string
    price?: string
    maxParticipants?: string
    eventDate?: string
    eventTime?: string
    placeId?: string
    eventImage?: string
}

// --- NOWE: Pomocnicza funkcja do wyciągania danych z Google Place ---
const extractPlaceDetails = (place: google.maps.places.PlaceResult) => {
    const getComp = (types: string[]) =>
        place.address_components?.find(c => types.some(t => c.types.includes(t)))?.long_name || ''

    const city = getComp(['locality']) || getComp(['postal_town']) || getComp(['administrative_area_level_2']) || 'Nieznane miasto'
    const street = getComp(['route']) || 'Nieznana ulica'
    const number = getComp(['street_number']) || '1'

    let lat = 0
    let lng = 0

    if (place.geometry && place.geometry.location) {

        lat = typeof place.geometry.location.lat === 'function'
            ? place.geometry.location.lat()
            : (place.geometry.location.lat as unknown as number)

        lng = typeof place.geometry.location.lng === 'function'
            ? place.geometry.location.lng()
            : (place.geometry.location.lng as unknown as number)
    }

    return { city, street, number, lat, lng }
}

export default function CreateEventForm() {
    const [eventName, setEventName] = useState('')
    const [description, setDescription] = useState('')
    const [sportId, setSportId] = useState<number>(0)
    const [level, setLevel] = useState(1)
    const [free, setFree] = useState(false)
    const [isPrivate, setIsPrivate] = useState(false)
    const [isForTeam, setIsForTeam] = useState(false)
    const [price, setPrice] = useState<number | ''>(0)
    const [maxParticipants, setMaxParticipants] = useState<number | ''>('')
    const [eventDate, setEventDate] = useState('')
    const [eventTime, setEventTime] = useState('')
    const [placeId, setPlaceId] = useState<number>(0)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [sportTypes, setSportTypes] = useState<SportType[]>([])
    const [sportObjects, setSportObjects] = useState<SportObject[]>([])
    const [errors, setErrors] = useState<FormErrors>({})
    const [submitting, setSubmitting] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [serverOk, setServerOk] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)

    // Domyślna metoda płatności
    const [paymentMethods, setPaymentMethods] = useState<string[]>(['GOTOWKA'])
    const [ownerEmail, setOwnerEmail] = useState<string | null>(null)
    const [useCustomPlace, setUseCustomPlace] = useState(false)
    const [customPlace, setCustomPlace] = useState<google.maps.places.PlaceResult | null>(null)

    useEffect(() => {
        setOwnerEmail(getCookie('email'))
    }, [])

    // --- FIX 1: Reset płatności, gdy wydarzenie jest darmowe ---
    useEffect(() => {
        if (free) {
            setPaymentMethods([])
        } else if (paymentMethods.length === 0) {
            setPaymentMethods(['GOTOWKA'])
        }
    }, [free])

    useEffect(() => {
        Promise.all([api.get('/sport-type'), api.get('/sport-object')])
            .then(([types, objects]) => {
                setSportTypes(types.data)
                setSportObjects(objects.data)
            })
            .catch(() => setServerError('Nie udało się pobrać danych.'))
    }, [])

    const isDateTimeInPast = (date: string, time: string) => {
        if (!date || !time) return false
        const dt = new Date(`${date}T${time}:00`)
        return dt.getTime() < Date.now()
    }

    const validate = (): boolean => {
        const newErrors: FormErrors = {}
        if (!eventName.trim() || eventName.trim().length < 3) newErrors.eventName = 'Podaj nazwę (min. 3 znaki).'
        if (!sportId) newErrors.sportId = 'Wybierz sport.'
        if (!maxParticipants || Number(maxParticipants) < 1) newErrors.maxParticipants = 'Podaj liczbę uczestników.'
        if (!eventDate) newErrors.eventDate = 'Wybierz datę.'
        if (!eventTime) newErrors.eventTime = 'Wybierz godzinę.'
        if (eventDate && eventTime && isDateTimeInPast(eventDate, eventTime))
            newErrors.eventTime = 'Termin nie może być z przeszłości.'
        if (!useCustomPlace && !placeId) newErrors.placeId = 'Wybierz miejsce.'
        if (!free && (price === '' || Number(price) < 0)) newErrors.price = 'Podaj poprawną cenę.'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => {
        return (
            <div
                onClick={() => onChange(!enabled)}
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all ${
                    enabled ? 'bg-violet-600' : 'bg-zinc-700'
                }`}>
                <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
            </div>
        )
    }

    const togglePaymentMethod = (method: string) => {
        setPaymentMethods(prev => {
            if (prev.includes(method)) {
                return prev.filter(m => m !== method)
            } else {
                return [...prev, method]
            }
        })
    }

    const toLocalDateTime = (d: string, t: string) => `${d}T${t}:00`

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        if (!ownerEmail) {
            setServerError('Brak zalogowanego użytkownika.')
            return
        }

        try {
            setSubmitting(true)

            // 1. Upload zdjęcia (bez zmian)
            let imageUrl = null
            if (selectedFile) {
                setUploadingImage(true)
                const formData = new FormData()
                formData.append('file', selectedFile)
                const res = await api.post('images/upload/event', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                imageUrl = res.data
                setUploadingImage(false) // wyłączamy loader zdjęcia
            }

            // 2. Obsługa Miejsca (SportObject)
            let sportObjectId = placeId

            if (useCustomPlace && customPlace) {
                // Wyciągamy dane z customPlace za pomocą naszej nowej funkcji
                let { city, street, number, lat, lng } = extractPlaceDetails(customPlace)

                // --- FIX 2: Geocoding Fallback ---
                // Jeśli Google Autocomplete nie dało nam lat/lng (jest 0), dopytujemy Geocodera
                if (lat === 0 || lng === 0) {
                    console.warn("Brak współrzędnych z autocomplete, próba geocodingu...")
                    const geocoder = new google.maps.Geocoder()
                    try {
                        const geoRes = await geocoder.geocode({
                            address: customPlace.formatted_address || `${city} ${street} ${number}`
                        })

                        if (geoRes.results && geoRes.results[0]) {
                            const location = geoRes.results[0].geometry.location
                            lat = location.lat()
                            lng = location.lng()
                            console.log("Geocoding sukces:", lat, lng)
                        }
                    } catch (geoErr) {
                        console.error("Geocoding error:", geoErr)
                        // Tutaj można rzucić błąd lub pozwolić zapisać z 0,0 - ale lepiej poinformować usera
                    }
                }

                const newObj = {
                    name: customPlace.name || 'Nowy obiekt',
                    city,
                    street,
                    number: parseInt(number.toString()) || 1, // parsowanie na int dla pewności
                    secondNumber: null,
                    latitude: lat,
                    longitude: lng,
                }

                try {
                    const res = await api.post('/sport-object', newObj)
                    sportObjectId = res.data.id
                } catch (err) {
                    console.error('Błąd tworzenia obiektu:', err)
                    setServerError('Nie udało się utworzyć nowego miejsca. Sprawdź adres.')
                    setSubmitting(false)
                    return
                }
            }

            // 3. Tworzenie wydarzenia
            await api.post('/event', {
                eventName,
                description,
                numberOfParticipants: Number(maxParticipants),
                cost: free ? 0 : Number(price),
                ownerEmail,
                sportObjectId: sportObjectId,
                eventVisibilityId: isPrivate ? 2 : 1,
                status: 'PLANNED',
                eventDate: toLocalDateTime(eventDate, eventTime),
                sportTypeId: sportId,
                minLevel: level,
                imageUrl,
                isForTeam,
                paymentMethods: free ? [] : paymentMethods, // upewniamy się, że nie wysyłamy metod jak jest free
            })

            setServerOk('🎉 Wydarzenie utworzone pomyślnie!')

            // Reset formularza
            setEventName('')
            setDescription('')
            setSportId(0)
            setLevel(1)
            setIsForTeam(false)
            setFree(false)
            setPrice(0)
            setMaxParticipants('')
            setEventDate('')
            setEventTime('')
            setPlaceId(0)
            setSelectedFile(null)
            setCustomPlace(null)
            setUseCustomPlace(false)

        } catch (err: any) {
            console.error('Błąd tworzenia wydarzenia:', err)
            setServerError('Wystąpił błąd serwera przy tworzeniu wydarzenia.')
        } finally {
            setSubmitting(false)
            setUploadingImage(false)
        }
    }

    return (
        <div className='bg-[#0d0d10] text-white min-h-screen py-20 px-4'>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className='max-w-5xl mx-auto'>
                <h1 className='text-4xl font-bold mb-8 text-center'>
                    <span className='text-violet-400'>Stwórz</span> nowe wydarzenie
                </h1>

                {(serverError || serverOk) && (
                    <div
                        className={`mb-6 text-center px-4 py-3 rounded-xl ${
                            serverError
                                ? 'bg-red-900/40 border border-red-700 text-red-300'
                                : 'bg-green-900/40 border border-green-700 text-green-300'
                        }`}>
                        {serverError || serverOk}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Nazwa i Opis */}
                    <div className={`${card} md:col-span-2 lg:col-span-3`}>
                        <div className='grid md:grid-cols-2 gap-6'>
                            <div>
                                <label className='block text-zinc-400 mb-2'>Nazwa wydarzenia</label>
                                <input
                                    className={`${inputBase} ${errors.eventName ? 'border-red-500' : ''}`}
                                    placeholder='np. Niedzielny mecz piłki'
                                    value={eventName}
                                    onChange={e => setEventName(e.target.value)}
                                />
                                {errors.eventName && <p className='text-red-400 text-sm mt-1'>{errors.eventName}</p>}
                            </div>

                            <div>
                                <label className='block text-zinc-400 mb-2 flex items-center gap-2'>
                                    <AlignLeft size={16} /> Opis wydarzenia (opcjonalne)
                                </label>
                                <textarea
                                    className={`${inputBase} h-[52px] resize-none py-3`}
                                    placeholder='Krótki opis, zasady, informacje dodatkowe...'
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sport */}
                    <div className={card}>
                        <label className='block text-zinc-400 mb-2'>Rodzaj sportu</label>
                        <select
                            value={sportId}
                            onChange={e => setSportId(Number(e.target.value))}
                            className={`${inputBase} ${errors.sportId ? 'border-red-500' : ''}`}>
                            <option value={0}>Wybierz sport</option>
                            {sportTypes.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        {errors.sportId && <p className='text-red-400 text-sm mt-1'>{errors.sportId}</p>}
                    </div>

                    {/* Poziom */}
                    <div className={card}>
                        <StarRatingInput
                            label='Minimalny poziom zaawansowania'
                            value={level}
                            onChange={setLevel}
                            max={5}
                            size={30}
                        />
                    </div>

                    {/* Widoczność */}
                    <div className={card}>
                        <label className='block text-zinc-400 mb-3'>Widoczność wydarzenia</label>
                        <div className='flex items-center justify-between'>
                            <div className='flex flex-col'>
                                <span className='font-semibold text-white'>
                                    {isPrivate ? 'Prywatne wydarzenie' : 'Publiczne wydarzenie'}
                                </span>
                                <span className='text-zinc-400 text-sm'>
                                    {isPrivate ? 'Tylko dla zaproszonych' : 'Dla wszystkich'}
                                </span>
                            </div>
                            <Toggle enabled={isPrivate} onChange={setIsPrivate} />
                        </div>
                    </div>

                    {/* Cena */}
                    <div className={card}>
                        <label className='block text-zinc-400 mb-2 flex items-center gap-2'>
                            <DollarSign size={16} /> Cena (PLN)
                        </label>
                        <input
                            type='number'
                            min={0}
                            step={0.01}
                            disabled={free}
                            value={free ? 0 : price}
                            onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                            className={`${inputBase} ${errors.price ? 'border-red-500' : ''} disabled:opacity-60`}
                        />
                        {errors.price && <p className='text-red-400 text-sm mt-1'>{errors.price}</p>}
                        <Checkbox id='free' label='Bezpłatne wydarzenie' checked={free} onChange={v => setFree(v)} />
                    </div>

                    {/* Metody płatności - UKRYWANE JEŚLI DARMOWE */}
                    {!free && (
                         <div className={card}>
                            <label className='block text-zinc-400 mb-2'>Akceptowane metody płatności</label>
                            <div className='flex flex-wrap gap-4'>
                                {['GOTOWKA', 'BLIK', 'PRZELEW', 'KARTA'].map(method => (
                                    <div
                                        key={method}
                                        onClick={() => togglePaymentMethod(method)}
                                        className={`cursor-pointer px-4 py-2 rounded-xl border transition-all ${
                                            paymentMethods.includes(method)
                                                ? 'bg-violet-600 border-violet-500 text-white'
                                                : 'bg-zinc-900/70 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                                        }`}>
                                        {method}
                                    </div>
                                ))}
                            </div>
                            {paymentMethods.length === 0 && (
                                <p className='text-red-400 text-sm mt-1'>Wybierz przynajmniej jedną metodę.</p>
                            )}
                        </div>
                    )}

                    {/* Maks uczestników */}
                    <div className={card}>
                        <label className='block text-zinc-400 mb-2 flex items-center gap-2'>
                            <Users size={16} /> Maksymalna liczba uczestników
                        </label>
                        <input
                            type='number'
                            min={1}
                            value={maxParticipants}
                            onChange={e => setMaxParticipants(e.target.value === '' ? '' : Number(e.target.value))}
                            className={`${inputBase} ${errors.maxParticipants ? 'border-red-500' : ''}`}
                        />
                        <Checkbox
                            id="isForTeam"
                            label="Czy to wydarzenie drużynowe?"
                            checked={isForTeam}
                            onChange={setIsForTeam}
                        />
                        {errors.maxParticipants && <p className='text-red-400 text-sm mt-1'>{errors.maxParticipants}</p>}
                    </div>

                    {/* Data */}
                    <div className={card}>
                        <label className='block text-zinc-400 mb-2 flex items-center gap-2'>
                            <CalendarDays size={16} /> Data wydarzenia
                        </label>
                        <DatePicker
                            value={eventDate}
                            onChange={setEventDate}
                            placeholder='Wybierz datę wydarzenia'
                            error={!!errors.eventDate}
                            mode='event'
                            theme='violet'
                        />
                        {errors.eventDate && <p className='text-red-400 text-sm mt-1'>{errors.eventDate}</p>}
                    </div>

                    {/* Czas */}
                    <div className={card}>
                        <label className='block text-zinc-400 mb-2'>Godzina</label>
                        <TimePicker
                            value={eventTime}
                            onChange={setEventTime}
                            placeholder='Wybierz godzinę'
                            error={!!errors.eventTime}
                            theme='violet'
                        />
                        {errors.eventTime && <p className='text-red-400 text-sm mt-1'>{errors.eventTime}</p>}
                    </div>

                    {/* Miejsce */}
                    <div className={card}>
                        <label className='block text-zinc-400 mb-2 flex items-center gap-2'>
                            <MapPin size={16} /> Miejsce
                        </label>

                        {!useCustomPlace ? (
                            <>
                                <SportObjectSelector
                                    value={placeId}
                                    onChange={setPlaceId}
                                    sportObjects={sportObjects}
                                    error={!!errors.placeId}
                                    placeholder='Wybierz obiekt'
                                />

                                <div className='mt-3'>
                                    <Checkbox
                                        id='customPlace'
                                        label='Nie ma mojego obiektu na liście'
                                        checked={useCustomPlace}
                                        onChange={setUseCustomPlace}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <PlaceAutocomplete onSelect={place => setCustomPlace(place)} />
                                <div className='mt-3'>
                                    <Checkbox
                                        id='useList'
                                        label='Wybierz z listy obiektów'
                                        checked={!useCustomPlace}
                                        onChange={() => setUseCustomPlace(false)}
                                    />
                                </div>

                                {customPlace && (
                                    <p className='text-sm text-zinc-400 mt-2'>
                                        Wybrano: {customPlace.name || 'Nowy obiekt'} ({customPlace.formatted_address || ''})
                                    </p>
                                )}
                            </>
                        )}

                        {errors.placeId && <p className='text-red-400 text-sm mt-1'>{errors.placeId}</p>}
                    </div>

                    {/* Zdjęcie */}
                    <div className={card}>
                        <label className='block text-zinc-400 mb-2 flex items-center gap-2'>
                            <Upload size={16} /> Zdjęcie wydarzenia
                        </label>
                        <input
                            type='file'
                            accept='image/*'
                            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                            className='file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-violet-700 file:text-white hover:file:bg-violet-800 cursor-pointer bg-zinc-900/70 text-gray-300 border border-zinc-700 rounded-xl p-2 w-full'
                        />
                        {selectedFile && (
                            <p className='text-sm text-zinc-400 mt-2'>
                                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                    </div>
                </form>

                <div className='mt-10 text-center'>
                    <button
                        type='submit'
                        onClick={handleSubmit}
                        disabled={submitting}
                        className='bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-500 px-10 py-4 rounded-xl font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:-translate-y-0.5 disabled:opacity-60'>
                        {uploadingImage ? 'Przesyłanie zdjęcia...' : submitting ? 'Tworzenie...' : 'Stwórz Wydarzenie'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}