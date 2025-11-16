import { Link } from 'react-router-dom'
import { MapPin, Crown, Users } from 'lucide-react'
import type { TeamRequestResponseDto } from '../Api/types/TeamRequest'
import type { TeamDetails } from '../Api/types/Team'

interface TeamRequestCardProps {
	request: TeamRequestResponseDto & {
		team: TeamDetails | null
	}
	onAccept: (requestId: number) => void
	onReject: (requestId: number) => void
}

const TeamRequestCard: React.FC<TeamRequestCardProps> = ({ request, onAccept, onReject }) => {
	const team = request.team

	if (!team) {
		return (
			<div className='flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
				<div className='text-zinc-400 text-sm'>Ładowanie szczegółów drużyny...</div>
			</div>
		)
	}

	return (
		<div className='flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
			<Link
				to={`/team/${team.idTeam}`}
				className='flex items-center gap-3 flex-1 hover:bg-zinc-800/30 rounded-lg p-2 -m-2 transition-colors'
			>
				{team.photoUrl && team.photoUrl.trim() !== '' ? (
					<img
						src={team.photoUrl}
						alt={team.name}
						className='h-12 w-12 rounded-lg object-cover border border-zinc-700'
						onError={e => {
							const target = e.currentTarget as HTMLImageElement
							target.style.display = 'none'
						}}
					/>
				) : (
					<div className='h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700'>
						<Users size={20} className='text-zinc-400' />
					</div>
				)}
				<div>
					<p className='text-white font-medium'>{team.name}</p>
					<div className='flex items-center gap-3 text-sm text-zinc-400 mt-1'>
						<div className='flex items-center gap-1'>
							<MapPin size={14} />
							{team.city}
						</div>
						<div className='flex items-center gap-1'>
							<Crown size={14} />
							<Link
								to={`/profile/${team.leaderId}`}
								onClick={(e) => e.stopPropagation()}
								className='hover:text-violet-300 hover:underline'
							>
								{team.leaderName}
							</Link>
						</div>
						<span className='text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded'>
							{team.sportType}
						</span>
					</div>
				</div>
			</Link>
			<div className='flex items-center gap-1 sm:gap-2'>
				<button
					onClick={() => onAccept(request.requestId)}
					className='inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-xs sm:text-sm font-medium text-white'
					title='Zaakceptuj zaproszenie'
				>
					<span>✓</span>
					<span className='hidden sm:inline'>Zaakceptuj</span>
				</button>
				<button
					onClick={() => onReject(request.requestId)}
					className='inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-zinc-600 hover:bg-zinc-500 transition-colors text-xs sm:text-sm font-medium text-white'
					title='Odrzuć zaproszenie'
				>
					<span>✗</span>
					<span className='hidden sm:inline'>Odrzuć</span>
				</button>
			</div>
		</div>
	)
}

export default TeamRequestCard

