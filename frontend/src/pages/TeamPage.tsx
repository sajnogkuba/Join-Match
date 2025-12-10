import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { TeamDetails } from '../Api/types/Team'
import type { User } from '../Api/types/User'
import type { SearchResult, Friend } from '../Api/types/Friends'
import type { TeamRequestResponseDto } from '../Api/types/TeamRequest'
import type { TeamMember } from '../Api/types/TeamMember'
import type { SportType } from '../Api/types/SportType'
import api from '../Api/axios'
import Avatar from '../components/Avatar'
import SportTypeFilter from '../components/SportTypeFilter'
import TeamInfoTab from '../components/TeamInfoTab'
import TeamDiscussionTab from '../components/TeamDiscussionTab'
import ReportTeamModal from '../components/ReportTeamModal'
import { MapPin, Users, Loader2, AlertTriangle, Search, X, UserPlus, Clock, Pencil, Camera, Check } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import { useAuth } from '../Context/authContext'
import AlertModal from '../components/AlertModal'
import { getCookie } from '../utils/cookies'

dayjs.locale('pl')

const TeamPage: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
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
	const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false)
	const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
	const [removingMember, setRemovingMember] = useState(false)
	const [removeMemberReason, setRemoveMemberReason] = useState('')
	const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false)
	const [deletingTeam, setDeletingTeam] = useState(false)
	const [deleteTeamReason, setDeleteTeamReason] = useState('')

	// 🔴 Zgłaszanie drużyny – modal
	const [showReportTeamModal, setShowReportTeamModal] = useState(false)

	// States for team editing
	const [isEditing, setIsEditing] = useState(false)
	const [editedName, setEditedName] = useState('')
	const [editedDescription, setEditedDescription] = useState('')
	const [editedCity, setEditedCity] = useState('')
	const [editedSportTypeId, setEditedSportTypeId] = useState<number | null>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const [uploadingImage, setUploadingImage] = useState(false)
	const [saveError, setSaveError] = useState<string | null>(null)
	const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState<'informacje' | 'dyskusja'>('informacje')
	const [showBannedAlert, setShowBannedAlert] = useState(false)

	// Check URL query parameter for tab
	useEffect(() => {
		const tabParam = searchParams.get('tab')
		if (tabParam === 'dyskusja') {
			setActiveTab('dyskusja')
		}
	}, [searchParams])

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

				if (data.isBanned) {
					setShowBannedAlert(true)
					setLoading(false)
					return
				}
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
			api
					.get<User>('/auth/user')
					.then(({ data }) => {
						setCurrentUserId(data.id)
						setUserEmail(data.email)
					})
					.catch(() => {
						setCurrentUserId(null)
						setUserEmail(null)
					});
		} else {
			setCurrentUserId(null)
			setUserEmail(null)
		}
	}, [isAuthenticated])

	const searchUsers = useCallback(
		async (query: string) => {
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
		},
		[currentUserId]
	)

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
				teamId: team.idTeam,
			})

			// Zaktualizuj mapę zaproszeń
			setTeamRequests(prev => {
				const updated = new Map(prev)
				updated.set(userId, response.data)
				return updated
			})
		} catch (error: any) {
			console.error('Error sending team request:', error)
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
	const fetchFriends = useCallback(
		async (query: string = '') => {
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
		},
		[currentUserId]
	)

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
			api
				.get<TeamRequestPageResponse>(`/team-request/by-team`, {
					params: { teamId: team.idTeam, page: 0, size: 100 },
				})
				.then(({ data }) => {
					const requestsMap = new Map<number, TeamRequestResponseDto>()
					data.content.forEach(request => {
						requestsMap.set(request.receiverId, request)
					})
					setTeamRequests(requestsMap)
				})
				.catch(error => {
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
			api
				.get<TeamRequestPageResponse>(`/team-request/by-receiver`, {
					params: { receiverId: currentUserId, page: 0, size: 100 },
				})
				.then(({ data }) => {
					if (data && data.content && Array.isArray(data.content)) {
						const pendingRequest = data.content.find(req => req.teamId === team.idTeam && req.status === 'PENDING')
						setUserTeamRequest(pendingRequest || null)
					} else {
						setUserTeamRequest(null)
					}
				})
				.catch(error => {
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
				params: { page: 0, size: 100, sort: 'userName', direction: 'ASC' },
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

	const isLeader: boolean = currentUserId !== null && team !== null && currentUserId === team.leaderId

	const handleAcceptTeamRequest = async (requestId: number) => {
		try {
			await api.patch(`/team-request/${requestId}/accept`)
			setUserTeamRequest(null)
			await fetchTeamMembers()
		} catch (error: any) {
			console.error('Error accepting team request:', error)
			alert('Nie udało się zaakceptować zaproszenia. Spróbuj ponownie.')
		}
	}

	const handleRejectTeamRequest = async (requestId: number) => {
		try {
			await api.delete(`/team-request/${requestId}`)
			setUserTeamRequest(null)
		} catch (error: any) {
			console.error('Error rejecting team request:', error)
			alert('Nie udało się odrzucić zaproszenia. Spróbuj ponownie.')
		}
	}

	const handleLeaveTeam = async () => {
		if (!team || !currentUserId) return

		setLeavingTeam(true)
		try {
			await api.delete(`/user-team/${team.idTeam}/members/${currentUserId}/quit`)
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

	const handleRemoveMember = async () => {
		if (!team || !memberToRemove) return

		setRemovingMember(true)
		try {
			await api.delete(`/user-team/${team.idTeam}/members/${memberToRemove.userId}`, {
				data: {
					reason: removeMemberReason.trim() || null,
				},
			})
			await fetchTeamMembers()
			setShowRemoveMemberModal(false)
			setMemberToRemove(null)
			setRemoveMemberReason('')
		} catch (error: any) {
			console.error('Error removing member:', error)
			setRemovingMember(false)
			if (error.response?.status === 403 || error.response?.status === 400) {
				alert('Nie można usunąć członka. Możliwe, że jest liderem lub nie jest członkiem tej drużyny.')
			} else {
				alert('Nie udało się usunąć członka. Spróbuj ponownie.')
			}
		}
	}

	const handleDeleteTeam = async () => {
		if (!team) return

		setDeletingTeam(true)
		try {
			await api.delete(`/team/${team.idTeam}`, {
				data: {
					teamId: team.idTeam,
					reason: deleteTeamReason.trim() || null,
				},
			})

			// Po sukcesie przekieruj do strony drużyn
			navigate('/teams')
		} catch (error: any) {
			console.error('Error deleting team:', error)
			setDeletingTeam(false)
			if (error.response?.status === 403 || error.response?.status === 400) {
				alert('Nie można usunąć drużyny. Sprawdź czy masz odpowiednie uprawnienia.')
			} else {
				alert('Nie udało się usunąć drużyny. Spróbuj ponownie.')
			}
		}
	}

	// Functions for team editing
	const handleEnterEditMode = async () => {
		if (!team) return

		try {
			const { data } = await api.get<SportType[]>('/sport-type')
			const currentSport = data.find(s => s.name === team.sportType)
			setEditedSportTypeId(currentSport?.id || null)
		} catch (error) {
			console.error('Error fetching sport types:', error)
		}

		setEditedName(team.name)
		setEditedDescription(team.description || '')
		setEditedCity(team.city)
		setPreviewPhotoUrl(team.photoUrl || null)
		setSelectedFile(null)
		setIsEditing(true)
	}

	const handleCancelEdit = () => {
		setIsEditing(false)
		setEditedName('')
		setEditedDescription('')
		setEditedCity('')
		setEditedSportTypeId(null)
		setSelectedFile(null)
		setPreviewPhotoUrl(null)
	}

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setSelectedFile(file)
			const url = URL.createObjectURL(file)
			setPreviewPhotoUrl(url)
		}
	}

	const handleSaveTeam = async () => {
		if (!team) return

		setSaveError(null)
		setSaveSuccess(null)

		if (!editedName.trim() || editedName.trim().length < 2) {
			setSaveError('Nazwa drużyny musi mieć co najmniej 2 znaki.')
			return
		}
		if (editedName.trim().length > 100) {
			setSaveError('Nazwa drużyny nie może przekraczać 100 znaków.')
			return
		}
		if (!editedCity.trim() || editedCity.trim().length < 2) {
			setSaveError('Miasto musi mieć co najmniej 2 znaki.')
			return
		}
		if (editedCity.trim().length > 100) {
			setSaveError('Nazwa miasta nie może przekraczać 100 znaków.')
			return
		}
		if (editedDescription.trim().length > 500) {
			setSaveError('Opis nie może przekraczać 500 znaków.')
			return
		}
		if (!editedSportTypeId) {
			setSaveError('Wybierz sport.')
			return
		}

		setSaving(true)
		try {
			let photoUrl = team.photoUrl

			if (selectedFile) {
				setUploadingImage(true)
				const formData = new FormData()
				formData.append('file', selectedFile)
				const uploadResponse = await api.post('/images/upload/team', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				})
				photoUrl = uploadResponse.data
				setUploadingImage(false)
			}

			await api.put(`/team/${team.idTeam}`, {
				name: editedName.trim(),
				city: editedCity.trim(),
				description: editedDescription.trim() || null,
				sportTypeId: editedSportTypeId,
				leaderId: team.leaderId,
				photoUrl,
			})

			const { data: teamDetails } = await api.get<TeamDetails>(`/team/${team.idTeam}`)
			setTeam(teamDetails)

			setSaveSuccess('Zmiany zostały zapisane pomyślnie!')

			setTimeout(() => {
				handleCancelEdit()
				setSaveSuccess(null)
			}, 1500)
		} catch (error: any) {
			console.error('Error saving team:', error)
			setUploadingImage(false)
			if (error.response?.status === 400) {
				const errorMessage = error.response?.data?.message || error.response?.data || 'Nieprawidłowe dane.'
				setSaveError(`Nie udało się zapisać zmian: ${errorMessage}`)
			} else {
				setSaveError('Nie udało się zapisać zmian. Spróbuj ponownie.')
			}
		} finally {
			setSaving(false)
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

	if (team?.isBanned || showBannedAlert) {
		return (
			<>
				<div className='min-h-screen bg-[#1f2632]' />
				<AlertModal
					isOpen={true}
					onClose={() => {
						setShowBannedAlert(false)
						navigate(-1)
					}}
					title='Drużyna zablokowana'
					message='Niestety ta drużyna została zablokowana, więc nie można wyświetlić jej szczegółów.'
					variant='error'
				/>
			</>
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
				{!isEditing ? (
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

							<div className='flex-1'>
								<div className='flex items-center gap-3'>
									<h1 className='text-3xl font-semibold text-white'>{team.name}</h1>
									{isLeader && (
										<button
											onClick={handleEnterEditMode}
											className='p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-violet-400'
											title='Edytuj drużynę'>
											<Pencil size={20} />
										</button>
									)}
								</div>
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
				) : (
					<div className='mb-6 space-y-6'>
						<div className='flex flex-col sm:flex-row sm:items-start gap-5'>
							{/* Photo upload */}
							<div className='relative'>
								{previewPhotoUrl ? (
									<img
										src={previewPhotoUrl}
										alt={team.name}
										className='h-36 w-36 object-cover rounded-2xl border border-zinc-700 shadow-md bg-zinc-800'
									/>
								) : (
									<div className='h-36 w-36 flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-400 text-sm'>
										Brak zdjęcia
									</div>
								)}
								<input
									type='file'
									id='team-photo-upload'
									accept='image/*'
									onChange={handleFileSelect}
									className='hidden'
								/>
								<label
									htmlFor='team-photo-upload'
									className='absolute bottom-2 right-2 p-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors cursor-pointer'
									title='Zmień zdjęcie'>
									<Camera size={18} className='text-white' />
								</label>
							</div>

							<div className='flex-1 space-y-4'>
								{/* Name input */}
								<div>
									<label className='block text-zinc-400 text-sm mb-2'>Nazwa drużyny</label>
									<input
										type='text'
										value={editedName}
										onChange={e => setEditedName(e.target.value)}
										className='w-full px-4 py-2 rounded-xl bg-zinc-900/70 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent transition'
										placeholder='np. Mistrzowie Piłki'
										maxLength={100}
									/>
								</div>

								{/* City input */}
								<div>
									<label className='block text-zinc-400 text-sm mb-2 flex items-center gap-2'>
										<MapPin size={16} /> Miasto
									</label>
									<input
										type='text'
										value={editedCity}
										onChange={e => setEditedCity(e.target.value)}
										className='w-full px-4 py-2 rounded-xl bg-zinc-900/70 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent transition'
										placeholder='np. Warszawa'
										maxLength={100}
									/>
								</div>

								{/* Sport dropdown */}
								<div>
									<label className='block text-zinc-400 text-sm mb-2 flex items-center gap-2'>
										<Users size={16} /> Sport
									</label>
									<SportTypeFilter value={editedSportTypeId} onChange={setEditedSportTypeId} />
								</div>
							</div>
						</div>

						{/* Description textarea */}
						<div>
							<label className='block text-zinc-400 text-sm mb-2'>Opis drużyny</label>
							<textarea
								value={editedDescription}
								onChange={e => setEditedDescription(e.target.value)}
								className='w-full px-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent transition min-h-[100px] resize-y'
								placeholder='Opisz swoją drużynę...'
								maxLength={500}
							/>
							<p className='text-zinc-500 text-xs mt-1'>{editedDescription.length}/500 znaków</p>
						</div>

						{/* Error/Success messages */}
						{saveError && (
							<div className='rounded-xl bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 text-sm flex items-center gap-2'>
								<AlertTriangle size={18} />
								{saveError}
							</div>
						)}
						{saveSuccess && (
							<div className='rounded-xl bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 text-sm flex items-center gap-2'>
								<Check size={18} />
								{saveSuccess}
							</div>
						)}

						{/* Action buttons */}
						<div className='flex items-center gap-3'>
							<button
								onClick={handleSaveTeam}
								disabled={saving || uploadingImage}
								className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-white'>
								{saving || uploadingImage ? (
									<>
										<Loader2 size={16} className='animate-spin' />
										{uploadingImage ? 'Przesyłanie zdjęcia...' : 'Zapisywanie...'}
									</>
								) : (
									<>
										<Check size={16} />
										Zapisz zmiany
									</>
								)}
							</button>
							<button
								onClick={() => {
									setSaveError(null)
									setSaveSuccess(null)
									handleCancelEdit()
								}}
								disabled={saving || uploadingImage}
								className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-white'>
								<X size={16} />
								Anuluj
							</button>
						</div>
					</div>
				)}

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
									title='Zaakceptuj zaproszenie'>
									<span>✓</span>
									<span className='hidden sm:inline'>Zaakceptuj</span>
								</button>
								<button
									onClick={() => handleRejectTeamRequest(userTeamRequest.requestId)}
									className='inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-zinc-600 hover:bg-zinc-500 transition-colors text-sm font-medium text-white'
									title='Odrzuć zaproszenie'>
									<span>✗</span>
									<span className='hidden sm:inline'>Odrzuć</span>
								</button>
							</div>
						</div>
					</div>
				)}

				<hr className='my-6 border-zinc-800' />

				{/* Zakładki */}
				<div className='mb-6 flex space-x-1 rounded-xl bg-zinc-800/60 p-1'>
					<button
						onClick={() => setActiveTab('informacje')}
						className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === 'informacje'
								? 'bg-violet-600 text-white'
								: 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
						}`}>
						Informacje
					</button>
					{currentUserId && teamMembers.some(m => m.userId === currentUserId) && (
						<button
							onClick={() => setActiveTab('dyskusja')}
							className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
								activeTab === 'dyskusja'
									? 'bg-violet-600 text-white'
									: 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
							}`}>
							Dyskusja
						</button>
					)}
				</div>

				{activeTab === 'informacje' && (
					<TeamInfoTab
						team={team}
						teamMembers={teamMembers}
						membersLoading={membersLoading}
						showAllMembers={showAllMembers}
						setShowAllMembers={setShowAllMembers}
						isLeader={isLeader}
						currentUserId={currentUserId}
						userEmail={userEmail}
						onInviteClick={() => setShowInvitePopup(true)}
						onRemoveMember={member => {
							setMemberToRemove(member)
							setShowRemoveMemberModal(true)
						}}
						onLeaveTeam={() => setShowLeaveTeamModal(true)}
						onDeleteTeam={() => setShowDeleteTeamModal(true)}
						onOpenTeamChat={async () => {
							try {
								const res = await api.post(`/team/${team.idTeam}`)
								const conversationId = res.data?.id

								if (!conversationId) {
									alert('Nie udało się otworzyć czatu drużyny')
									return
								}

								navigate('/chat', { state: { conversationId } })
							} catch (e) {
								console.error('❌ Błąd otwierania czatu drużyny:', e)
								alert('Nie udało się otworzyć czatu drużyny.')
							}
						}}
						onReportTeam={() => setShowReportTeamModal(true)}
					/>
				)}
				{activeTab === 'dyskusja' && (
					<TeamDiscussionTab
						teamMembers={teamMembers}
						teamId={team.idTeam}
					/>
				)}
			</div>

			{showInvitePopup && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={handleCloseInvitePopup} />

					<div className='relative w-full max-w-5xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200'>
						<div className='flex items-center justify-between p-6 border-b border-zinc-800'>
							<h3 className='text-white text-xl font-semibold'>Zaproś użytkowników do drużyny</h3>
							<button onClick={handleCloseInvitePopup} className='p-2 rounded-xl hover:bg-zinc-800 transition-colors'>
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
									}`}>
									Wyszukaj
								</button>
								<button
									onClick={() => setInviteActiveTab('friends')}
									className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
										inviteActiveTab === 'friends'
											? 'bg-violet-600 text-white'
											: 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
									}`}>
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
											onChange={e => setSearchQuery(e.target.value)}
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
													<div
														key={user.id}
														className='flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
														<Link
															to={`/profile/${user.id}`}
															className='flex items-center gap-3 flex-1 hover:bg-zinc-800/30 rounded-lg p-2 -m-2 transition-colors'>
															<Avatar src={user.urlOfPicture} name={user.name} size='sm' />
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
																	title='Zaproszenie oczekuje na odpowiedź'>
																	<UserPlus size={14} className='sm:w-4 sm:h-4' />
																	<span className='hidden sm:inline'>Oczekuje na odpowiedź</span>
																	<span className='sm:hidden'>Oczekuje</span>
																</button>
															) : (
																<button
																	onClick={() => handleInviteUser(user.id)}
																	className='inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-xs sm:text-sm font-medium text-white'
																	title='Zaproś do drużyny'>
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
											onChange={e => setFriendsSearchQuery(e.target.value)}
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
														: 'Dodaj znajomych, aby móc ich zaprosić do drużyny'}
												</p>
											</div>
										) : (
											friends.map(friend => {
												const teamRequest = teamRequests.get(friend.id)
												const isPending = teamRequest?.status === 'PENDING'

												return (
													<div
														key={friend.id}
														className='flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
														<Link
															to={`/profile/${friend.id}`}
															className='flex items-center gap-3 flex-1 hover:bg-zinc-800/30 rounded-lg p-2 -m-2 transition-colors'>
															<Avatar src={friend.urlOfPicture} name={friend.name} size='sm' />
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
																	title='Zaproszenie oczekuje na odpowiedź'>
																	<UserPlus size={14} className='sm:w-4 sm:h-4' />
																	<span className='hidden sm:inline'>Oczekuje na odpowiedź</span>
																	<span className='sm:hidden'>Oczekuje</span>
																</button>
															) : (
																<button
																	onClick={() => handleInviteUser(friend.id)}
																	className='inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-xs sm:text-sm font-medium text-white'
																	title='Zaproś do drużyny'>
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

			<AlertModal
				isOpen={showLeaveTeamModal}
				onClose={() => setShowLeaveTeamModal(false)}
				title='Opuść drużynę'
				message='Czy na pewno chcesz opuścić tę drużynę? Tej akcji nie można cofnąć.'
				variant='warning'
				showConfirm={true}
				onConfirm={handleLeaveTeam}
				confirmText='Opuść drużynę'
				cancelText='Anuluj'
				isLoading={leavingTeam}
			/>

			<AlertModal
				isOpen={showRemoveMemberModal}
				onClose={() => {
					setShowRemoveMemberModal(false)
					setMemberToRemove(null)
					setRemoveMemberReason('')
				}}
				title='Usuń członka drużyny'
				message={
					memberToRemove
						? `Czy na pewno chcesz usunąć ${memberToRemove.userName} z drużyny? Tej akcji nie można cofnąć.`
						: ''
				}
				variant='warning'
				showConfirm={true}
				onConfirm={handleRemoveMember}
				confirmText='Usuń z drużyny'
				cancelText='Anuluj'
				isLoading={removingMember}
				showTextInput={true}
				textInputLabel='Powód usunięcia (opcjonalnie)'
				textInputPlaceholder='Podaj powód usunięcia członka z drużyny...'
				textInputValue={removeMemberReason}
				onTextInputChange={setRemoveMemberReason}
				textInputRequired={false}
			/>

			<AlertModal
				isOpen={showDeleteTeamModal}
				onClose={() => {
					setShowDeleteTeamModal(false)
					setDeleteTeamReason('')
				}}
				title='Usuń drużynę'
				message={
					team
						? `Czy na pewno chcesz usunąć drużynę "${team.name}"? Ta akcja jest nieodwracalna i spowoduje usunięcie wszystkich danych związanych z drużyną.`
						: ''
				}
				variant='error'
				showConfirm={true}
				onConfirm={handleDeleteTeam}
				confirmText='Usuń drużynę'
				cancelText='Anuluj'
				isLoading={deletingTeam}
				showTextInput={true}
				textInputLabel='Powód usunięcia (opcjonalnie)'
				textInputPlaceholder='Podaj powód usunięcia drużyny...'
				textInputValue={deleteTeamReason}
				onTextInputChange={setDeleteTeamReason}
				textInputRequired={false}
			/>

			<ReportTeamModal
				isOpen={showReportTeamModal}
				onClose={() => setShowReportTeamModal(false)}
				teamId={team.idTeam}
				teamName={team.name}
			/>
		</main>
	)
}

export default TeamPage
