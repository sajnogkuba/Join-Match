import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import dayjs, { Dayjs } from 'dayjs'
import { MapPin, CalendarDays, Users, Loader2, AlertTriangle } from 'lucide-react'
import api from '../Api/axios'

type EventStatus = 'PLANNED' | 'CANCELED' | 'FINISHED'
type EventDateWire = number[] | string | Date

interface ParticipatedEvent {
	eventId: number
	eventName: string
	numberOfParticipants: number
	cost: number
	ownerId: number
	sportObjectName: string
	eventVisibilityId: number
	status: EventStatus
	scoreTeam1: number | null
	scoreTeam2: number | null
	eventDate: EventDateWire
	sportTypeName: string
	bookedParticipants?: number
	minLevel: number
	imageUrl: string | null
	isBanned?: boolean
}

type ParticipatedEventsPageResponse = {
	content: ParticipatedEvent[]
	totalElements: number
	totalPages: number
	number: number
	size: number
	first: boolean
	last: boolean
	numberOfElements: number
	empty: boolean
}

function normalizeEventDate(d: EventDateWire): Dayjs {
	if (Array.isArray(d)) {
		const [y, m, day, h = 0, min = 0] = d
		return dayjs(new Date(y, (m ?? 1) - 1, day, h, min))
	}
	return dayjs(d)
}

const MyParticipationsSection: React.FC = () => {
	const [events, setEvents] = useState<ParticipatedEvent[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [confirmedCounts, setConfirmedCounts] = useState<Record<number, number>>({})
	const [hasNext, setHasNext] = useState(false)
	const observerTarget = useRef<HTMLDivElement>(null)
	const currentPageRef = useRef(0)

	const fetchEvents = useCallback(async (pageNum: number, append: boolean = false) => {
		if (append) {
			setLoadingMore(true)
		} else {
			setLoading(true)
		}

		try {
			const { data } = await api.get<ParticipatedEventsPageResponse>('/event/byParticipant', {
				params: {
					page: pageNum,
					size: 12,
					sortBy: 'eventDate',
					direction: 'DESC',
				},
			})

			const sanitized = (data.content ?? []).map(e => ({
				...e,
				bookedParticipants: e.bookedParticipants ?? 0,
			}))

			if (append) {
				setEvents(prev => [...prev, ...sanitized])
			} else {
				setEvents(sanitized)
			}
			// fetch confirmed participant counts for these events
			;(async () => {
				try {
					const promises = sanitized.map(async ev => {
						try {
							const res = await api.get(`/user-event/${ev.eventId}/participants`)
							const confirmed = Array.isArray(res.data)
								? res.data.filter((p: any) => p.attendanceStatusName === 'Zapisany').length
								: 0
							return { id: ev.eventId, confirmed }
						} catch (e) {
							return { id: ev.eventId, confirmed: ev.bookedParticipants ?? 0 }
						}
					})
					const results = await Promise.all(promises)
					setConfirmedCounts(prev => {
						const copy = { ...prev }
						results.forEach((r: any) => (copy[r.id] = r.confirmed))
						return copy
					})
				} catch (e) {
					console.error('Błąd pobierania potwierdzonych uczestników:', e)
				}
			})()
			setHasNext(!data.last)
		} catch (err: any) {
			if (err?.response?.status === 204) {
				// No Content - brak wydarzeń
				if (append) {
					setHasNext(false)
				} else {
					setEvents([])
					setHasNext(false)
				}
			} else {
				if (!append) {
					setError('Nie udało się pobrać wydarzeń, w których bierzesz udział.')
				}
			}
		} finally {
			setLoading(false)
			setLoadingMore(false)
		}
	}, [])

	useEffect(() => {
		currentPageRef.current = 0
		fetchEvents(0, false)
	}, [fetchEvents])

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

	return (
		<section className='space-y-6'>
			<header className='flex items-end justify-between'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>Biorę udział</h2>
					<p className='text-sm text-zinc-400'>Wydarzenia, w których bierzesz udział.</p>
				</div>
			</header>

			{loading ? (
				<div className='text-center py-16 text-zinc-400'>Ładowanie...</div>
			) : error ? (
				<div className='text-center py-16 text-red-400'>{error}</div>
			) : events.length === 0 ? (
				<div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400'>
					Nie bierzesz udziału w żadnych wydarzeniach.
				</div>
			) : (
				<>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
						{events.map(ev => {
							const d = normalizeEventDate(ev.eventDate)
							const booked = ev.bookedParticipants ?? 0
							const hasImage = typeof ev.imageUrl === 'string' && ev.imageUrl.trim() !== ''
							const isBanned = ev.isBanned === true

							return (
								<div
									key={ev.eventId}
									className={`group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-zinc-800 transition-all ${
										isBanned
											? 'opacity-60 grayscale cursor-not-allowed'
											: 'hover:border-violet-600/40 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)]'
									}`}>
									{isBanned ? (
										<div className='block relative h-48 w-full bg-zinc-800 overflow-hidden'>
											<div className='h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800'>
												<div className='text-center text-zinc-500'>
													<AlertTriangle className='mx-auto mb-2' size={32} />
													<div className='text-sm font-medium'>Zablokowane</div>
												</div>
											</div>
										</div>
									) : (
										<Link
											to={`/event/${ev.eventId}`}
											className='block relative h-48 w-full bg-zinc-800 overflow-hidden'>
											{hasImage ? (
												<img
													src={ev.imageUrl as string}
													alt={ev.eventName}
													onError={e => {
														const img = e.currentTarget as HTMLImageElement
														img.style.display = 'none'
														const fallback = img.nextElementSibling as HTMLElement | null
														if (fallback) fallback.style.display = 'flex'
													}}
													className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-500'
												/>
											) : null}
											<div
												className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 group-hover:scale-105 transition-transform duration-500 ${
													hasImage ? 'hidden' : 'flex'
												}`}
												style={{ display: hasImage ? 'none' : 'flex' }}>
												<div className='text-center text-zinc-400'>
													<div className='text-4xl mb-2'>JoinMatch</div>
													<div className='text-sm font-medium'>{ev.sportTypeName}</div>
												</div>
											</div>
										</Link>
									)}

									<div className='p-5'>
										<h3 className={`text-lg font-semibold mb-1 ${isBanned ? 'text-zinc-500' : 'text-white'}`}>
											{ev.eventName}
										</h3>
										<p className='text-sm text-zinc-500 mb-2 flex items-center gap-2'>
											<MapPin size={14} /> {ev.sportObjectName}
										</p>
										<p className='text-sm text-zinc-500 mb-2 flex items-center gap-2'>
											<CalendarDays size={14} /> {d.format('DD.MM.YYYY HH:mm')}
										</p>
										<p className='text-sm text-zinc-500 mb-3 flex items-center gap-2'>
											<Users size={14} /> {confirmedCounts[ev.eventId] ?? booked}/{ev.numberOfParticipants}
										</p>

										<div className='flex justify-end'>
											{isBanned ? (
												<div className='px-4 py-2 rounded-lg text-sm font-medium text-zinc-500 bg-zinc-800 cursor-not-allowed'>
													Zablokowane
												</div>
											) : (
												<Link
													to={`/event/${ev.eventId}`}
													className='px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 transition-colors'>
													Szczegóły
												</Link>
											)}
										</div>
									</div>
								</div>
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
		</section>
	)
}

export default MyParticipationsSection
