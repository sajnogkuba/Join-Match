import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import axiosInstance from '../Api/axios'
import type { Event } from '../Api/types'
import type { SportObject } from '../Api/types/SportObject'
import MapView from '../components/MapView'
import PlaceAutocomplete from '../components/PlaceAutocomplete'
import type { UserSportsResponse } from '../Api/types/Sports'
import AlertModal from '../components/AlertModal'
import SportTypeFilter from '../components/SportTypeFilter'
import { parseEventDate } from '../utils/formatDate'
import {
	Map as MapIcon,
	Grid as GridIcon,
	Search,
	ChevronRight,
	Bookmark,
	BookmarkCheck,
	CalendarDays,
	MapPin,
	Users,
	Ticket,
	FilterX,
	Loader2,
	ArrowUpDown,
	Plus,
	AlertTriangle,
} from 'lucide-react'

dayjs.locale('pl')

type SortKey = 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc' | 'popularity'
type SortBy = 'eventDate' | 'cost' | 'eventName' | 'bookedParticipants'
type SortDirection = 'ASC' | 'DESC'
const PAGE_SIZE = 12

// --- NOWE: typ odpowiedzi z backendu /api/event (Spring Page) ---
type EventsPageResponse = {
	content: Event[]
	totalElements: number
	totalPages: number
	number: number
	size: number
	first: boolean
	last: boolean
	numberOfElements: number
	empty: boolean
}

