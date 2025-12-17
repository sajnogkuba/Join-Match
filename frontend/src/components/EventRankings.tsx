import React, { useState, useEffect, useMemo } from 'react'
import { Star, TrendingUp, MapPin, Crown, Loader2, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import CitySelector from './CitySelector'
import Avatar from './Avatar'
import StarRatingDisplay from './StarRatingDisplay'
import { getRatingEventRanking, getPopularityEventRanking, getLocalEventRanking, getAvailableCities } from '../Api/rankings'
import type { EventRankingItem } from '../Api/types/Ranking'

type RankingType = 'oceny' | 'popularnosc' | 'lokalny'

const EventRankings: React.FC = () => {
	const [activeRanking, setActiveRanking] = useState<RankingType>('oceny')
	const [selectedCity, setSelectedCity] = useState<string | null>(null)
	const [ranking, setRanking] = useState<EventRankingItem[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const rankingTypes = [
		{ key: 'oceny' as RankingType, label: 'Oceny', icon: Star },
		{ key: 'popularnosc' as RankingType, label: 'Popularność', icon: TrendingUp },
		{ key: 'lokalny' as RankingType, label: 'Lokalny', icon: MapPin },
	]

	useEffect(() => {
		setLoading(true)
		setError(null)
		setRanking([])
		
		if (activeRanking === 'oceny') {
			getRatingEventRanking(20, 1)
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
		} else if (activeRanking === 'popularnosc') {
			getPopularityEventRanking(20)
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
				getLocalEventRanking(selectedCity, 20, 1)
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
			<h3 className='text-lg font-semibold text-white mb-4'>Ranking wydarzeń</h3>

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
				{activeRanking === 'oceny' && (
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
										{top3.map((event) => {
											const colors = getTop3Colors(event.position)
											return (
												<Link
													key={event.eventId}
													to={`/event/${event.eventId}`}
													className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 transition-transform hover:scale-105`}
												>
													<div className='flex flex-col items-center text-center space-y-3'>
														<div className='relative w-full'>
															<div className='relative h-32 w-full rounded-xl overflow-hidden bg-zinc-800'>
																{event.eventImageUrl && event.eventImageUrl.trim() !== '' ? (
																	<img
																		src={event.eventImageUrl}
																		alt={event.eventName}
																		className='h-full w-full object-cover'
																		onError={(e) => {
																			const target = e.currentTarget as HTMLImageElement
																			target.style.display = 'none'
																			const fallback = target.nextElementSibling as HTMLElement
																			if (fallback) fallback.style.display = 'flex'
																		}}
																	/>
																) : null}
																<div
																	className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 ${
																		event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'hidden' : 'flex'
																	}`}
																	style={{ display: event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'none' : 'flex' }}
																>
																	<span className='text-4xl'>{event.eventName}</span>
																</div>
																<div className={`absolute top-2 right-2 ${colors.crown}`}>
																	<Crown size={20} className='fill-current' />
																</div>
															</div>
														</div>
														<div>
															<div className={`text-2xl font-bold ${colors.text} mb-1`}>
																#{event.position}
															</div>
															<h4 className='text-white font-semibold text-lg line-clamp-2'>{event.eventName}</h4>
															<div className='text-sm text-zinc-400 mt-1'>
																{event.sportTypeName} • {event.eventCity}
															</div>
															<div className='text-xs text-zinc-500 mt-1'>
																Organizator: <Link to={`/profile/${event.ownerId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																	{event.ownerName}
																</Link>
															</div>
														</div>
														<div className='flex flex-col items-center gap-1'>
															<StarRatingDisplay value={event.averageRating} size={18} />
															<div className={`text-2xl font-bold ${colors.text}`}>
																{event.averageRating.toFixed(1)}
															</div>
															<div className='text-xs text-zinc-400'>
																{event.totalRatings} {event.totalRatings === 1 ? 'ocena' : 'ocen'}
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
										{rest.map((event) => (
											<Link
												key={event.eventId}
												to={`/event/${event.eventId}`}
												className='flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:bg-zinc-800'
											>
												<div className='flex items-center gap-4 flex-1 min-w-0'>
													<div className='text-zinc-400 font-semibold w-8 shrink-0'>
														#{event.position}
													</div>
													<div className='h-16 w-24 rounded-lg overflow-hidden bg-zinc-800 shrink-0'>
														{event.eventImageUrl && event.eventImageUrl.trim() !== '' ? (
															<img
																src={event.eventImageUrl}
																alt={event.eventName}
																className='h-full w-full object-cover'
																onError={(e) => {
																	const target = e.currentTarget as HTMLImageElement
																	target.style.display = 'none'
																	const fallback = target.nextElementSibling as HTMLElement
																	if (fallback) fallback.style.display = 'flex'
																}}
															/>
														) : null}
														<div
															className={`h-full w-full flex items-center justify-center bg-zinc-800 ${
																event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'hidden' : 'flex'
															}`}
															style={{ display: event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'none' : 'flex' }}
														>
															<span className='text-xl'>⚽</span>
														</div>
													</div>
													<div className='flex-1 min-w-0'>
														<div className='text-white font-medium truncate'>{event.eventName}</div>
														<div className='flex items-center gap-2 mt-1 text-sm text-zinc-400'>
															<span>{event.sportTypeName}</span>
															<span>•</span>
															<span>{event.eventCity}</span>
															<span>•</span>
															<Link to={`/profile/${event.ownerId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																{event.ownerName}
															</Link>
														</div>
														<div className='flex items-center gap-2 mt-1'>
															<StarRatingDisplay value={event.averageRating} size={14} />
															<span className='text-sm text-zinc-400'>
																{event.averageRating.toFixed(1)} ({event.totalRatings} {event.totalRatings === 1 ? 'ocena' : 'ocen'})
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
				{activeRanking === 'popularnosc' && (
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
										{top3.map((event) => {
											const colors = getTop3Colors(event.position)
											return (
												<Link
													key={event.eventId}
													to={`/event/${event.eventId}`}
													className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 transition-transform hover:scale-105`}
												>
													<div className='flex flex-col items-center text-center space-y-3'>
														<div className='relative w-full'>
															<div className='relative h-32 w-full rounded-xl overflow-hidden bg-zinc-800'>
																{event.eventImageUrl && event.eventImageUrl.trim() !== '' ? (
																	<img
																		src={event.eventImageUrl}
																		alt={event.eventName}
																		className='h-full w-full object-cover'
																		onError={(e) => {
																			const target = e.currentTarget as HTMLImageElement
																			target.style.display = 'none'
																			const fallback = target.nextElementSibling as HTMLElement
																			if (fallback) fallback.style.display = 'flex'
																		}}
																	/>
																) : null}
																<div
																	className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 ${
																		event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'hidden' : 'flex'
																	}`}
																	style={{ display: event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'none' : 'flex' }}
																>
																	<span className='text-4xl'>⚽</span>
																</div>
																<div className={`absolute top-2 right-2 ${colors.crown}`}>
																	<Crown size={20} className='fill-current' />
																</div>
															</div>
														</div>
														<div>
															<div className={`text-2xl font-bold ${colors.text} mb-1`}>
																#{event.position}
															</div>
															<h4 className='text-white font-semibold text-lg line-clamp-2'>{event.eventName}</h4>
															<div className='text-sm text-zinc-400 mt-1'>
																{event.sportTypeName} • {event.eventCity}
															</div>
															<div className='text-xs text-zinc-500 mt-1'>
																Organizator: <Link to={`/profile/${event.ownerId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																	{event.ownerName}
																</Link>
															</div>
														</div>
														<div className='flex flex-col items-center gap-1'>
															<div className={`text-3xl font-bold ${colors.text}`}>
																{event.participantCount}
															</div>
															<div className='text-xs text-zinc-400'>
																{event.participantCount === 1
																	? 'uczestnik'
																	: event.participantCount < 5
																	? 'uczestników'
																	: 'uczestników'}
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
										{rest.map((event) => (
											<Link
												key={event.eventId}
												to={`/event/${event.eventId}`}
												className='flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:bg-zinc-800'
											>
												<div className='flex items-center gap-4 flex-1 min-w-0'>
													<div className='text-zinc-400 font-semibold w-8 shrink-0'>
														#{event.position}
													</div>
													<div className='h-16 w-24 rounded-lg overflow-hidden bg-zinc-800 shrink-0'>
														{event.eventImageUrl && event.eventImageUrl.trim() !== '' ? (
															<img
																src={event.eventImageUrl}
																alt={event.eventName}
																className='h-full w-full object-cover'
																onError={(e) => {
																	const target = e.currentTarget as HTMLImageElement
																	target.style.display = 'none'
																	const fallback = target.nextElementSibling as HTMLElement
																	if (fallback) fallback.style.display = 'flex'
																}}
															/>
														) : null}
														<div
															className={`h-full w-full flex items-center justify-center bg-zinc-800 ${
																event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'hidden' : 'flex'
															}`}
															style={{ display: event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'none' : 'flex' }}
														>
															<span className='text-xl'>⚽</span>
														</div>
													</div>
													<div className='flex-1 min-w-0'>
														<div className='text-white font-medium truncate'>{event.eventName}</div>
														<div className='flex items-center gap-2 mt-1 text-sm text-zinc-400'>
															<span>{event.sportTypeName}</span>
															<span>•</span>
															<span>{event.eventCity}</span>
															<span>•</span>
															<Link to={`/profile/${event.ownerId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																{event.ownerName}
															</Link>
														</div>
														<div className='text-sm text-zinc-400 mt-1'>
															{event.participantCount} {event.participantCount === 1 ? 'uczestnik' : 'uczestników'}
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
							<CitySelector value={selectedCity} onChange={setSelectedCity} />
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
										{top3.map((event) => {
											const colors = getTop3Colors(event.position)
											return (
												<Link
													key={event.eventId}
													to={`/event/${event.eventId}`}
													className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 transition-transform hover:scale-105`}
												>
													<div className='flex flex-col items-center text-center space-y-3'>
														<div className='relative w-full'>
															<div className='relative h-32 w-full rounded-xl overflow-hidden bg-zinc-800'>
																{event.eventImageUrl && event.eventImageUrl.trim() !== '' ? (
																	<img
																		src={event.eventImageUrl}
																		alt={event.eventName}
																		className='h-full w-full object-cover'
																		onError={(e) => {
																			const target = e.currentTarget as HTMLImageElement
																			target.style.display = 'none'
																			const fallback = target.nextElementSibling as HTMLElement
																			if (fallback) fallback.style.display = 'flex'
																		}}
																	/>
																) : null}
																<div
																	className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 ${
																		event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'hidden' : 'flex'
																	}`}
																	style={{ display: event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'none' : 'flex' }}
																>
																	<span className='text-4xl'>⚽</span>
																</div>
																<div className={`absolute top-2 right-2 ${colors.crown}`}>
																	<Crown size={20} className='fill-current' />
																</div>
															</div>
														</div>
														<div>
															<div className={`text-2xl font-bold ${colors.text} mb-1`}>
																#{event.position}
															</div>
															<h4 className='text-white font-semibold text-lg line-clamp-2'>{event.eventName}</h4>
															<div className='text-sm text-zinc-400 mt-1'>
																{event.sportTypeName}
															</div>
															<div className='text-xs text-zinc-500 mt-1'>
																Organizator: <Link to={`/profile/${event.ownerId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																	{event.ownerName}
																</Link>
															</div>
														</div>
														<div className='flex flex-col items-center gap-1'>
															<StarRatingDisplay value={event.averageRating} size={18} />
															<div className={`text-2xl font-bold ${colors.text}`}>
																{event.averageRating.toFixed(1)}
															</div>
															<div className='text-xs text-zinc-400'>
																{event.totalRatings} {event.totalRatings === 1 ? 'ocena' : 'ocen'}
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
										{rest.map((event) => (
											<Link
												key={event.eventId}
												to={`/event/${event.eventId}`}
												className='flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:bg-zinc-800'
											>
												<div className='flex items-center gap-4 flex-1 min-w-0'>
													<div className='text-zinc-400 font-semibold w-8 shrink-0'>
														#{event.position}
													</div>
													<div className='h-16 w-24 rounded-lg overflow-hidden bg-zinc-800 shrink-0'>
														{event.eventImageUrl && event.eventImageUrl.trim() !== '' ? (
															<img
																src={event.eventImageUrl}
																alt={event.eventName}
																className='h-full w-full object-cover'
																onError={(e) => {
																	const target = e.currentTarget as HTMLImageElement
																	target.style.display = 'none'
																	const fallback = target.nextElementSibling as HTMLElement
																	if (fallback) fallback.style.display = 'flex'
																}}
															/>
														) : null}
														<div
															className={`h-full w-full flex items-center justify-center bg-zinc-800 ${
																event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'hidden' : 'flex'
															}`}
															style={{ display: event.eventImageUrl && event.eventImageUrl.trim() !== '' ? 'none' : 'flex' }}
														>
															<span className='text-xl'>⚽</span>
														</div>
													</div>
													<div className='flex-1 min-w-0'>
														<div className='text-white font-medium truncate'>{event.eventName}</div>
														<div className='flex items-center gap-2 mt-1 text-sm text-zinc-400'>
															<span>{event.sportTypeName}</span>
															<span>•</span>
															<Link to={`/profile/${event.ownerId}`} className='text-violet-300 hover:underline' onClick={(e) => e.stopPropagation()}>
																{event.ownerName}
															</Link>
														</div>
														<div className='flex items-center gap-2 mt-1'>
															<StarRatingDisplay value={event.averageRating} size={14} />
															<span className='text-sm text-zinc-400'>
																{event.averageRating.toFixed(1)} ({event.totalRatings} {event.totalRatings === 1 ? 'ocena' : 'ocen'})
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

export default EventRankings
