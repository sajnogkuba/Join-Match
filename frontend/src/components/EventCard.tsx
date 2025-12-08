import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, CalendarDays, Users, Banknote } from 'lucide-react'
import type { Event } from '../Api/types'

interface EventCardProps {
	event: Event
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
	// Formatowanie daty
	const formatDate = (dateStr: string | Date) => {
		const date = new Date(dateStr)
		return new Intl.DateTimeFormat('pl-PL', {
			day: 'numeric',
			month: 'long',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date)
	}

	// Skracanie opisu
	const truncateDescription = (text?: string, length = 100) => {
		if (!text) return 'Brak dodatkowego opisu.'
		return text.length > length ? text.substring(0, length) + '...' : text
	}

	// Obliczanie wolnych miejsc
	const spotsLeft = event.numberOfParticipants - event.bookedParticipants

	return (
		<div className='group relative flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-xl hover:shadow-violet-900/10 transition-all duration-300 h-full'>
			{/* Obrazek / Placeholder */}
			<div className='h-48 w-full bg-zinc-800 overflow-hidden relative'>
				{event.imageUrl ? (
					<img
						src={event.imageUrl}
						alt={event.eventName}
						className='w-full h-full object-cover group-hover:scale-105 transition duration-500'
					/>
				) : (
					<div className='w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-800/80'>
						<span className='text-4xl'>⚽</span>
					</div>
				)}

				{/* Badge Cena */}
				<div className='absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700/50 flex items-center gap-1.5'>
					<Banknote size={14} className='text-emerald-400' />
					<span className='text-sm font-semibold text-white'>{event.cost > 0 ? `${event.cost} PLN` : 'FREE'}</span>
				</div>

				{/* Badge Sport */}
				<div className='absolute top-3 left-3 bg-violet-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wide shadow-lg'>
					{event.sportTypeName}
				</div>
			</div>

			{/* Treść */}
			<div className='p-5 flex flex-col flex-grow'>
				<div className='mb-3'>
					<h3 className='text-xl font-bold text-white leading-tight mb-1 group-hover:text-violet-400 transition-colors'>
						<Link to={`/event/${event.eventId}`}>{event.eventName}</Link>
					</h3>
					<div className='flex items-center text-zinc-400 text-sm'>
						<MapPin size={14} className='mr-1.5 text-zinc-500' />
						<span className='truncate'>{event.city || event.sportObjectName}</span>
					</div>
				</div>

				{/* Opis */}
				<p className='text-zinc-400 text-sm mb-5 line-clamp-2 flex-grow'>{truncateDescription(event.description)}</p>

				{/* Info dolne */}
				<div className='flex items-center justify-between pt-4 border-t border-zinc-800/50 mt-auto'>
					<div className='flex items-center text-zinc-300 text-sm'>
						<CalendarDays size={16} className='mr-2 text-violet-400' />
						{formatDate(event.eventDate)}
					</div>

					<div
						className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-lg border ${
							spotsLeft <= 3 && spotsLeft > 0
								? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
								: 'bg-zinc-800 border-zinc-700 text-zinc-300'
						}`}>
						<Users size={14} />
						<span>
							{event.bookedParticipants}/{event.numberOfParticipants}
						</span>
					</div>
				</div>
			</div>

			<Link to={`/event/${event.eventId}`} className='absolute inset-0 z-10' aria-label={`Zobacz ${event.eventName}`} />
		</div>
	)
}

export default EventCard
