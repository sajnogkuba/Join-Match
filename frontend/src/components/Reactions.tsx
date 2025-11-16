import { useState, useRef, useEffect } from 'react'
import { useReactionTypes } from '../hooks/useReactionTypes'
import { Loader2, SmilePlus } from 'lucide-react'
import { usePostReactions } from '../hooks/usePostReactions'
import { Link } from 'react-router-dom'

interface ReactionsProps {
	targetId: number
	compact?: boolean
	reactionCounts?: Record<number, number>
	userReactionTypeId?: number | null
	onReactionClick?: (reactionTypeId: number) => void
	getReactionUsers?: (targetId: number, reactionTypeId: number) => Promise<Array<{ userId: number; name: string; avatarUrl: string | null }>>
}

export const Reactions = ({ targetId, compact = false, reactionCounts, userReactionTypeId, onReactionClick, getReactionUsers: getReactionUsersProp }: ReactionsProps) => {
	const { reactionTypes, loading } = useReactionTypes()
	const { getReactionUsers: getReactionUsersFromPost } = usePostReactions()
	const getReactionUsers = getReactionUsersProp || getReactionUsersFromPost
	const [hoveredReaction, setHoveredReaction] = useState<number | null>(null)
	const [showDropdown, setShowDropdown] = useState(false)
	const [showUsersPopover, setShowUsersPopover] = useState<number | null>(null)
	const [reactionUsers, setReactionUsers] = useState<Record<number, Array<{ userId: number; name: string; avatarUrl: string | null }>>>({})
	const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({})
	const dropdownRef = useRef<HTMLDivElement>(null)
	const popoverRefs = useRef<Map<number, HTMLDivElement | null>>(new Map())

	// Zamykanie dropdownu po kliknięciu na zewnątrz
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false)
			}

			popoverRefs.current.forEach((ref, reactionTypeId) => {
				if (ref && !ref.contains(event.target as Node)) {
					setShowUsersPopover(prev => prev === reactionTypeId ? null : prev)
				}
			})
		}

		if (showDropdown || showUsersPopover !== null) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showDropdown, showUsersPopover])

	// Wyczyść cache użytkowników i odśwież dane gdy zmienią się reactionCounts (po zmianie reakcji)
	useEffect(() => {
		// Jeśli jakiś popover jest otwarty, odśwież jego dane
		if (showUsersPopover !== null) {
			const reactionTypeId = showUsersPopover
			setLoadingUsers(prev => ({ ...prev, [reactionTypeId]: true }))
			
			getReactionUsers(targetId, reactionTypeId)
				.then(users => {
					setReactionUsers(prev => ({ ...prev, [reactionTypeId]: users }))
				})
				.catch(error => {
					console.error('Błąd odświeżania użytkowników:', error)
				})
				.finally(() => {
					setLoadingUsers(prev => ({ ...prev, [reactionTypeId]: false }))
				})
		} else {
			// Jeśli żaden popover nie jest otwarty, wyczyść cache
			setReactionUsers({})
		}
	}, [reactionCounts, showUsersPopover, targetId, getReactionUsers])

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

	// Filtruj tylko reakcje z count > 0
	const activeReactions = reactionTypes.filter((reactionType) => {
		const count = reactionCounts?.[reactionType.id] || 0
		return count > 0
	})

	const containerClasses = compact 
		? 'flex items-center gap-1 flex-wrap'
		: 'flex items-center gap-2 py-2 border-t border-zinc-800 mt-3'

	const buttonClasses = compact
		? `px-1.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1`
		: `px-2 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5`

	const handleReactionSelect = (reactionTypeId: number) => {
		onReactionClick?.(reactionTypeId)
		setShowDropdown(false)
	}

	// Pobierz użytkowników dla reakcji po kliknięciu na liczbę
	const handleCountClick = async (reactionTypeId: number, event: React.MouseEvent) => {
		event.stopPropagation()
		
		if (showUsersPopover === reactionTypeId) {
			setShowUsersPopover(null)
			return
		}

		setShowUsersPopover(reactionTypeId)
		
		// Jeśli już mamy dane, nie pobieraj ponownie
		if (reactionUsers[reactionTypeId]) {
			return
		}

		setLoadingUsers(prev => ({ ...prev, [reactionTypeId]: true }))

		try {
			const users = await getReactionUsers(targetId, reactionTypeId)
			setReactionUsers(prev => ({ ...prev, [reactionTypeId]: users }))
		} catch (error) {
			console.error('Błąd pobierania użytkowników:', error)
		} finally {
			setLoadingUsers(prev => ({ ...prev, [reactionTypeId]: false }))
		}
	}

	return (
		<div className={containerClasses}>
			<div className='flex items-center gap-0.5 sm:gap-1 flex-wrap'>
				{activeReactions.map((reactionType) => {
					const count = reactionCounts?.[reactionType.id] || 0
					const isUserReaction = userReactionTypeId !== null && userReactionTypeId !== undefined && Number(userReactionTypeId) === Number(reactionType.id)
					
					return (
						<div key={reactionType.id} className='relative' ref={el => {
							if (el) {
								popoverRefs.current.set(reactionType.id, el)
							} else {
								popoverRefs.current.delete(reactionType.id)
							}
						}}>
							<div className={`
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
							`}>
								{/* Emotka - reaguje/usuwa reakcję */}
								<button
									onClick={() => onReactionClick?.(reactionType.id)}
									onMouseEnter={() => setHoveredReaction(reactionType.id)}
									onMouseLeave={() => setHoveredReaction(null)}
									className='flex items-center'
									title={reactionType.name}
								>
									<span className={compact ? 'text-sm' : 'text-base'}>{reactionType.emoji}</span>
								</button>
								
								{/* Liczba - otwiera popover z użytkownikami */}
								<button
									onClick={(e) => handleCountClick(reactionType.id, e)}
									className='flex items-center ml-0.5'
									title='Zobacz kto zareagował'
								>
									<span className={`${compact ? 'text-xs' : 'text-xs'} font-medium`}>
										{count}
									</span>
								</button>
							</div>

							{/* Popover z listą użytkowników */}
							{showUsersPopover === reactionType.id && (
								<div className='absolute bottom-full left-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[200px] max-w-[300px] p-3'>
									<div className='text-xs text-zinc-400 mb-2 font-medium'>
										{reactionType.emoji} {reactionType.name}
									</div>
									{loadingUsers[reactionType.id] ? (
										<div className='flex items-center gap-2 py-2'>
											<Loader2 className='animate-spin text-violet-400' size={14} />
											<span className='text-xs text-zinc-400'>Ładowanie...</span>
										</div>
									) : reactionUsers[reactionType.id]?.length > 0 ? (
										<div className='space-y-1 max-h-[200px] overflow-y-auto'>
											{reactionUsers[reactionType.id].map((user) => (
												<Link
													key={user.userId}
													to={`/profile/${user.userId}`}
													className='block text-sm text-zinc-200 hover:text-violet-400 hover:bg-zinc-700 rounded-lg px-2 py-1 transition-colors'
													onClick={() => setShowUsersPopover(null)}
												>
													{user.name}
												</Link>
											))}
										</div>
									) : (
										<div className='text-xs text-zinc-400 py-2'>
											Brak użytkowników
										</div>
									)}
								</div>
							)}
						</div>
					)
				})}
				
				{/* Przycisk z dropdownem do dodawania reakcji */}
				{onReactionClick && (
					<div className='relative' ref={dropdownRef}>
						<button
							onClick={() => setShowDropdown(!showDropdown)}
							className={`
								${buttonClasses}
								bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white
							`}
							title='Dodaj reakcję'
						>
							<SmilePlus size={compact ? 14 : 16} />
						</button>
						
						{showDropdown && (
							<div className='absolute bottom-full left-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-2 z-50 flex flex-col gap-1 max-w-[250px]'>
								{reactionTypes.map((reactionType) => {
									const isUserReaction = userReactionTypeId !== null && userReactionTypeId !== undefined && Number(userReactionTypeId) === Number(reactionType.id)
									
									return (
										<button
											key={reactionType.id}
											onClick={() => handleReactionSelect(reactionType.id)}
											className={`
												p-2 rounded-lg text-left transition-all hover:bg-zinc-700 flex items-center gap-2
												${isUserReaction ? 'bg-violet-600/50' : ''}
											`}
											title={reactionType.name}
										>
											<span className='text-base'>{reactionType.emoji}</span>
											{reactionType.description && (
												<span className='text-xs text-zinc-400'>{reactionType.description}</span>
											)}
										</button>
									)
								})}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

