import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../Api/axios'
import type { Team } from '../Api/types/Team'
import TeamCard from './TeamCard'
import { Loader2, Users, ArrowUpDown } from 'lucide-react'

type TeamsPageResponse = {
	content: Team[]
	totalElements: number
	totalPages: number
	number: number
	size: number
	first: boolean
	last: boolean
	numberOfElements: number
	empty: boolean
}

type SortOption = 'name' | 'city'
type SortDirection = 'ASC' | 'DESC'

interface TeamsListProps {
	leaderId?: number
}

const TeamsList: React.FC<TeamsListProps> = ({ leaderId }) => {
	const [teams, setTeams] = useState<Team[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [pageSize] = useState(12)
	const [hasNext, setHasNext] = useState(false)
	const [sortBy, setSortBy] = useState<SortOption>('name')
	const [sortDirection, setSortDirection] = useState<SortDirection>('ASC')
	const observerTarget = useRef<HTMLDivElement>(null)
	const currentPageRef = useRef(0)

	const fetchTeams = useCallback(async (pageNum: number, append: boolean = false) => {
		try {
			if (append) {
				setLoadingMore(true)
			} else {
				setLoading(true)
			}
			const endpoint = leaderId !== undefined ? '/team/by-leader' : '/team'
			const params: Record<string, any> = {
				page: pageNum,
				size: pageSize,
				sort: sortBy,
				direction: sortDirection,
			}
			if (leaderId !== undefined) {
				params.leaderId = leaderId
			}
			const response = await api.get<TeamsPageResponse>(endpoint, { params })
			const data = response.data
			if (append) {
				setTeams(prev => [...prev, ...(data.content || [])])
			} else {
				setTeams(data.content || [])
			}
			setHasNext(!data.last)
		} catch (err) {
			setError('Nie udało się pobrać drużyn.')
		} finally {
			setLoading(false)
			setLoadingMore(false)
		}
	}, [pageSize, sortBy, sortDirection, leaderId])

	useEffect(() => {
		currentPageRef.current = 0
		setTeams([])
		fetchTeams(0, false)
	}, [sortBy, sortDirection, leaderId, fetchTeams])

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasNext && !loading && !loadingMore) {
					const nextPage = currentPageRef.current + 1
					currentPageRef.current = nextPage
					fetchTeams(nextPage, true)
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
	}, [hasNext, loading, loadingMore, fetchTeams])

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

	if (teams.length === 0) {
		return (
			<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center'>
				<Users className='mx-auto mb-4 text-5xl text-violet-400' size={64} />
				<div className='text-white text-lg font-semibold'>Brak drużyn</div>
				<div className='text-zinc-400 text-sm'>Nie znaleziono żadnych drużyn do wyświetlenia.</div>
			</div>
		)
	}

	const handleSortChange = (value: string) => {
		const [sort, direction] = value.split('_')
		setSortBy(sort as SortOption)
		setSortDirection(direction as SortDirection)
	}

	return (
		<>
			<div className='mb-6 flex items-center justify-end'>
				<div className='relative'>
					<select
						value={`${sortBy}_${sortDirection}`}
						onChange={e => handleSortChange(e.target.value)}
						className='appearance-none rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 pr-8 text-sm text-zinc-200'>
						<option value='name_ASC'>Nazwa A-Z</option>
						<option value='name_DESC'>Nazwa Z-A</option>
						<option value='city_ASC'>Miasto A-Z</option>
						<option value='city_DESC'>Miasto Z-A</option>
					</select>
					<ArrowUpDown
						className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60'
						size={16}
					/>
				</div>
			</div>
			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{teams.map(team => (
					<TeamCard key={team.idTeam} team={team} />
				))}
			</div>

			{hasNext && (
				<div ref={observerTarget} className='mt-8 grid place-items-center py-4'>
					{loadingMore && (
						<div className='flex items-center gap-2 text-zinc-400'>
							<Loader2 className='animate-spin' size={20} />
							<span className='text-sm'>Ładowanie kolejnych drużyn...</span>
						</div>
					)}
				</div>
			)}
		</>
	)
}

export default TeamsList
