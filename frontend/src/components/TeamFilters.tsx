import React from 'react'
import { X } from 'lucide-react'
import SportTypeFilter from './SportTypeFilter'

export interface TeamFilters {
	name: string
	sportTypeId: number | null
	leaderName: string
}

interface TeamFiltersProps {
	filters: TeamFilters
	onFiltersChange: (filters: TeamFilters) => void
}

const TeamFilters: React.FC<TeamFiltersProps> = ({ filters, onFiltersChange }) => {
	const handleNameChange = (value: string) => {
		onFiltersChange({ ...filters, name: value })
	}

	const handleSportTypeChange = (sportTypeId: number | null) => {
		onFiltersChange({ ...filters, sportTypeId })
	}

	const handleLeaderNameChange = (value: string) => {
		onFiltersChange({ ...filters, leaderName: value })
	}

	const handleClear = () => {
		onFiltersChange({
			name: '',
			sportTypeId: null,
			leaderName: '',
		})
	}

	const hasActiveFilters =
		filters.name.trim() !== '' || filters.sportTypeId !== null || filters.leaderName.trim() !== ''

	return (
		<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
			<div className='flex flex-col gap-3 sm:flex-row sm:flex-1 sm:items-center'>
				<input
					type='text'
					placeholder='Nazwa drużyny...'
					value={filters.name}
					onChange={e => handleNameChange(e.target.value)}
					className='flex-1 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent transition'
				/>

				<div className='w-full sm:w-48'>
					<SportTypeFilter value={filters.sportTypeId} onChange={handleSportTypeChange} />
				</div>

				<input
					type='text'
					placeholder='Nazwa lidera...'
					value={filters.leaderName}
					onChange={e => handleLeaderNameChange(e.target.value)}
					className='flex-1 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent transition'
				/>
			</div>

			{hasActiveFilters && (
				<button
					type='button'
					onClick={handleClear}
					className='flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900/80 transition whitespace-nowrap'
				>
					<X size={16} />
					Wyczyść filtry
				</button>
			)}
		</div>
	)
}

export default TeamFilters


