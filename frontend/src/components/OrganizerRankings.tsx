import React, { useState } from 'react'
import { Star, Activity, MapPin } from 'lucide-react'
import CitySelector from './CitySelector'

type RankingType = 'ogolny' | 'aktywnosc' | 'lokalny'

const OrganizerRankings: React.FC = () => {
	const [activeRanking, setActiveRanking] = useState<RankingType>('ogolny')
	const [selectedCity, setSelectedCity] = useState<string | null>(null)

	const rankingTypes = [
		{ key: 'ogolny' as RankingType, label: 'Ogólny', icon: Star },
		{ key: 'aktywnosc' as RankingType, label: 'Aktywność', icon: Activity },
		{ key: 'lokalny' as RankingType, label: 'Lokalny', icon: MapPin },
	]

	return (
		<section>
			<h3 className='text-lg font-semibold text-white mb-4'>Ranking organizatorów</h3>

			<div className='mb-6'>
				<div className='flex gap-2 overflow-x-auto pb-3'>
					{rankingTypes.map(({ key, label, icon: Icon }) => (
						<button
							key={key}
							onClick={() => setActiveRanking(key)}
							className={`
                                flex-1 flex items-center justify-center gap-2
                                rounded-xl border transition
                                px-3 py-2 text-sm
                                min-w-0
                                ${
									activeRanking === key
										? 'border-violet-600 bg-violet-600/20 text-white'
										: 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
								}
                            `}
						>
							<Icon size={16} className='shrink-0' />
							<span className='whitespace-nowrap truncate'>{label}</span>
						</button>
					))}
				</div>
			</div>
			
			<div>
				{activeRanking === 'ogolny' && (
					<div>
						<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center'>
							<p className='text-zinc-400'>Ranking ogólny organizatorów zostanie dodany wkrótce.</p>
						</div>
					</div>
				)}
				{activeRanking === 'aktywnosc' && (
					<div>
						<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center'>
							<p className='text-zinc-400'>Ranking aktywności organizatorów zostanie dodany wkrótce.</p>
						</div>
					</div>
				)}
				{activeRanking === 'lokalny' && (
					<div>
						<div className='mb-6'>
							<CitySelector value={selectedCity} onChange={setSelectedCity} />
						</div>
						{!selectedCity ? (
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center'>
								<p className='text-zinc-400'>Wybierz miasto, aby zobaczyć ranking.</p>
							</div>
						) : (
							<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center'>
								<p className='text-zinc-400'>Ranking lokalny organizatorów dla miasta {selectedCity} zostanie dodany wkrótce.</p>
							</div>
						)}
					</div>
				)}
			</div>
		</section>
	)
}

export default OrganizerRankings
