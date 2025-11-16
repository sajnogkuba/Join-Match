import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search, X } from 'lucide-react'
import api from '../Api/axios'
import type { SportType } from '../Api/types/SportType'

interface SportTypeFilterProps {
	value: number | null
	onChange: (sportTypeId: number | null) => void
}

const SportTypeFilter: React.FC<SportTypeFilterProps> = ({ value, onChange }) => {
	const [sportTypes, setSportTypes] = useState<SportType[]>([])
	const [filteredSports, setFilteredSports] = useState<SportType[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [isOpen, setIsOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
	const containerRef = useRef<HTMLDivElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		setLoading(true)
		api.get<SportType[]>('/sport-type')
			.then(({ data }) => {
				const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
				setSportTypes(sorted)
				setFilteredSports(sorted)
			})
			.catch(() => {
				setSportTypes([])
				setFilteredSports([])
			})
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => {
		if (searchQuery.trim() === '') {
			setFilteredSports(sportTypes)
		} else {
			const query = searchQuery.toLowerCase()
			const filtered = sportTypes.filter(sport =>
				sport.name.toLowerCase().includes(query)
			)
			setFilteredSports(filtered)
		}
	}, [searchQuery, sportTypes])

	// Calculate position when opening
	const calculatePosition = () => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect()
			setPosition({
				top: rect.bottom + 4,
				left: rect.left,
				width: rect.width
			})
		}
	}

	useEffect(() => {
		if (isOpen) {
			calculatePosition()
		}
	}, [isOpen])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node) &&
				dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
				setSearchQuery('')
			}
		}

		const handleScroll = () => {
			if (isOpen) {
				calculatePosition()
			}
		}

		const handleResize = () => {
			if (isOpen) {
				calculatePosition()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		window.addEventListener('scroll', handleScroll, true)
		window.addEventListener('resize', handleResize)
		
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			window.removeEventListener('scroll', handleScroll, true)
			window.removeEventListener('resize', handleResize)
		}
	}, [isOpen])

	const selectedSport = sportTypes.find(s => s.id === value)

	const handleSelect = (sportId: number | null) => {
		onChange(sportId)
		setIsOpen(false)
		setSearchQuery('')
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onChange(null)
		setSearchQuery('')
	}

	return (
		<>
			<div ref={containerRef} className='relative'>
				<button
					type='button'
					onClick={() => setIsOpen(!isOpen)}
					className='w-full flex items-center justify-between gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/80 transition focus:ring-2 focus:ring-violet-600 focus:border-transparent'
				>
					<span className='truncate'>
						{selectedSport ? selectedSport.name : 'Wszystkie sporty'}
					</span>
					<div className='flex items-center gap-1 shrink-0'>
						{value !== null && (
							<button
								type='button'
								onClick={handleClear}
								className='p-0.5 hover:bg-zinc-700 rounded transition'
							>
								<X size={14} />
							</button>
						)}
						<ChevronDown
							size={16}
							className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
						/>
					</div>
				</button>
			</div>

			{isOpen && typeof document !== 'undefined' && createPortal(
				<div 
					ref={dropdownRef}
					className='fixed bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-[9999]'
					style={{
						top: `${position.top}px`,
						left: `${position.left}px`,
						width: `${position.width}px`,
						transform: 'translateZ(0)'
					}}
				>
					<div className='p-2 border-b border-zinc-800'>
						<div className='relative'>
							<Search
								size={16}
								className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'
							/>
							<input
								type='text'
								placeholder='Szukaj sportu...'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								onClick={e => e.stopPropagation()}
								className='w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent'
								autoFocus
							/>
						</div>
					</div>
					<div className='max-h-60 overflow-y-auto'>
						{loading ? (
							<div className='px-4 py-3 text-sm text-zinc-400 text-center'>
								Ładowanie...
							</div>
						) : filteredSports.length === 0 ? (
							<div className='px-4 py-3 text-sm text-zinc-400 text-center'>
								Brak wyników
							</div>
						) : (
							<>
								<button
									type='button'
									onClick={() => handleSelect(null)}
									className={`w-full px-4 py-2 text-left text-sm transition ${
										value === null
											? 'bg-violet-900/40 text-white'
											: 'text-zinc-300 hover:bg-zinc-800'
									}`}
								>
									Wszystkie sporty
								</button>
								{filteredSports.map(sport => (
									<button
										key={sport.id}
										type='button'
										onClick={() => handleSelect(sport.id)}
										className={`w-full px-4 py-2 text-left text-sm transition ${
											value === sport.id
												? 'bg-violet-900/40 text-white'
												: 'text-zinc-300 hover:bg-zinc-800'
										}`}
									>
										{sport.name}
									</button>
								))}
							</>
						)}
					</div>
				</div>,
				document.body
			)}
		</>
	)
}

export default SportTypeFilter

