// src/pages/EventPage.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { EventDetails } from '../Api/types'
import axiosInstance from '../Api/axios'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import {
	ArrowLeft,
	Share2,
	CalendarDays,
	MapPin,
	Ticket,
	Shield,
	Users,
	Copy,
	ChevronDown,
	MessageCircle,
	UserRound,
	Bookmark,
	AlertTriangle,
} from 'lucide-react'

dayjs.locale('pl')

// --- Mock uczestników (zachowano z wersji wejściowej) ---
const mockParticipants = [
	{ id: 1, name: 'Anna Nowak', avatar: '👩', skillLevel: 'Średni' },
	{ id: 2, name: 'Piotr Wiśniewski', avatar: '👨', skillLevel: 'Wysoki' },
	{ id: 3, name: 'Katarzyna Kowalczyk', avatar: '👩', skillLevel: 'Niski' },
	{ id: 4, name: 'Michał Zieliński', avatar: '👨', skillLevel: 'Średni' },
	{ id: 5, name: 'Agnieszka Dąbrowska', avatar: '👩', skillLevel: 'Wysoki' },
]

const EventPage: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const [event, setEvent] = useState<EventDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [participants, setParticipants] = useState(mockParticipants)
	const [joined, setJoined] = useState(false)

	const [showShareToast, setShowShareToast] = useState(false)
	const [showShareModal, setShowShareModal] = useState(false)
	const [showDetailsAccordion, setShowDetailsAccordion] = useState(false)
	const [showParticipants, setShowParticipants] = useState(false)

	useEffect(() => {
		if (!id) {
			setError('Nieprawidłowy identyfikator wydarzenia')
			setLoading(false)
			return
		}

		axiosInstance
			.get<EventDetails>(`/event/${id}`)
			.then(({ data }) => setEvent(data))
			.catch(err => {
				console.error('❌ Błąd pobierania szczegółów wydarzenia:', err)
				setError('Nie udało się pobrać szczegółów wydarzenia')
			})
			.finally(() => setLoading(false))
	}, [id])

	// --- utils ---
	const formatPrice = (cost: number, currency: string) =>
		new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(cost)

	const formatAddress = (street: string, number: number, secondNumber: number | null, city: string) =>
		`${street} ${secondNumber ? `${number}/${secondNumber}` : number}, ${city}`

	const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

	const getSkillLevelColor = (level: string) => {
		switch (level.toLowerCase()) {
			case 'niski':
				return 'bg-emerald-500/15 text-emerald-300'
			case 'średni':
				return 'bg-amber-500/15 text-amber-300'
			case 'wysoki':
				return 'bg-rose-500/15 text-rose-300'
			default:
				return 'bg-zinc-600/20 text-zinc-300'
		}
	}

	const getStatusBadge = (status: string, scoreTeam1: number | null, scoreTeam2: number | null) => {
		const base = 'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1'
		switch (status) {
			case 'finished':
				return (
					<span className={`${base} bg-emerald-500/10 text-emerald-300 ring-emerald-600/40`}>
						<span className='h-1.5 w-1.5 rounded-full bg-emerald-400' />
						Zakończone • {scoreTeam1 ?? 0}:{scoreTeam2 ?? 0}
					</span>
				)
			case 'cancelled':
				return (
					<span className={`${base} bg-rose-500/10 text-rose-300 ring-rose-600/40`}>
						<span className='h-1.5 w-1.5 rounded-full bg-rose-400' />
						Anulowane
					</span>
				)
			case 'in_progress':
				return (
					<span className={`${base} bg-amber-500/10 text-amber-300 ring-amber-600/40`}>
						<span className='h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400' />W trakcie
					</span>
				)
			default:
				return (
					<span className={`${base} bg-sky-500/10 text-sky-300 ring-sky-600/40`}>
						<span className='h-1.5 w-1.5 rounded-full bg-sky-400' />
						Planowane
					</span>
				)
		}
	}

	const handleShare = async () => {
		const shareData = {
			title: event?.eventName || 'Wydarzenie sportowe',
			text: `Sprawdź to wydarzenie sportowe: ${event?.eventName}`,
			url: window.location.href,
		}

		if (navigator.share) {
			try {
				await navigator.share(shareData)
			} catch {
				// anulowano
			}
		} else {
			try {
				await navigator.clipboard.writeText(window.location.href)
				setShowShareToast(true)
				setTimeout(() => setShowShareToast(false), 2500)
			} catch (err) {
				console.error('Nie udało się skopiować linku', err)
			}
		}
	}

	const handleJoinEvent = () => {
		if (joined) {
			setParticipants(prev => prev.filter(p => p.name !== 'Ty'))
			setJoined(false)
		} else {
			setParticipants(prev => [...prev, { id: Date.now(), name: 'Ty', avatar: '👤', skillLevel: 'Średni' }])
			setJoined(true)
		}
	}

	// --- stany ekranu ---
	if (loading) {
		return (
			<div className='min-h-screen grid place-items-center bg-[#1f2632]'>
				<div className='rounded-2xl bg-black/50 px-6 py-5 ring-1 ring-zinc-800 text-zinc-200 flex items-center gap-3'>
					<span className='h-4 w-4 animate-pulse rounded-full bg-violet-500' />
					Ładowanie wydarzenia…
				</div>
			</div>
		)
	}

	if (error || !event) {
		return (
			<div className='min-h-screen grid place-items-center bg-[#1f2632] px-4'>
				<div className='max-w-md w-full rounded-3xl bg-black/60 p-6 ring-1 ring-zinc-800 text-center'>
					<div className='mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-rose-500/20 text-rose-300'>
						<AlertTriangle />
					</div>
					<h2 className='text-white text-xl font-semibold'>Wydarzenie nie znalezione</h2>
					<p className='mt-2 text-sm text-zinc-400'>{error || 'Nie udało się załadować wydarzenia'}</p>
					<button
						onClick={() => navigate('/')}
						className='mt-5 w-full rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500'>
						Powrót do strony głównej
					</button>
				</div>
			</div>
		)
	}

	const spotsLeft = Math.max(0, event.numberOfParticipants - participants.length)
	const progressPercentage = Math.min(100, (participants.length / Math.max(1, event.numberOfParticipants)) * 100)

	return (
		<div className='min-h-screen bg-[#1f2632] text-zinc-300'>
			{/* HERO */}
			<div className='sticky top-0 z-40 bg-[#1f2632]/80 backdrop-blur border-b border-zinc-800'>
				<div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8'>
					<button
						onClick={() => navigate(-1)}
						className='inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-zinc-200 ring-1 ring-white/10 bg-black/30 hover:bg-black/50'>
						<ArrowLeft size={18} />
						<span className='hidden sm:inline'>Wróć</span>
					</button>
					<button
						onClick={() => setShowShareModal(true)}
						className='inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-zinc-200 ring-1 ring-white/10 bg-black/30 hover:bg-black/50'>
						<Share2 size={18} />
						<span className='hidden sm:inline'>Udostępnij</span>
					</button>
				</div>
			</div>

			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					{/* Nagłówek wydarzenia */}
					<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
						<div>
							<div className='flex flex-wrap items-center gap-2'>
								<span className='rounded-full bg-violet-600/20 px-3 py-1 text-xs font-medium text-violet-200 ring-1 ring-violet-600/40'>
									{event.sportTypeName}
								</span>
								{getStatusBadge(event.status, event.scoreTeam1, event.scoreTeam2)}
								<span
									className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-zinc-700 ${getSkillLevelColor(
										event.skillLevel
									)}`}>
									Poziom: {event.skillLevel}
								</span>
							</div>
							<h1 className='mt-3 text-2xl md:text-3xl font-semibold text-white'>{event.eventName}</h1>
							<div className='mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-300'>
								<div className='inline-flex items-center gap-2'>
									<CalendarDays size={18} />
									<span>{dayjs(event.eventDate).format('dddd, DD.MM.YYYY • HH:mm')}</span>
								</div>
								<div className='inline-flex items-center gap-2'>
									<MapPin size={18} />
									<span>{event.sportObjectName}</span>
								</div>
								<div className='inline-flex items-center gap-2'>
									<Ticket size={18} />
									<span>{formatPrice(event.cost, event.currency)}</span>
								</div>
							</div>
						</div>
					</div>

					<hr className='my-6 border-zinc-800' />

					<div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
						{/* Main content */}
						<section className='lg:col-span-2 space-y-6'>
							{/* Zapełnienie */}
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<div className='mb-3 flex items-center justify-between'>
									<h3 className='text-white text-lg font-semibold'>Zapełnienie wydarzenia</h3>
									<span className='text-violet-300 font-semibold'>
										{participants.length}/{event.numberOfParticipants}
									</span>
								</div>
								<div className='h-3 w-full overflow-hidden rounded-full bg-zinc-800'>
									<div
										className='h-3 rounded-full bg-violet-600 transition-all'
										style={{ width: `${progressPercentage}%` }}
									/>
								</div>
								<div className='mt-2 flex justify-between text-xs text-zinc-400'>
									<span>Wolne miejsca: {spotsLeft}</span>
									<span>{progressPercentage.toFixed(0)}% zapełnione</span>
								</div>
								{spotsLeft <= 3 && spotsLeft > 0 && (
									<div className='mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200 text-sm inline-flex items-center gap-2'>
										<Shield size={16} /> Tylko {spotsLeft} {spotsLeft === 1 ? 'miejsce' : 'miejsca'} pozostało!
									</div>
								)}
							</div>

							{/* Uczestnicy */}
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<div className='mb-4 flex items-center justify-between'>
									<h3 className='text-white text-lg font-semibold'>Uczestnicy ({participants.length})</h3>
									<button
										onClick={() => setShowParticipants(s => !s)}
										className='inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200'>
										{showParticipants ? 'Ukryj' : 'Zobacz wszystkich'}
										<ChevronDown size={16} className={`transition-transform ${showParticipants ? 'rotate-180' : ''}`} />
									</button>
								</div>

								<div className='mb-2 flex flex-wrap gap-2'>
									{participants.slice(0, showParticipants ? participants.length : 8).map(p => (
										<div
											key={p.id}
											className='group flex items-center gap-2 rounded-lg bg-zinc-800/60 px-3 py-2 hover:bg-zinc-800'>
											<span className='text-xl'>{p.avatar}</span>
											<div className='text-sm'>
												<div className='font-medium text-white leading-tight'>{p.name}</div>
												<div
													className={`mt-0.5 inline-block rounded px-2 py-0.5 text-[10px] ${getSkillLevelColor(
														p.skillLevel
													)}`}>
													{p.skillLevel}
												</div>
											</div>
										</div>
									))}
								</div>

								{!showParticipants && participants.length > 8 && (
									<p className='text-center text-xs text-zinc-400'>i {participants.length - 8} więcej…</p>
								)}
							</div>

							{/* Info grid */}
							<div className='grid grid-cols-2 gap-4'>
								<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
									<p className='text-xs text-zinc-400'>Cena</p>
									<p className='mt-1 text-white text-lg font-semibold'>{formatPrice(event.cost, event.currency)}</p>
								</div>
								<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
									<p className='text-xs text-zinc-400'>Płatność</p>
									<p className='mt-1 text-white text-lg font-semibold'>{event.paymentMethod}</p>
								</div>
								<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
									<p className='text-xs text-zinc-400'>Widoczność</p>
									<p className='mt-1 text-white text-lg font-semibold'>{capitalizeFirst(event.eventVisibilityName)}</p>
								</div>
								<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
									<p className='text-xs text-zinc-400'>Pojemność obiektu</p>
									<p className='mt-1 text-white text-lg font-semibold'>{event.capacity} osób</p>
								</div>
							</div>

							{/* Lokalizacja */}
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<h3 className='text-white text-lg font-semibold'>Lokalizacja</h3>
								<div className='mt-3 space-y-2 text-sm'>
									<div className='inline-flex items-center gap-2 text-zinc-200'>
										<UserRound size={16} />
										<span className='font-medium'>{event.sportObjectName}</span>
									</div>
									<div className='inline-flex items-center gap-2 text-zinc-400'>
										<MapPin size={16} />
										<span>{formatAddress(event.street, event.number, event.secondNumber, event.city)}</span>
									</div>
								</div>
								<button className='mt-4 w-full rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
									Pokaż na mapie
								</button>
							</div>

							{/* Szczegóły */}
							<div className='overflow-hidden rounded-2xl border border-zinc-800 bg-black/40'>
								<button
									onClick={() => setShowDetailsAccordion(s => !s)}
									className='flex w-full items-center justify-between px-5 py-4 text-left hover:bg-black/50'>
									<h3 className='text-white text-lg font-semibold'>Zobacz szczegóły</h3>
									<ChevronDown
										size={18}
										className={`text-zinc-400 transition-transform ${showDetailsAccordion ? 'rotate-180' : ''}`}
									/>
								</button>
								{showDetailsAccordion && (
									<div className='border-t border-zinc-800 px-5 py-4 text-sm leading-relaxed text-zinc-300'>
										<h4 className='mb-2 font-semibold text-white'>Opis wydarzenia</h4>
										<p>
											To jest placeholder dla opisu wydarzenia. Tutaj organizator może dodać szczegółowe informacje,
											zasady, wymagania oraz inne istotne detale.
										</p>
									</div>
								)}
							</div>
						</section>

						{/* Sidebar */}
						<aside className='space-y-6 lg:sticky lg:top-6'>
							{/* Akcja dołączenia */}
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								{event.status === 'planned' && spotsLeft > 0 ? (
									<button
										onClick={handleJoinEvent}
										className={`w-full rounded-2xl px-4 py-3 text-white font-semibold transition ${
											joined
												? 'bg-rose-600 hover:bg-rose-500'
												: 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/30'
										}`}>
										{joined ? 'Opuść wydarzenie' : 'Dołącz do wydarzenia'}
									</button>
								) : spotsLeft <= 0 ? (
									<button disabled className='w-full rounded-2xl bg-zinc-700 px-4 py-3 font-semibold text-zinc-400'>
										Brak wolnych miejsc
									</button>
								) : (
									<button disabled className='w-full rounded-2xl bg-zinc-700 px-4 py-3 font-semibold text-zinc-400'>
										Wydarzenie niedostępne
									</button>
								)}
							</div>

							{/* Organizator */}
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<h3 className='text-white text-lg font-semibold'>Organizator</h3>
								<div className='mt-4 flex items-center gap-3'>
									<div className='grid h-12 w-12 place-items-center rounded-full bg-violet-600 text-white font-bold'>
										{event.ownerName
											.split(' ')
											.map(n => n[0])
											.join('')}
									</div>
									<div>
										<div className='font-medium text-white'>{event.ownerName}</div>
										<div className='text-xs text-zinc-400'>Organizator</div>
									</div>
								</div>
								<div className='mt-4 space-y-2'>
									<button className='w-full rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 inline-flex items-center justify-center gap-2'>
										<MessageCircle size={16} /> Wyślij wiadomość
									</button>
									<button className='w-full rounded-xl bg-transparent px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 ring-1 ring-zinc-700 inline-flex items-center justify-center gap-2'>
										<UserRound size={16} /> Zobacz profil
									</button>
								</div>
							</div>

							{/* Akcje */}
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<h3 className='text-white text-lg font-semibold'>Akcje</h3>
								<div className='mt-4 space-y-3'>
									<button className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
										<Bookmark size={16} /> Zapisz wydarzenie
									</button>
									<button className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
										<CalendarDays size={16} /> Dodaj do kalendarza
									</button>
									<button className='w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm text-rose-300 ring-1 ring-rose-700/40 hover:bg-rose-500/10'>
										<AlertTriangle size={16} /> Zgłoś wydarzenie
									</button>
								</div>
							</div>
						</aside>
					</div>
				</div>
			</main>

			{/* Share Modal */}
			{showShareModal && (
				<div className='fixed inset-0 z-50 grid place-items-center bg-black/70 p-4'>
					<div className='w-full max-w-md rounded-2xl bg-zinc-900/90 p-5 ring-1 ring-zinc-800'>
						<div className='mb-4 flex items-center justify-between'>
							<h3 className='text-white text-lg font-semibold'>Udostępnij wydarzenie</h3>
							<button
								onClick={() => setShowShareModal(false)}
								className='rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white'
								aria-label='Zamknij'>
								✕
							</button>
						</div>

						<div className='flex items-center gap-2 rounded-xl bg-zinc-800/70 px-3 py-2'>
							<input
								type='text'
								value={window.location.href}
								readOnly
								className='flex-1 bg-transparent text-sm text-zinc-200 outline-none'
							/>
							<button
								onClick={handleShare}
								className='inline-flex items-center gap-2 text-violet-300 hover:text-violet-200'>
								<Copy size={16} />
								Kopiuj
							</button>
						</div>

						<div className='mt-4 grid grid-cols-2 gap-3'>
							<a
								href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
								target='_blank'
								rel='noreferrer'
								className='grid place-items-center rounded-xl bg-[#1877F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90'>
								Facebook
							</a>
							<a
								href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
									window.location.href
								)}&text=${encodeURIComponent(event.eventName)}`}
								target='_blank'
								rel='noreferrer'
								className='grid place-items-center rounded-xl bg-[#1DA1F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90'>
								Twitter
							</a>
						</div>
					</div>
				</div>
			)}

			{/* Share toast */}
			{showShareToast && (
				<div className='fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-sm text-emerald-200 ring-1 ring-emerald-700/40'>
					<span className='h-2 w-2 rounded-full bg-emerald-400' />
					Link skopiowany do schowka!
				</div>
			)}
		</div>
	)
}

export default EventPage
