import { useState } from 'react'
import RankingsSidebar from '../components/RankingsSidebar'
import UserRankings from '../components/UserRankings'
import OrganizerRankings from '../components/OrganizerRankings'
import TeamRankings from '../components/TeamRankings'
import EventRankings from '../components/EventRankings'

const RankingsPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<string>('Gracze')

	return (
		<div className='min-h-screen bg-[#1f2632] text-zinc-300'>
			<header className='relative h-[180px] md:h-[220px] w-full overflow-hidden'>
				<div className='absolute inset-0 bg-black/60' />
				<div className='relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-6 md:px-8'>
					<div>
						<h1 className='text-2xl md:text-3xl font-semibold text-white'>Rankingi</h1>
						<div className='mt-2 h-1 w-32 rounded-full bg-violet-600' />
					</div>
				</div>
			</header>

			<main className='mx-auto max-w-[2000px] px-4 py-8 md:px-8'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					<div className='flex flex-col gap-8 lg:flex-row'>
						<RankingsSidebar active={activeTab} onSelect={setActiveTab} />

						<div className='flex-1 space-y-6'>
							{activeTab === 'Gracze' && <UserRankings />}
							{activeTab === 'Organizatorzy' && <OrganizerRankings />}
							{activeTab === 'Drużyny' && <TeamRankings />}
							{activeTab === 'Wydarzenia' && <EventRankings />}
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default RankingsPage