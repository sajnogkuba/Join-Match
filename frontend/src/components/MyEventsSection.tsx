import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import dayjs, { Dayjs } from 'dayjs'
import { MapPin, CalendarDays, Users, AlertTriangle, List, Calendar, ArrowUpDown } from 'lucide-react'
import api from '../Api/axios'
import UniversalEventsCalendar from './UniversalEventsCalendar'
type EventStatus = 'PLANNED' | 'CANCELED' | 'FINISHED'
type EventDateWire = number[] | string | Date

interface OwnedEvent {
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

function normalizeEventDate(d: EventDateWire): Dayjs {
	if (Array.isArray(d)) {
		const [y, m, day, h = 0, min = 0] = d
		return dayjs(new Date(y, (m ?? 1) - 1, day, h, min))
	}
	return dayjs(d)
}

const MyEventsSection: React.FC = () => {
	const [events, setEvents] = useState<OwnedEvent[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [confirmedCounts, setConfirmedCounts] = useState<Record<number, number>>({})
	const [view, setView] = useState<'list' | 'calendar'>('list')
	const [sortBy, setSortBy] = useState<string>("date_desc")

	useEffect(() => {
		;(async () => {
			try {
				const { data } = await api.get<OwnedEvent[]>('/event/byUser')

				const sanitized = (data ?? []).map(e => ({
					...e,
					bookedParticipants: e.bookedParticipants ?? 0,
				}))
				setEvents(sanitized)
				;(async () => {
					try {
						const promises = sanitized.map(async ev => {
							try {
								const res = await api.get(`/user-event/${ev.eventId}/participants`)
								let confirmed = Array.isArray(res.data)
									? res.data.filter((p: any) => p.attendanceStatusName === 'Zapisany').length
									: 0

								const teamCount = (ev as any).teamParticipants ?? null
								if (teamCount == null) {
									try {
										const det = await api.get(`/event/${ev.eventId}`)
										const td = det.data as any
										if (td?.isForTeam) confirmed += td.teamParticipants ?? 0
									} catch (_) {
									}
								} else {
									confirmed += teamCount
								}

								return { id: ev.eventId, confirmed }
							} catch (e) {
								return { id: ev.eventId, confirmed: (ev.bookedParticipants ?? 0) + ((ev as any).teamParticipants ?? 0) }
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
			} catch {
				setError('Nie udało się pobrać Twoich wydarzeń.')
			} finally {
				setLoading(false)
			}
		})()
	}, [])

	const sortedEvents = useMemo(() => {
		if (view === 'calendar') return events

		const result = [...events]

		result.sort((a, b) => {
			let comparison = 0

			switch (sortBy) {
				case "date_desc":
					const dateA_desc = normalizeEventDate(a.eventDate).valueOf()
					const dateB_desc = normalizeEventDate(b.eventDate).valueOf()
					comparison = dateB_desc - dateA_desc
					break
				case "date_asc":
					const dateA_asc = normalizeEventDate(a.eventDate).valueOf()
					const dateB_asc = normalizeEventDate(b.eventDate).valueOf()
					comparison = dateA_asc - dateB_asc
					break
				case "name_asc":
					comparison = a.eventName.localeCompare(b.eventName, "pl", {
						sensitivity: "base",
					})
					break
				case "name_desc":
					comparison = b.eventName.localeCompare(a.eventName, "pl", {
						sensitivity: "base",
					})
					break
				case "participants_desc":
					const countA_desc = confirmedCounts[a.eventId] ?? (a.bookedParticipants ?? 0)
					const countB_desc = confirmedCounts[b.eventId] ?? (b.bookedParticipants ?? 0)
					comparison = countB_desc - countA_desc
					break
				case "participants_asc":
					const countA_asc = confirmedCounts[a.eventId] ?? (a.bookedParticipants ?? 0)
					const countB_asc = confirmedCounts[b.eventId] ?? (b.bookedParticipants ?? 0)
					comparison = countA_asc - countB_asc
					break
				default:
					return 0
			}

			return comparison
		})

		return result
	}, [events, sortBy, view, confirmedCounts])

	return (
		<section className='space-y-6'>
			<header className='flex items-end justify-between'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>Moje wydarzenia</h2>
					<p className='text-sm text-zinc-400'>Wydarzenia, których jesteś właścicielem.</p>
				</div>
				{events.length > 0 && (
					<div className='flex items-center gap-2'>
						{view === 'list' && (
							<div className='relative'>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className='appearance-none rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 pr-8 text-sm text-zinc-200'
								>
									<option value='date_desc'>Data (najnowsze)</option>
									<option value='date_asc'>Data (najstarsze)</option>
									<option value='name_asc'>Nazwa A-Z</option>
									<option value='name_desc'>Nazwa Z-A</option>
									<option value='participants_desc'>Uczestnicy (najwięcej)</option>
									<option value='participants_asc'>Uczestnicy (najmniej)</option>
								</select>
								<ArrowUpDown
									className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60'
									size={16}
								/>
							</div>
						)}
						<div className='flex items-center gap-1 bg-zinc-800 rounded-lg p-1 border border-zinc-700'>
							<button
								onClick={() => setView('list')}
								className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									view === 'list'
										? 'bg-violet-600 text-white'
										: 'text-zinc-400 hover:text-white'
								}`}>
								<List size={16} />
								Lista
							</button>
							<button
								onClick={() => setView('calendar')}
								className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									view === 'calendar'
										? 'bg-violet-600 text-white'
										: 'text-zinc-400 hover:text-white'
								}`}>
								<Calendar size={16} />
								Kalendarz
							</button>
						</div>
					</div>
				)}
			</header>

			{loading ? (
				<div className='text-center py-16 text-zinc-400'>Ładowanie…</div>
			) : error ? (
				<div className='text-center py-16 text-red-400'>{error}</div>
			) : events.length === 0 ? (
				<div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400'>
					Nie masz jeszcze żadnych własnych wydarzeń.
				</div>
			) : view === 'calendar' ? (
				<UniversalEventsCalendar
					events={events.map(e => ({
						eventId: e.eventId,
						eventName: e.eventName,
						eventDate: e.eventDate,
					}))}
				/>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
					{sortedEvents.map(ev => {
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
									<Link to={`/event/${ev.eventId}`} className='block relative h-48 w-full bg-zinc-800 overflow-hidden'>
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
			)}
		</section>
	)
}

export default MyEventsSection
