import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import type { TeamDetails } from '../Api/types/Team'
import type { TeamMember } from '../Api/types/TeamMember'
import Avatar from './Avatar'
import ContextMenu from './ContextMenu'
import {
	MapPin,
	Users,
	Crown,
	UserRound,
	Loader2,
	ChevronDown,
	UserPlus,
	UserMinus,
	LogOut,
	Trash2,
	Flag,
	Settings,
	ArrowUpDown,
} from 'lucide-react'
import { parseLocalDate } from '../utils/formatDate'

const getContrastColor = (hexColor: string): string => {
	if (!hexColor || !hexColor.startsWith('#')) return '#d4d4d8'
	
	const r = parseInt(hexColor.slice(1, 3), 16)
	const g = parseInt(hexColor.slice(3, 5), 16)
	const b = parseInt(hexColor.slice(5, 7), 16)
	
	const brightness = (r * 299 + g * 587 + b * 114) / 1000
	
	return brightness > 128 ? '#000000' : '#ffffff'
}

interface TeamInfoTabProps {
	team: TeamDetails
	teamMembers: TeamMember[]
	membersLoading: boolean
	showAllMembers: boolean
	setShowAllMembers: (show: boolean | ((prev: boolean) => boolean)) => void
	isLeader: boolean
	currentUserId: number | null
	userEmail: string | null
	onInviteClick: () => void
	onRemoveMember: (member: TeamMember) => void
	onLeaveTeam: () => void
	onDeleteTeam: () => void
	onOpenTeamChat: () => void
	onReportTeam: () => void
	onManageRoles: () => void
}

