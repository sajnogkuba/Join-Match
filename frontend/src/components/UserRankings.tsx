import React, { useState, useEffect } from 'react'
import { Star, Activity, Trophy, MapPin, Crown, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../Api/axios'
import Avatar from './Avatar'
import StarRatingDisplay from './StarRatingDisplay'
import type { UserRankingItem } from '../Api/types/Ranking'

type RankingType = 'ogolny' | 'aktywnosc' | 'sport' | 'lokalny'

const UserRankings: React.FC = () => {
	const [activeRanking, setActiveRanking] = useState<RankingType>('ogolny')
	const [ranking, setRanking] = useState<UserRankingItem[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const rankingTypes = [
		{ key: 'ogolny' as RankingType, label: 'Ogólny', icon: Star },
		{ key: 'aktywnosc' as RankingType, label: 'Aktywność', icon: Activity },
		{ key: 'sport' as RankingType, label: 'W sporcie', icon: Trophy },
		{ key: 'lokalny' as RankingType, label: 'Lokalny', icon: MapPin },
	]

	useEffect(() => {
		if (activeRanking === 'ogolny') {
			setLoading(true)
			setError(null)
			api
				.get<UserRankingItem[]>('/rankings/users/general', {
					params: { limit: 20, minRatings: 1 },
				})
				.then(({ data }) => {
					setRanking(data || [])
				})
				.catch(() => {
					setError('Nie udało się pobrać rankingu.')
					setRanking([])
				})
				.finally(() => {
					setLoading(false)
				})
		} else {
			setRanking([])
		}
	}, [activeRanking])

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

	const top3 = ranking.slice(0, 3)
	const rest = ranking.slice(3)

	return (
		<section>
			<h3 className='text-lg font-semibold text-white mb-4'>Ranking użytkowników</h3>

			<div className='mb-6'>
				<div className='flex gap-2 overflow-x-auto pb-3'>
					{rankingTypes.map(({ key, label, icon: Icon }) => (
						<button
							key={key}
							onClick={() => setActiveRanking(key)}
							className={`
                                flex-1 flex items-center justify-center gap-2
                                rounded-xl border transition
                                px-3 py-2 text-sm
                                min-w-0
                                ${
									activeRanking === key
										? 'border-violet-600 bg-violet-600/20 text-white'
										: 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
								}
                            `}
						>
							<Icon size={16} className='shrink-0' />
							<span className='whitespace-nowrap truncate'>{label}</span>
						</button>
					))}
				</div>
			</div>
			
			<div>
				{activeRanking === 'ogolny' && (
					<div>
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
															<StarRatingDisplay value={user.averageRating} size={18} />
															<div className={`text-sm ${colors.text} font-medium`}>
																{user.averageRating.toFixed(1)}
															</div>
															<div className='text-xs text-zinc-400'>
																{user.totalRatings} {user.totalRatings === 1 ? 'ocena' : 'ocen'}
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
														<div className='flex items-center gap-2 mt-1'>
															<StarRatingDisplay value={user.averageRating} size={14} />
															<span className='text-sm text-zinc-400'>
																{user.averageRating.toFixed(1)} ({user.totalRatings}{' '}
																{user.totalRatings === 1 ? 'ocena' : 'ocen'})
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
					</div>
				)}
				{activeRanking === 'aktywnosc' && (
					<div>
						<p className='text-sm text-zinc-400'>Ranking aktywności użytkowników zostanie dodany wkrótce.</p>
					</div>
				)}
				{activeRanking === 'sport' && (
					<div>
						<p className='text-sm text-zinc-400'>Ranking użytkowników w sporcie zostanie dodany wkrótce.</p>
					</div>
				)}
				{activeRanking === 'lokalny' && (
					<div>
						<p className='text-sm text-zinc-400'>Ranking lokalny użytkowników zostanie dodany wkrótce.</p>
					</div>
				)}
			</div>
		</section>
	)
}

export default UserRankings

