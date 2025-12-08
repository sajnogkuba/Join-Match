import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../Api/axios'
import Avatar from '../components/Avatar'
import StarRatingDisplay from '../components/StarRatingDisplay'
import StarRatingInput from '../components/StarRatingInput'
import UserProfileSidebar from '../components/UserProfileSidebar'
import UserRatingForm from '../components/UserRatingForm'
import type { UsersResponse } from '../Api/types/User'
import type { UserRatingResponse, OrganizerRatingResponse } from '../Api/types/Rating'
import { toast } from 'sonner'
import { UserPlus, UserMinus, Users, Trophy, Star, MessageSquare } from 'lucide-react'
import RatingCard from '../components/RatingCard'
import { parseLocalDate } from '../utils/formatDate'
import { showRatingToast } from '../components/RatingToast'
import { useNavigate } from 'react-router-dom'

import MutualEventsUserProfile from '../components/MutualEventsUserProfile'

interface FriendStatus {
	isFriend: boolean
	pendingRequestId?: number
}

const UserProfilePage = () => {
	const { id } = useParams<{ id: string }>()

	const [user, setUser] = useState<UsersResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [events, setEvents] = useState<any[]>([])
	const [userRatings, setUserRatings] = useState<UserRatingResponse[]>([])
	const [organizerRatings, setOrganizerRatings] = useState<OrganizerRatingResponse[]>([])
	const [activeTab, setActiveTab] = useState<string>('Informacje')

	const [currentUserId, setCurrentUserId] = useState<number | null>(null)
	const [currentUserName, setCurrentUserName] = useState<string | null>(null)
	const [viewerEvents, setViewerEvents] = useState<any[]>([])
	const [isSending, setIsSending] = useState(false)
	const [friendsCount, setFriendsCount] = useState<number>(0)
	const [mainSportName, setMainSportName] = useState<string>('')
	const [editingRatingId, setEditingRatingId] = useState<number | null>(null)
	const [editRatingValue, setEditRatingValue] = useState<number>(0)
	const [editRatingComment, setEditRatingComment] = useState<string>('')
	const [editingOrganizerRatingId, setEditingOrganizerRatingId] = useState<number | null>(null)
	const [editOrganizerRatingValue, setEditOrganizerRatingValue] = useState<number>(0)
	const [editOrganizerRatingComment, setEditOrganizerRatingComment] = useState<string>('')
	const navigate = useNavigate()

	const levelToNumber = (lvl: any): number => {
		if (typeof lvl === 'number') return lvl
		const s = String(lvl || '').toLowerCase()
		if (s === 'niski') return 1
		if (s.startsWith('ś') || s.includes('redni')) return 3
		if (s === 'wysoki') return 5
		const parsed = parseInt(s)
		return isNaN(parsed) ? 0 : parsed
	}
	const toFiveScale = (n: number) => (n > 5 ? n / 2 : n)

	const [friendStatus, setFriendStatus] = useState<FriendStatus>({ isFriend: false })

	const EVENTS_PREVIEW = 3
	const [showAllEvents, setShowAllEvents] = useState(false)

	const [mutualEvents, setMutualEvents] = useState<any[]>([])
	const [isLoadingMutual, setIsLoadingMutual] = useState(false)

	const fetchUserRatings = async () => {
		try {
			const res = await api.get(`/ratings/user/${id}`)
			setUserRatings(res.data || [])
		} catch {
			setUserRatings([])
		}
	}

	const fetchOrganizerRatings = async () => {
		try {
			if (!id) return
			const res = await api.get(`/ratings/${id}`)
			setOrganizerRatings(res.data || [])
		} catch {
			setOrganizerRatings([])
		}
	}

	const averageRating = userRatings.length ? userRatings.reduce((a, r) => a + r.rating, 0) / userRatings.length : null

	const hasRated = !!(currentUserName && userRatings.some(r => r.raterName === currentUserName))
	const hasCommonEvent =
		viewerEvents.length > 0 && events.length > 0 && viewerEvents.some(ve => events.some(e => e.eventId === ve.eventId))

	const handleAddUserRating = async (rating: number, comment: string) => {
		if (!currentUserId || !id) return
		setIsSending(true)
		try {
			await api.post(`/ratings/user`, {
				raterId: currentUserId,
				ratedId: parseInt(id),
				rating,
				comment,
			})
			showRatingToast({ type: 'add', target: 'użytkownika' })
			fetchUserRatings()
		} catch {
			toast.error('Nie możesz ocenić tego użytkownika.')
		} finally {
			setIsSending(false)
		}
	}

	const handleOpenChat = async () => {
		if (!currentUserId || !id) return
		try {
			const token = localStorage.getItem('accessToken')
			const res = await api.post(`/conversations/direct?user1Id=${currentUserId}&user2Id=${parseInt(id)}`, null, {
				headers: { Authorization: `Bearer ${token}` },
			})

			const conversationId = res.data?.id || res.data?.conversationId

			navigate('/chat', {
				state: { conversationId: conversationId ?? null, targetUserId: parseInt(id) },
			})
		} catch (err) {
			toast.error('Nie udało się otworzyć czatu.')
			console.error(err)
		}
	}

	const startEditUserRating = (r: UserRatingResponse) => {
		setEditingRatingId(r.id)
		setEditRatingValue(r.rating)
		setEditRatingComment(r.comment || '')
	}

	const cancelEditUserRating = () => {
		setEditingRatingId(null)
		setEditRatingValue(0)
		setEditRatingComment('')
	}

	const saveEditUserRating = async (ratingId: number) => {
		if (!currentUserId || !id) return
		try {
			const token = localStorage.getItem('accessToken')
			await api.put(
				`/ratings/user/${ratingId}`,
				{
					raterId: currentUserId,
					ratedId: parseInt(id),
					rating: editRatingValue,
					comment: editRatingComment,
				},
				{
					...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
					params: { userId: currentUserId },
				}
			)
			showRatingToast({ type: 'update', target: 'użytkownika' })
			cancelEditUserRating()
			fetchUserRatings()
		} catch (e) {
			toast.error('Nie udało się zaktualizować opinii')
		}
	}

	const deleteUserRating = async (ratingId: number) => {
		try {
			const token = localStorage.getItem('accessToken')
			await api.delete(`/ratings/user/${ratingId}`, {
				...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
				params: { userId: currentUserId ?? undefined },
			})
			showRatingToast({ type: 'delete', target: 'użytkownika' })
			if (editingRatingId === ratingId) cancelEditUserRating()
			fetchUserRatings()
		} catch (e) {
			toast.error('Nie udało się usunąć opinii')
		}
	}

	useEffect(() => {
		if (id) {
			fetchUserRatings()
			fetchOrganizerRatings()
		}
	}, [id])

	const startEditOrganizerRating = (r: OrganizerRatingResponse) => {
		setEditingOrganizerRatingId(r.id)
		setEditOrganizerRatingValue(r.rating)
		setEditOrganizerRatingComment(r.comment || '')
	}

	const cancelEditOrganizerRating = () => {
		setEditingOrganizerRatingId(null)
		setEditOrganizerRatingValue(0)
		setEditOrganizerRatingComment('')
	}

	const saveEditOrganizerRating = async (ratingId: number) => {
		if (!currentUserId || !id) return
		try {
			const token = localStorage.getItem('accessToken')
			await api.put(
				`/ratings/organizer/${ratingId}`,
				{
					raterId: currentUserId,
					organizerId: parseInt(id),
					rating: editOrganizerRatingValue,
					comment: editOrganizerRatingComment,
					eventId: 0,
				},
				{
					...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
					params: { userId: currentUserId },
				}
			)
			showRatingToast({ type: 'update', target: 'organizatora' })
			cancelEditOrganizerRating()
			fetchOrganizerRatings()
		} catch (e) {
			toast.error('Nie udało się zaktualizować oceny')
		}
	}

	const deleteOrganizerRating = async (ratingId: number) => {
		try {
			const token = localStorage.getItem('accessToken')
			await api.delete(`/ratings/organizer/${ratingId}`, {
				...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
				params: { userId: currentUserId ?? undefined },
			})
			showRatingToast({ type: 'delete', target: 'organizatora' })
			if (editingOrganizerRatingId === ratingId) cancelEditOrganizerRating()
			fetchOrganizerRatings()
		} catch (e) {
			toast.error('Nie udało się usunąć oceny organizatora')
		}
	}

	useEffect(() => {
		const token = localStorage.getItem('accessToken')
		if (!token || !id) return

		const fetchData = async () => {
			setLoading(true)
			try {
				const currentRes = await api.get('/auth/user', { params: { token } })
				setCurrentUserId(currentRes.data.id)
				setCurrentUserName(currentRes.data.name)

				const profileRes = await api.get(`/auth/user/${id}`, {
					params: { viewerId: currentRes.data.id },
				})
				setUser(profileRes.data)

				const relation = profileRes.data.relationStatus
				if (relation === 'FRIEND') setFriendStatus({ isFriend: true })
				else if (relation === 'PENDING') setFriendStatus({ isFriend: false, pendingRequestId: -1 })
				else setFriendStatus({ isFriend: false })

				const targetEmail = profileRes.data.email
				const targetEventsRes = await api.get(`/user-event/by-user-email`, {
					params: { userEmail: targetEmail },
				})
				setEvents(targetEventsRes.data || [])

				// liczba znajomych
				try {
					const friendsRes = await api.get(`/friends/${profileRes.data.id}`)
					setFriendsCount((friendsRes.data || []).length)
				} catch {
					setFriendsCount(0)
				}

				// główny sport (heurystyka)
				try {
					const sports = profileRes.data.sports || []
					const best = [...sports].sort((a: any, b: any) => levelToNumber(b.level) - levelToNumber(a.level))[0]
					setMainSportName(best?.name || '')
				} catch {
					setMainSportName('')
				}

				const viewerEmail = currentRes.data.email
				if (viewerEmail) {
					const viewerEventsRes = await api.get(`/user-event/by-user-email`, {
						params: { userEmail: viewerEmail },
					})
					setViewerEvents(viewerEventsRes.data || [])
				}
			} catch {
				setErrorMsg('Nie udało się pobrać profilu użytkownika.')
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [id])

	useEffect(() => {
		if (!currentUserId || !user?.id) return
		const fetchMutual = async () => {
			setIsLoadingMutual(true)
			try {
				const mutualRes = await api.get('/event/mutualEvents', {
					params: {
						idLogUser: currentUserId, // zalogowany
						idViewedUser: user.id, // oglądany profil
						// token: localStorage.getItem('accessToken'), // odkomentuj, jeśli BE wymaga tokenu w query
					},
				})
				setMutualEvents(Array.isArray(mutualRes.data) ? mutualRes.data : [])
			} catch {
				setMutualEvents([])
			} finally {
				setIsLoadingMutual(false)
			}
		}
		fetchMutual()
	}, [currentUserId, user?.id])

	useEffect(() => {
		if (currentUserId && id && currentUserId === parseInt(id)) {
			window.location.href = '/profile'
		}
	}, [currentUserId, id])

	const handleAddFriend = async () => {
		if (!currentUserId || !id) return
		try {
			await api.post('/friends/request', { senderId: currentUserId, receiverId: parseInt(id ?? '0') })
			const res = await api.get(`/auth/user/${id}`, { params: { viewerId: currentUserId } })
			setUser(res.data)
			const relation = res.data.relationStatus
			if (relation === 'PENDING') setFriendStatus({ isFriend: false, pendingRequestId: -1 })
		} catch {
			setErrorMsg('Nie udało się wysłać zaproszenia.')
		}
	}

	const handleRemoveFriend = async () => {
		if (!currentUserId || !id) return
		try {
			const res = await api.get(`/friends/${currentUserId}`)
			const friendship = res.data.find((f: any) => f.id === parseInt(id ?? '0'))
			if (friendship) {
				await api.delete(`/friends/${friendship.friendshipId}`)
				setFriendStatus({ isFriend: false })
			}
		} catch {
			setErrorMsg('Nie udało się usunąć znajomego.')
		}
	}

	if (loading) return <div className='p-10 text-center text-zinc-400'>Ładowanie profilu...</div>
	if (errorMsg) return <div className='p-10 text-center text-red-400'>{errorMsg}</div>
	if (!user) return null

	return (
		<div className='min-h-screen bg-[#1f2632] text-zinc-300'>
			<header className='relative h-[180px] md:h-[220px] w-full overflow-hidden'>
				<div className='absolute inset-0 bg-black/60' />
				<div className='relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-6 md:px-8'>
					<div>
						<h1 className='text-2xl md:text-3xl font-semibold text-white'>{user.name}</h1>
						<div className='mt-2 h-1 w-32 rounded-full bg-violet-600' />
					</div>
				</div>
			</header>

			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8'>
				<div className='rounded-3xl bg-black/60 p-6 md:p-8 ring-1 ring-zinc-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]'>
					{/* Karta nagłówkowa */}
					<div className='flex flex-col md:flex-row items-center justify-between gap-6 mb-8'>
						<div className='flex items-center gap-4'>
							<Avatar src={user.urlOfPicture} name={user.name} size='md' className='ring-4 ring-violet-700 shadow-xl' />
							<div>
								<p className='text-white font-semibold leading-tight'>
									{user.name} <span className='text-zinc-400'>/ Profil</span>
								</p>
								<p className='text-sm text-zinc-400'>Zaktualizuj swoje dane i zarządzaj kontem</p>
							</div>
						</div>
						<div className='flex items-center gap-8'>
							<div className='text-center'>
								<div className='flex items-center justify-center gap-1'>
									<Star size={16} className='fill-current' />
									<span className='font-semibold text-white'>{averageRating ? averageRating.toFixed(1) : '—'}</span>
								</div>
								<p className='text-xs text-zinc-400'>Ocena</p>
							</div>
							<div className='text-center'>
								<div className='flex items-center justify-center gap-1'>
									<Users size={16} />
									<span className='font-semibold text-white'>{friendsCount}</span>
								</div>
								<p className='text-xs text-zinc-400'>Znajomi</p>
							</div>
							<div className='text-center'>
								<div className='flex items-center justify-center gap-1'>
									<Trophy size={16} />
									<span className='font-semibold text-white'>{mainSportName || '—'}</span>
								</div>
								<p className='text-xs text-zinc-400'>Główny sport</p>
							</div>
						</div>
					</div>

					{/* Layout z bocznym panelem */}
					<div className='flex flex-col lg:flex-row gap-8'>
						<UserProfileSidebar active={activeTab} onSelect={setActiveTab} />

						<div className='flex-1 space-y-6'>
							{activeTab === 'Informacje' && (
								<section>
									<h3 className='text-lg font-semibold text-white mb-3'>O użytkowniku</h3>
									<p className='text-sm text-zinc-400'>
										Data urodzenia: {new Date(user.dateOfBirth).toLocaleDateString('pl-PL')}
									</p>
									<p className='mt-2 text-sm text-zinc-400'>Sporty:</p>
									<ul className='mt-2 space-y-2'>
										{user.sports.map(s => (
											<li key={s.id} className='flex items-center justify-between bg-zinc-800/50 px-4 py-2 rounded-lg'>
												<span>{s.name}</span>
												<div className='flex items-center gap-2'>
													<StarRatingDisplay value={toFiveScale(levelToNumber(s.level))} />
													<span className='text-sm text-zinc-400 ml-1'>Poziom: {levelToNumber(s.level)}</span>
												</div>
											</li>
										))}
									</ul>

									<div className='mt-6 flex gap-3'>
										{!friendStatus.isFriend && friendStatus.pendingRequestId !== -1 && (
											<button
												onClick={handleAddFriend}
												className='flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition'>
												<UserPlus size={18} /> Dodaj do znajomych
											</button>
										)}
										{friendStatus.pendingRequestId === -1 && (
											<p className='text-green-400 font-medium'>Zaproszenie wysłane!</p>
										)}
										{friendStatus.isFriend && (
											<button
												onClick={handleRemoveFriend}
												className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition'>
												<UserMinus size={18} /> Usuń znajomego
											</button>
										)}
										<button
											onClick={handleOpenChat}
											className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition'>
											<MessageSquare size={18} /> Napisz wiadomość
										</button>
									</div>
								</section>
							)}

							{activeTab === 'Historia wydarzeń' && (
								<section>
									<h3 className='text-lg font-semibold text-white mb-3'>Historia wydarzeń</h3>
									{events.length ? (
										<>
											<ul className='space-y-3'>
												{(showAllEvents ? events : events.slice(0, EVENTS_PREVIEW)).map(e => (
													<li
														key={e.eventId}
														className='flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg'>
														<span className='text-white'>{e.eventName}</span>
														<a href={`/event/${e.eventId}`} className='text-violet-400 hover:text-violet-300 text-sm'>
															Zobacz →
														</a>
													</li>
												))}
											</ul>
											{events.length > EVENTS_PREVIEW && (
												<div className='mt-3 text-center'>
													<button
														onClick={() => setShowAllEvents(s => !s)}
														className='inline-flex items-center gap-2 rounded-lg bg-zinc-800/60 px-4 py-2 text-sm text-violet-300 hover:bg-zinc-800 transition'>
														{showAllEvents ? 'Pokaż mniej' : `Pokaż więcej (${events.length - EVENTS_PREVIEW})`}
													</button>
												</div>
											)}
										</>
									) : (
										<p className='text-sm text-zinc-500 italic'>Brak historii wydarzeń.</p>
									)}
								</section>
							)}

							{activeTab === 'Wspólne wydarzenia' &&
								(isLoadingMutual ? (
									<div className='space-y-3'>
										<div className='h-10 rounded-lg bg-zinc-800/50 animate-pulse' />
										<div className='h-10 rounded-lg bg-zinc-800/50 animate-pulse' />
										<div className='h-10 rounded-lg bg-zinc-800/50 animate-pulse' />
									</div>
								) : (
									<section>
										{mutualEvents.length ? (
											<>
												<MutualEventsUserProfile events={mutualEvents} previewCount={3} />
											</>
										) : (
											<p className='text-sm text-zinc-500 italic'>Brak wspólnych wydarzeń.</p>
										)}
									</section>
								))}

							{activeTab === 'Oceny (uczestnik)' && (
								<section>
									<h3 className='text-lg font-semibold text-white mb-3'>Oceny użytkownika</h3>
									{currentUserId && currentUserId !== parseInt(id ?? '0') && !hasRated && hasCommonEvent && (
										<UserRatingForm onSubmit={handleAddUserRating} disabled={isSending} />
									)}
									{hasRated && (
										<p className='text-sm text-emerald-300 italic mt-3'>Dziękujemy! Już oceniłeś tego użytkownika.</p>
									)}
									{!hasRated && currentUserId && currentUserId !== parseInt(id ?? '0') && !hasCommonEvent && (
										<p className='text-sm text-zinc-400 italic mt-3'>
											Możesz ocenić użytkownika tylko, jeśli uczestniczyliście w tym samym wydarzeniu.
										</p>
									)}
									{userRatings.length ? (
										<ul className='space-y-3 mt-6'>
											{userRatings.map(r => {
												const isEditing = editingRatingId === r.id
												if (isEditing) {
													return (
														<li key={r.id} className='bg-zinc-800/50 p-4 rounded-xl border border-zinc-700'>
															<div className='mt-2 space-y-2'>
																<StarRatingInput value={editRatingValue} onChange={setEditRatingValue} />
																<textarea
																	className='w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-zinc-200'
																	value={editRatingComment}
																	onChange={e => setEditRatingComment(e.target.value)}
																	placeholder='Komentarz (opcjonalnie)'
																/>
																<div className='flex gap-2'>
																	<button
																		className='px-3 py-1 rounded-md bg-violet-600 text-white text-sm hover:bg-violet-500'
																		onClick={() => saveEditUserRating(r.id)}>
																		Zapisz
																	</button>
																	<button
																		className='px-3 py-1 rounded-md bg-zinc-700 text-zinc-200 text-sm hover:bg-zinc-600'
																		onClick={cancelEditUserRating}>
																		Anuluj
																	</button>
																</div>
															</div>
														</li>
													)
												}
												return (
													<li key={r.id}>
														<RatingCard
															rating={r.rating}
															raterEmail={r.userEmail}
															comment={r.comment}
															raterName={r.raterName}
															raterAvatarUrl={r.raterAvatarUrl}
															createdAt={r.createdAt}
															isMine={r.raterName === currentUserName}
															onEdit={() => startEditUserRating(r)}
															onDelete={() => deleteUserRating(r.id)}
														/>
													</li>
												)
											})}
										</ul>
									) : (
										<p className='text-zinc-500 text-sm italic mt-4'>Brak ocen dla tego użytkownika.</p>
									)}
								</section>
							)}

							{activeTab === 'Oceny (organizator)' && (
								<section>
									<h3 className='text-lg font-semibold text-white mb-3'>Oceny jako organizator</h3>

									{organizerRatings.length ? (
										<ul className='space-y-3 mt-6'>
											{organizerRatings.map(r => {
												const isEditing = editingOrganizerRatingId === r.id
												const isMine = r.raterId === currentUserId

												if (isEditing) {
													return (
														<li key={r.id} className='bg-zinc-800/50 p-4 rounded-xl border border-zinc-700'>
															<div className='flex items-center justify-between mb-2'>
																<div className='text-sm text-zinc-300'>
																	Wydarzenie:{' '}
																	<a
																		href={`/event/${r.eventId}`}
																		className='text-violet-400 hover:text-violet-300 font-medium'>
																		{r.eventName}
																	</a>
																</div>
																<span className='text-xs text-zinc-500'>
																	{parseLocalDate(r.createdAt).format('DD.MM.YYYY HH:mm')}
																</span>
															</div>

															<div className='mt-2 space-y-2'>
																<StarRatingInput
																	value={editOrganizerRatingValue}
																	onChange={setEditOrganizerRatingValue}
																/>
																<textarea
																	className='w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-zinc-200'
																	value={editOrganizerRatingComment}
																	onChange={e => setEditOrganizerRatingComment(e.target.value)}
																	placeholder='Komentarz (opcjonalnie)'
																/>
																<div className='flex gap-2'>
																	<button
																		className='px-3 py-1 rounded-md bg-violet-600 text-white text-sm hover:bg-violet-500'
																		onClick={() => saveEditOrganizerRating(r.id)}>
																		Zapisz
																	</button>
																	<button
																		className='px-3 py-1 rounded-md bg-zinc-700 text-zinc-200 text-sm hover:bg-zinc-600'
																		onClick={cancelEditOrganizerRating}>
																		Anuluj
																	</button>
																</div>
															</div>
														</li>
													)
												}
												return (
													<li key={r.id}>
														<RatingCard
															rating={r.rating}
															comment={r.comment}
															raterName={r.raterName}
															raterEmail={r.raterEmail}
															raterAvatarUrl={r.raterAvatarUrl}
															createdAt={r.createdAt}
															isMine={!!isMine}
															onEdit={() => startEditOrganizerRating(r)}
															onDelete={() => deleteOrganizerRating(r.id)}
															eventName={r.eventName}
															eventId={r.eventId}
														/>
													</li>
												)
											})}
										</ul>
									) : (
										<p className='text-zinc-500 text-sm italic mt-4'>Brak ocen jako organizator.</p>
									)}
								</section>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default UserProfilePage
