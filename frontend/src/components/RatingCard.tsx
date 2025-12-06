import React from 'react'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'
import StarRatingDisplay from './StarRatingDisplay'
import { parseLocalDate } from '../utils/formatDate'
import { Edit, Trash2, CalendarDays } from 'lucide-react'

interface RatingCardProps {
	rating: number
	comment: string
	raterName: string
	raterAvatarUrl?: string
	raterEmail?: string
	createdAt: string
	isMine: boolean
	onEdit: () => void
	onDelete: () => void
	eventName?: string
	eventId?: number
	raterId: number
}

const RatingCard: React.FC<RatingCardProps> = ({
	rating,
	comment,
	raterName,
	raterAvatarUrl,
	raterEmail,
	createdAt,
	isMine,
	onEdit,
	onDelete,
	eventName,
	eventId,
	raterId,
}) => {
	return (
		<div className='bg-zinc-800/50 p-4 rounded-xl border border-zinc-700'>
			{/* Górna sekcja z użytkownikiem + datą */}
			<div className='flex items-center justify-between mb-2'>
				<div className='flex items-center gap-3'>
					<Link to={`/profile/${raterId}`}>
						<Avatar
							src={raterAvatarUrl || null}
							name={raterName}
							size='sm'
							className='ring-1 ring-zinc-700 hover:opacity-80 transition'
						/>
					</Link>
					<Link to={`/profile/${raterId}`} className='text-white text-sm font-medium hover:text-violet-300 transition'>
						<div className='leading-tight'>
							<div className='text-white text-sm font-medium'>{raterName}</div>
							{raterEmail && <div className='text-xs text-zinc-400'>{raterEmail}</div>}
						</div>
					</Link>
				</div>
				<div className='flex items-center gap-3'>
					<span className='text-xs text-zinc-500'>{parseLocalDate(createdAt).format('DD.MM.YYYY HH:mm')}</span>
					{isMine && (
						<div className='flex gap-2'>
							<button className='text-xs text-zinc-300 hover:text-white cursor-pointer' onClick={onEdit}>
								<Edit size={14} />
							</button>
							<button className='text-xs text-rose-400 hover:text-rose-300 cursor-pointer' onClick={onDelete}>
								<Trash2 size={14} />
							</button>
						</div>
					)}
				</div>
			</div>

			{eventName && eventId && (
				<div className='flex items-center gap-2 mb-2 text-xs text-violet-300'>
					<CalendarDays size={13} className='text-violet-400' />
					<a href={`/event/${eventId}`} className='font-medium hover:underline hover:text-violet-200 transition'>
						{eventName}
					</a>
				</div>
			)}

			<div className='space-y-2'>
				<StarRatingDisplay value={rating} size={18} />
				{comment && <p className='text-sm text-zinc-300 mt-2'>{comment}</p>}
			</div>
		</div>
	)
}

export default RatingCard
