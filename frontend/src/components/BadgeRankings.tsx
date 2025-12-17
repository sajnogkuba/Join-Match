import React, { useState, useEffect, useMemo } from 'react'
import {  Crown, Loader2, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { getGeneralBadgeRanking } from '../Api/rankings'
import type { BadgeRankingItem } from '../Api/types/Ranking'

const BadgeRankings: React.FC = () => {
	const [ranking, setRanking] = useState<BadgeRankingItem[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		setLoading(true)
		setError(null)
		setRanking([])
		
		getGeneralBadgeRanking(20)
			.then((data) => {
				setRanking(data || [])
			})
			.catch(() => {
				setError('Nie udało się pobrać rankingu.')
				setRanking([])
			})
			.finally(() => {
				setLoading(false)
			})
	}, [])

	const getTop3Colors = (position: number) => {
		switch (position) {
			case 1:
				return {
					bg: 'bg-yellow-500/20',
					border: 'border-yellow-500',
					text: 'text-yellow-400',
					crown: 'text-yellow-400',
				}
			case 2:
				return {
					bg: 'bg-zinc-500/20',
					border: 'border-zinc-400',
					text: 'text-zinc-300',
					crown: 'text-zinc-300',
				}
			case 3:
				return {
					bg: 'bg-amber-700/30',
					border: 'border-amber-700',
					text: 'text-amber-700',
					crown: 'text-amber-700',
				}
			default:
				return {
					bg: 'bg-zinc-800/50',
					border: 'border-zinc-800',
					text: 'text-white',
					crown: 'text-zinc-400',
				}
		}
	}

	const validRanking = useMemo(() => {
		return ranking
	}, [ranking])

	const top3 = useMemo(() => validRanking.slice(0, 3), [validRanking])
	const rest = useMemo(() => validRanking.slice(3), [validRanking])

	return (
		<section>
			<h3 className='text-lg font-semibold text-white mb-4'>Ranking odznak</h3>

			{loading ? (
				<div className='flex items-center justify-center py-12'>
					<div className='flex items-center gap-2 text-zinc-400'>
						<Loader2 className='animate-spin' size={24} />
						<span>Ładowanie rankingu...</span>
					</div>
				</div>
			) : error ? (
				<div className='rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center'>
					<p className='text-rose-300'>{error}</p>
				</div>
			) : ranking.length === 0 ? (
				<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center'>
					<p className='text-zinc-400'>Brak danych w rankingu.</p>
				</div>
			) : (
				<div className='space-y-6'>
					{top3.length > 0 && (
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{top3.map((user) => {
								const colors = getTop3Colors(user.position)
								return (
									<Link
										key={user.userId}
										to={`/profile/${user.userId}`}
										className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 transition-transform hover:scale-105`}
									>
										<div className='flex flex-col items-center text-center space-y-3'>
											<div className='relative'>
												<Avatar
													src={user.userAvatarUrl}
													name={user.userName}
													size='md'
													className='ring-4 ring-violet-700'
												/>
												<div className={`absolute -top-2 -right-2 ${colors.crown}`}>
													<Crown size={24} className='fill-current' />
												</div>
											</div>
											<div>
												<div className={`text-2xl font-bold ${colors.text} mb-1`}>
													#{user.position}
												</div>
												<h4 className='text-white font-semibold text-lg'>{user.userName}</h4>
											</div>
											<div className='flex flex-col items-center gap-1'>
												<div className={`text-3xl font-bold ${colors.text}`}>
													{user.badgeCount}
												</div>
												<div className='text-xs text-zinc-400'>
													{user.badgeCount === 1
														? 'odznaka'
														: user.badgeCount < 5
														? 'odznaki'
														: 'odznak'}
												</div>
											</div>
										</div>
									</Link>
								)
							})}
						</div>
					)}

					{rest.length > 0 && (
						<div className='space-y-2'>
							<h4 className='text-white font-semibold mb-3'>Pozostali</h4>
							{rest.map((user) => (
								<Link
									key={user.userId}
									to={`/profile/${user.userId}`}
									className='flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:bg-zinc-800'
								>
									<div className='flex items-center gap-4 flex-1 min-w-0'>
										<div className='text-zinc-400 font-semibold w-8 shrink-0'>
											#{user.position}
										</div>
										<Avatar src={user.userAvatarUrl} name={user.userName} size='sm' />
										<div className='flex-1 min-w-0'>
											<div className='text-white font-medium truncate'>{user.userName}</div>
											<div className='flex items-center gap-2 mt-1 text-sm text-zinc-400'>
												<Award size={14} />
												<span>
													{user.badgeCount} {user.badgeCount === 1 ? 'odznaka' : user.badgeCount < 5 ? 'odznaki' : 'odznak'}
												</span>
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			)}
		</section>
	)
}

export default BadgeRankings
