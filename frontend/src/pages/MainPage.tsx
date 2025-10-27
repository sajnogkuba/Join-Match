import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { MapPin, CalendarDays, Bookmark, Users } from 'lucide-react'
import BackgroundImage from '../assets/Background.jpg'
import AlertModal from '../components/AlertModal'
import api from '../Api/axios.tsx'
import type { Event } from '../Api/types.ts'
import type { UserSportsResponse } from '../Api/types/Sports'

const CATEGORIES = ['All', 'Basketball', 'Football', 'Tennis', 'Volleyball', 'Running', 'Yoga', 'Swimming']

const MainPage: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('All')
	const [events, setEvents] = useState<Event[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [userEmail, setUserEmail] = useState<string | null>(null)
	const [joinedEventIds, setJoinedEventIds] = useState<Set<number>>(new Set())
	const [savedEventIds, setSavedEventIds] = useState<Set<number>>(new Set())
	const [userSports, setUserSports] = useState<Map<string, number>>(new Map())
	const [alertModal, setAlertModal] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
	}>({ isOpen: false, title: "", message: "" })
	const navigate = useNavigate()

	useEffect(() => setUserEmail(localStorage.getItem('email')), [])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await api.get('/event')
				setEvents(data)
			} catch {
				setError('Nie udało się pobrać wydarzeń.')
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	useEffect(() => {
		if (!userEmail) return
		api.get('/user-event/by-user-email', { params: { userEmail } })
			.then(({ data }) => setJoinedEventIds(new Set(data.map((x: any) => x.eventId))))
			.catch(() => {})
		
		// Fetch saved events
		api.get('/user-saved-event/by-user-email', { params: { userEmail } })
			.then(({ data }) => setSavedEventIds(new Set((data || []).map((se: any) => se.eventId))))
			.catch(() => {})
		
		// Fetch user's sports
		const token = localStorage.getItem('accessToken')
		if (token) {
			api.get<UserSportsResponse>('/sport-type/user', { params: { token } })
				.then(({ data }) => {
					const sportsMap = new Map<string, number>()
					data.sports?.forEach((s: any) => {
						sportsMap.set(s.name, s.rating)
					})
					setUserSports(sportsMap)
				})
				.catch(() => {})
		}
	}, [userEmail])

	const handleSignUp = async (eventId: number) => {
		if (!userEmail) return navigate('/login')
		
		const isJoined = joinedEventIds.has(eventId)
		
		try {
			if (isJoined) {
				// Leave the event
				await api.delete('/user-event', { data: { userEmail, eventId } })
				setJoinedEventIds(prev => {
					const s = new Set(prev)
					s.delete(eventId)
					return s
				})
				// Decrease booked participants count
				setEvents(prev => prev.map(ev => 
					ev.eventId === eventId 
						? { ...ev, bookedParticipants: Math.max(0, (ev as any).bookedParticipants - 1) }
						: ev
				))
			} else {
				// Check if event has available places
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
				
				// Check if user has required skill level
				if (event?.minLevel) {
					const userLevel = userSports.get(event.sportTypeName)
					const requiredLevel = event.minLevel
					
					if (userLevel === undefined || userLevel < requiredLevel) {
						const modalMessage = userLevel === undefined 
							? `To wydarzenie wymaga poziomu ${requiredLevel} w ${event.sportTypeName}. Dodaj ten sport do swojego profilu, aby dołączyć.`
							: `To wydarzenie wymaga poziomu ${requiredLevel}, a Twoje umiejętności to ${userLevel}. Zaktualizuj swój profil, aby dołączyć.`
						setAlertModal({
							isOpen: true,
							title: "Niewystarczający poziom",
							message: modalMessage
						})
						return
					}
				}
				
				// Join the event
				await api.post('/user-event', { userEmail, eventId, attendanceStatusId: 1 })
				setJoinedEventIds(prev => new Set([...prev, eventId]))
				// Increase booked participants count
				setEvents(prev => prev.map(ev => 
					ev.eventId === eventId 
						? { ...ev, bookedParticipants: ((ev as any).bookedParticipants || 0) + 1 }
						: ev
				))
			}
		} catch {}
	}

	const handleSaveEvent = async (eventId: number) => {
		if (!userEmail) return navigate('/login')
		try {
			if (savedEventIds.has(eventId)) {
				await api.delete('/user-saved-event', { data: { userEmail, eventId } })
				setSavedEventIds(p => {
					const s = new Set(p)
					s.delete(eventId)
					return s
				})
			} else {
				await api.post('/user-saved-event', { userEmail, eventId })
				setSavedEventIds(p => new Set([...p, eventId]))
			}
		} catch {}
	}

	const filteredEvents = events.filter(e => {
		const matchName = e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			e.sportObjectName.toLowerCase().includes(searchQuery.toLowerCase())
		const matchCat = selectedCategory === 'All' || e.sportTypeName === selectedCategory
		return matchName && matchCat
	})

	return (
		<div className="bg-[#0d0d10] text-zinc-100">
			{/* HERO */}
			<section
				className="relative min-h-[85vh] flex items-center justify-center text-center bg-cover bg-center overflow-hidden"
				style={{ backgroundImage: `url(${BackgroundImage})` }}
			>
				<div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
				<div className="relative z-10 px-4 max-w-3xl">
					<h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
						Odkrywaj <span className="text-violet-400">sportowe emocje</span> w swoim mieście
					</h1>
					<p className="text-lg md:text-xl text-zinc-300 mb-10">
						Znajdź wydarzenia, dołącz do drużyn i graj z ludźmi, którzy dzielą Twoją pasję.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Link
							to="/events"
							className="bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 px-8 py-4 rounded-xl font-semibold text-white shadow-lg shadow-violet-900/40 transition-all hover:-translate-y-0.5"
						>
							Zobacz wydarzenia
						</Link>
						<Link
							to="/stworz-wydarzenie"
							className="bg-white/10 border border-white/20 px-8 py-4 rounded-xl font-semibold text-white hover:bg-white/20 transition-all hover:-translate-y-0.5"
						>
							Stwórz własne
						</Link>
					</div>
				</div>
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-gray-400">
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</section>

			{/* SEARCH BAR */}
			<section className="relative z-20 -mt-16 px-4">
				<div className="mx-auto max-w-5xl bg-black/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-white/10">
					<div className="flex flex-col md:flex-row gap-4">
						<input
							type="text"
							placeholder="Czego szukasz?"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className="flex-1 rounded-xl bg-zinc-900/70 border border-zinc-700 px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent"
						/>
						<select
							value={selectedCategory}
							onChange={e => setSelectedCategory(e.target.value)}
							className="md:w-64 rounded-xl bg-zinc-900/70 border border-zinc-700 px-4 py-3 text-white focus:ring-2 focus:ring-violet-600"
						>
							{CATEGORIES.map(c => <option key={c}>{c}</option>)}
						</select>
						<button className="bg-gradient-to-r from-violet-600 to-violet-800 text-white font-medium py-3 px-8 rounded-xl hover:from-violet-700 hover:to-violet-900 transition-all shadow-lg shadow-violet-900/30">
							Szukaj
						</button>
					</div>
				</div>
			</section>

			{/* EVENTS */}
			<section className="py-20 bg-black">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center mb-10">
						<div>
							<h2 className="text-3xl font-bold text-white mb-2">Polecane wydarzenia</h2>
							<p className="text-gray-400">Zobacz, co dzieje się w Twojej okolicy</p>
						</div>
						<Link
							to="/events"
							className="mt-4 md:mt-0 bg-violet-700 hover:bg-violet-600 text-white px-5 py-2 rounded-xl transition"
						>
							Wszystkie
						</Link>
					</div>

					{loading ? (
						<div className="text-center py-16 text-gray-400">Ładowanie...</div>
					) : error ? (
						<div className="text-center py-16 text-red-400">{error}</div>
					) : filteredEvents.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
							{filteredEvents.slice(0, 6).map(event => (
								<motion.div
									key={event.eventId}
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4 }}
									className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-violet-600/40 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)]"
								>
									<Link to={`/event/${event.eventId}`} className="block relative h-48 w-full bg-zinc-800 overflow-hidden">
										{event.imageUrl && event.imageUrl.trim() !== '' ? (
											<img
												src={event.imageUrl}
												alt={event.eventName}
												onError={e => {
													const target = e.currentTarget as HTMLImageElement
													target.style.display = 'none'
													const fallback = target.nextElementSibling as HTMLElement
													if (fallback) fallback.style.display = 'flex'
												}}
												className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
											/>
										) : null}
										<div 
											className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 group-hover:scale-105 transition-transform duration-500 ${event.imageUrl && event.imageUrl.trim() !== '' ? 'hidden' : 'flex'}`}
											style={{ display: event.imageUrl && event.imageUrl.trim() !== '' ? 'none' : 'flex' }}
										>
											<div className="text-center text-zinc-400">
												<div className="text-4xl mb-2">JoinMatch</div>
												<div className="text-sm font-medium">{event.sportTypeName}</div>
											</div>
										</div>
									</Link>
									<div className="p-5">
										<h3 className="text-lg font-semibold text-white mb-1">{event.eventName}</h3>
										<p className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
											<MapPin size={14} /> {event.sportObjectName}
										</p>
										<p className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
											<CalendarDays size={14} /> {dayjs(event.eventDate).format('DD.MM.YYYY HH:mm')}
										</p>
										<p className="text-sm text-zinc-400 mb-3 flex items-center gap-2">
											<Users size={14} /> {(event as any).bookedParticipants || 0}/{event.numberOfParticipants}
										</p>
										<div className="flex justify-between items-center">
											<button
												onClick={() => handleSaveEvent(event.eventId)}
												className={`flex items-center gap-1 text-sm ${savedEventIds.has(event.eventId)
													? 'text-violet-400' : 'text-zinc-400 hover:text-white'
													}`}
											>
												<Bookmark size={14} /> {savedEventIds.has(event.eventId) ? 'Zapisano' : 'Zapisz'}
											</button>
											{(() => {
												const isJoined = joinedEventIds.has(event.eventId)
												const isFull = ((event as any).bookedParticipants || 0) >= event.numberOfParticipants && !isJoined
												return (
													<button
														onClick={() => handleSignUp(event.eventId)}
														disabled={isFull}
														className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
															isJoined
																? 'bg-red-600 hover:bg-red-500'
																: isFull
																? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
																: 'bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900'
														}`}
													>
														{isJoined ? 'Opuść' : isFull ? 'Pełne' : 'Dołącz'}
													</button>
												)
											})()}
										</div>
									</div>
								</motion.div>
							))}
						</div>
					) : (
						<div className="text-center py-16 text-zinc-400">Brak wydarzeń spełniających kryteria.</div>
					)}
				</div>
			</section>

			{/* FEATURES */}
			<section className="py-20 bg-[#0d0d12] relative">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold text-white mb-4">Dlaczego <span className="text-violet-400">JoinMatch</span>?</h2>
					<p className="text-zinc-400 max-w-2xl mx-auto mb-12">Tworzymy społeczność, która łączy ludzi przez sport</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{ icon: '📅', title: 'Proste planowanie', desc: 'Zarządzaj swoim kalendarzem sportowym i otrzymuj powiadomienia o wydarzeniach.' },
							{ icon: '🤝', title: 'Zarządzanie drużyną', desc: 'Twórz zespoły, zapraszaj znajomych i graj razem.' },
							{ icon: '🏟️', title: 'Rezerwacja obiektów', desc: 'Rezerwuj miejsca z aktualną dostępnością w czasie rzeczywistym.' },
						].map((f, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.1 }}
								className="group bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 hover:border-violet-600/50 hover:-translate-y-1 transition-all"
							>
								<div className="text-5xl mb-4">{f.icon}</div>
								<h3 className="text-xl font-semibold text-white mb-3 group-hover:text-violet-400">{f.title}</h3>
								<p className="text-zinc-400 text-sm">{f.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 bg-gradient-to-br from-violet-800 via-violet-700 to-violet-900 text-center text-white relative overflow-hidden">
				<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#fff,transparent_60%)]" />
				<div className="relative z-10 px-4">
					<h2 className="text-4xl font-bold mb-6">Gotowy do gry?</h2>
					<p className="text-lg text-violet-100 mb-8">Dołącz do tysięcy użytkowników, którzy już grają z JoinMatch.</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Link to="/register" className="bg-white text-violet-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition">
							Zarejestruj się
						</Link>
						<Link to="/events" className="bg-transparent border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition">
							Zobacz wydarzenia
						</Link>
					</div>
				</div>
			</section>
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

export default MainPage
