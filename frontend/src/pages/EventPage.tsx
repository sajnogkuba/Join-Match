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
import { getCookie } from '../utils/cookies'
import type { EventRatingResponse } from '../Api/types/Rating'
import ReportEventModal from '../components/ReportEventModal'
import ReportRatingModal from '../components/ReportRatingModal'
import AlertModal from '../components/AlertModal'
import InviteToEventModal from '../components/InviteToEventModal'
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
	Flag,
	Check,
	X,
	CheckCircle,
	XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { showRatingToast } from '../components/RatingToast'

dayjs.locale('pl')

const EventPage: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const [showReportModal, setShowReportModal] = useState(false)
	const [isSendingReport, setIsSendingReport] = useState(false)

	const [showRatingReportModal, setShowRatingReportModal] = useState(false)
	const [ratingToReport, setRatingToReport] = useState<EventRatingResponse | null>(null)
	const [isSendingRatingReport, setIsSendingRatingReport] = useState(false)

	const [event, setEvent] = useState<EventDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [userEmail, setUserEmail] = useState<string | null>(null)

	const [participants, setParticipants] = useState<Participant[]>([])
	const confirmedParticipants = participants.filter(p => p.attendanceStatusName === 'Zapisany')
	const pendingParticipants = participants.filter(p => p.attendanceStatusName === 'Oczekujący')
	const isInvited = participants.some(p => p.userEmail === userEmail && p.attendanceStatusName === 'Zaproszony')
	const isPending = participants.some(p => p.userEmail === userEmail && p.attendanceStatusName === 'Oczekujący')
	const isRejected = participants.some(p => p.userEmail === userEmail && p.attendanceStatusName === 'Odrzucony')

	const visibleParticipantsCount = confirmedParticipants.length

	const [joined, setJoined] = useState(false)
	const [saved, setSaved] = useState(false)

	const [showShareModal, setShowShareModal] = useState(false)
	const [showDetailsAccordion, setShowDetailsAccordion] = useState(false)
	const [showParticipants, setShowParticipants] = useState(false)
	const [showInviteModal, setShowInviteModal] = useState(false)
	const [isSendingInvite, setIsSendingInvite] = useState(false)

	const [eventRatings, setEventRatings] = useState<EventRatingResponse[]>([])
	const [isSending, setIsSending] = useState(false)
	const [currentUserId, setCurrentUserId] = useState<number | null>(null)
	const [currentUserName, setCurrentUserName] = useState<string | null>(null)
	const isEventPast = event && parseEventDate(event.eventDate).isBefore(dayjs())
	const [editingRatingId, setEditingRatingId] = useState<number | null>(null)
	const [editRatingValue, setEditRatingValue] = useState<number>(0)
	const [editRatingComment, setEditRatingComment] = useState<string>('')
	const [hasRatedOrganizer, setHasRatedOrganizer] = useState(false)
	const [showBannedAlert, setShowBannedAlert] = useState(false)

	const averageRating = eventRatings.length
		? eventRatings.reduce((acc: number, r: EventRatingResponse) => acc + r.rating, 0) / eventRatings.length
		: null

	const hasRated = !!(currentUserName && eventRatings.some(r => r.userName === currentUserName))

	const getSkillLevelValue = (level?: string) => {
		switch (level?.toLowerCase()) {
			case 'amator':
				return 1
			case 'rekreacyjny':
				return 2
			case 'średniozaawansowany':
				return 3
			case 'zaawansowany':
				return 4
			case 'profesjonalista':
				return 5
			default:
				return 1
		}
	}

	// --- HANDLER: ZGŁOSZENIE WYDARZENIA ---
	const handleSubmitReport = async (message: string) => {
		if (!id) return

		const token = getCookie('accessToken')
		if (!token) {
			toast.error('Musisz być zalogowany, aby zgłosić wydarzenie.')
			return
		}

		try {
			setIsSendingReport(true)

			await axiosInstance.post('/event/report/event', {
				token,
				idEvent: Number(id),
				description: message,
			})

			toast.success('Dziękujemy, zgłoszenie zostało wysłane do moderacji.')
			setShowReportModal(false)
		} catch (e: any) {
			console.error('❌ Błąd wysyłania zgłoszenia wydarzenia:', e)
			if (e?.response?.status === 400) {
				toast.error('Nie udało się wysłać zgłoszenia (400).')
			} else {
				toast.error('Nie udało się wysłać zgłoszenia.')
			}
		} finally {
			setIsSendingReport(false)
		}
	}

	const handleSubmitRatingReport = async (message: string) => {
		if (!ratingToReport) return

		const token = getCookie('accessToken')
		if (!token) {
			toast.error('Musisz być zalogowany, aby zgłosić ocenę.')
			return
		}

		try {
			setIsSendingRatingReport(true)
			await axiosInstance.post('/ratings/report/eventRating', {
				token,
				idEventRating: ratingToReport.id,
				description: message,
			})

			toast.success('Dziękujemy, zgłoszenie oceny zostało wysłane do moderacji.')
			setShowRatingReportModal(false)
			setRatingToReport(null)
		} catch (e: any) {
			console.error('❌ Błąd wysyłania zgłoszenia oceny wydarzenia:', e)
			if (e?.response?.status === 400) {
				toast.error('Nie udało się wysłać zgłoszenia (400).')
			} else {
				toast.error('Nie udało się wysłać zgłoszenia oceny.')
			}
		} finally {
			setIsSendingRatingReport(false)
		}
	}

	const handleAcceptInvitation = async () => {
		if (!userEmail || !id) return
		try {
			await axiosInstance.post('/user-event/invitation/accept', {
				userEmail,
				eventId: Number(id),
			})
			toast.success('Zaproszenie przyjęte! Witamy w wydarzeniu.')
			await fetchParticipants(Number(id))
		} catch (err) {
			console.error('❌ Błąd akceptacji zaproszenia:', err)
			toast.error('Nie udało się zaakceptować zaproszenia.')
		}
	}

	const handleDeclineInvitation = async () => {
		if (!userEmail || !id) return
		try {
			await axiosInstance.post('/user-event/invitation/decline', {
				userEmail,
				eventId: Number(id),
			})
			toast.success('Zaproszenie odrzucone.')
			await fetchParticipants(Number(id))
		} catch (err) {
			console.error('❌ Błąd odrzucania zaproszenia:', err)
			toast.error('Nie udało się odrzucić zaproszenia.')
		}
	}

	const openRatingReportModal = (rating: EventRatingResponse) => {
		setRatingToReport(rating)
		setShowRatingReportModal(true)
	}

	useEffect(() => {
		const checkOrganizerRated = async () => {
			if (!currentUserId || !event?.ownerId || !id) return
			try {
				const { data } = await axiosInstance.get(`/ratings/${event.ownerId}`)
				const eventIdNum = parseInt(id)
				const already = Array.isArray(data)
					? data.some((r: any) => Number(r.eventId) === eventIdNum && Number(r.raterId) === Number(currentUserId))
					: false
				setHasRatedOrganizer(already)
			} catch (e) {
				console.error('❌ Błąd sprawdzania oceny organizatora:', e)
			}
		}

		checkOrganizerRated()
	}, [currentUserId, event?.ownerId, id])

	// fetch user email from backend based on stored access token (similar to ProfilePage)
	useEffect(() => {
		const fetchUserEmail = async () => {
			const token = getCookie('accessToken')
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
			const token = getCookie('accessToken')
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
			if (userEmail && data?.some(p => p.userEmail === userEmail && p.attendanceStatusName === 'Zapisany'))
				setJoined(true)
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
			console.log('EVENT RATINGS:', res.data)
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
			showRatingToast({ type: 'add', target: 'wydarzenia' })
			fetchEventRatings()
		} catch (e: any) {
			const raw = e?.response?.data?.message ?? e?.response?.data ?? e?.message ?? ''
			const msg = typeof raw === 'string' ? raw.toLowerCase() : ''
			if (msg.includes('already rated')) {
				setHasRatedOrganizer(true)
				toast.info('Już oceniłeś tego organizatora — ukrywam formularz.')
			} else {
				toast.error('Nie możesz ocenić tego organizatora.')
			}
		} finally {
			setIsSending(false)
		}
	}

	const handleOpenInMaps = () => {
		if (!event) return

		const { latitude, longitude, street, number, city } = event

		if (street && city) {
			const address = encodeURIComponent(`${street} ${number ?? ''}, ${city}`)
			const url = `https://www.google.com/maps/search/?api=1&query=${address}`
			window.open(url, '_blank')
		} else if (latitude && longitude) {
			const url = `https://www.google.com/maps?q=${latitude},${longitude}`
			window.open(url, '_blank')
		} else {
			toast.error('Brak danych lokalizacji dla tego obiektu')
		}
	}

	const handleApproveUser = async (userId: number) => {
		try {
			await axiosInstance.post(`/user-event/${id}/approve`, null, {
				params: { userId },
			})
			toast.success('Użytkownik zaakceptowany!')
			fetchParticipants(Number(id))
		} catch (err) {
			console.error('❌ Błąd akceptacji:', err)
			toast.error('Nie udało się zaakceptować użytkownika.')
		}
	}

	const handleRejectUser = async (userId: number) => {
		try {
			await axiosInstance.post(`/user-event/${id}/reject`, null, {
				params: { userId },
			})
			toast.success('Użytkownik odrzucony.')
			fetchParticipants(Number(id))
		} catch (err) {
			console.error('❌ Błąd odrzucania:', err)
			toast.error('Nie udało się odrzucić użytkownika.')
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

	const handleSystemShare = async () => {
		if (!event) return
		const shareData = {
			title: event.eventName,
			text: `Dołącz do mojego wydarzenia "${event.eventName}"!\n📅 ${formatEventDate(
				event.eventDate
			)}\n\nSprawdź szczegóły:`,
			url: window.location.href,
		}

		try {
			if (navigator.share) {
				await navigator.share(shareData)
			} else {
				await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
				toast.info('Link do wydarzenia został skopiowany 📋')
			}
		} catch (err) {
			console.error('❌ Nie udało się udostępnić wydarzenia:', err)
			toast.error('Nie udało się udostępnić wydarzenia')
		}
	}

	const saveEditEventRating = async (ratingId: number) => {
		if (!currentUserId || !id) return
		try {
			const token = getCookie('accessToken')
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
			showRatingToast({ type: 'update', target: 'wydarzenia' })
			cancelEditEventRating()
			fetchEventRatings()
		} catch (e) {
			toast.error('Nie udało się zaktualizować oceny')
		}
	}

	const deleteEventRating = async (ratingId: number) => {
		try {
			const token = getCookie('accessToken')
			await axiosInstance.delete(`/ratings/event/${ratingId}`, {
				...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
				params: { userId: currentUserId ?? undefined },
			})
			showRatingToast({ type: 'delete', target: 'wydarzenia' })
			if (editingRatingId === ratingId) cancelEditEventRating()
			fetchEventRatings()
		} catch (e) {
			toast.error('Nie udało się usunąć oceny')
		}
	}

	useEffect(() => {
		if (id) fetchEventRatings()
	}, [id])

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

				if (data.isBanned) {
					setShowBannedAlert(true)
					setLoading(false)
					return
				}

				await fetchParticipants(Number(id))

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

	const handleJoinEvent = async () => {
		if (!userEmail || !id) return
		if (isEventPast) return // Nie można dołączać/opuszczać zakończonych wydarzeń
		try {
			if (joined || isPending) {
				await axiosInstance.delete(`/user-event`, {
					data: { userEmail, eventId: Number(id) },
				})
			} else {
				await axiosInstance.post(`/user-event/request`, {
					userEmail,
					eventId: Number(id),
				})
			}

			await fetchParticipants(Number(id))
		} catch (err) {
			console.error('❌ Błąd przy dołączaniu/opuszczaniu wydarzenia:', err)
		}
	}

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
		} catch (e) {
			console.error('Nie udało się skopiować linku', e)
		}
	}

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

	const handleMessageOrganizer = async () => {
		if (!currentUserId || !event?.ownerId) return
		try {
			const token = getCookie('accessToken')
			const res = await axiosInstance.post(
				`/conversations/direct?user1Id=${currentUserId}&user2Id=${event.ownerId}`,
				null,
				{
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				}
			)
			const conversationId = res.data?.id || res.data?.conversationId
			navigate('/chat', { state: { conversationId, targetUserId: event.ownerId } })
		} catch (err) {
			console.error('❌ Błąd przy otwieraniu czatu z organizatorem:', err)
			toast.error('Nie udało się otworzyć czatu z organizatorem.')
		}
	}

	const handleSendInvite = async (targetEmail: string) => {
		if (!id || !currentUserId) return

		try {
			setIsSendingInvite(true)

			await axiosInstance.post('/user-event/invite', {
				senderId: currentUserId,
				targetEmail,
				eventId: Number(id),
			})

			toast.success('Zaproszenie wysłane!')
			setShowInviteModal(false)
		} catch (err) {
			console.error('❌ Błąd wysyłania zaproszenia:', err)
			toast.error('Nie udało się wysłać zaproszenia.')
		} finally {
			setIsSendingInvite(false)
		}
	}

	const formatPrice = (cost: number, currency: string) =>
		new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(cost)

	const formatAddress = (street: string, number: number, secondNumber: number | null, city: string) =>
		`${street} ${secondNumber ? `${number}/${secondNumber}` : number}, ${city}`

	const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

	const getSkillLevelColor = (level?: string) => {
		if (!level) return 'bg-zinc-600/20 text-zinc-300'

		switch (level.toLowerCase()) {
			case 'amator':
			case 'niski':
				return 'bg-emerald-500/15 text-emerald-300'
			case 'rekreacyjny':
			case 'średni':
				return 'bg-amber-500/15 text-amber-300'
			case 'średniozaawansowany':
			case 'zaawansowany':
			case 'wysoki':
				return 'bg-rose-500/15 text-rose-300'
			case 'profesjonalista':
				return 'bg-violet-500/15 text-violet-300'
			default:
				return 'bg-zinc-600/20 text-zinc-300'
		}
	}

	const handleTogglePayment = async (participantId: number, currentStatus: boolean, e: React.MouseEvent) => {
		e.preventDefault()
		if (!id || !currentUserId || event?.ownerId !== currentUserId) return

		try {
			const token = getCookie('accessToken')
			await axiosInstance.patch(`/user-event/${id}/participant/${participantId}/payment`, null, {
				params: { token },
			})

			setParticipants(prev => prev.map(p => (p.userId === participantId ? { ...p, isPaid: !currentStatus } : p)))

			toast.success(currentStatus ? 'Oznaczono jako nieopłacone' : 'Oznaczono jako opłacone')
		} catch (err) {
			console.error('Błąd zmiany statusu płatności:', err)
			toast.error('Nie udało się zmienić statusu płatności')
		}
	}

	if (loading)
		return (
			<div className='min-h-screen grid place-items-center bg-[#1f2632]'>
				<div className='rounded-2xl bg-black/50 px-6 py-5 ring-1 ring-zinc-800 text-zinc-200 flex items-center gap-3'>
					<span className='h-4 w-4 animate-pulse rounded-full bg-violet-500' />
					Ładowanie wydarzenia…
				</div>
			</div>
		)

	if (event?.isBanned || showBannedAlert)
		return (
			<>
				<div className='min-h-screen bg-[#1f2632]' />
				<AlertModal
					isOpen={true}
					onClose={() => {
						setShowBannedAlert(false)
						navigate(-1)
					}}
					title='Wydarzenie zbanowane'
					message='Niestety to wydarzenie zostało zablokowane, więc nie można wyświetlić jego szczegółów.'
					variant='error'
				/>
			</>
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

	const spotsLeft = Math.max(0, event.numberOfParticipants - confirmedParticipants.length)
	const progressPercentage = Math.min(
		100,
		(confirmedParticipants.length / Math.max(1, event.numberOfParticipants)) * 100
	)

	return (
		<>
			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8 mt-20'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5'>
						<div className='flex flex-col sm:flex-row sm:items-center gap-5'>
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

							{joined && isEventPast && hasRatedOrganizer && (
								<p className='text-sm text-emerald-300 italic mt-3'>Dziękujemy! Już oceniłeś tego organizatora.</p>
							)}

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
						<section className='lg:col-span-2 space-y-6'>
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<div className='mb-3 flex items-center justify-between'>
									<h3 className='text-white text-lg font-semibold'>Zapełnienie wydarzenia</h3>
									<span className='text-violet-300 font-semibold'>
										{confirmedParticipants.length}/{event.numberOfParticipants}
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

							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<div className='mb-4 flex items-center justify-between'>
									<h3 className='text-white text-lg font-semibold'>Uczestnicy ({visibleParticipantsCount})</h3>
									<button
										onClick={() => setShowParticipants(s => !s)}
										className='inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200'>
										{showParticipants ? 'Ukryj' : 'Zobacz wszystkich'}
										<ChevronDown size={16} className={`transition-transform ${showParticipants ? 'rotate-180' : ''}`} />
									</button>
								</div>

								{currentUserId === event?.ownerId && (
									<button
										onClick={() => setShowInviteModal(true)}
										className='inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200 ml-auto mb-3'>
										+ Zaproś uczestnika
									</button>
								)}

								{/* Pending participants - visible only to organizer */}
								{currentUserId === event?.ownerId && pendingParticipants.length > 0 && (
									<div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 mb-4'>
										<h4 className='text-white font-semibold mb-3'>
											Oczekujący na akceptację ({pendingParticipants.length})
										</h4>
										<div className='space-y-3'>
											{pendingParticipants.map(p => (
												<div key={p.id} className='flex items-center justify-between bg-zinc-800/40 p-3 rounded-xl'>
													<div className='flex items-center gap-3'>
														<Avatar src={p.userAvatarUrl || null} name={p.userName} size='sm' />
														<div>
															<p className='text-white font-medium'>{p.userName}</p>
															<p className='text-xs text-zinc-400'>{p.userEmail}</p>
														</div>
													</div>

													<div className='flex gap-2'>
														<button
															onClick={() => handleApproveUser(p.userId)}
															className='px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-500'>
															Akceptuj
														</button>
														<button
															onClick={() => handleRejectUser(p.userId)}
															className='px-3 py-1 rounded-lg bg-rose-600 text-white text-sm hover:bg-rose-500'>
															Odrzuć
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								<div className='mb-2 flex flex-col gap-2'>
									{confirmedParticipants.slice(0, showParticipants ? confirmedParticipants.length : 8).map(p => (
										<Link
											key={p.id}
											to={`/profile/${p.userId}`}
											className='group flex items-center justify-between rounded-lg bg-zinc-800/60 px-3 py-2 hover:bg-zinc-800 transition'>
											{/* Lewa strona: Avatar i Info */}
											<div className='flex items-center gap-3'>
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
													<div className='mt-1 flex items-center gap-2'>
														{p.sportRating && (
															<div className='flex items-center gap-1.5' title={`Poziom zaawansowania w ${event.sportTypeName}: ${p.sportRating}/5`}>
																<StarRatingDisplay value={p.sportRating} size={14} max={5} />
																<span className='text-xs text-zinc-400'>{event.sportTypeName}</span>
															</div>
														)}
														{p.skillLevel && (
															<div
																className={`inline-block rounded px-2 py-0.5 text-[10px] ${getSkillLevelColor(
																	p.skillLevel
																)}`}>
																{p.skillLevel}
															</div>
														)}
													</div>
												</div>
											</div>

											{event.cost > 0 && (
												<div
													onClick={e => {
														if (currentUserId === event.ownerId) {
															handleTogglePayment(p.userId, p.isPaid, e)
														} else {
															e.preventDefault()
														}
													}}
													className={`
        flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium select-none
        transition-all
        ${currentUserId === event.ownerId ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
        ${
					p.isPaid
						? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
						: 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
				}
      `}>
													{p.isPaid ? (
														<>
															<CheckCircle size={14} className='shrink-0' />
															<span>Opłacone</span>
														</>
													) : (
														<>
															<XCircle size={14} className='shrink-0' />
															<span>Nieopłacone</span>
														</>
													)}
												</div>
											)}
										</Link>
									))}
								</div>

								{!showParticipants && participants.length > 8 && (
									<p className='text-center text-xs text-zinc-400'>i {participants.length - 8} więcej…</p>
								)}
							</div>

							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<h3 className='text-white text-lg font-semibold mb-3'>Czat wydarzenia</h3>
								<p className='text-sm text-zinc-400 mb-4'>
									Rozmawiaj z innymi uczestnikami wydarzenia w dedykowanym czacie grupowym.
								</p>
								{joined || currentUserId === event.ownerId ? (
									<button
										onClick={async () => {
											if (!id) return
											try {
												const res = await axiosInstance.post(`/event/${id}`)
												const conversationId = res.data?.id
												if (conversationId) {
													navigate('/chat', { state: { conversationId } })
												} else {
													toast.error('Nie udało się otworzyć czatu.')
												}
											} catch (e) {
												console.error('❌ Błąd przy otwieraniu czatu wydarzenia:', e)
												toast.error('Nie udało się otworzyć czatu wydarzenia.')
											}
										}}
										className='w-full rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-sm font-medium transition flex items-center justify-center gap-2'>
										<MessageCircle size={16} />
										Przejdź do czatu wydarzenia
									</button>
								) : (
									<p className='text-sm text-zinc-400 italic'>
										Musisz najpierw dołączyć do wydarzenia, aby zobaczyć czat.
									</p>
								)}
							</div>

							<div className='grid grid-cols-2 gap-4'>
								{/* CENA */}
								<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
									<p className='text-xs text-zinc-400'>Cena</p>
									<p className='mt-1 text-white text-lg font-semibold'>{formatPrice(event.cost, event.currency)}</p>
								</div>

								{/* PŁATNOŚĆ */}
								<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
									<p className='text-xs text-zinc-400'>Płatność</p>
									<p className='mt-1 text-white text-sm font-semibold wrap-break-word'>
										{event.cost === 0
											? 'Wydarzenie darmowe'
											: event.paymentMethods && event.paymentMethods.length > 0
											? event.paymentMethods.join(', ')
											: 'Nie określono'}
									</p>
								</div>

								{/* WIDOCZNOŚĆ */}
								<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
									<p className='text-xs text-zinc-400'>Widoczność</p>
									<p className='mt-1 text-white text-lg font-semibold'>{capitalizeFirst(event.eventVisibilityName)}</p>
								</div>

								{/* POZIOM TRUDNOŚCI */}
								<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
									<p className='text-xs text-zinc-400'>Wymagany poziom</p>

									<div className='flex flex-col gap-2 mt-2'>
										{/* Plakietka z nazwą i kolorem */}
										<div
											className={`self-start inline-block rounded px-2 py-1 text-sm font-medium ${getSkillLevelColor(
												event.skillLevel
											)}`}>
											{event.skillLevel}
										</div>

										{/* Twój komponent gwiazdek */}
										<div title={`${getSkillLevelValue(event.skillLevel)}/5`}>
											<StarRatingDisplay value={getSkillLevelValue(event.skillLevel)} size={18} max={5} />
										</div>
									</div>
								</div>
							</div>

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
								<button
									onClick={handleOpenInMaps}
									className='mt-4 w-full rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
									Wyznacz trasę
								</button>
							</div>

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
										<p className='whitespace-pre-line'>
											{event.description ? event.description : 'Organizator nie dodał opisu dla tego wydarzenia.'}
										</p>
									</div>
								)}
							</div>

							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 mt-8'>
								<h3 className='text-white text-lg font-semibold mb-3'>Oceny wydarzenia</h3>

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
															<textarea
																className='w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-zinc-200'
																value={editRatingComment}
																onChange={e => setEditRatingComment(e.target.value)}
																placeholder='Komentarz (opcjonalnie)'
															/>
															<div className='flex gap-2'>
																<button
																	className='px-3 py-1 rounded-md bg-violet-600 text-white text-sm hover:bg-violet-500'
																	onClick={() => saveEditEventRating(r.id)}>
																	Zapisz
																</button>
																<button
																	className='px-3 py-1 rounded-md bg-zinc-700 text-zinc-200 text-sm hover:bg-zinc-600'
																	onClick={cancelEditEventRating}>
																	Anuluj
																</button>
															</div>
														</div>
													) : (
														<>
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
																raterId={r.id}
															/>
															<div className='mt-2 flex justify-end'>
																<button
																	type='button'
																	onClick={() => openRatingReportModal(r)}
																	className='inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200'>
																	<Flag size={12} />
																	Zgłoś ocenę
																</button>
															</div>
														</>
													)}
												</li>
											)
										})}
									</ul>
								) : (
									<p className='text-zinc-500 text-sm italic mt-4'>Brak ocen dla tego wydarzenia.</p>
								)}
							</div>

							{joined && isEventPast && !hasRatedOrganizer && currentUserId !== event.ownerId && (
								<EventRatingForm
									title='Oceń organizatora'
									onSubmit={async (rating, comment) => {
										if (!currentUserId || !event?.ownerId) return
										setIsSending(true)
										try {
											await axiosInstance.post('/ratings', {
												raterId: currentUserId,
												organizerId: event.ownerId,
												rating,
												comment,
												eventId: parseInt(id!),
											})
											showRatingToast({ type: 'add', target: 'organizatora' })
											setHasRatedOrganizer(true)
										} catch (e: any) {
											const raw = e?.response?.data?.message ?? e?.response?.data ?? e?.message ?? ''
											const msg = typeof raw === 'string' ? raw.toLowerCase() : ''
											if (msg.includes('already rated')) {
												setHasRatedOrganizer(true)
												toast.info('Już oceniłeś tego organizatora — ukrywam formularz.')
											} else {
												toast.error('Nie możesz ocenić tego organizatora.')
											}
										} finally {
											setIsSending(false)
										}
									}}
									disabled={isSending}
								/>
							)}

							{!joined && (
								<p className='text-sm text-zinc-400 italic mt-3'>
									Możesz ocenić organizatora tylko, jeśli uczestniczyłeś w wydarzeniu.
								</p>
							)}

							{joined && !isEventPast && (
								<p className='text-sm text-zinc-400 italic mt-3'>
									Ocenić organizatora możesz dopiero po zakończeniu wydarzenia.
								</p>
							)}
						</section>

						<aside className='space-y-6 lg:sticky lg:top-6'>
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								{isEventPast ? (
									<button disabled className='w-full rounded-2xl bg-zinc-700 px-4 py-3 font-semibold text-zinc-400'>
										Zakończone
									</button>
								) : event.status?.toLowerCase() === 'planned' && spotsLeft > 0 ? (
									// If the current user was invited, show accept/decline UI
									isInvited ? (
										<div className='space-y-3'>
											<div className='rounded-xl bg-violet-500/10 border border-violet-500/30 p-3 text-center'>
												<p className='text-violet-200 text-sm font-medium'>
													Organizator zaprosił Cię do tego wydarzenia!
												</p>
											</div>
											<div className='grid grid-cols-2 gap-3'>
												<button
													onClick={handleAcceptInvitation}
													className='flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500 transition'>
													<Check size={18} /> Przyjmij
												</button>
												<button
													onClick={handleDeclineInvitation}
													className='flex items-center justify-center gap-2 rounded-xl bg-zinc-700 px-4 py-3 font-semibold text-white hover:bg-zinc-600 transition'>
													<X size={18} /> Odrzuć
												</button>
											</div>
										</div>
									) : // 2. NOWE: Czy ODRZUCONY
									isRejected ? (
										<div className='w-full rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-center'>
											<p className='text-red-400 text-sm font-medium'>
												Twoje zgłoszenie zostało odrzucone przez organizatora.
											</p>
										</div>
									) : // 3. Reszta starej logiki (Oczekujący / Dołącz)
									isPending ? (
										<button disabled className='w-full rounded-2xl bg-zinc-700 px-4 py-3 text-zinc-400'>
											Twoja prośba oczekuje na akceptację…
										</button>
									) : (
										<button
											onClick={handleJoinEvent}
											className={`w-full rounded-2xl px-4 py-3 text-white font-semibold transition ${
												joined
													? 'bg-rose-600 hover:bg-rose-500'
													: 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/30'
											}`}>
											{joined ? 'Opuść wydarzenie' : 'Dołącz do wydarzenia'}
										</button>
									)
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

							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<h3 className='text-white text-lg font-semibold mb-4'>Sport</h3>
								<div className='flex items-center gap-4'>
									{event.sportTypeURL ? (
										<img
											src={event.sportTypeURL}
											alt={event.sportTypeName}
											className='h-16 w-16 rounded-xl object-cover border border-zinc-700 shadow-md'
											onError={e => {
												e.currentTarget.style.display = 'none'
												const fallback = e.currentTarget.nextElementSibling as HTMLElement
												if (fallback) fallback.style.display = 'flex'
											}}
										/>
									) : null}
									<div
										className={`flex items-center justify-center h-16 w-16 rounded-xl border border-zinc-700 bg-zinc-800/50 ${
											event.sportTypeURL ? 'hidden' : ''
										}`}
										style={{ display: event.sportTypeURL ? 'none' : 'flex' }}>
										<span className='text-2xl'>{event.sportTypeName}</span>
									</div>
									<div>
										<div className='font-semibold text-white text-lg'>{event.sportTypeName.charAt(0).toUpperCase() + event.sportTypeName.slice(1)}</div>
									</div>
								</div>
							</div>

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
									{currentUserId !== event.ownerId && (
										<button
											onClick={handleMessageOrganizer}
											className='w-full rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 inline-flex items-center justify-center gap-2'>
											<MessageCircle size={16} /> Wyślij wiadomość
										</button>
									)}

									<Link
										to={`/profile/${event.ownerId}`}
										className='w-full rounded-xl bg-transparent px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 ring-1 ring-zinc-700 inline-flex items-center justify-center gap-2'>
										<UserRound size={16} /> Zobacz profil
									</Link>
								</div>
							</div>

							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<h3 className='text-white text-lg font-semibold'>Akcje</h3>
								<div className='mt-4 space-y-3'>
									<button
										onClick={handleSaveEvent}
										className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
										{saved ? <BookmarkCheck size={16} className='text-violet-400' /> : <Bookmark size={16} />}
										{saved ? 'Zapisano wydarzenie' : 'Zapisz wydarzenie'}
									</button>
									<button
										onClick={() => setShowInviteModal(true)}
										className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
										<UserRound size={16} /> Zaproś do wydarzenia
									</button>
									<button className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
										<CalendarDays size={16} /> Dodaj do kalendarza
									</button>
									<button
										onClick={() => setShowReportModal(true)}
										className='w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm text-rose-300 ring-1 ring-rose-700/40 hover:bg-rose-500/10'>
										<AlertTriangle size={16} /> Zgłoś wydarzenie
									</button>
								</div>
							</div>
						</aside>
					</div>
				</div>
			</main>

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
								className='grid place-items-center rounded-xl bg-[#1877F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition'>
								Facebook
							</a>

							<button
								onClick={handleSystemShare}
								className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 transition'>
								<Share2 size={16} /> Udostępnij wydarzenie
							</button>
						</div>
					</div>
				</div>
			)}

			{showReportModal && event && (
				<ReportEventModal
					isOpen={showReportModal}
					onClose={() => setShowReportModal(false)}
					event={event}
					onSubmit={handleSubmitReport}
					isSubmitting={isSendingReport}
				/>
			)}

			{showInviteModal && (
				<InviteToEventModal
					isOpen={showInviteModal}
					onClose={() => setShowInviteModal(false)}
					onSubmit={handleSendInvite}
					isSubmitting={isSendingInvite}
					eventId={event.eventId}
				/>
			)}

			{showRatingReportModal && ratingToReport && (
				<ReportRatingModal
					isOpen={showRatingReportModal}
					onClose={() => {
						setShowRatingReportModal(false)
						setRatingToReport(null)
					}}
					rating={{
						id: ratingToReport.id,
						userName: ratingToReport.userName,
						raterAvatarUrl: participants.find(p => p.userName === ratingToReport.userName)?.userAvatarUrl ?? undefined,
						rating: ratingToReport.rating,
						comment: ratingToReport.comment,
					}}
					onSubmit={handleSubmitRatingReport}
					isSubmitting={isSendingRatingReport}
				/>
			)}
		</>
	)
}

export default EventPage