const EventsPage = () => {
	const navigate = useNavigate()
	const [userEmail, setUserEmail] = useState<string | null>(null)

	// --- ZMIANA: events będą akumulowane strona po stronie ---
	const [events, setEvents] = useState<Event[]>([])
	const [sportObjects, setSportObjects] = useState<SportObject[]>([])

	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false) // dla przycisku „Załaduj więcej”
	const [error, setError] = useState<string | null>(null)

	const [joinedEventIds, setJoinedEventIds] = useState<Set<number>>(new Set())
	const [savedEventIds, setSavedEventIds] = useState<Set<number>>(new Set())
	const [userSports, setUserSports] = useState<Map<string, number>>(new Map())
	const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; }>({
		isOpen: false, title: "", message: ""
	})

	const [view, setView] = useState<'grid' | 'map'>('grid')
	const [search, setSearch] = useState('')
	const [sportTypeId, setSportTypeId] = useState<number | null>(null)
	const [city, setCity] = useState('')
	const [onlyFree, setOnlyFree] = useState(false)
	const [onlyAvailable, setOnlyAvailable] = useState(false)
	const [dateFrom, setDateFrom] = useState<string>('')
	const [dateTo, setDateTo] = useState<string>('')
	const [priceMin, setPriceMin] = useState<string>('')
	const [priceMax, setPriceMax] = useState<string>('')
	const [sort, setSort] = useState<SortKey>('date_asc')

	// --- NOWE: stan paginacji z backendu ---
	const [hasNext, setHasNext] = useState(false)
	const observerTarget = useRef<HTMLDivElement>(null)
	const currentPageRef = useRef(0)

	useEffect(() => {
		setUserEmail(localStorage.getItem('email'))
	}, [])

	// --- Pobieranie sport objects przy starcie ---
	useEffect(() => {
		let cancelled = false
		const loadInitial = async () => {
			try {
				const soRes = await axiosInstance.get<SportObject[]>('/sport-object')
				if (cancelled) return
				setSportObjects(soRes.data || [])
			} catch (e) {
				console.error('Błąd pobierania danych:', e)
			}
		}
		loadInitial()
		return () => { cancelled = true }
	}, [])

	// --- reszta Twoich efektów bez zmian ---
	useEffect(() => {
		if (!userEmail) return
		axiosInstance
			.get('/user-event/by-user-email', { params: { userEmail } })
			.then(({ data }) => setJoinedEventIds(new Set((data || []).map((ue: any) => ue.eventId))))
			.catch(e => console.error('Nie udało się pobrać dołączonych wydarzeń:', e))
	}, [userEmail])

	useEffect(() => {
		if (!userEmail) return
		axiosInstance
			.get('/user-saved-event', { params: { userEmail } })
			.then(({ data }) => setSavedEventIds(new Set((data || []).map((se: any) => se.eventId))))
			.catch(e => console.error('Nie udało się pobrać zapisanych wydarzeń:', e))

		const token = localStorage.getItem('accessToken')
		if (token) {
			axiosInstance.get<UserSportsResponse>('/sport-type/user', { params: { token } })
				.then(({ data }) => {
					const sportsMap = new Map<string, number>()
					data.sports?.forEach((s: any) => {
						sportsMap.set(s.name, s.rating)
					})
					setUserSports(sportsMap)
				})
				.catch(e => console.error('Nie udało się pobrać sportów użytkownika:', e))
		}
	}, [userEmail])

	// Mapowanie SortKey na sortBy + direction
	const getSortParams = (sortKey: SortKey): { sortBy: SortBy; direction: SortDirection } => {
		switch (sortKey) {
			case 'date_asc':
				return { sortBy: 'eventDate', direction: 'ASC' }
			case 'date_desc':
				return { sortBy: 'eventDate', direction: 'DESC' }
			case 'price_asc':
				return { sortBy: 'cost', direction: 'ASC' }
			case 'price_desc':
				return { sortBy: 'cost', direction: 'DESC' }
			case 'popularity':
				return { sortBy: 'bookedParticipants', direction: 'DESC' }
			default:
				return { sortBy: 'eventDate', direction: 'ASC' }
		}
	}

	// Funkcja pobierająca eventy z backendu
	const fetchEvents = useCallback(async (pageNum: number, append: boolean = false) => {
		try {
			if (append) {
				setLoadingMore(true)
			} else {
				setLoading(true)
			}

			const { sortBy: currentSortBy, direction: currentDirection } = getSortParams(sort)
			const params: Record<string, any> = {
				page: pageNum,
				size: PAGE_SIZE,
				sortBy: currentSortBy,
				direction: currentDirection,
			}

			// Dodaj filtry
			if (search.trim() !== '') {
				params.name = search.trim()
			}
			if (sportTypeId !== null) {
				params.sportTypeId = sportTypeId
			}
			if (city.trim() !== '') {
				params.city = city.trim()
			}
			if (dateFrom) {
				params.dateFrom = dateFrom
			}
			if (dateTo) {
				params.dateTo = dateTo
			}
			if (onlyFree) {
				params.free = true
			}
			if (onlyAvailable) {
				params.available = true
			}

			const response = await axiosInstance.get<EventsPageResponse>('/event', { params })
			const data = response.data

			if (append) {
				setEvents(prev => [...prev, ...(data.content || [])])
			} else {
				setEvents(data.content || [])
			}
			setHasNext(!data.last)
		} catch (err) {
			console.error('Błąd pobierania wydarzeń:', err)
			setError('Nie udało się pobrać wydarzeń.')
		} finally {
			setLoading(false)
			setLoadingMore(false)
		}
	}, [sort, search, sportTypeId, city, dateFrom, dateTo, onlyFree, onlyAvailable])

	// Reset page i pobieranie eventów przy zmianie filtrów/sortowania
	useEffect(() => {
		currentPageRef.current = 0
		setEvents([])
		fetchEvents(0, false)
	}, [sort, search, sportTypeId, city, dateFrom, dateTo, onlyFree, onlyAvailable, fetchEvents])

	// Infinite scroll z IntersectionObserver
	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasNext && !loading && !loadingMore) {
			const nextPage = currentPageRef.current + 1
			currentPageRef.current = nextPage
			fetchEvents(nextPage, true)
				}
			},
			{ threshold: 0.1 }
		)

		const currentTarget = observerTarget.current
		if (currentTarget) {
			observer.observe(currentTarget)
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget)
			}
		}
	}, [hasNext, loading, loadingMore, fetchEvents])

	const eventsWithCoords = useMemo(() => {
		const levelMap: Record<number, string> = {
			1: 'Początkujący',
			2: 'Amator',
			3: 'Średni',
			4: 'Zaawansowany',
			5: 'Profesjonalny',
		}
		return events
			.map(ev => {
				const obj = sportObjects.find(o => o.name === ev.sportObjectName)
				if (!obj || obj.latitude == null || obj.longitude == null) return null

				return {
					eventId: ev.eventId,
					eventName: ev.eventName,
					eventDate: ev.eventDate,
					sportObjectName: ev.sportObjectName,
					latitude: obj.latitude,
					longitude: obj.longitude,
					city: obj.city || ev.city,
					sportTypeName: ev.sportTypeName || 'Nieznany sport',
					cost: (ev as any).cost ?? 0,
					imageUrl: (ev as any).imageUrl || null,
					skillLevel: 'Poziom: ' + levelMap[(ev as any).minLevel] || 'brak',
				}
			})
			.filter(Boolean) as any[]
	}, [events, sportObjects])


	const handleSave = async (eventId: number) => {
		if (!userEmail) return navigate('/login')
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
		if (!userEmail) return navigate('/login')
		const isJoined = joinedEventIds.has(eventId)

		try {
			if (isJoined) {
				await axiosInstance.delete('/user-event', { data: { userEmail, eventId } })
				setJoinedEventIds(prev => {
					const s = new Set(prev)
					s.delete(eventId)
					return s
				})
				setEvents(prev => prev.map(ev =>
					ev.eventId === eventId
						? { ...ev, bookedParticipants: Math.max(0, (ev as any).bookedParticipants - 1) }
						: ev
				))
			} else {
				const event = events.find(ev => ev.eventId === eventId)
				const bookedParticipants = (event as any)?.bookedParticipants || 0
				const numberOfParticipants = event?.numberOfParticipants || 0

				if (bookedParticipants >= numberOfParticipants) {
					setAlertModal({
						isOpen: true,
						title: "Wydarzenie pełne",
						message: "Przepraszamy, to wydarzenie jest już pełne."
					})
					return
				}

				if (event?.minLevel) {
					const userLevel = userSports.get(event.sportTypeName)
					const requiredLevel = event.minLevel
					if (userLevel === undefined || userLevel < requiredLevel) {
						const modalMessage = userLevel === undefined
							? `To wydarzenie wymaga poziomu ${requiredLevel} w ${event.sportTypeName}. Dodaj ten sport do swojego profilu, aby dołączyć.`
							: `To wydarzenie wymaga poziomu ${requiredLevel}, a Twoje umiejętności to ${userLevel}. Zaktualizuj swój profil, aby dołączyć.`
						setAlertModal({ isOpen: true, title: "Niewystarczający poziom", message: modalMessage })
						return
					}
				}

				await axiosInstance.post('/user-event', { userEmail, eventId, attendanceStatusId: 1 })
				setJoinedEventIds(prev => new Set([...prev, eventId]))
				setEvents(prev => prev.map(ev =>
					ev.eventId === eventId
						? { ...ev, bookedParticipants: ((ev as any).bookedParticipants || 0) + 1 }
						: ev
				))
			}
		} catch (e) {
			console.error('Błąd dołączania/opuszczania:', e)
		}
	}

	const clearFilters = () => {
		setSearch('')
		setSportTypeId(null)
		setCity('')
		setOnlyFree(false)
		setOnlyAvailable(false)
		setDateFrom('')
		setDateTo('')
		setPriceMin('')
		setPriceMax('')
		setSort('date_asc')
		// Reset page zostanie wykonany przez useEffect przy zmianie filtrów
	}

	return (
		<div className='min-h-screen bg-[#1f2632] text-zinc-300 pt-10'>
			<header className='relative h-[140px] w-full overflow-hidden'>
				<div
					className='absolute inset-0 bg-cover bg-center'
					style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1604948501466-4e9b4d6f3e2b?q=80&w=1600&auto=format&fit=crop)' }}
				/>
				<div className='absolute inset-0 bg-black/60' />
				<div className='relative z-10 mx-auto flex h-full max-w-7xl items-end justify-between px-4 pb-6 md:px-8'>
					<div>
						<h1 className='text-2xl md:text-3xl font-semibold text-white'>Wydarzenia</h1>
						<div className='mt-2 h-1 w-28 rounded-full bg-violet-600' />
					</div>
					<Link
						to="/stworz-wydarzenie"
						className='bg-white/10 border border-white/20 px-4 py-2 rounded-xl font-semibold text-white hover:bg-white/20 transition-all inline-flex items-center gap-2'
					>
						<Plus size={18} />
						Stwórz wydarzenie
					</Link>
				</div>
			</header>

			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					{/* Pasek wyszukiwania i sortowania */}
					<div className='flex flex-col gap-4'>
						{/* Wyszukiwanie */}
						<div className='relative flex-1'>
							<Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2' size={18} />
							<input
								value={search}
								onChange={e => setSearch(e.target.value)}
								placeholder='Szukaj po nazwie lub obiekcie…'
								className='w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-10 py-2.5 text-sm text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600'
							/>
						</div>

						{/* Przyciski widoku, sortowania i akcji */}
						<div className='flex flex-wrap items-center gap-3'>
							{/* Przyciski widoku - Lista/Mapa */}
							<div className='flex items-center gap-2'>
								<button
									onClick={() => setView('grid')}
									className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${view === 'grid' ? 'border-violet-600 text-white' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}>
									<GridIcon size={16} /> <span className='hidden sm:inline'>Lista</span>
								</button>
								<button
									onClick={() => setView('map')}
									className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${view === 'map' ? 'border-violet-600 text-white' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}>
									<MapIcon size={16} /> <span className='hidden sm:inline'>Mapa</span>
								</button>
							</div>

							{/* Sortowanie */}
							<div className='relative flex-1 min-w-[140px]'>
								<select
									value={sort}
									onChange={e => setSort(e.target.value as SortKey)}
									className='w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 pr-8 text-sm text-zinc-200'>
									<option value='date_asc'>Data rosnąco</option>
									<option value='date_desc'>Data malejąco</option>
									<option value='price_asc'>Cena rosnąco</option>
									<option value='price_desc'>Cena malejąco</option>
									<option value='popularity'>Popularność</option>
								</select>
								<ArrowUpDown className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60' size={16} />
							</div>

							{/* Przycisk wyczyść */}
							<button
								onClick={clearFilters}
								className='inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 whitespace-nowrap'>
								<FilterX size={16} /> <span className='hidden sm:inline'>Wyczyść</span>
							</button>
						</div>
					</div>

					{/* Filtry */}
					<div className='mt-4 grid grid-cols-1 gap-3 md:grid-cols-4'>
						<div>
							<label className='mb-1 block text-xs text-zinc-400'>Sport</label>
							<SportTypeFilter value={sportTypeId} onChange={setSportTypeId} />
						</div>

						<div>
							<label className='mb-1 block text-xs text-zinc-400'>Miasto</label>
							<PlaceAutocomplete
								onSelect={(place: google.maps.places.PlaceResult) => {
									const getAddr = (types: string[]) =>
										(place.address_components || []).find((c: any) => c.types.some((t: string) => types.includes(t)))?.long_name
									const cityName =
										getAddr(['locality', 'postal_town', 'administrative_area_level_2', 'administrative_area_level_1']) ||
										place.formatted_address || place.name || ''
									setCity(cityName)
								}}
								placeholder='Miasto lub adres'
							/>
						</div>

						<div className='grid grid-cols-2 gap-2'>
							<div>
								<label className='mb-1 block text-xs text-zinc-400'>Od</label>
								<input type='date' value={dateFrom} onChange={e => setDateFrom(e.target.value)}
									   className='w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200' />
							</div>
							<div>
								<label className='mb-1 block text-xs text-zinc-400'>Do</label>
								<input type='date' value={dateTo} onChange={e => setDateTo(e.target.value)}
									   className='w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200' />
							</div>
						</div>

						<div className='grid grid-cols-2 gap-2'>
							<label className='flex items-center gap-2 text-sm'>
								<input type='checkbox' checked={onlyFree} onChange={e => setOnlyFree(e.target.checked)} /> Darmowe
							</label>
							<label className='flex items-center gap-2 text-sm'>
								<input type='checkbox' checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} /> Dostępne
							</label>
							<input placeholder='Cena od' value={priceMin} onChange={e => setPriceMin(e.target.value)}
								   className='rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm col-span-1' />
							<input placeholder='Cena do' value={priceMax} onChange={e => setPriceMax(e.target.value)}
								   className='rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm col-span-1' />
						</div>
					</div>

					{/* Lista / Mapa */}
					<div className='mt-6'>
						{view === 'map' ? (
							<MapView events={eventsWithCoords} selectedCity={city} />
						) : loading ? (
							<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10'>
								<div className='flex items-center gap-2 text-zinc-300'><Loader2 className='animate-spin' /> Ładowanie…</div>
							</div>
						) : error ? (
							<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-rose-500/10 p-10 text-rose-200'>
								{error}
							</div>
						) : events.length === 0 ? (
							<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center'>
								<div className='text-5xl mb-2'>🔍</div>
								<div className='text-white text-lg font-semibold'>Brak wyników</div>
								<div className='text-zinc-400 text-sm'>Spróbuj zmienić filtry lub frazę wyszukiwania.</div>
							</div>
						) : (
							<>
								<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
									{events.map(ev => {
										const isBanned = ev.isBanned === true
										return (
											<article 
												key={ev.eventId} 
												className={`overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 ${
													isBanned ? 'opacity-60 grayscale' : ''
												}`}
											>
												{isBanned ? (
													<div className='block relative h-40 bg-zinc-800 overflow-hidden'>
														<div className='h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800'>
															<div className='text-center text-zinc-500'>
																<AlertTriangle className='mx-auto mb-2' size={32} />
																<div className='text-sm font-medium'>Zablokowane</div>
															</div>
														</div>
													</div>
												) : (
													<Link to={`/event/${ev.eventId}`} className='block relative h-40 bg-zinc-800 overflow-hidden'>
														{ev.imageUrl && ev.imageUrl.trim() !== '' ? (
															<img
																src={ev.imageUrl}
																alt={ev.eventName}
																onError={e => {
																	const target = e.currentTarget as HTMLImageElement
																	target.style.display = 'none'
																	const fallback = target.nextElementSibling as HTMLElement
																	if (fallback) fallback.style.display = 'flex'
																}}
																className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-500'
															/>
														) : null}
														<div
															className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 group-hover:scale-105 transition-transform duration-500 ${ev.imageUrl && ev.imageUrl.trim() !== '' ? 'hidden' : 'flex'}`}
															style={{ display: ev.imageUrl && ev.imageUrl.trim() !== '' ? 'none' : 'flex' }}>
															<div className='text-center text-zinc-400'>
																<div className='text-4xl mb-2'>JoinMatch</div>
																<div className='text-sm font-medium'>{ev.sportTypeName}</div>
															</div>
														</div>
														<span className='absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-violet-200 ring-1 ring-violet-600/40'>
															{ev.sportTypeName}
														</span>
													</Link>
												)}
												<div className='p-4'>
													<div className='flex items-start justify-between'>
														<h3 className={`font-semibold line-clamp-1 ${isBanned ? 'text-zinc-500' : 'text-white'}`}>
															{isBanned ? (
																<span>{ev.eventName}</span>
															) : (
																<Link to={`/event/${ev.eventId}`} className='hover:underline'>
																	{ev.eventName}
																</Link>
															)}
														</h3>
														{!isBanned && (
															<button onClick={() => handleSave(ev.eventId)} className='rounded-full p-2 ring-1 bg-zinc-800 hover:bg-zinc-700'>
																{savedEventIds.has(ev.eventId) ? (
																	<BookmarkCheck size={18} className='text-violet-400' />
																) : (
																	<Bookmark size={18} className='text-zinc-400' />
																)}
															</button>
														)}
													</div>
													<div className='mt-2 text-sm text-zinc-500 space-y-1'>
														<div className='flex items-center gap-2'>
															<CalendarDays size={16} /> {parseEventDate(ev.eventDate).format('DD.MM.YYYY HH:mm')}
														</div>
														<div className='flex items-center gap-2'>
															<MapPin size={16} /> {ev.sportObjectName}
														</div>
														<div className='flex items-center gap-2'>
															<Users size={16} /> {(ev as any).bookedParticipants}/{ev.numberOfParticipants}
														</div>
														<div className='flex items-center gap-2'>
															<Ticket size={16} />
															{new Intl.NumberFormat('pl-PL', {
																style: 'currency',
																currency: (ev as any).currency || 'PLN',
															}).format((ev as any).cost || 0)}
														</div>
													</div>
													<div className='mt-4 flex justify-between'>
														{isBanned ? (
															<div className='text-zinc-500 text-sm'>Zablokowane</div>
														) : (
															<>
																{(() => {
																	const isJoined = joinedEventIds.has(ev.eventId)
																	const isFull = (ev as any).bookedParticipants >= ev.numberOfParticipants && !isJoined
																	return (
																		<button
																			onClick={() => handleJoin(ev.eventId)}
																			disabled={isFull}
																			className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${isJoined
																				? 'bg-red-600 text-white hover:bg-red-500'
																				: isFull
																					? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
																					: 'bg-violet-600 text-white hover:bg-violet-500'
																			}`}>
																			{isJoined ? 'Opuść' : isFull ? 'Pełne' : 'Dołącz'}
																		</button>
																	)
																})()}
																<Link to={`/event/${ev.eventId}`} className='text-violet-300 hover:text-violet-200 inline-flex items-center gap-1'>
																	Szczegóły <ChevronRight size={16} />
																</Link>
															</>
														)}
													</div>
												</div>
											</article>
										)
									})}
								</div>

								{/* Infinite scroll trigger */}
								{hasNext && (
									<div ref={observerTarget} className='mt-8 grid place-items-center py-4'>
										{loadingMore && (
											<div className='flex items-center gap-2 text-zinc-400'>
												<Loader2 className='animate-spin' size={20} />
												<span className='text-sm'>Ładowanie kolejnych wydarzeń...</span>
											</div>
										)}
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</main>

			<AlertModal
				isOpen={alertModal.isOpen}
				onClose={() => setAlertModal({ isOpen: false, title: "", message: "" })}
				title={alertModal.title}
				message={alertModal.message}
				variant="warning"
			/>
		</div>
	)
}

export default EventsPage
