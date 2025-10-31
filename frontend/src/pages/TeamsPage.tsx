import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Crown, CheckCircle, Plus } from 'lucide-react'
import { useAuth } from '../Context/authContext'
import TeamsList from '../components/TeamsList'

type TeamsTab = 'all-teams' | 'owned-teams' | 'joined-teams'

const TeamsPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TeamsTab>('all-teams')
	const { isAuthenticated } = useAuth()
	const navigate = useNavigate()

	const handleTabSelect = (tab: TeamsTab) => {
		if ((tab === 'owned-teams' || tab === 'joined-teams') && !isAuthenticated) {
			navigate('/login')
			return
		}
		setActiveTab(tab)
	}

	const handleCreateTeam = () => {
		if (!isAuthenticated) {
			navigate('/login')
			return
		}
		navigate('/stworz-druzyne')
	}

	const sidebarItems = [
		{ key: 'all-teams' as TeamsTab, label: 'Wszystkie', icon: Users },
		{ key: 'owned-teams' as TeamsTab, label: 'Utworzone', icon: Crown },
		{ key: 'joined-teams' as TeamsTab, label: 'Dołączyłem', icon: CheckCircle },
	]

	return (
		<div className='min-h-screen bg-[#1f2632] text-zinc-300 pt-10'>
			<header className='relative h-[140px] w-full overflow-hidden'>
				<div
					className='absolute inset-0 bg-cover bg-center'
				/>
				<div className='absolute inset-0 bg-black/60' />
				<div className='relative z-10 mx-auto flex h-full max-w-7xl items-end justify-between px-4 pb-6 md:px-8'>
					<div>
						<h1 className='text-2xl md:text-3xl font-semibold text-white'>Drużyny</h1>
						<div className='mt-2 h-1 w-28 rounded-full bg-violet-600' />
					</div>
					<button
						onClick={handleCreateTeam}
						className='bg-white/10 border border-white/20 px-4 py-2 rounded-xl font-semibold text-white hover:bg-white/20 transition-all inline-flex items-center gap-2'
					>
						<Plus size={18} />
						Stwórz drużynę
					</button>
				</div>
			</header>

			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					<div className='flex flex-col gap-8 lg:flex-row'>
						<aside className='w-full md:w-64 shrink-0 lg:sticky lg:top-8 lg:self-start lg:pr-8 lg:border-r lg:border-zinc-800'>
							<nav className='space-y-1'>
								{sidebarItems.map(({ key, label, icon: Icon }) => (
									<button
										key={key}
										onClick={() => handleTabSelect(key)}
										className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
											activeTab === key
												? 'bg-zinc-800 text-white'
												: 'text-zinc-300 hover:bg-zinc-800/60'
										}`}
									>
										<Icon size={18} />
										<span className='text-sm'>{label}</span>
									</button>
								))}
							</nav>
						</aside>

						<div className='flex-1 min-w-0 lg:pl-8'>
							<div className='max-h-[calc(100vh-280px)] overflow-y-auto pr-2 rounded-xl bg-zinc-900/30 p-4 border border-zinc-800/50 dark-scrollbar'>
								{activeTab === 'all-teams' && <TeamsList />}

								{activeTab === 'owned-teams' && (
									<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-20 text-center'>
										<div>
											<Crown className='mx-auto mb-4 text-5xl text-violet-400' size={64} />
											<h2 className='text-white text-xl font-semibold mb-2'>Utworzone drużyny</h2>
											<p className='text-zinc-400 text-sm'>
												Tutaj znajdziesz drużyny, które utworzyłeś.
											</p>
										</div>
									</div>
								)}

								{activeTab === 'joined-teams' && (
									<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-20 text-center'>
										<div>
											<CheckCircle className='mx-auto mb-4 text-5xl text-violet-400' size={64} />
											<h2 className='text-white text-xl font-semibold mb-2'>Drużyny, do których dołączyłem</h2>
											<p className='text-zinc-400 text-sm'>
												Tutaj znajdziesz drużyny, do których należysz.
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default TeamsPage

