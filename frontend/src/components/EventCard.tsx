// src/components/EventCard.tsx
import React from 'react'
import { Link } from 'react-router-dom'

// Typ wydarzenia
interface Participant {
	initials: string
	color: string
}

interface Event {
	id: number
	title: string
	location: string
	date: Date
	spots: number
	spotsLeft: number
	rating: number
	reviews: number
	description: string
	participants: Participant[]
}

interface EventCardProps {
	event: Event
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
	// Formatowanie daty
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('pl-PL', {
			day: 'numeric',
			month: 'long',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date)
	}

	return (
		<div className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition'>
			<div className='p-6'>
				<div className='flex justify-between items-start mb-4'>
					<div>
						<h3 className='text-xl font-semibold text-gray-900 mb-1'>
							<Link to={`/event/${event.id}`} className='hover:underline'>
								{event.title}
							</Link>
						</h3>
						<div className='flex items-center text-sm text-gray-600'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-4 w-4 mr-1'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
								/>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
								/>
							</svg>
							<span>{event.location}</span>
						</div>
					</div>
					<div className='bg-gray-100 px-3 py-1 rounded-full text-sm font-medium'>
						{event.spotsLeft} / {event.spots}
					</div>
				</div>

				<div className='flex items-center mb-4'>
					<div className='flex items-center text-yellow-500 mr-2'>
						{[...Array(5)].map((_, i) => (
							<svg
								key={i}
								xmlns='http://www.w3.org/2000/svg'
								className='h-4 w-4'
								viewBox='0 0 20 20'
								fill={i < Math.floor(event.rating) ? 'currentColor' : 'none'}
								stroke='currentColor'>
								<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
							</svg>
						))}
					</div>
					<span className='text-sm text-gray-600'>
						{event.rating} ({event.reviews} reviews)
					</span>
				</div>

				<p className='text-gray-700 mb-6'>{event.description}</p>

				<div className='flex justify-between items-center'>
					<div className='flex -space-x-2'>
						{event.participants.slice(0, 4).map((participant, index) => (
							<div
								key={index}
								className={`${participant.color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white`}>
								{participant.initials}
							</div>
						))}
						{event.participants.length > 4 && (
							<div className='bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white'>
								+{event.participants.length - 4}
							</div>
						)}
					</div>

					<div className='text-sm text-gray-500'>{formatDate(event.date)}</div>
				</div>

				<div className='mt-6'>
					<Link
						to={`/event/${event.id}`}
						className='block w-full text-center bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded-full transition'>
						Zobacz więcej
					</Link>
				</div>
			</div>
		</div>
	)
}

export default EventCard
