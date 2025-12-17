import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search, X } from 'lucide-react'
import { getAvailableCities } from '../Api/rankings'

interface CitySelectorProps {
	value: string | null
	onChange: (city: string | null) => void
}

const CitySelector: React.FC<CitySelectorProps> = ({ value, onChange }) => {
	const [cities, setCities] = useState<string[]>([])
	const [filteredCities, setFilteredCities] = useState<string[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [isOpen, setIsOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
	const containerRef = useRef<HTMLDivElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		setLoading(true)
		getAvailableCities()
			.then((data) => {
				const sorted = [...data].sort((a, b) => a.localeCompare(b))
				setCities(sorted)
				setFilteredCities(sorted)
			})
			.catch(() => {
				setCities([])
				setFilteredCities([])
			})
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => {
		if (searchQuery.trim() === '') {
			setFilteredCities(cities)
		} else {
			const query = searchQuery.toLowerCase()
			const filtered = cities.filter(city =>
				city.toLowerCase().includes(query)
			)
			setFilteredCities(filtered)
		}
	}, [searchQuery, cities])

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

	const handleSelect = (city: string | null) => {
		onChange(city)
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
						{value || 'Wybierz miasto'}
					</span>
					<div className='flex items-center gap-1 shrink-0'>
						{value !== null && (
							<div
								onClick={(e) => {
									e.stopPropagation();
									handleClear(e);
								}}
								className='p-0.5 hover:bg-zinc-700 rounded transition cursor-pointer'
								role='button'
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										e.stopPropagation();
										handleClear(e);
									}
								}}
							>
								<X size={14} />
							</div>
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
								placeholder='Szukaj miasta...'
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
						) : filteredCities.length === 0 ? (
							<div className='px-4 py-3 text-sm text-zinc-400 text-center'>
								Brak wyników
							</div>
						) : (
							filteredCities.map(city => (
								<button
									key={city}
									type='button'
									onClick={() => handleSelect(city)}
									className={`w-full px-4 py-2 text-left text-sm transition ${
										value === city
											? 'bg-violet-900/40 text-white'
											: 'text-zinc-300 hover:bg-zinc-800'
									}`}
								>
									{city}
								</button>
							))
						)}
					</div>
				</div>,
				document.body
			)}
		</>
	)
}

export default CitySelector
