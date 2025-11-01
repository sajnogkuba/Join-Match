import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../Api/axios'
import type { UsersResponse } from '../Api/types/User'
import { UserPlus, UserMinus } from 'lucide-react'
import Avatar from '../components/Avatar'
import StarRatingDisplay from '../components/StarRatingDisplay'
import type { UserRatingResponse } from '../Api/types/Rating'
import UserRatingForm from '../components/UserRatingForm'
import { toast } from 'sonner'

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
	const [friendStatus, setFriendStatus] = useState<FriendStatus>({
		isFriend: false,
	})
    const [userRatings, setUserRatings] = useState<UserRatingResponse[]>([])
	const [isSending, setIsSending] = useState(false)

	const [showAllEvents, setShowAllEvents] = useState(false)
	const EVENTS_PREVIEW = 3

    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const [currentUserName, setCurrentUserName] = useState<string | null>(null)
    const [viewerEvents, setViewerEvents] = useState<any[]>([])

    const fetchUserRatings = async () => {
        try {
            const res = await api.get(`/ratings/user/${id}`)
            setUserRatings(res.data || [])
        } catch {
            setUserRatings([])
        }
    }

    const averageRating = userRatings.length
        ? userRatings.reduce((acc, r) => acc + r.rating, 0) / userRatings.length
        : null

    const hasRated = !!(currentUserName && userRatings.some(r => r.raterName === currentUserName))
    const hasCommonEvent = viewerEvents.length > 0 && events.length > 0 && viewerEvents.some(ve => events.some(e => e.eventId === ve.eventId))

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
			toast.success('Dziękujemy za ocenę!')
			fetchUserRatings()
		} catch {
			toast.error('Nie możesz ocenić tego użytkownika.')
		} finally {
			setIsSending(false)
		}
	}

	useEffect(() => {
		if (id) fetchUserRatings()
	}, [id])

	const levelToNumber = (level: string | number) => {
		if (typeof level === 'number') return level
		if (!level) return 0

		const lower = level.toString().toLowerCase()
		switch (lower) {
			case 'niski':
				return 1
			case 'średni':
				return 3
			case 'wysoki':
				return 5
			default:
				const parsed = parseInt(lower)
				return isNaN(parsed) ? 0 : parsed
		}
	}

	useEffect(() => {
		const token = localStorage.getItem('accessToken')
		if (!token || !id) return

		const fetchData = async () => {
            try {
                // first get current user (to obtain viewerId)
                const currentUserRes = await api.get('/auth/user', { params: { token } })
                // then fetch profile passing viewerId so backend returns relationStatus
                const profileRes = await api.get(`/auth/user/${id}`, {
                    params: { viewerId: currentUserRes.data.id },
                })

                setCurrentUserId(currentUserRes.data.id)
                setCurrentUserName(currentUserRes.data.name)
                setUser(profileRes.data)

				const relation = profileRes.data.relationStatus
				if (relation === 'FRIEND') setFriendStatus({ isFriend: true })
				else if (relation === 'PENDING') setFriendStatus({ isFriend: false, pendingRequestId: -1 })
				else setFriendStatus({ isFriend: false })

                const targetEmail = profileRes.data.email
                const targetEventsRes = await api.get(`/user-event/by-user-email`, { params: { userEmail: targetEmail } })
                setEvents(targetEventsRes.data || [])

                // fetch viewer's events as well (to check common events for UI gating)
                const viewerEmail = currentUserRes.data.email
                if (viewerEmail) {
                    const viewerEventsRes = await api.get(`/user-event/by-user-email`, { params: { userEmail: viewerEmail } })
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
		if (currentUserId && id && currentUserId === parseInt(id)) {
			window.location.href = '/profile'
		}
	}, [currentUserId, id])

	const handleAddFriend = async () => {
		if (!currentUserId || !id) return
		try {
			await api.post('/friends/request', {
				senderId: currentUserId,
				receiverId: parseInt(id ?? '0'),
			})
			// refresh profile so backend's relationStatus (PENDING) is reflected
			const res = await api.get(`/auth/user/${id}`, {
				params: { viewerId: currentUserId },
			})
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
				<div className='absolute inset-0 bg-cover bg-center' />
				<div className='absolute inset-0 bg-black/60' />
				<div className='relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-6 md:px-8'>
					<div>
						<h1 className='text-2xl md:text-3xl font-semibold text-white'>Profil użytkownika</h1>
						<div className='mt-2 h-1 w-32 rounded-full bg-violet-600' />
					</div>
				</div>
			</header>

			<main className='mx-auto max-w-5xl px-4 py-8 md:px-8'>
				<div className='rounded-3xl bg-black/60 p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800 flex flex-col md:flex-row gap-6'>
					{/* Avatar */}
					<div className='flex flex-col items-center md:w-1/3 text-center'>
                <Avatar
                    src={user.urlOfPicture}
                    name={user.name}
                    size='md'
                    className='ring-4 ring-violet-700 shadow-xl mb-4'
                />
                <h2 className='text-xl font-semibold text-white'>{user.name}</h2>
                <p className='text-sm text-zinc-400'>{user.email}</p>

                {averageRating && (
                    <div className='mt-3 inline-flex items-center gap-2'>
                        <StarRatingDisplay value={averageRating} size={18} />
                        <span className='text-sm text-zinc-300'>({averageRating.toFixed(1)})</span>
                    </div>
                )}

						<div className='mt-6 flex flex-col gap-3 w-full'>
							{!friendStatus.isFriend && friendStatus.pendingRequestId !== -1 && (
								<button
									onClick={handleAddFriend}
									className='flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition'>
									<UserPlus size={18} /> Dodaj do znajomych
								</button>
							)}
							{friendStatus.pendingRequestId === -1 && (
								<p className='text-green-400 font-medium'>Zaproszenie wysłane!</p>
							)}
							{friendStatus.isFriend && (
								<button
									onClick={handleRemoveFriend}
									className='flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition'>
									<UserMinus size={18} /> Usuń znajomego
								</button>
							)}
						</div>
					</div>

					{/* Dane użytkownika */}
					<div className='flex-1 space-y-6'>
						<section>
							<h3 className='text-lg font-semibold text-white mb-3'>O użytkowniku</h3>
							<p className='text-zinc-400'>Data urodzenia: {new Date(user.dateOfBirth).toLocaleDateString('pl-PL')}</p>
						</section>

						<section>
							<h3 className='text-lg font-semibold text-white mb-3'>Sporty i poziomy</h3>
							{user.sports.length ? (
								<ul className='space-y-3'>
									{user.sports.map(sport => (
										<li
											key={sport.id}
											className='flex items-center justify-between bg-zinc-800/50 px-4 py-2 rounded-lg'>
											<span>{sport.name}</span>
											{sport.level ? (
												<div className='flex items-center gap-2'>
													<StarRatingDisplay value={levelToNumber(sport.level)} />
													<span className='text-sm text-zinc-400 ml-1'>{sport.level}/5</span>
												</div>
											) : (
												<span className='text-zinc-500 text-sm italic'>brak danych</span>
											)}
										</li>
									))}
								</ul>
							) : (
								<p className='text-zinc-500 text-sm'>Brak dodanych sportów.</p>
							)}
						</section>

						{/* Events history section */}
						<section>
							<h3 className='text-lg font-semibold text-white mb-3'>Historia wydarzeń</h3>
							{events.length ? (
								<>
									<ul className='space-y-3'>
										{(showAllEvents ? events : events.slice(0, EVENTS_PREVIEW)).map(e => (
											<li key={e.eventId} className='flex items-center gap-4 bg-zinc-800/50 px-4 py-2 rounded-lg'>
												{e.imageUrl ? (
													<img src={e.imageUrl} alt='' className='h-12 w-12 rounded-full object-cover' />
												) : (
													<div className='h-12 w-12 rounded-full bg-zinc-700 grid place-items-center text-xs text-zinc-400'>
														img
													</div>
												)}
												<div className='flex-1 min-w-0'>
													<p className='text-white font-medium truncate'>{e.eventName}</p>
													<p className='text-xs text-zinc-400 truncate'>Status: {e.attendanceStatusName}</p>
												</div>
												<a
													href={`/event/${e.eventId}`}
													className='text-violet-400 hover:text-violet-300 text-sm font-medium'>
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
								<p className='text-zinc-500 text-sm italic'>Brak historii wydarzeń.</p>
							)}
						</section>

						{/* --- Oceny użytkownika --- */}
						<section className='mt-8'>
							<h3 className='text-lg font-semibold text-white mb-3'>Oceny użytkownika</h3>

                {/* Formularz oceny: tylko inni, jednorazowo, opcjonalnie z wspólnym wydarzeniem */}
                {currentUserId && currentUserId !== parseInt(id ?? '0') && !hasRated && hasCommonEvent && (
                    <UserRatingForm onSubmit={handleAddUserRating} disabled={isSending} />
                )}
                {hasRated && (
                    <p className='text-sm text-emerald-300 italic'>Dziękujemy! Już oceniłeś tego użytkownika.</p>
                )}
                {!hasRated && currentUserId && currentUserId !== parseInt(id ?? '0') && !hasCommonEvent && (
                    <p className='text-sm text-zinc-400 italic'>Możesz ocenić użytkownika tylko, jeśli uczestniczyliście w tym samym wydarzeniu.</p>
                )}

							{/* Lista ocen */}
                {userRatings.length ? (
                    <ul className='space-y-3 mt-6'>
                        {userRatings.map(r => (
                            <li key={r.id} className='bg-zinc-800/50 p-4 rounded-xl border border-zinc-700'>
                                <div className='flex items-center justify-between mb-1'>
                                    <div className='flex items-center gap-3'>
                                        <Avatar src={null} name={r.raterName} size='sm' className='ring-1 ring-zinc-700' />
                                        <div className='leading-tight'>
                                            <div className='text-white text-sm font-medium'>{r.raterName}</div>
                                        </div>
                                    </div>
                                    <span className='text-xs text-zinc-500'>
                                        {new Date(r.createdAt).toLocaleDateString('pl-PL')}
                                    </span>
                                </div>
                                <div className='mb-2'>
                                    <StarRatingDisplay value={r.rating} size={18} />
                                </div>
                                {r.comment && <p className='text-sm text-zinc-300'>{r.comment}</p>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='text-zinc-500 text-sm italic mt-4'>Brak ocen dla tego użytkownika.</p>
                )}
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}

export default UserProfilePage
