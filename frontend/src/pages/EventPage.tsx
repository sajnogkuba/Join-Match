import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import type { EventDetails } from '../Api/types'
import type { Participant } from '../Api/types/Participant'
import axiosInstance from '../Api/axios'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import Avatar from '../components/Avatar'
import EventRatingForm from '../components/EventRatingForm'
import StarRatingDisplay from '../components/StarRatingDisplay'
import RatingCard from '../components/RatingCard'
import StarRatingInput from '../components/StarRatingInput'
import { formatEventDate, parseEventDate } from '../utils/formatDate'
import type { EventRatingResponse } from '../Api/types/Rating'
import {
	Share2,
	Shield,
	Copy,
	ChevronDown,
	UserRound,
	MapPin,
	Bookmark,
	BookmarkCheck,
	AlertTriangle,
	MessageCircle,
	CalendarDays,
} from 'lucide-react'
import { toast } from 'sonner'

dayjs.locale('pl')

const EventPage: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const [event, setEvent] = useState<EventDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// user email will be fetched from backend using access token
	const [userEmail, setUserEmail] = useState<string | null>(null)

	const [participants, setParticipants] = useState<Participant[]>([])
	const [joined, setJoined] = useState(false)
	const [saved, setSaved] = useState(false)

	const [showShareToast, setShowShareToast] = useState(false)
	const [showShareModal, setShowShareModal] = useState(false)
	const [showDetailsAccordion, setShowDetailsAccordion] = useState(false)
	const [showParticipants, setShowParticipants] = useState(false)

	const [eventRatings, setEventRatings] = useState<EventRatingResponse[]>([])
	const [isSending, setIsSending] = useState(false)
	const [currentUserId, setCurrentUserId] = useState<number | null>(null)
	const [currentUserName, setCurrentUserName] = useState<string | null>(null)
	const isEventPast = event && parseEventDate(event.eventDate).isBefore(dayjs())
	const [editingRatingId, setEditingRatingId] = useState<number | null>(null)
	const [editRatingValue, setEditRatingValue] = useState<number>(0)
	const [editRatingComment, setEditRatingComment] = useState<string>('')

	const averageRating = eventRatings.length
		? eventRatings.reduce((acc: number, r: EventRatingResponse) => acc + r.rating, 0) / eventRatings.length
		: null

	const hasRated = !!(currentUserName && eventRatings.some(r => r.userName === currentUserName))

	// fetch user email from backend based on stored access token (similar to ProfilePage)
	useEffect(() => {
		const fetchUserEmail = async () => {
			const token = localStorage.getItem('accessToken')
			if (!token) {
				setUserEmail(null)
				return
			}
			try {
				const { data } = await axiosInstance.get('/auth/user/details', { params: { token } })
				setUserEmail(data.email)
			} catch (err) {
				console.error('❌ Nie udało się pobrać danych użytkownika:', err)
				setUserEmail(null)
			}
		}

		fetchUserEmail()
	}, [])

	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem('accessToken')
			if (!token) return
			try {
					const { data } = await axiosInstance.get('/auth/user', { params: { token } })
					setCurrentUserId(data.id)
					setCurrentUserName(data.name)
					setUserEmail(data.email)
			} catch (err) {
				console.error('❌ Błąd pobierania usera:', err)
			}
		}
		fetchUser()
	}, [])

	const fetchParticipants = async (eventId: number) => {
		try {
			const { data } = await axiosInstance.get<Participant[]>(`/user-event/${eventId}/participants`)
			setParticipants(data || [])
			if (userEmail && data?.some(p => p.userEmail === userEmail)) setJoined(true)
			else setJoined(false)
		} catch (err) {
			console.error('❌ Błąd pobierania uczestników:', err)
			setParticipants([])
		}
	}

	const fetchEventRatings = async () => {
		try {
			const res = await axiosInstance.get(`/ratings/event/${id}`)
			setEventRatings(res.data || [])
		} catch (e) {
			console.error('❌ Błąd pobierania ocen wydarzenia:', e)
			setEventRatings([])
		}
	}

	const handleAddEventRating = async (rating: number, comment: string) => {
		if (!userEmail || !id) return
		setIsSending(true)
		try {
			await axiosInstance.post(`/ratings/event`, {
				userId: currentUserId,
				eventId: parseInt(id),
				rating,
				comment,
			})
			toast.success('Dziękujemy za ocenę wydarzenia!')
			fetchEventRatings()
		} catch {
			toast.error('Nie możesz ocenić tego wydarzenia.')
		} finally {
			setIsSending(false)
		}
	}

	const startEditEventRating = (r: EventRatingResponse) => {
		setEditingRatingId(r.id)
		setEditRatingValue(r.rating)
		setEditRatingComment(r.comment || '')
	}

	const cancelEditEventRating = () => {
		setEditingRatingId(null)
		setEditRatingValue(0)
		setEditRatingComment('')
	}

	const saveEditEventRating = async (ratingId: number) => {
		if (!currentUserId || !id) return
		try {
			const token = localStorage.getItem('accessToken')
			await axiosInstance.put(
				`/ratings/event/${ratingId}`,
				{
					userId: currentUserId,
					eventId: parseInt(id),
					rating: editRatingValue,
					comment: editRatingComment,
				},
				{
					...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
					params: { userId: currentUserId },
				}
			)
			toast.success('Zmieniono ocenę wydarzenia')
			cancelEditEventRating()
			fetchEventRatings()
		} catch (e) {
			toast.error('Nie udało się zaktualizować oceny')
		}
	}

	const deleteEventRating = async (ratingId: number) => {
		try {
			const token = localStorage.getItem('accessToken')
			await axiosInstance.delete(`/ratings/event/${ratingId}`, {
				...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
				params: { userId: currentUserId ?? undefined },
			})
			toast.success('Usunięto ocenę wydarzenia')
			if (editingRatingId === ratingId) cancelEditEventRating()
			fetchEventRatings()
		} catch (e) {
			toast.error('Nie udało się usunąć oceny')
		}
	}

	useEffect(() => {
		if (id) fetchEventRatings()
	}, [id])

	// ---------------- FETCH EVENT + PARTICIPANTS ----------------
	useEffect(() => {
		if (!id) {
			setError('Nieprawidłowy identyfikator wydarzenia')
			setLoading(false)
			return
		}

		const fetchEvent = async () => {
			try {
				const { data } = await axiosInstance.get<EventDetails>(`/event/${id}`)
				setEvent(data)

				await fetchParticipants(Number(id))

				// sprawdź, czy zapisany
				if (userEmail) {
					const savedRes = await axiosInstance.get(`/user-saved-event/by-user-email`, { params: { userEmail } })
					if (savedRes.data?.some?.((s: any) => s.eventId === Number(id))) {
						setSaved(true)
					}
				}
			} catch (err) {
				console.error('❌ Błąd pobierania szczegółów wydarzenia:', err)
				setError('Nie udało się pobrać szczegółów wydarzenia')
			} finally {
				setLoading(false)
			}
		}

		fetchEvent()
	}, [id, userEmail])

	// ---------------- JOIN / LEAVE EVENT ----------------
	const handleJoinEvent = async () => {
		if (!userEmail || !id) return
		try {
			if (joined) {
				await axiosInstance.delete(`/user-event`, {
					data: { userEmail, eventId: Number(id), attendanceStatusId: 1 },
				})
			} else {
				await axiosInstance.post(`/user-event`, {
					userEmail,
					eventId: Number(id),
					attendanceStatusId: 1,
				})
			}
			await fetchParticipants(Number(id))
		} catch (err) {
			console.error('❌ Błąd przy dołączaniu/opuszczaniu wydarzenia:', err)
		}
	}

	// ---------------- SHARE ----------------
	const handleShare = async () => {
		try {
			const url = window.location.href
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(url)
			} else {
				const el = document.createElement('textarea')
				el.value = url
				document.body.appendChild(el)
				el.select()
				document.execCommand('copy')
				document.body.removeChild(el)
			}
			setShowShareToast(true)
			setTimeout(() => setShowShareToast(false), 2000)
		} catch (e) {
			console.error('Nie udało się skopiować linku', e)
		}
	}

	// ---------------- SAVE / UNSAVE EVENT ----------------
	const handleSaveEvent = async () => {
		if (!userEmail || !id) return
		try {
			if (saved) {
				await axiosInstance.delete(`/user-saved-event`, {
					data: { userEmail, eventId: Number(id) },
				})
				setSaved(false)
			} else {
				await axiosInstance.post(`/user-saved-event`, {
					userEmail,
					eventId: Number(id),
				})
				setSaved(true)
			}
		} catch (err) {
			console.error('❌ Błąd przy zapisywaniu/odpinaniu wydarzenia:', err)
		}
	}

	// ---------------- UTILS ----------------
	const formatPrice = (cost: number, currency: string) =>
		new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(cost)

	const formatAddress = (street: string, number: number, secondNumber: number | null, city: string) =>
		`${street} ${secondNumber ? `${number}/${secondNumber}` : number}, ${city}`

	const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

	const getSkillLevelColor = (level?: string) => {
		if (!level) return 'bg-zinc-600/20 text-zinc-300'

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

	// ---------------- LOADING / ERROR ----------------
	if (loading)
		return (
			<div className='min-h-screen grid place-items-center bg-[#1f2632]'>
				<div className='rounded-2xl bg-black/50 px-6 py-5 ring-1 ring-zinc-800 text-zinc-200 flex items-center gap-3'>
					<span className='h-4 w-4 animate-pulse rounded-full bg-violet-500' />
					Ładowanie wydarzenia…
				</div>
			</div>
		)

	if (error || !event)
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

	const spotsLeft = Math.max(0, event.numberOfParticipants - participants.length)
	const progressPercentage = Math.min(100, (participants.length / Math.max(1, event.numberOfParticipants)) * 100)

	// ---------------- UI ----------------
	return (
		<>
			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8 mt-20'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					{/* --- Nagłówek z miniaturą zdjęcia --- */}
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5'>
						<div className='flex flex-col sm:flex-row sm:items-center gap-5'>
							{/* Miniaturka wydarzenia */}
							{event.imageUrl && event.imageUrl.trim() !== '' ? (
								<img
									src={event.imageUrl}
									alt={event.eventName}
									className='h-36 w-36 object-cover rounded-2xl border border-zinc-700 shadow-md bg-zinc-800'
									onError={e => (e.currentTarget.style.display = 'none')}
								/>
							) : (
								<div className='h-36 w-36 flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-400 text-sm'>
									Brak zdjęcia
								</div>
							)}

							{/* Tytuł i szczegóły */}
							<div>
									<h1 className='text-3xl font-semibold text-white'>{event.eventName}</h1>
									{isEventPast && averageRating && (
										<div className='flex items-center gap-2 mt-2'>
											<StarRatingDisplay value={averageRating} size={16} />
											<span className='text-sm text-zinc-300'>({averageRating.toFixed(1)})</span>
										</div>
									)}
								<p className='text-sm text-zinc-400 mt-1'>{formatEventDate(event.eventDate)}</p>
								<p className='text-sm text-zinc-400'>{event.sportObjectName}</p>
							</div>
						</div>

						{/* Akcje */}
						<div className='flex items-center gap-3 self-start sm:self-auto'>
							<button
								onClick={() => setShowShareModal(true)}
								className='inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-white hover:bg-zinc-800'>
								<Share2 size={16} /> Udostępnij
							</button>

							<button
								onClick={handleSaveEvent}
								className='flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-white hover:bg-zinc-800'>
								{saved ? <BookmarkCheck size={18} className='text-violet-400' /> : <Bookmark size={18} />}
								{saved ? 'Zapisano' : 'Zapisz wydarzenie'}
							</button>
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
										<Link
											key={p.id}
											to={`/profile/${p.userId}`}
											className='group flex items-center gap-3 rounded-lg bg-zinc-800/60 px-3 py-2 hover:bg-zinc-800 transition'>
											<Avatar
												src={p.userAvatarUrl || null}
												name={p.userName}
												size='sm'
												className='ring-1 ring-zinc-700 shadow-sm'
											/>
											<div className='text-sm'>
												<div className='font-medium text-white leading-tight'>
													{p.userEmail === userEmail ? `${p.userName} (Ty)` : p.userName}
												</div>
												{p.skillLevel && (
													<div
														className={`mt-0.5 inline-block rounded px-2 py-0.5 text-[10px] ${getSkillLevelColor(
															p.skillLevel
														)}`}>
														{p.skillLevel}
													</div>
												)}
											</div>
										</Link>
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
							{/* --- Oceny wydarzenia --- */}
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 mt-8'>
								<h3 className='text-white text-lg font-semibold mb-3'>Oceny wydarzenia</h3>

								{/* Formularz oceny tylko jeśli użytkownik brał udział */}
								{joined && isEventPast && !hasRated && (
									<EventRatingForm onSubmit={handleAddEventRating} disabled={isSending} />
								)}

								{joined && !isEventPast && (
									<p className='text-sm text-zinc-400 italic mt-3'>
										Możesz ocenić wydarzenie dopiero po jego zakończeniu.
									</p>
								)}

								{joined && isEventPast && hasRated && (
									<p className='text-sm text-emerald-300 italic mt-3'>Dziękujemy! Już oceniłeś to wydarzenie.</p>
								)}

								{/* Lista ocen */}
									{eventRatings.length ? (
										<ul className='space-y-3 mt-6'>
											{eventRatings.map(r => {
												const participant = participants.find(p => p.userName === r.userName)
												const isMine = currentUserName && r.userName === currentUserName
													const isEditing = editingRatingId === r.id
													return (
														<li key={r.id}>
															{isEditing ? (
																<div className='bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 mt-2 space-y-2'>
																	<StarRatingInput value={editRatingValue} onChange={setEditRatingValue} />
																	<textarea className='w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-zinc-200' value={editRatingComment} onChange={e => setEditRatingComment(e.target.value)} placeholder='Komentarz (opcjonalnie)' />
																	<div className='flex gap-2'>
																		<button className='px-3 py-1 rounded-md bg-violet-600 text-white text-sm hover:bg-violet-500' onClick={() => saveEditEventRating(r.id)}>Zapisz</button>
																		<button className='px-3 py-1 rounded-md bg-zinc-700 text-zinc-200 text-sm hover:bg-zinc-600' onClick={cancelEditEventRating}>Anuluj</button>
																	</div>
																</div>
															) : (
																<RatingCard
																	rating={r.rating}
																	comment={r.comment}
																	raterName={r.userName}
																	raterAvatarUrl={participant?.userAvatarUrl || undefined}
																	raterEmail={participant?.userEmail}
																	createdAt={r.createdAt}
																	isMine={!!isMine}
																	onEdit={() => startEditEventRating(r)}
																	onDelete={() => deleteEventRating(r.id)}
																/>
															)}
														</li>
													)
											})}
										</ul>
									) : (
									<p className='text-zinc-500 text-sm italic mt-4'>Brak ocen dla tego wydarzenia.</p>
								)}
							</div>
						</section>

						{/* Sidebar */}
						<aside className='space-y-6 lg:sticky lg:top-6'>
							{/* Akcja dołączenia */}
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								{event.status?.toLowerCase() === 'planned' && spotsLeft > 0 ? (
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
									<Avatar
										src={event.ownerAvatarUrl || null}
										name={event.ownerName}
										size='sm'
										className='ring-2 ring-zinc-700 shadow-md'
									/>
									<div>
										<div className='font-medium text-white'>{event.ownerName}</div>
										<div className='text-xs text-zinc-400'>Organizator</div>
									</div>
								</div>

								<div className='mt-4 space-y-2'>
									<button className='w-full rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 inline-flex items-center justify-center gap-2'>
										<MessageCircle size={16} /> Wyślij wiadomość
									</button>
									<Link
										to={`/profile/${event.ownerId}`}
										className='w-full rounded-xl bg-transparent px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 ring-1 ring-zinc-700 inline-flex items-center justify-center gap-2'>
										<UserRound size={16} /> Zobacz profil
									</Link>
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
		</>
	)
}

export default EventPage
