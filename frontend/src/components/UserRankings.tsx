import React, { useState } from 'react'
import { Star, Activity, Trophy, MapPin } from 'lucide-react'

type RankingType = 'ogolny' | 'aktywnosc' | 'sport' | 'lokalny'

const UserRankings: React.FC = () => {
	const [activeRanking, setActiveRanking] = useState<RankingType>('ogolny')

	const rankingTypes = [
		{ key: 'ogolny' as RankingType, label: 'Ogólny', icon: Star },
		{ key: 'aktywnosc' as RankingType, label: 'Aktywność', icon: Activity },
		{ key: 'sport' as RankingType, label: 'W sporcie', icon: Trophy },
		{ key: 'lokalny' as RankingType, label: 'Lokalny', icon: MapPin },
	]

	return (
		<section>
			<h3 className='text-lg font-semibold text-white mb-4'>Ranking użytkowników</h3>

			{/* Tabs */}
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

			{/* Zawartość rankingu */}
			<div>
				{activeRanking === 'ogolny' && (
					<div>
						<p className='text-sm text-zinc-400'>Ranking ogólny użytkowników po średniej ocenie zostanie dodany wkrótce.</p>
					</div>
				)}
				{activeRanking === 'aktywnosc' && (
					<div>
						<p className='text-sm text-zinc-400'>Ranking aktywności użytkowników zostanie dodany wkrótce.</p>
					</div>
				)}
				{activeRanking === 'sport' && (
					<div>
						<p className='text-sm text-zinc-400'>Ranking użytkowników w sporcie zostanie dodany wkrótce.</p>
					</div>
				)}
				{activeRanking === 'lokalny' && (
					<div>
						<p className='text-sm text-zinc-400'>Ranking lokalny użytkowników zostanie dodany wkrótce.</p>
					</div>
				)}
			</div>
		</section>
	)
}

export default UserRankings

