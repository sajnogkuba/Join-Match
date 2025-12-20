import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import type { UserEventResponseDto } from '../Api/types/Participant'
import { parseEventDate } from '../utils/formatDate'

dayjs.locale('pl')

interface EventsCalendarProps {
	events: UserEventResponseDto[]
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events }) => {
	const [currentMonth, setCurrentMonth] = useState(dayjs())

	// Grupowanie wydarzeń według daty (tylko data, bez czasu)
	const eventsByDate = useMemo(() => {
		const grouped = new Map<string, UserEventResponseDto[]>()
		events.forEach(event => {
			if (event.eventDate) {
				const dateKey = parseEventDate(event.eventDate).format('YYYY-MM-DD')
				if (!grouped.has(dateKey)) {
					grouped.set(dateKey, [])
				}
				grouped.get(dateKey)!.push(event)
			}
		})
		return grouped
	}, [events])

	// Pobierz wydarzenia dla konkretnego dnia
	const getEventsForDay = (date: dayjs.Dayjs): UserEventResponseDto[] => {
		const dateKey = date.format('YYYY-MM-DD')
		return eventsByDate.get(dateKey) || []
	}

	// Oblicz dni miesiąca
	const daysInMonth = currentMonth.daysInMonth()
	const firstDayOfMonth = currentMonth.startOf('month').day()
	// dayjs używa 0 (niedziela) jako pierwszy dzień tygodnia, ale chcemy poniedziałek jako pierwszy
	const startingDayOfWeek = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

	const previousMonth = () => {
		setCurrentMonth(prev => prev.subtract(1, 'month'))
	}

	const nextMonth = () => {
		setCurrentMonth(prev => prev.add(1, 'month'))
	}

	const goToToday = () => {
		setCurrentMonth(dayjs())
	}

	const today = dayjs()
	const isCurrentMonth = currentMonth.isSame(today, 'month') && currentMonth.isSame(today, 'year')

	// Nazwy dni tygodnia
	const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

	return (
		<div className='space-y-4'>
			{/* Nagłówek z nawigacją */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<button
						onClick={previousMonth}
						className='p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 transition-colors'>
						<ChevronLeft size={20} />
					</button>
					<h4 className='text-lg font-semibold text-white min-w-[200px] text-center'>
						{currentMonth.format('MMMM YYYY')}
					</h4>
					<button
						onClick={nextMonth}
						className='p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 transition-colors'>
						<ChevronRight size={20} />
					</button>
				</div>
				{!isCurrentMonth && (
					<button
						onClick={goToToday}
						className='px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors'>
						Dziś
					</button>
				)}
			</div>

			{/* Kalendarz */}
			<div className='bg-zinc-900/50 rounded-xl border border-zinc-800 p-4'>
				{/* Nagłówki dni tygodnia */}
				<div className='grid grid-cols-7 gap-1 mb-2'>
					{weekDays.map(day => (
						<div key={day} className='text-center text-sm font-medium text-zinc-400 py-2'>
							{day}
						</div>
					))}
				</div>

				{/* Dni miesiąca */}
				<div className='grid grid-cols-7 gap-1'>
					{/* Puste komórki przed pierwszym dniem miesiąca */}
					{Array.from({ length: startingDayOfWeek }).map((_, index) => (
						<div key={`empty-${index}`} className='h-20' />
					))}

					{/* Dni miesiąca */}
					{Array.from({ length: daysInMonth }, (_, index) => {
						const day = index + 1
						const date = currentMonth.date(day)
						const dayEvents = getEventsForDay(date)
						const isToday = date.isSame(today, 'day')
						const isPast = date.isBefore(today, 'day')
						const hasEvents = dayEvents.length > 0

						return (
							<div
								key={day}
								className={`relative h-20 p-1 rounded-lg border transition-colors ${
									isToday
										? 'bg-violet-600/20 border-violet-600'
										: hasEvents
										? 'bg-zinc-800/50 border-zinc-700 hover:border-violet-500/50'
										: isPast
										? 'border-zinc-800/30'
										: 'border-zinc-800/50'
								}`}>
								<div
									className={`text-sm font-medium mb-1 ${
										isToday ? 'text-violet-300' : isPast ? 'text-zinc-500' : 'text-zinc-300'
									}`}>
									{day}
								</div>
								{hasEvents && (
									<div className='space-y-0.5 max-h-12 overflow-y-auto'>
										{dayEvents.slice(0, 2).map(event => (
											<Link
												key={event.id}
												to={`/event/${event.eventId}`}
												className='block text-xs px-1.5 py-0.5 rounded bg-violet-600/80 hover:bg-violet-600 text-white truncate transition-colors'
												title={event.eventName}>
												{event.eventName}
											</Link>
										))}
										{dayEvents.length > 2 && (
											<div className='text-xs text-violet-400 px-1.5 py-0.5'>
												+{dayEvents.length - 2} więcej
											</div>
										)}
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>

			{/* Legenda */}
			<div className='flex items-center gap-4 text-sm text-zinc-400'>
				<div className='flex items-center gap-2'>
					<div className='w-4 h-4 rounded bg-violet-600/20 border border-violet-600' />
					<span>Dzisiaj</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='w-4 h-4 rounded bg-zinc-800/50 border border-zinc-700' />
					<span>Dzień z wydarzeniami</span>
				</div>
			</div>

			{/* Lista wszystkich wydarzeń w miesiącu */}
			{events.length > 0 && (
				<div className='mt-6'>
					<h5 className='text-md font-semibold text-white mb-3 flex items-center gap-2'>
						<CalendarDays size={18} />
						Wszystkie wydarzenia w {currentMonth.format('MMMM YYYY')}
					</h5>
					<div className='space-y-2'>
						{Array.from(eventsByDate.entries())
							.sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
							.map(([dateKey, dayEvents]) => {
								const date = dayjs(dateKey)
								const isInCurrentMonth = date.isSame(currentMonth, 'month')
								if (!isInCurrentMonth) return null

								return (
									<div key={dateKey} className='bg-zinc-800/50 rounded-lg p-3 border border-zinc-700'>
										<div className='text-sm font-medium text-violet-400 mb-2'>
											{date.format('dddd, DD.MM.YYYY')}
										</div>
										<div className='space-y-2'>
											{dayEvents.map(event => (
												<Link
													key={event.id}
													to={`/event/${event.eventId}`}
													className='block p-2 rounded bg-zinc-900/50 hover:bg-zinc-900 transition-colors'>
													<div className='text-white font-medium'>{event.eventName}</div>
													<div className='text-xs text-zinc-400 mt-1'>
														{parseEventDate(event.eventDate).format('HH:mm')}
													</div>
												</Link>
											))}
										</div>
									</div>
								)
							})}
					</div>
				</div>
			)}
		</div>
	)
}

export default EventsCalendar
