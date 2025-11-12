import { useRef } from 'react'
import type { TeamMember } from '../Api/types/TeamMember'

interface MentionListProps {
	items: TeamMember[]
	command: (item: { id: string | number; label: string }) => void
	selectedIndex?: number
	setSelectedIndex?: (index: number | ((prev: number) => number)) => void
}

export const MentionList = ({ items, command, selectedIndex = 0 }: MentionListProps) => {
	const ref = useRef<HTMLDivElement>(null)

	return (
		<div ref={ref} className='bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto'>
			{items.length ? (
				items.map((item, index) => (
					<button
						key={item.userId}
						onClick={() => command({ id: item.userId, label: item.userName })}
						className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${
							index === selectedIndex ? 'bg-violet-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'
						}`}
					>
						<span className='font-medium'>{item.userName}</span>
						<span className='text-xs text-zinc-400'>({item.userEmail})</span>
					</button>
				))
			) : (
				<div className='px-3 py-2 text-zinc-400 text-sm'>Brak wyników</div>
			)}
		</div>
	)
}

