import { useState } from 'react'
import { useReactionTypes } from '../hooks/useReactionTypes'
import { Loader2 } from 'lucide-react'

interface ReactionsProps {
	targetId: number
	compact?: boolean
	reactionCounts?: Record<number, number>
	userReactionTypeId?: number | null
	onReactionClick?: (reactionTypeId: number) => void
}

export const Reactions = ({ targetId, compact = false, reactionCounts, userReactionTypeId, onReactionClick }: ReactionsProps) => {
	const { reactionTypes, loading } = useReactionTypes()
	const [hoveredReaction, setHoveredReaction] = useState<number | null>(null)

	if (loading) {
		return (
			<div className={`flex items-center gap-2 ${compact ? 'py-1' : 'py-2'}`}>
				<Loader2 className='animate-spin text-violet-400' size={compact ? 14 : 16} />
				<span className='text-xs text-zinc-400'>Ładowanie reakcji...</span>
			</div>
		)
	}

	if (reactionTypes.length === 0) {
		return null
	}

	const containerClasses = compact 
		? 'flex items-center gap-1 flex-wrap'
		: 'flex items-center gap-2 py-2 border-t border-zinc-800 mt-3'

	const buttonClasses = compact
		? `px-1.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1`
		: `px-2 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5`

	return (
		<div className={containerClasses}>
			<div className='flex items-center gap-0.5 sm:gap-1 flex-wrap'>
				{reactionTypes.map((reactionType) => {
					const count = reactionCounts?.[reactionType.id] || 0
					const isUserReaction = userReactionTypeId !== null && userReactionTypeId !== undefined && Number(userReactionTypeId) === Number(reactionType.id)
					
					return (
						<button
							key={reactionType.id}
							onClick={() => onReactionClick?.(reactionType.id)}
							onMouseEnter={() => setHoveredReaction(reactionType.id)}
							onMouseLeave={() => setHoveredReaction(null)}
							className={`
								${buttonClasses}
								${
									isUserReaction
										? hoveredReaction === reactionType.id
											? 'bg-violet-600 text-white scale-105'
											: 'bg-violet-600/70 text-white'
										: hoveredReaction === reactionType.id
											? 'bg-zinc-800 text-white scale-105'
											: 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white'
								}
							`}
							title={reactionType.name}
						>
							<span className={compact ? 'text-sm' : 'text-base'}>{reactionType.emoji}</span>
							<span className={`${compact ? 'text-xs' : 'text-xs'} font-medium`}>
								{count}
							</span>
						</button>
					)
				})}
			</div>
		</div>
	)
}