const TeamInfoTab: React.FC<TeamInfoTabProps> = ({
													 team,
													 teamMembers,
													 membersLoading,
													 showAllMembers,
													 setShowAllMembers,
													 isLeader,
													 currentUserId,
													 userEmail,
													 onInviteClick,
													 onRemoveMember,
													 onLeaveTeam,
	onDeleteTeam,
	onOpenTeamChat,
	onReportTeam,
	onManageRoles,
												 }) => {
	const [sortBy, setSortBy] = useState<string>("name_asc")

	const sortedTeamMembers = useMemo(() => {
		const result = [...teamMembers]

		result.sort((a, b) => {
			if (a.userId === team.leaderId && b.userId !== team.leaderId) return -1
			if (a.userId !== team.leaderId && b.userId === team.leaderId) return 1

			let comparison = 0

			switch (sortBy) {
				case "name_asc":
					comparison = a.userName.localeCompare(b.userName, "pl", {
						sensitivity: "base",
					})
					break
				case "name_desc":
					comparison = b.userName.localeCompare(a.userName, "pl", {
						sensitivity: "base",
					})
					break
				case "role_asc":
					const roleA = a.roleName || ""
					const roleB = b.roleName || ""
					comparison = roleA.localeCompare(roleB, "pl", {
						sensitivity: "base",
					})
					break
				default:
					return 0
			}

			return comparison
		})

		return result
	}, [teamMembers, sortBy, team.leaderId])

	return (
		<div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
			<section className='lg:col-span-2 space-y-6'>
				{team.description && (
					<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
						<h3 className='text-white text-lg font-semibold mb-3'>Opis drużyny</h3>
						<p className='text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap break-words overflow-wrap-anywhere'>
							{team.description}
						</p>
					</div>
				)}

				<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
					<div className='mb-4 flex items-center justify-between'>
						<h3 className='text-white text-lg font-semibold'>Członkowie drużyny ({teamMembers.length})</h3>
						<div className='flex items-center gap-2'>
							<div className='relative'>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className='appearance-none rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 pr-8 text-sm text-zinc-200'
								>
									<option value='name_asc'>Nazwa A-Z</option>
									<option value='name_desc'>Nazwa Z-A</option>
									<option value='role_asc'>Rola (alfabetycznie)</option>
								</select>
								<ArrowUpDown
									className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60'
									size={16}
								/>
							</div>
							{teamMembers.length > 8 && (
								<button
									onClick={() => setShowAllMembers(s => !s)}
									className='inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200'>
									{showAllMembers ? 'Ukryj' : 'Zobacz wszystkich'}
									<ChevronDown size={16} className={`transition-transform ${showAllMembers ? 'rotate-180' : ''}`} />
								</button>
							)}
						</div>
					</div>
					{isLeader && (
						<div className='mb-4 flex gap-2'>
							<button
								onClick={onInviteClick}
								className='inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors'>
								<UserPlus size={16} />
								Zaproś użytkowników
							</button>
							<button
								onClick={onManageRoles}
								className='inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors'>
								<Settings size={16} />
								Zarządzaj rolami
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
							{sortedTeamMembers.slice(0, showAllMembers ? sortedTeamMembers.length : 8).map(member => (
								<div
									key={member.id}
									className='group flex items-center justify-between gap-3 rounded-lg bg-zinc-800/60 px-3 py-2 hover:bg-zinc-800 transition'>
									<Link to={`/profile/${member.userId}`} className='flex items-center gap-3 flex-1'>
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
											<div className='mt-0.5 flex flex-wrap items-center gap-1'>
												{member.userId === team.leaderId && (
													<div className='inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] bg-violet-500/20 text-violet-300'>
														<Crown size={10} />
														Lider
													</div>
												)}
												{member.roleName && (
													<div
														className='inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium'
														style={{
															backgroundColor: member.roleColor || '#3f3f46',
															color: member.roleColor
																? getContrastColor(member.roleColor)
																: '#d4d4d8',
														}}
													>
														{member.roleName}
													</div>
												)}
											</div>
										</div>
									</Link>
									{isLeader && member.userId !== currentUserId && (
										<ContextMenu
											items={[
												{
													label: 'Usuń z drużyny',
													icon: <UserMinus size={16} />,
													onClick: () => onRemoveMember(member),
													variant: 'danger',
												},
											]}
										/>
									)}
								</div>
							))}
						</div>
					)}

					{!showAllMembers && sortedTeamMembers.length > 8 && (
						<p className='text-center text-xs text-zinc-400 mt-4'>i {sortedTeamMembers.length - 8} więcej…</p>
					)}
				</div>
			</section>

			<aside className='space-y-6 lg:sticky lg:top-6'>
				<div
					className={`rounded-2xl border p-5 ${
						isLeader ? 'border-violet-500/50 bg-zinc-900/80' : 'border-zinc-800 bg-zinc-900/60'
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

				<div className='rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5'>
					<button
						onClick={onReportTeam}
						className='w-full rounded-xl bg-rose-600/20 border border-rose-500/40 px-4 py-3 text-sm font-medium text-rose-200 hover:bg-rose-600/30 transition-colors inline-flex items-center justify-center gap-2'>
						<Flag size={16} />
						Zgłoś drużynę
					</button>

				</div>

				{currentUserId && teamMembers.some(m => m.userId === currentUserId) && (
					<div className='rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5'>
						<button
							onClick={onOpenTeamChat}
							className='w-full rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-3 text-sm font-medium text-white transition-colors inline-flex items-center justify-center gap-2'>
							<Users size={16} />
							Przejdź do czatu drużyny
						</button>
					</div>
				)}

				{currentUserId && !isLeader && teamMembers.some(m => m.userId === currentUserId) && (
					<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
						<button
							onClick={onLeaveTeam}
							className='w-full rounded-xl bg-red-600/20 border border-red-500/30 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-600/30 transition-colors inline-flex items-center justify-center gap-2'>
							<LogOut size={16} />
							Opuść drużynę
						</button>
					</div>
				)}

				{isLeader && (
					<div className='rounded-2xl border border-red-500/30 bg-red-500/10 p-5'>
						<button
							onClick={onDeleteTeam}
							className='w-full rounded-xl bg-red-600/20 border border-red-500/30 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-600/30 transition-colors inline-flex items-center justify-center gap-2'>
							<Trash2 size={16} />
							Usuń drużynę
						</button>
					</div>
				)}
			</aside>
		</div>
	)
}

export default TeamInfoTab
