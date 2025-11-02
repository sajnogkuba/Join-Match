import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { TeamDetails } from '../Api/types/Team'
import api from '../Api/axios'
import Avatar from '../components/Avatar'
import { MapPin, Users, Crown, UserRound, Loader2, AlertTriangle } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import { parseLocalDate } from '../utils/formatDate'

dayjs.locale('pl')

const TeamPage: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const [team, setTeam] = useState<TeamDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

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
				{/* Header z miniaturą zdjęcia */}
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6'>
					<div className='flex flex-col sm:flex-row sm:items-center gap-5'>
						{/* Miniaturka drużyny */}
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

						{/* Tytuł i szczegóły */}
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

				<hr className='my-6 border-zinc-800' />

				<div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
					{/* Main content */}
					<section className='lg:col-span-2 space-y-6'>
						{/* Opis drużyny */}
						{team.description && (
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
								<h3 className='text-white text-lg font-semibold mb-3'>Opis drużyny</h3>
								<p className='text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap break-words overflow-wrap-anywhere'>{team.description}</p>
							</div>
						)}

						{/* Informacja o członkach - placeholder */}
						<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
							<div className='mb-4 flex items-center justify-between'>
								<h3 className='text-white text-lg font-semibold'>Członkowie drużyny</h3>
								{team.memberCount !== undefined && (
									<span className='text-violet-300 font-semibold'>{team.memberCount} członków</span>
								)}
							</div>
							<div className='rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm inline-flex items-center gap-2'>
								<AlertTriangle size={16} /> Funkcjonalność dołączania do drużyny wkrótce
							</div>
						</div>
					</section>

					{/* Sidebar */}
					<aside className='space-y-6 lg:sticky lg:top-6'>
						{/* Lider */}
						<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5'>
							<h3 className='text-white text-lg font-semibold flex items-center gap-2 mb-4'>
								<Crown size={20} className='text-violet-400' /> Lider
							</h3>
							<div className='mt-4 flex items-center gap-3'>
								<Avatar
									src={team.leaderAvatarUrl || null}
									name={team.leaderName}
									size='sm'
									className='ring-2 ring-zinc-700 shadow-md'
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

						{/* Informacje dodatkowe */}
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
					</aside>
				</div>
			</div>
		</main>
	)
}

export default TeamPage

