import React, { useState, useEffect, useMemo } from 'react'
import { Star, MapPin, Crown, Loader2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import CitySelector from './CitySelector'
import { getGeneralTeamRanking, getLocalTeamRanking, getAvailableTeamCities } from '../Api/rankings'
import type { TeamRankingItem } from '../Api/types/Ranking'

type RankingType = 'ogolny' | 'lokalny'

const TeamRankings: React.FC = () => {
	const [activeRanking, setActiveRanking] = useState<RankingType>('ogolny')
	const [selectedCity, setSelectedCity] = useState<string | null>(null)
	const [ranking, setRanking] = useState<TeamRankingItem[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const rankingTypes = [
		{ key: 'ogolny' as RankingType, label: 'Ogólny', icon: Star },
		{ key: 'lokalny' as RankingType, label: 'Lokalny', icon: MapPin },
	]

	useEffect(() => {
		setLoading(true)
		setError(null)
		setRanking([])
		
		if (activeRanking === 'ogolny') {
			getGeneralTeamRanking(20)
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
		} else if (activeRanking === 'lokalny') {
			if (selectedCity) {
				setLoading(true)
				setError(null)
				getLocalTeamRanking(selectedCity, 20)
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
			} else {
				setRanking([])
				setLoading(false)
				setError(null)
			}
		} else {
			setRanking([])
		}
	}, [activeRanking, selectedCity])

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
			<h3 className='text-lg font-semibold text-white mb-4'>Ranking drużyn</h3>

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
										{top3.map((team) => {
											const colors = getTop3Colors(team.position)
											return (
												<Link
													key={team.teamId}
													to={`/team/${team.teamId}`}
													className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 transition-transform hover:scale-105`}
												>
													<div className='flex flex-col items-center text-center space-y-3'>
														<div className='relative'>
															{team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? (
																<img
																	src={team.teamPhotoUrl}
																	alt={team.teamName}
																	className='h-24 w-24 rounded-full object-cover ring-4 ring-violet-700'
																	onError={(e) => {
																		const target = e.currentTarget as HTMLImageElement
																		target.style.display = 'none'
																		const fallback = target.nextElementSibling as HTMLElement
																		if (fallback) fallback.style.display = 'flex'
																	}}
																/>
															) : null}
															<div
																className={`h-24 w-24 rounded-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 ring-4 ring-violet-700 ${
																	team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? 'hidden' : 'flex'
																}`}
																style={{ display: team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? 'none' : 'flex' }}
															>
																<Users size={32} className='text-zinc-400' />
															</div>
															<div className={`absolute -top-2 -right-2 ${colors.crown}`}>
																<Crown size={24} className='fill-current' />
															</div>
														</div>
														<div>
															<div className={`text-2xl font-bold ${colors.text} mb-1`}>
																#{team.position}
															</div>
															<h4 className='text-white font-semibold text-lg'>{team.teamName}</h4>
															<div className='text-sm text-zinc-400 mt-1'>
																Lider: <Link to={`/profile/${team.leaderId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																	{team.leaderName}
																</Link>
															</div>
														</div>
														<div className='flex flex-col items-center gap-1'>
															<div className={`text-3xl font-bold ${colors.text}`}>
																{team.memberCount}
															</div>
															<div className='text-xs text-zinc-400'>
																{team.memberCount === 1
																	? 'członek'
																	: team.memberCount < 5
																	? 'członkowie'
																	: 'członków'}
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
										{rest.map((team) => (
											<Link
												key={team.teamId}
												to={`/team/${team.teamId}`}
												className='flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:bg-zinc-800'
											>
												<div className='flex items-center gap-4 flex-1 min-w-0'>
													<div className='text-zinc-400 font-semibold w-8 shrink-0'>
														#{team.position}
													</div>
													{team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? (
														<img
															src={team.teamPhotoUrl}
															alt={team.teamName}
															className='h-12 w-12 rounded-lg object-cover border border-zinc-700'
															onError={(e) => {
																const target = e.currentTarget as HTMLImageElement
																target.style.display = 'none'
																const fallback = target.nextElementSibling as HTMLElement
																if (fallback) fallback.style.display = 'flex'
															}}
														/>
													) : null}
													<div
														className={`h-12 w-12 rounded-lg flex items-center justify-center bg-zinc-800 border border-zinc-700 ${
															team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? 'hidden' : 'flex'
														}`}
														style={{ display: team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? 'none' : 'flex' }}
													>
														<Users size={20} className='text-zinc-400' />
													</div>
													<div className='flex-1 min-w-0'>
														<div className='text-white font-medium truncate'>{team.teamName}</div>
														<div className='flex items-center gap-2 mt-1 text-sm text-zinc-400'>
															<span>Lider: </span>
															<Link to={`/profile/${team.leaderId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																{team.leaderName}
															</Link>
															<span className='mx-2'>•</span>
															<span>
																{team.memberCount}{' '}
																{team.memberCount === 1
																	? 'członek'
																	: team.memberCount < 5
																	? 'członkowie'
																	: 'członków'}
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
				{activeRanking === 'lokalny' && (
					<div>
						<div className='mb-6'>
							<CitySelector value={selectedCity} onChange={setSelectedCity} getCitiesFn={getAvailableTeamCities} />
						</div>
						{!selectedCity ? (
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center'>
								<p className='text-zinc-400'>Wybierz miasto, aby zobaczyć ranking.</p>
							</div>
						) : loading ? (
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
								<p className='text-zinc-400'>Brak danych w rankingu dla miasta {selectedCity}.</p>
							</div>
						) : (
							<div className='space-y-6'>
								<div className='mb-4'>
									<h4 className='text-white font-semibold text-lg'>
										Ranking dla miasta: <span className='text-violet-400'>{selectedCity}</span>
									</h4>
								</div>
								{top3.length > 0 && (
									<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
										{top3.map((team) => {
											const colors = getTop3Colors(team.position)
											return (
												<Link
													key={team.teamId}
													to={`/team/${team.teamId}`}
													className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 transition-transform hover:scale-105`}
												>
													<div className='flex flex-col items-center text-center space-y-3'>
														<div className='relative'>
															{team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? (
																<img
																	src={team.teamPhotoUrl}
																	alt={team.teamName}
																	className='h-24 w-24 rounded-full object-cover ring-4 ring-violet-700'
																	onError={(e) => {
																		const target = e.currentTarget as HTMLImageElement
																		target.style.display = 'none'
																		const fallback = target.nextElementSibling as HTMLElement
																		if (fallback) fallback.style.display = 'flex'
																	}}
																/>
															) : null}
															<div
																className={`h-24 w-24 rounded-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 ring-4 ring-violet-700 ${
																	team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? 'hidden' : 'flex'
																}`}
																style={{ display: team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? 'none' : 'flex' }}
															>
																<Users size={32} className='text-zinc-400' />
															</div>
															<div className={`absolute -top-2 -right-2 ${colors.crown}`}>
																<Crown size={24} className='fill-current' />
															</div>
														</div>
														<div>
															<div className={`text-2xl font-bold ${colors.text} mb-1`}>
																#{team.position}
															</div>
															<h4 className='text-white font-semibold text-lg'>{team.teamName}</h4>
															<div className='text-sm text-zinc-400 mt-1'>
																Lider: <Link to={`/profile/${team.leaderId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																	{team.leaderName}
																</Link>
															</div>
														</div>
														<div className='flex flex-col items-center gap-1'>
															<div className={`text-3xl font-bold ${colors.text}`}>
																{team.memberCount}
															</div>
															<div className='text-xs text-zinc-400'>
																{team.memberCount === 1
																	? 'członek'
																	: team.memberCount < 5
																	? 'członkowie'
																	: 'członków'}
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
										{rest.map((team) => (
											<Link
												key={team.teamId}
												to={`/team/${team.teamId}`}
												className='flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:bg-zinc-800'
											>
												<div className='flex items-center gap-4 flex-1 min-w-0'>
													<div className='text-zinc-400 font-semibold w-8 shrink-0'>
														#{team.position}
													</div>
													{team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? (
														<img
															src={team.teamPhotoUrl}
															alt={team.teamName}
															className='h-12 w-12 rounded-lg object-cover border border-zinc-700'
															onError={(e) => {
																const target = e.currentTarget as HTMLImageElement
																target.style.display = 'none'
																const fallback = target.nextElementSibling as HTMLElement
																if (fallback) fallback.style.display = 'flex'
															}}
														/>
													) : null}
													<div
														className={`h-12 w-12 rounded-lg flex items-center justify-center bg-zinc-800 border border-zinc-700 ${
															team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? 'hidden' : 'flex'
														}`}
														style={{ display: team.teamPhotoUrl && team.teamPhotoUrl.trim() !== '' ? 'none' : 'flex' }}
													>
														<Users size={20} className='text-zinc-400' />
													</div>
													<div className='flex-1 min-w-0'>
														<div className='text-white font-medium truncate'>{team.teamName}</div>
														<div className='flex items-center gap-2 mt-1 text-sm text-zinc-400'>
															<span>Lider: </span>
															<Link to={`/profile/${team.leaderId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																{team.leaderName}
															</Link>
															<span className='mx-2'>•</span>
															<span>
																{team.memberCount}{' '}
																{team.memberCount === 1
																	? 'członek'
																	: team.memberCount < 5
																	? 'członkowie'
																	: 'członków'}
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
			</div>
		</section>
	)
}

export default TeamRankings
