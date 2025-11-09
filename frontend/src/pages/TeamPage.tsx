import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import type { TeamDetails } from '../Api/types/Team'
import type { User } from '../Api/types/User'
import type { SearchResult, Friend } from '../Api/types/Friends'
import type { TeamRequestResponseDto } from '../Api/types/TeamRequest'
import type { TeamMember } from '../Api/types/TeamMember'
import api from '../Api/axios'
import Avatar from '../components/Avatar'
import { MapPin, Users, Crown, UserRound, Loader2, AlertTriangle, Search, X, UserPlus, Clock, ChevronDown, LogOut } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import { parseLocalDate } from '../utils/formatDate'
import { useAuth } from '../Context/authContext'
import AlertModal from '../components/AlertModal'

dayjs.locale('pl')

const TeamPage: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const [team, setTeam] = useState<TeamDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [currentUserId, setCurrentUserId] = useState<number | null>(null)
	const { isAuthenticated } = useAuth()
	const [showInvitePopup, setShowInvitePopup] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<SearchResult[]>([])
	const [searchLoading, setSearchLoading] = useState(false)
	const [inviteActiveTab, setInviteActiveTab] = useState<'search' | 'friends'>('search')
	const [friends, setFriends] = useState<Friend[]>([])
	const [friendsLoading, setFriendsLoading] = useState(false)
	const [friendsSearchQuery, setFriendsSearchQuery] = useState('')
	const [teamRequests, setTeamRequests] = useState<Map<number, TeamRequestResponseDto>>(new Map())
	const [userTeamRequest, setUserTeamRequest] = useState<TeamRequestResponseDto | null>(null)
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
	const [membersLoading, setMembersLoading] = useState(false)
	const [showAllMembers, setShowAllMembers] = useState(false)
	const [userEmail, setUserEmail] = useState<string | null>(null)
	const [showLeaveTeamModal, setShowLeaveTeamModal] = useState(false)
	const [leavingTeam, setLeavingTeam] = useState(false)

	useEffect(() => {
		if (!id) {
			setError('Nieprawidłowy identyfikator drużyny')
			setLoading(false)
			return
		}

		const fetchTeam = async () => {
			try {
				const { data } = await api.get<TeamDetails>(`/team/${id}`)
				setTeam(data)
			} catch (err) {
				console.error('❌ Błąd pobierania szczegółów drużyny:', err)
				setError('Nie udało się pobrać szczegółów drużyny')
			} finally {
				setLoading(false)
			}
		}

		fetchTeam()
	}, [id])

	useEffect(() => {
		if (isAuthenticated) {
			const token = localStorage.getItem('accessToken')
			if (token) {
				api.get<User>('/auth/user', { params: { token } })
					.then(({ data }) => {
						setCurrentUserId(data.id)
						setUserEmail(data.email)
					})
					.catch(() => {
						setCurrentUserId(null)
						setUserEmail(null)
					})
			}
		} else {
			setCurrentUserId(null)
			setUserEmail(null)
		}
	}, [isAuthenticated])

	const searchUsers = useCallback(async (query: string) => {
		if (!query.trim()) {
			setSearchResults([])
			return
		}

		if (!currentUserId) {
			setSearchResults([])
			return
		}

		setSearchLoading(true)
		try {
			const response = await api.get<SearchResult[]>(
				`/auth/search?query=${encodeURIComponent(query)}&senderId=${currentUserId}`
			)
			setSearchResults(response.data)
		} catch (error) {
			console.error('Error searching users:', error)
			setSearchResults([])
		} finally {
			setSearchLoading(false)
		}
	}, [currentUserId])

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			searchUsers(searchQuery)
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [searchQuery, searchUsers])

	const handleInviteUser = async (userId: number) => {
		if (!team) return

		try {
			const response = await api.post<TeamRequestResponseDto>('/team-request', {
				receiverId: userId,
				teamId: team.idTeam
			})

			// Zaktualizuj mapę zaproszeń
			setTeamRequests(prev => {
				const updated = new Map(prev)
				updated.set(userId, response.data)
				return updated
			})
		} catch (error: any) {
			console.error('Error sending team request:', error)
			// Można dodać toast notification tutaj
			if (error.response?.status === 400 || error.response?.status === 409) {
				alert('Nie można wysłać zaproszenia. Użytkownik może już mieć zaproszenie do tej drużyny.')
			} else {
				alert('Nie udało się wysłać zaproszenia. Spróbuj ponownie.')
			}
		}
	}

	const handleCloseInvitePopup = () => {
		setShowInvitePopup(false)
		setSearchQuery('')
		setSearchResults([])
		setFriendsSearchQuery('')
		setTeamRequests(new Map())
		setInviteActiveTab('search')
	}

	// Funkcja do pobierania znajomych z filtrowaniem
	const fetchFriends = useCallback(async (query: string = '') => {
		if (!currentUserId) return

		setFriendsLoading(true)
		try {
			const url = `/friends/${currentUserId}${query ? `?query=${encodeURIComponent(query)}` : ''}`
			const { data } = await api.get<Friend[]>(url)
			setFriends(data)
		} catch (error) {
			console.error('Error fetching friends:', error)
			setFriends([])
		} finally {
			setFriendsLoading(false)
		}
	}, [currentUserId])

	// Pobierz znajomych gdy modal się otwiera (bez query)
	useEffect(() => {
		if (showInvitePopup && currentUserId && !friendsSearchQuery.trim()) {
			fetchFriends('')
		}
	}, [showInvitePopup, currentUserId, fetchFriends])

	// Wyszukiwanie znajomych z debounce
	useEffect(() => {
		if (!showInvitePopup || !currentUserId) return

		const timeoutId = setTimeout(() => {
			fetchFriends(friendsSearchQuery)
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [friendsSearchQuery, showInvitePopup, currentUserId, fetchFriends])

	// Pobierz zaproszenia do drużyny gdy modal się otwiera
	useEffect(() => {
		if (showInvitePopup && team) {
			type TeamRequestPageResponse = {
				content: TeamRequestResponseDto[]
				totalElements: number
				totalPages: number
				number: number
				size: number
				first: boolean
				last: boolean
				numberOfElements: number
				empty: boolean
			}
			api.get<TeamRequestPageResponse>(`/team-request/by-team`, {
				params: { teamId: team.idTeam, page: 0, size: 100 }
			})
				.then(({ data }) => {
					const requestsMap = new Map<number, TeamRequestResponseDto>()
					data.content.forEach(request => {
						requestsMap.set(request.receiverId, request)
					})
					setTeamRequests(requestsMap)
				})
				.catch((error) => {
					console.error('Error fetching team requests:', error)
					setTeamRequests(new Map())
				})
		}
	}, [showInvitePopup, team])

	// Sprawdź czy użytkownik ma zaproszenie do tej drużyny
	useEffect(() => {
		if (currentUserId && team) {
			type TeamRequestPageResponse = {
				content: TeamRequestResponseDto[]
				totalElements: number
				totalPages: number
				number: number
				size: number
				first: boolean
				last: boolean
				numberOfElements: number
				empty: boolean
			}
			api.get<TeamRequestPageResponse>(`/team-request/by-receiver`, {
				params: { receiverId: currentUserId, page: 0, size: 100 }
			})
				.then(({ data }) => {
					// Znajdź zaproszenie dla tej drużyny ze statusem PENDING
					const pendingRequest = data.content.find(
						req => req.teamId === team.idTeam && req.status === 'PENDING'
					)
					setUserTeamRequest(pendingRequest || null)
				})
				.catch((error) => {
					console.error('Error fetching user team request:', error)
					setUserTeamRequest(null)
				})
		} else {
			setUserTeamRequest(null)
		}
	}, [currentUserId, team])

	// Funkcja do pobierania członków drużyny
	const fetchTeamMembers = useCallback(async () => {
		if (!team) return

		setMembersLoading(true)
		type TeamMembersPageResponse = {
			content: TeamMember[]
			totalElements: number
			totalPages: number
			number: number
			size: number
			first: boolean
			last: boolean
			numberOfElements: number
			empty: boolean
		}
		try {
			const { data } = await api.get<TeamMembersPageResponse>(`/user-team/${team.idTeam}/members`, {
				params: { page: 0, size: 100, sort: 'userName', direction: 'ASC' }
			})
			setTeamMembers(data.content || [])
		} catch (error) {
			console.error('Error fetching team members:', error)
			setTeamMembers([])
		} finally {
			setMembersLoading(false)
		}
	}, [team])

	// Pobierz członków drużyny
	useEffect(() => {
		fetchTeamMembers()
	}, [fetchTeamMembers])

	const isLeader = currentUserId !== null && team && currentUserId === team.leaderId

	const handleAcceptTeamRequest = async (requestId: number) => {
		try {
			await api.patch(`/team-request/${requestId}/accept`)
			// Po akceptacji usunąć zaproszenie i odświeżyć listę członków
			setUserTeamRequest(null)
			// Odśwież listę członków
			await fetchTeamMembers()
		} catch (error: any) {
			console.error('Error accepting team request:', error)
			alert('Nie udało się zaakceptować zaproszenia. Spróbuj ponownie.')
		}
	}

	const handleRejectTeamRequest = (requestId: number) => {
		console.log('Odrzucanie zaproszenia do drużyny:', requestId)
		// TODO: Dodać endpoint do odrzucenia zaproszenia
		// Po odrzuceniu usunąć zaproszenie
		setUserTeamRequest(null)
	}

	const handleLeaveTeam = async () => {
		if (!team || !currentUserId) return

		setLeavingTeam(true)
		try {
			await api.delete(`/user-team/${team.idTeam}/members/${currentUserId}`)
			// Po sukcesie przekieruj do strony drużyn
			navigate('/teams')
		} catch (error: any) {
			console.error('Error leaving team:', error)
			setLeavingTeam(false)
			if (error.response?.status === 403 || error.response?.status === 400) {
				alert('Nie możesz opuścić drużyny. Możliwe, że jesteś liderem lub nie jesteś członkiem tej drużyny.')
			} else {
				alert('Nie udało się opuścić drużyny. Spróbuj ponownie.')
			}
		}
	}

	if (loading) {
		return (
			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8 mt-20'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					<div className='grid place-items-center p-10'>
						<div className='flex items-center gap-2 text-zinc-300'>
							<Loader2 className='animate-spin' /> Ładowanie…
						</div>
					</div>
				</div>
			</main>
		)
	}

	if (error || !team) {
		return (
			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8 mt-20'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					<div className='grid place-items-center p-10 text-center'>
						<AlertTriangle className='mx-auto mb-4 text-rose-400' size={48} />
						<h2 className='text-white text-xl font-semibold mb-2'>Błąd</h2>
						<p className='text-zinc-400'>{error || 'Nie znaleziono drużyny'}</p>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className='mx-auto max-w-7xl px-4 py-8 md:px-8 mt-20'>
			<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6'>
					<div className='flex flex-col sm:flex-row sm:items-center gap-5'>
						{team.photoUrl && team.photoUrl.trim() !== '' ? (
							<img
								src={team.photoUrl}
								alt={team.name}
								className='h-36 w-36 object-cover rounded-2xl border border-zinc-700 shadow-md bg-zinc-800'
								onError={e => (e.currentTarget.style.display = 'none')}
							/>
						) : (
							<div className='h-36 w-36 flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-400 text-sm'>
								Brak zdjęcia
							</div>
						)}

						<div>
							<h1 className='text-3xl font-semibold text-white'>{team.name}</h1>
							<div className='mt-2 flex items-center gap-4 text-sm text-zinc-400'>
								<div className='flex items-center gap-2'>
									<MapPin size={16} /> {team.city}
								</div>
								<div className='flex items-center gap-2'>
									<Users size={16} /> {team.sportType}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Informacja o zaproszeniu do drużyny */}
				{userTeamRequest && (
					<div className='mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4'>
						<div className='flex items-center justify-between gap-4'>
							<div className='flex items-center gap-3'>
								<Clock className='text-amber-400' size={20} />
								<div>
									<p className='text-white font-medium'>Masz zaproszenie do tej drużyny</p>
									<p className='text-sm text-zinc-400'>Możesz zaakceptować lub odrzucić zaproszenie</p>
								</div>
							</div>
							<div className='flex items-center gap-2'>
								<button
									onClick={() => handleAcceptTeamRequest(userTeamRequest.requestId)}
									className='inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-sm font-medium text-white'
									title='Zaakceptuj zaproszenie'
								>
									<span>✓</span>
									<span className='hidden sm:inline'>Zaakceptuj</span>
								</button>
								<button
									onClick={() => handleRejectTeamRequest(userTeamRequest.requestId)}
									className='inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-zinc-600 hover:bg-zinc-500 transition-colors text-sm font-medium text-white'
									title='Odrzuć zaproszenie'
								>
									<span>✗</span>
									<span className='hidden sm:inline'>Odrzuć</span>
								</button>
							</div>
						</div>
					</div>
				)}

				<hr className='my-6 border-zinc-800' />

				<div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
					<section className='lg:col-span-2 space-y-6'>
						{team.description && (
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<h3 className='text-white text-lg font-semibold mb-3'>Opis drużyny</h3>
								<p className='text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap break-words overflow-wrap-anywhere'>{team.description}</p>
							</div>
						)}

						<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
							<div className='mb-4 flex items-center justify-between'>
								<h3 className='text-white text-lg font-semibold'>Członkowie drużyny ({teamMembers.length})</h3>
								{teamMembers.length > 8 && (
									<button
										onClick={() => setShowAllMembers(s => !s)}
										className='inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200'
									>
										{showAllMembers ? 'Ukryj' : 'Zobacz wszystkich'}
										<ChevronDown size={16} className={`transition-transform ${showAllMembers ? 'rotate-180' : ''}`} />
									</button>
								)}
							</div>
							{isLeader && (
								<div className='mb-4'>
									<button
										onClick={() => setShowInvitePopup(true)}
										className='inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors'
									>
										<UserPlus size={16} />
										Zaproś użytkowników
									</button>
								</div>
							)}

							{membersLoading ? (
								<div className='flex items-center justify-center py-8'>
									<Loader2 className='animate-spin text-violet-400' size={24} />
									<span className='ml-2 text-zinc-400'>Ładowanie członków...</span>
								</div>
							) : teamMembers.length === 0 ? (
								<div className='text-center py-8'>
									<Users className='mx-auto mb-4 text-zinc-600' size={48} />
									<p className='text-zinc-400'>Brak członków w drużynie</p>
								</div>
							) : (
								<div className='flex flex-wrap gap-2'>
									{teamMembers.slice(0, showAllMembers ? teamMembers.length : 8).map(member => (
										<Link
											key={member.id}
											to={`/profile/${member.userId}`}
											className='group flex items-center gap-3 rounded-lg bg-zinc-800/60 px-3 py-2 hover:bg-zinc-800 transition'
										>
											<Avatar
												src={member.userAvatarUrl || null}
												name={member.userName}
												size='sm'
												className='ring-1 ring-zinc-700 shadow-sm'
											/>
											<div className='text-sm'>
												<div className='font-medium text-white leading-tight'>
													{member.userEmail === userEmail ? `${member.userName} (Ty)` : member.userName}
												</div>
												{member.userId === team.leaderId && (
													<div className='mt-0.5 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] bg-violet-500/20 text-violet-300'>
														<Crown size={10} />
														Lider
													</div>
												)}
											</div>
										</Link>
									))}
								</div>
							)}

							{!showAllMembers && teamMembers.length > 8 && (
								<p className='text-center text-xs text-zinc-400 mt-4'>i {teamMembers.length - 8} więcej…</p>
							)}
						</div>
					</section>

					<aside className='space-y-6 lg:sticky lg:top-6'>
						<div className={`rounded-2xl border p-5 ${
							isLeader 
								? 'border-violet-500/50 bg-zinc-900/80' 
								: 'border-zinc-800 bg-zinc-900/60'
						}`}>
							<h3 className='text-white text-lg font-semibold flex items-center gap-2 mb-4'>
								<Crown size={20} className='text-violet-400' /> Lider
							</h3>
							{isLeader && (
								<div className='mb-4 rounded-lg border border-violet-500/30 bg-violet-500/10 p-3 text-violet-200 text-sm'>
									Jesteś liderem tej drużyny
								</div>
							)}
							<div className='mt-4 flex items-center gap-3'>
								<Avatar
									src={team.leaderAvatarUrl || null}
									name={team.leaderName}
									size='sm'
									className={`shadow-md ${isLeader ? 'ring-2 ring-violet-500' : 'ring-2 ring-zinc-700'}`}
								/>
								<div>
									<div className='font-medium text-white'>{team.leaderName}</div>
									<div className='text-xs text-zinc-400'>Założyciel drużyny</div>
								</div>
							</div>

							<div className='mt-4 space-y-2'>
								<Link
									to={`/profile/${team.leaderId}`}
									className='w-full rounded-xl bg-transparent px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 ring-1 ring-zinc-700 inline-flex items-center justify-center gap-2'>
									<UserRound size={16} /> Zobacz profil
								</Link>
							</div>
						</div>

						<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
							<h3 className='text-white text-lg font-semibold mb-4'>Informacje</h3>
							<div className='space-y-3 text-sm'>
								<div className='flex items-center gap-2 text-zinc-300'>
									<MapPin size={16} className='text-zinc-400' />
									<span>{team.city}</span>
								</div>
								<div className='flex items-center gap-2 text-zinc-300'>
									<Users size={16} className='text-zinc-400' />
									<span>{team.sportType}</span>
								</div>
								{team.createdAt && (
									<div className='text-zinc-400 text-xs pt-2 border-t border-zinc-800'>
										Utworzono: {parseLocalDate(team.createdAt).format('DD.MM.YYYY')}
									</div>
								)}
							</div>
						</div>

						{/* Przycisk opuszczania drużyny - tylko dla zwykłych członków */}
						{currentUserId && !isLeader && teamMembers.some(m => m.userId === currentUserId) && (
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<button
									onClick={() => setShowLeaveTeamModal(true)}
									className='w-full rounded-xl bg-red-600/20 border border-red-500/30 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-600/30 transition-colors inline-flex items-center justify-center gap-2'
								>
									<LogOut size={16} />
									Opuść drużynę
								</button>
							</div>
						)}
					</aside>
				</div>
			</div>

			{showInvitePopup && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div 
						className='absolute inset-0 bg-black/60 backdrop-blur-sm'
						onClick={handleCloseInvitePopup}
					/>
					
					<div className='relative w-full max-w-5xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200'>
						<div className='flex items-center justify-between p-6 border-b border-zinc-800'>
							<h3 className='text-white text-xl font-semibold'>Zaproś użytkowników do drużyny</h3>
							<button
								onClick={handleCloseInvitePopup}
								className='p-2 rounded-xl hover:bg-zinc-800 transition-colors'
							>
								<X size={20} className='text-zinc-400 hover:text-white' />
							</button>
						</div>

						<div className='p-6 space-y-4'>
							{/* Zakładki */}
							<div className='flex space-x-1 rounded-xl bg-zinc-800/60 p-1'>
								<button
									onClick={() => setInviteActiveTab('search')}
									className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
										inviteActiveTab === 'search'
											? 'bg-violet-600 text-white'
											: 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
									}`}
								>
									Wyszukaj
								</button>
								<button
									onClick={() => setInviteActiveTab('friends')}
									className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
										inviteActiveTab === 'friends'
											? 'bg-violet-600 text-white'
											: 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
									}`}
								>
									Znajomi
								</button>
							</div>

							{/* Zakładka Wyszukaj */}
							{inviteActiveTab === 'search' && (
								<>
									<div className='relative'>
										<Search size={16} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400' />
										<input
											type='text'
											placeholder='Szukaj użytkowników...'
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className='w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-10 py-3 text-white placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'
										/>
									</div>

									<div className='max-h-80 overflow-y-auto space-y-3 dark-scrollbar'>
										{searchLoading ? (
											<div className='text-center py-8'>
												<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4'></div>
												<p className='text-zinc-400'>Szukanie...</p>
											</div>
										) : searchResults.length === 0 ? (
											<div className='text-center py-8'>
												<Search size={48} className='mx-auto text-zinc-600 mb-4' />
												<p className='text-zinc-400'>
													{searchQuery ? 'Nie znaleziono użytkowników' : 'Wpisz nazwę lub email użytkownika'}
												</p>
											</div>
										) : (
											searchResults.map(user => {
												const teamRequest = teamRequests.get(user.id)
												const isPending = teamRequest?.status === 'PENDING'

												return (
													<div key={user.id} className='flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
														<Link 
															to={`/profile/${user.id}`}
															className='flex items-center gap-3 flex-1 hover:bg-zinc-800/30 rounded-lg p-2 -m-2 transition-colors'
														>
															<Avatar 
																src={user.urlOfPicture} 
																name={user.name}
																size='sm'
															/>
															<div>
																<p className='text-white font-medium'>{user.name}</p>
																<p className='text-sm text-zinc-400'>{user.email}</p>
															</div>
														</Link>
														<div className='flex items-center gap-2'>
															{isPending ? (
																<button
																	disabled
																	className='inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-zinc-600 text-zinc-400 cursor-not-allowed text-xs sm:text-sm font-medium'
																	title='Zaproszenie oczekuje na odpowiedź'
																>
																	<UserPlus size={14} className='sm:w-4 sm:h-4' />
																	<span className='hidden sm:inline'>Oczekuje na odpowiedź</span>
																	<span className='sm:hidden'>Oczekuje</span>
																</button>
															) : (
																<button
																	onClick={() => handleInviteUser(user.id)}
																	className='inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-xs sm:text-sm font-medium text-white'
																	title='Zaproś do drużyny'
																>
																	<UserPlus size={14} className='sm:w-4 sm:h-4' />
																	<span className='hidden sm:inline'>Zaproś do drużyny</span>
																	<span className='sm:hidden'>Zaproś</span>
																</button>
															)}
														</div>
													</div>
												)
											})
										)}
									</div>
								</>
							)}

							{/* Zakładka Znajomi */}
							{inviteActiveTab === 'friends' && (
								<>
									<div className='relative'>
										<Search size={16} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400' />
										<input
											type='text'
											placeholder='Szukaj znajomych...'
											value={friendsSearchQuery}
											onChange={(e) => setFriendsSearchQuery(e.target.value)}
											className='w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-10 py-3 text-white placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'
										/>
									</div>

									<div className='max-h-80 overflow-y-auto space-y-3 dark-scrollbar'>
										{friendsLoading ? (
											<div className='text-center py-8'>
												<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4'></div>
												<p className='text-zinc-400'>
													{friendsSearchQuery.trim() ? 'Szukanie...' : 'Ładowanie znajomych...'}
												</p>
											</div>
										) : friends.length === 0 ? (
											<div className='text-center py-8'>
												<Users size={48} className='mx-auto text-zinc-600 mb-4' />
												<p className='text-zinc-400'>
													{friendsSearchQuery.trim() ? 'Nie znaleziono znajomych' : 'Brak znajomych'}
												</p>
												<p className='text-sm text-zinc-500 mt-1'>
													{friendsSearchQuery.trim() 
														? 'Spróbuj innej frazy wyszukiwania'
														: 'Dodaj znajomych, aby móc ich zaprosić do drużyny'
													}
												</p>
											</div>
										) : (
											friends.map(friend => {
												const teamRequest = teamRequests.get(friend.id)
												const isPending = teamRequest?.status === 'PENDING'

												return (
													<div key={friend.id} className='flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
														<Link 
															to={`/profile/${friend.id}`}
															className='flex items-center gap-3 flex-1 hover:bg-zinc-800/30 rounded-lg p-2 -m-2 transition-colors'
														>
															<Avatar 
																src={friend.urlOfPicture} 
																name={friend.name}
																size='sm'
															/>
															<div>
																<p className='text-white font-medium'>{friend.name}</p>
																<p className='text-sm text-zinc-400'>{friend.email}</p>
															</div>
														</Link>
														<div className='flex items-center gap-2'>
															{isPending ? (
																<button
																	disabled
																	className='inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-zinc-600 text-zinc-400 cursor-not-allowed text-xs sm:text-sm font-medium'
																	title='Zaproszenie oczekuje na odpowiedź'
																>
																	<UserPlus size={14} className='sm:w-4 sm:h-4' />
																	<span className='hidden sm:inline'>Oczekuje na odpowiedź</span>
																	<span className='sm:hidden'>Oczekuje</span>
																</button>
															) : (
																<button
																	onClick={() => handleInviteUser(friend.id)}
																	className='inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-xs sm:text-sm font-medium text-white'
																	title='Zaproś do drużyny'
																>
																	<UserPlus size={14} className='sm:w-4 sm:h-4' />
																	<span className='hidden sm:inline'>Zaproś do drużyny</span>
																	<span className='sm:hidden'>Zaproś</span>
																</button>
															)}
														</div>
													</div>
												)
											})
										)}
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Modal potwierdzenia opuszczania drużyny */}
			<AlertModal
				isOpen={showLeaveTeamModal}
				onClose={() => setShowLeaveTeamModal(false)}
				title="Opuść drużynę"
				message="Czy na pewno chcesz opuścić tę drużynę? Tej akcji nie można cofnąć."
				variant="warning"
				showConfirm={true}
				onConfirm={handleLeaveTeam}
				confirmText="Opuść drużynę"
				cancelText="Anuluj"
				isLoading={leavingTeam}
			/>
		</main>
	)
}

export default TeamPage

