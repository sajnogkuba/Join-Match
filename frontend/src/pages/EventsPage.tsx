// src/pages/EventsPage.tsx
import { useEffect, useMemo, useState, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import axiosInstance from '../Api/axios'
import type { Event } from '../Api/types'
import {
	Map as MapIcon,
	Grid as GridIcon,
	Search,
	ChevronRight,
	Bookmark,
	CalendarDays,
	MapPin,
	Users,
	Ticket,
	FilterX,
	Loader2,
	ArrowUpDown,
} from 'lucide-react'

dayjs.locale('pl')

// TODO: Po wdrożeniu mapy rozważ rozszerzenie typu Event:
// export type Event = {
//   ...
//   latitude?: number;
//   longitude?: number;
// }

// Lazy map (react-leaflet) — załadujemy tylko gdy użytkownik przełączy na widok mapy
const LazyMapView = ({  }: { events: Event[] }) => {
	// TODO: MAPA — włącz po dodaniu pól latitude/longitude w API i zainstalowaniu react-leaflet + leaflet
	// Plan na później:
	// 1) Dodać do typu Event (opcjonalne): latitude?: number; longitude?: number;
	// 2) Odkomentować lazy import react-leaflet + leaflet.css
	// 3) Renderować markery dla eventów posiadających współrzędne

	// Na teraz wyświetlamy placeholder zamiast faktycznej mapy (bez zależności i bez błędów builda):
	return (
		<div className='grid h-[520px] place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center'>
			<div>
				<div className='text-4xl mb-3'>🗺️</div>
				<p className='text-white font-semibold'>Widok mapy będzie dostępny wkrótce</p>
				<p className='mt-1 text-sm text-zinc-400'>
					Po dodaniu współrzędnych do wydarzeń (latitude/longitude) pokażemy markery na mapie.
				</p>
			</div>
		</div>
	)
}

// Pomocniczy typ dla sortowania
type SortKey = 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc' | 'popularity'

const PAGE_SIZE = 12

const EventsPage = () => {
	const navigate = useNavigate()

	// Stan użytkownika
	const [userEmail, setUserEmail] = useState<string | null>(null)

	// Dane
	const [events, setEvents] = useState<Event[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Zbiory ID dla zapisanych i dołączonych
	const [joinedEventIds, setJoinedEventIds] = useState<Set<number>>(new Set())
	const [savedEventIds, setSavedEventIds] = useState<Set<number>>(new Set())

	// Filtry / UI stan
	const [view, setView] = useState<'grid' | 'map'>('grid')
	const [search, setSearch] = useState('')
	const [sportFilters, setSportFilters] = useState<string[]>([]) // wielokrotny wybór
	const [city, setCity] = useState('')
	const [onlyFree, setOnlyFree] = useState(false)
	const [onlyAvailable, setOnlyAvailable] = useState(false)
	const [dateFrom, setDateFrom] = useState<string>('')
	const [dateTo, setDateTo] = useState<string>('')
	const [priceMin, setPriceMin] = useState<string>('')
	const [priceMax, setPriceMax] = useState<string>('')
	const [sort, setSort] = useState<SortKey>('date_asc')

	const [page, setPage] = useState(1)

	useEffect(() => {
		setUserEmail(localStorage.getItem('email'))
	}, [])

	// Pobierz eventy
	useEffect(() => {
		setLoading(true)
		axiosInstance
			.get<Event[]>('/event')
			.then(({ data }) => setEvents(data || []))
			.catch(e => {
				console.error('Błąd pobierania eventów:', e)
				setError('Nie udało się pobrać wydarzeń.')
			})
			.finally(() => setLoading(false))
	}, [])

	// Pobierz status dołączonych
	useEffect(() => {
		const fetchJoined = async () => {
			if (!userEmail) return
			try {
				const { data } = await axiosInstance.get('/user-event/by-user-email', { params: { userEmail } })
				const ids = new Set<number>((data || []).map((ue: { eventId: number }) => ue.eventId))
				setJoinedEventIds(ids)
			} catch (e) {
				console.error('Nie udało się pobrać dołączonych wydarzeń:', e)
			}
		}
		fetchJoined()
	}, [userEmail])

	// Pobierz status zapisanych
	useEffect(() => {
		const fetchSaved = async () => {
			if (!userEmail) return
			try {
				const { data } = await axiosInstance.get('/user-saved-event', { params: { userEmail } })
				const ids = new Set<number>((data || []).map((se: { eventId: number }) => se.eventId))
				setSavedEventIds(ids)
			} catch (e) {
				console.error('Nie udało się pobrać zapisanych wydarzeń:', e)
			}
		}
		fetchSaved()
	}, [userEmail])

	// Kategorie sportów z danych
	const sports = useMemo(() => {
		const set = new Set(events.map(e => e.sportTypeName).filter(Boolean))
		return Array.from(set).sort()
	}, [events])

	// Miasta z danych (opcjonalnie)
	const cities = useMemo(() => {
		const set = new Set(events.map((e: any) => e.city).filter(Boolean))
		return Array.from(set).sort()
	}, [events])

	// Filtrowanie i sortowanie w pamięci
	const filteredSorted = useMemo(() => {
		let list = [...events]

		// Wyszukiwanie po nazwie lub obiekcie
		if (search.trim()) {
			const q = search.toLowerCase()
			list = list.filter(e => e.eventName.toLowerCase().includes(q) || e.sportObjectName.toLowerCase().includes(q))
		}

		// Filtr sportów
		if (sportFilters.length > 0) {
			const set = new Set(sportFilters)
			list = list.filter(e => set.has(e.sportTypeName))
		}

		// Filtr miasta
		if (city) list = list.filter((e: any) => (e.city || '').toLowerCase() === city.toLowerCase())

		// Data
		if (dateFrom)
			list = list.filter(
				e =>
					dayjs(e.eventDate).isAfter(dayjs(dateFrom).startOf('day')) ||
					dayjs(e.eventDate).isSame(dayjs(dateFrom), 'day')
			)
		if (dateTo)
			list = list.filter(
				e => dayjs(e.eventDate).isBefore(dayjs(dateTo).endOf('day')) || dayjs(e.eventDate).isSame(dayjs(dateTo), 'day')
			)

		// Cena
		if (onlyFree) list = list.filter((e: any) => Number(e.cost) === 0)
		if (priceMin) list = list.filter((e: any) => Number(e.cost) >= Number(priceMin))
		if (priceMax) list = list.filter((e: any) => Number(e.cost) <= Number(priceMax))

		// Dostępne miejsca
		if (onlyAvailable) list = list.filter(e => e.numberOfParticipants - (e as any).bookedParticipants > 0)

		// Sortowanie
		list.sort((a, b) => {
			switch (sort) {
				case 'date_asc':
					return +new Date(a.eventDate) - +new Date(b.eventDate)
				case 'date_desc':
					return +new Date(b.eventDate) - +new Date(a.eventDate)
				case 'price_asc':
					return (a as any).cost - (b as any).cost
				case 'price_desc':
					return (b as any).cost - (a as any).cost
				case 'popularity':
					return ((b as any).bookedParticipants || 0) - ((a as any).bookedParticipants || 0)
				default:
					return 0
			}
		})

		return list
	}, [events, search, sportFilters, city, onlyFree, onlyAvailable, dateFrom, dateTo, priceMin, priceMax, sort])

	// Paginacja klientowa
	const paged = useMemo(() => filteredSorted.slice(0, page * PAGE_SIZE), [filteredSorted, page])
	const canLoadMore = paged.length < filteredSorted.length

	// Akcje: zapisz / dołącz
	const handleSave = async (eventId: number) => {
		if (!userEmail) {
			navigate('/login')
			return
		}
		const isSaved = savedEventIds.has(eventId)
		try {
			if (isSaved) {
				await axiosInstance.delete('/user-saved-event', { data: { userEmail, eventId } })
				setSavedEventIds(prev => {
					const s = new Set(prev)
					s.delete(eventId)
					return s
				})
			} else {
				await axiosInstance.post('/user-saved-event', { userEmail, eventId })
				setSavedEventIds(prev => new Set([...prev, eventId]))
			}
		} catch (e) {
			console.error('Błąd zapisu/unsave:', e)
		}
	}

	const handleJoin = async (eventId: number) => {
		if (!userEmail) {
			navigate('/login')
			return
		}
		if (joinedEventIds.has(eventId)) return
		try {
			await axiosInstance.post('/user-event', { userEmail, eventId, attendanceStatusId: 1 })
			setJoinedEventIds(prev => new Set([...prev, eventId]))
		} catch (e) {
			console.error('Błąd dołączania:', e)
		}
	}

	const clearFilters = () => {
		setSearch('')
		setSportFilters([])
		setCity('')
		setOnlyFree(false)
		setOnlyAvailable(false)
		setDateFrom('')
		setDateTo('')
		setPriceMin('')
		setPriceMax('')
		setSort('date_asc')
		setPage(1)
	}

	return (
		<div className='min-h-screen bg-[#1f2632] text-zinc-300'>
			{/* Top */}
			<header className='relative h-[140px] w-full overflow-hidden'>
				<div
					className='absolute inset-0 bg-cover bg-center'
					style={{
						backgroundImage:
							'url(https://images.unsplash.com/photo-1604948501466-4e9b4d6f3e2b?q=80&w=1600&auto=format&fit=crop)',
					}}
				/>
				<div className='absolute inset-0 bg-black/60' />
				<div className='relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-6 md:px-8'>
					<div>
						<h1 className='text-2xl md:text-3xl font-semibold text-white'>Wydarzenia</h1>
						<div className='mt-2 h-1 w-28 rounded-full bg-violet-600' />
					</div>
				</div>
			</header>

			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					{/* Pasek narzędzi */}
					<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
						<div className='flex flex-1 items-stretch gap-3'>
							<div className='relative flex-1'>
								<Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2' size={18} />
								<input
									value={search}
									onChange={e => {
										setSearch(e.target.value)
										setPage(1)
									}}
									placeholder='Szukaj po nazwie lub obiekcie…'
									className='w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-10 py-2.5 text-sm text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600'
								/>
							</div>

							<div className='hidden md:flex items-center gap-2'>
								<button
									onClick={() => setView('grid')}
									className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
										view === 'grid' ? 'border-violet-600 text-white' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
									}`}>
									<GridIcon size={16} /> Lista
								</button>
								<button
									onClick={() => setView('map')}
									className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
										view === 'map' ? 'border-violet-600 text-white' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
									}`}>
									<MapIcon size={16} /> Mapa
								</button>
							</div>
						</div>

						<div className='flex items-center gap-3'>
							<div className='relative'>
								<select
									value={sort}
									onChange={e => setSort(e.target.value as SortKey)}
									className='appearance-none rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 pr-8 text-sm text-zinc-200'>
									<option value='date_asc'>Data rosnąco</option>
									<option value='date_desc'>Data malejąco</option>
									<option value='price_asc'>Cena rosnąco</option>
									<option value='price_desc'>Cena malejąco</option>
									<option value='popularity'>Popularność</option>
								</select>
								<ArrowUpDown
									className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60'
									size={16}
								/>
							</div>
							<button
								onClick={clearFilters}
								className='inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800'>
								<FilterX size={16} /> Wyczyść
							</button>
						</div>
					</div>

					{/* Filtry rozbudowane */}
					<div className='mt-4 grid grid-cols-1 gap-3 md:grid-cols-4'>
						{/* Sporty (multi) */}
						<div>
							<label className='mb-1 block text-xs text-zinc-400'>Sport</label>
							<div className='flex flex-wrap gap-2'>
								{sports.map(s => {
									const active = sportFilters.includes(s)
									return (
										<button
											key={s}
											onClick={() => {
												setPage(1)
												setSportFilters(prev => (active ? prev.filter(x => x !== s) : [...prev, s]))
											}}
											className={`rounded-full px-3 py-1 text-xs ring-1 ${
												active
													? 'bg-violet-600 text-white ring-violet-700'
													: 'bg-zinc-900/60 text-zinc-200 ring-zinc-700 hover:bg-zinc-800'
											}`}>
											{s}
										</button>
									)
								})}
							</div>
						</div>

						{/* Miasto */}
						<div>
							<label className='mb-1 block text-xs text-zinc-400'>Miasto</label>
							<div className='relative'>
								<input
									list='cities'
									value={city}
									onChange={e => {
										setCity(e.target.value)
										setPage(1)
									}}
									placeholder='np. Warszawa'
									className='w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200'
								/>
								<datalist id='cities'>
									{cities.map(c => (
										<option key={c} value={c} />
									))}
								</datalist>
							</div>
						</div>

						{/* Zakres dat */}
						<div className='grid grid-cols-2 gap-2'>
							<div>
								<label className='mb-1 block text-xs text-zinc-400'>Od</label>
								<input
									type='date'
									value={dateFrom}
									onChange={e => {
										setDateFrom(e.target.value)
										setPage(1)
									}}
									className='w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200'
								/>
							</div>
							<div>
								<label className='mb-1 block text-xs text-zinc-400'>Do</label>
								<input
									type='date'
									value={dateTo}
									onChange={e => {
										setDateTo(e.target.value)
										setPage(1)
									}}
									className='w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200'
								/>
							</div>
						</div>

						{/* Cena / Dostępność */}
						<div className='grid grid-cols-2 gap-2'>
							<div className='flex items-center gap-2'>
								<input
									id='free'
									type='checkbox'
									checked={onlyFree}
									onChange={e => {
										setOnlyFree(e.target.checked)
										setPage(1)
									}}
								/>
								<label htmlFor='free' className='text-sm'>
									Tylko darmowe
								</label>
							</div>
							<div className='flex items-center gap-2'>
								<input
									id='avail'
									type='checkbox'
									checked={onlyAvailable}
									onChange={e => {
										setOnlyAvailable(e.target.checked)
										setPage(1)
									}}
								/>
								<label htmlFor='avail' className='text-sm'>
									Tylko z miejscami
								</label>
							</div>
							<div className='col-span-2 grid grid-cols-2 gap-2'>
								<input
									placeholder='Cena od'
									value={priceMin}
									onChange={e => {
										setPriceMin(e.target.value)
										setPage(1)
									}}
									className='rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm'
								/>
								<input
									placeholder='Cena do'
									value={priceMax}
									onChange={e => {
										setPriceMax(e.target.value)
										setPage(1)
									}}
									className='rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm'
								/>
							</div>
						</div>
					</div>

					{/* Widok */}
					<div className='mt-6'>
						{loading ? (
							<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10'>
								<div className='flex items-center gap-2 text-zinc-300'>
									<Loader2 className='animate-spin' /> Ładowanie…
								</div>
							</div>
						) : error ? (
							<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-rose-500/10 p-10 text-rose-200'>
								{error}
							</div>
						) : view === 'map' ? (
							<Suspense
								fallback={
									<div className='grid h-[520px] place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60'>
										Ładowanie mapy…
									</div>
								}>
								<LazyMapView events={filteredSorted} />
							</Suspense>
						) : filteredSorted.length === 0 ? (
							<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center'>
								<div className='text-5xl mb-2'>🔍</div>
								<div className='text-white text-lg font-semibold'>Brak wyników</div>
								<div className='text-zinc-400 text-sm'>Spróbuj zmienić filtry lub frazę wyszukiwania.</div>
							</div>
						) : (
							<>
								<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
									{paged.map(ev => (
										<article
											key={ev.eventId}
											className='overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60'>
											<Link to={`/event/${ev.eventId}`} className='block'>
												<div className='relative h-40 w-full bg-zinc-800'>
													<img
														src={`/assets/${ev.eventName}.jpeg`}
														alt={ev.eventName}
														onError={e => {
															;(e.currentTarget as HTMLImageElement).src = `/assets/Event${ev.eventId}.jpeg`
														}}
														className='h-full w-full object-cover'
													/>
													<span className='absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-violet-200 ring-1 ring-violet-600/40'>
														{ev.sportTypeName}
													</span>
												</div>
											</Link>
											<div className='p-4'>
												<div className='flex items-start justify-between gap-2'>
													<h3 className='line-clamp-1 text-white font-semibold'>
														<Link to={`/event/${ev.eventId}`} className='hover:underline'>
															{ev.eventName}
														</Link>
													</h3>
													<button
														onClick={() => handleSave(ev.eventId)}
														className={`rounded-full p-2 ring-1 ${
															savedEventIds.has(ev.eventId)
																? 'text-violet-300 ring-violet-700/40 bg-zinc-800'
																: 'text-zinc-300 ring-zinc-700 hover:bg-zinc-800'
														}`}
														aria-label='Zapisz wydarzenie'>
														<Bookmark size={16} />
													</button>
												</div>
												<div className='mt-2 grid grid-cols-1 gap-2 text-sm text-zinc-300'>
													<div className='inline-flex items-center gap-2'>
														<CalendarDays size={16} />
														{dayjs(ev.eventDate).format('DD.MM.YYYY HH:mm')}
													</div>
													<div className='inline-flex items-center gap-2'>
														<MapPin size={16} />
														{ev.sportObjectName}
													</div>
													<div className='inline-flex items-center gap-2'>
														<Users size={16} />
														{(ev as any).bookedParticipants}/{ev.numberOfParticipants}
													</div>
													<div className='inline-flex items-center gap-2'>
														<Ticket size={16} />
														{new Intl.NumberFormat('pl-PL', {
															style: 'currency',
															currency: (ev as any).currency || 'PLN',
														}).format((ev as any).cost || 0)}
													</div>
												</div>
												<div className='mt-4 flex items-center justify-between'>
													<button
														onClick={() => handleJoin(ev.eventId)}
														disabled={joinedEventIds.has(ev.eventId)}
														className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${
															joinedEventIds.has(ev.eventId)
																? 'bg-zinc-700 text-zinc-300'
																: 'bg-violet-600 hover:bg-violet-500'
														}`}>
														{joinedEventIds.has(ev.eventId) ? 'Dołączono' : 'Dołącz'}
													</button>
													<Link
														to={`/event/${ev.eventId}`}
														className='inline-flex items-center gap-1 text-violet-300 hover:text-violet-200'>
														Szczegóły <ChevronRight size={16} />
													</Link>
												</div>
											</div>
										</article>
									))}
								</div>

								{canLoadMore && (
									<div className='mt-8 grid place-items-center'>
										<button
											onClick={() => setPage(p => p + 1)}
											className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
											Załaduj więcej
										</button>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</main>
		</div>
	)
}

export default EventsPage
