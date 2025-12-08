import { Link } from 'react-router-dom'
import { MapPin, Crown, ChevronRight } from 'lucide-react'

interface TeamCardProps {
	team: {
		idTeam: number
		name: string
		city: string
		sportType: string
		description: string | null
		leaderId: number
		leaderName: string
		photoUrl: string | null
	}
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
	return (
		<article className='overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60'>
			<Link to={`/team/${team.idTeam}`} className='block relative h-40 bg-zinc-800 overflow-hidden'>
				{team.photoUrl && team.photoUrl.trim() !== '' ? (
					<img
						src={team.photoUrl}
						alt={team.name}
						onError={e => {
							const target = e.currentTarget as HTMLImageElement
							target.style.display = 'none'
							const fallback = target.nextElementSibling as HTMLElement
							if (fallback) fallback.style.display = 'flex'
						}}
						className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-500'
					/>
				) : null}
				<div
					className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 group-hover:scale-105 transition-transform duration-500 ${
						team.photoUrl && team.photoUrl.trim() !== '' ? 'hidden' : 'flex'
					}`}
					style={{ display: team.photoUrl && team.photoUrl.trim() !== '' ? 'none' : 'flex' }}>
					<div className='text-center text-zinc-400'>
						<div className='text-4xl mb-2'>{team.name}</div>
						<div className='text-sm font-medium'>{team.sportType}</div>
					</div>
				</div>
				<span className='absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-violet-200 ring-1 ring-violet-600/40'>
					{team.sportType}
				</span>
			</Link>
			<div className='p-4'>
				<div className='flex items-start justify-between'>
					<h3 className='text-white font-semibold line-clamp-1'>
						<Link to={`/team/${team.idTeam}`} className='hover:underline'>
							{team.name}
						</Link>
					</h3>
				</div>
				<div className='mt-2 text-sm text-zinc-300 space-y-1'>
					<div className='flex items-center gap-2'>
						<MapPin size={16} /> {team.city}
					</div>
					<div className='flex items-center gap-2'>
						<Crown size={16} />
						<Link
							to={`/profile/${team.leaderId}`}
							className='text-violet-300 hover:text-violet-200 hover:underline'>
							{team.leaderName}
						</Link>
					</div>
				</div>
				<div className='mt-4 flex justify-end'>
					<Link
						to={`/team/${team.idTeam}`}
						className='text-violet-300 hover:text-violet-200 inline-flex items-center gap-1'>
						Szczegóły <ChevronRight size={16} />
					</Link>
				</div>
			</div>
		</article>
	)
}

export default TeamCard

