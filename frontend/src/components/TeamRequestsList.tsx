import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../Api/axios'
import type { TeamRequestResponseDto } from '../Api/types/TeamRequest'
import type { TeamDetails } from '../Api/types/Team'
import TeamRequestCard from './TeamRequestCard'
import { Loader2, Clock } from 'lucide-react'

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

interface TeamRequestWithTeam extends TeamRequestResponseDto {
	team: TeamDetails | null
}

interface TeamRequestsListProps {
	receiverId: number
}

const TeamRequestsList: React.FC<TeamRequestsListProps> = ({ receiverId }) => {
	const [requests, setRequests] = useState<TeamRequestWithTeam[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [pageSize] = useState(12)
	const [hasNext, setHasNext] = useState(false)
	const observerTarget = useRef<HTMLDivElement>(null)
	const currentPageRef = useRef(0)

	const fetchTeamDetails = async (teamId: number): Promise<TeamDetails | null> => {
		try {
			const { data } = await api.get<TeamDetails>(`/team/${teamId}`)
			return data
		} catch (err) {
			console.error(`Error fetching team details for team ${teamId}:`, err)
			return null
		}
	}

		const fetchRequests = useCallback(async (pageNum: number, append: boolean = false) => {
		try {
			if (append) {
				setLoadingMore(true)
			} else {
				setLoading(true)
			}

			const response = await api.get<TeamRequestPageResponse>('/team-request/by-receiver', {
				params: {
					receiverId,
					page: pageNum,
					size: pageSize
				}
			})
			
			if (response.status === 204 || !response.data || !response.data.content) {
				if (append) {
					setHasNext(false)
				} else {
					setRequests([])
					setHasNext(false)
				}
				return
			}

			const data = response.data

			const requestsWithTeams = await Promise.all(
				(data.content || []).map(async (request) => {
					const team = await fetchTeamDetails(request.teamId)
					return {
						...request,
						team
					} as TeamRequestWithTeam
				})
			)

			const pendingRequests = requestsWithTeams.filter(req => req.status === 'PENDING')

			if (append) {
				setRequests(prev => [...prev, ...pendingRequests])
			} else {
				setRequests(pendingRequests)
			}

			setHasNext(!data.last)
		} catch (err: any) {
			console.error('Error fetching team requests:', err)
			if (err.response?.status === 204) {
				if (append) {
					setHasNext(false)
				} else {
					setRequests([])
					setHasNext(false)
				}
			} else {
				setError('Nie udało się pobrać zaproszeń.')
			}
		} finally {
			setLoading(false)
			setLoadingMore(false)
		}
	}, [receiverId, pageSize])

	useEffect(() => {
		currentPageRef.current = 0
		setRequests([])
		fetchRequests(0, false)
	}, [receiverId, fetchRequests])

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasNext && !loading && !loadingMore) {
					const nextPage = currentPageRef.current + 1
					currentPageRef.current = nextPage
					fetchRequests(nextPage, true)
				}
			},
			{ threshold: 0.1 }
		)

		const currentTarget = observerTarget.current
		if (currentTarget) {
			observer.observe(currentTarget)
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget)
			}
		}
	}, [hasNext, loading, loadingMore, fetchRequests])

	if (loading) {
		return (
			<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10'>
				<div className='flex items-center gap-2 text-zinc-300'>
					<Loader2 className='animate-spin' /> Ładowanie…
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-rose-500/10 p-10 text-rose-200'>
				{error}
			</div>
		)
	}

	if (requests.length === 0) {
		return (
			<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center'>
				<Clock className='mx-auto mb-4 text-5xl text-violet-400' size={64} />
				<div className='text-white text-lg font-semibold'>Brak oczekujących zaproszeń</div>
				<div className='text-zinc-400 text-sm'>Nie masz żadnych zaproszeń oczekujących na akceptację.</div>
			</div>
		)
	}

	const handleAccept = async (requestId: number) => {
		try {
			await api.patch(`/team-request/${requestId}/accept`)
			// Po akceptacji usunąć zaproszenie z listy
			setRequests(prev => prev.filter(req => req.requestId !== requestId))
		} catch (error: any) {
			console.error('Error accepting team request:', error)
			alert('Nie udało się zaakceptować zaproszenia. Spróbuj ponownie.')
		}
	}

	const handleReject = async (requestId: number) => {
		try {
			await api.delete(`/team-request/${requestId}`)
			// Po odrzuceniu usunąć zaproszenie z listy
			setRequests(prev => prev.filter(req => req.requestId !== requestId))
		} catch (error: any) {
			console.error('Error rejecting team request:', error)
			alert('Nie udało się odrzucić zaproszenia. Spróbuj ponownie.')
		}
	}

	return (
		<>
			<div className='space-y-3'>
				{requests.map(request => (
					<TeamRequestCard
						key={request.requestId}
						request={request}
						onAccept={handleAccept}
						onReject={handleReject}
					/>
				))}
			</div>

			{hasNext && (
				<div ref={observerTarget} className='mt-8 grid place-items-center py-4'>
					{loadingMore && (
						<div className='flex items-center gap-2 text-zinc-400'>
							<Loader2 className='animate-spin' size={20} />
							<span className='text-sm'>Ładowanie kolejnych zaproszeń...</span>
						</div>
					)}
				</div>
			)}
		</>
	)
}

export default TeamRequestsList

