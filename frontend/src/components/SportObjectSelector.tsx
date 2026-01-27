import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search, X, ArrowUpDown } from 'lucide-react'
import type { SportObject } from '../Api/types/SportObject'

interface SportObjectSelectorProps {
	value: number | 0
	onChange: (id: number) => void
	sportObjects: SportObject[]
	error?: boolean
	placeholder?: string
}

const SportObjectSelector: React.FC<SportObjectSelectorProps> = ({
	value,
	onChange,
	sportObjects,
	error = false,
	placeholder = 'Wybierz obiekt'
}) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [sortBy, setSortBy] = useState<string>('name_asc')
	const [selectedCity, setSelectedCity] = useState<string | null>(null)
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
	const containerRef = useRef<HTMLDivElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const formatObjectDisplay = (obj: SportObject): string => {
		return `${obj.name}, ${obj.city}, ${obj.street} ${obj.number}`
	}

	const selectedObject = useMemo(() => {
		return sportObjects.find(obj => obj.id === value) || null
	}, [sportObjects, value])

	const uniqueCities = useMemo(() => {
		const cities = [...new Set(sportObjects.map(obj => obj.city))].sort()
		return cities
	}, [sportObjects])

	const filteredAndSortedObjects = useMemo(() => {
		let filtered = sportObjects
		
		if (searchQuery.trim() !== '') {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(obj =>
				obj.name.toLowerCase().includes(query) ||
				obj.city.toLowerCase().includes(query) ||
				obj.street.toLowerCase().includes(query)
			)
		}
		
		if (selectedCity !== null) {
			filtered = filtered.filter(obj => obj.city === selectedCity)
		}
		
		const [field, direction] = sortBy.split('_')
		const sorted = [...filtered].sort((a, b) => {
			let aVal: string
			let bVal: string
			
			if (field === 'name') {
				aVal = a.name.toLowerCase()
				bVal = b.name.toLowerCase()
			} else if (field === 'city') {
				aVal = a.city.toLowerCase()
				bVal = b.city.toLowerCase()
			} else {
				aVal = a.street.toLowerCase()
				bVal = b.street.toLowerCase()
			}
			
			const comparison = aVal.localeCompare(bVal)
			return direction === 'asc' ? comparison : -comparison
		})
		
		return sorted
	}, [sportObjects, searchQuery, selectedCity, sortBy])

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
				setSelectedCity(null)
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

	const handleSelect = (obj: SportObject) => {
		onChange(obj.id)
		setIsOpen(false)
		setSearchQuery('')
	}

	const handleClear = (e?: React.SyntheticEvent) => {
		if (e) {
			e.stopPropagation()
		}
		onChange(0)
		setSearchQuery('')
	}

	return (
		<>
			<div ref={containerRef} className='relative'>
				<button
					type='button'
					onClick={() => setIsOpen(!isOpen)}
					className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/80 transition focus:ring-2 focus:ring-violet-600 focus:border-transparent ${
						error
							? 'border-red-500 bg-zinc-900/60'
							: 'border-zinc-700 bg-zinc-900/60'
					}`}
				>
					<span className='truncate'>
						{selectedObject ? formatObjectDisplay(selectedObject) : placeholder}
					</span>
					<div className='flex items-center gap-1 shrink-0'>
						{value !== 0 && (
							<div
								onClick={(e) => {
									e.stopPropagation()
									handleClear(e)
								}}
								className='p-0.5 hover:bg-zinc-700 rounded transition cursor-pointer'
								role='button'
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										e.stopPropagation()
										handleClear()
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
						width: `${Math.max(position.width, 400)}px`,
						minWidth: '400px',
						transform: 'translateZ(0)'
					}}
				>
					<div className='p-2 border-b border-zinc-800 space-y-2'>
						<div className='relative'>
							<Search
								size={16}
								className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'
							/>
							<input
								type='text'
								placeholder='Szukaj obiektu...'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								onClick={e => e.stopPropagation()}
								className='w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent'
								autoFocus
							/>
						</div>
						<div className='flex gap-2'>
							<div className='relative flex-1'>
								<select
									value={selectedCity || ''}
									onChange={e => setSelectedCity(e.target.value || null)}
									onClick={e => e.stopPropagation()}
									className='w-full appearance-none rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 pr-8 text-sm text-zinc-200 focus:ring-2 focus:ring-violet-600 focus:border-transparent'
								>
									<option value=''>Wszystkie miasta</option>
									{uniqueCities.map(city => (
										<option key={city} value={city}>
											{city}
										</option>
									))}
								</select>
								<ChevronDown
									size={14}
									className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60'
								/>
							</div>
							<div className='relative flex-1'>
								<select
									value={sortBy}
									onChange={e => setSortBy(e.target.value)}
									onClick={e => e.stopPropagation()}
									className='w-full appearance-none rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 pr-8 text-sm text-zinc-200 focus:ring-2 focus:ring-violet-600 focus:border-transparent'
								>
									<option value='name_asc'>Nazwa A-Z</option>
									<option value='name_desc'>Nazwa Z-A</option>
									<option value='city_asc'>Miasto A-Z</option>
									<option value='city_desc'>Miasto Z-A</option>
									<option value='street_asc'>Ulica A-Z</option>
									<option value='street_desc'>Ulica Z-A</option>
								</select>
								<ArrowUpDown
									className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60'
									size={14}
								/>
							</div>
						</div>
					</div>
					<div className='max-h-96 overflow-y-auto dark-scrollbar'>
						{sportObjects.length === 0 ? (
							<div className='px-4 py-3 text-sm text-zinc-400 text-center'>
								Brak obiektów
							</div>
						) : filteredAndSortedObjects.length === 0 ? (
							<div className='px-4 py-3 text-sm text-zinc-400 text-center'>
								Brak wyników
							</div>
						) : (
							filteredAndSortedObjects.map(obj => (
								<button
									key={obj.id}
									type='button'
									onClick={() => handleSelect(obj)}
									className={`w-full px-4 py-2 text-left text-sm transition ${
										value === obj.id
											? 'bg-violet-900/40 text-white'
											: 'text-zinc-300 hover:bg-zinc-800'
									}`}
								>
									{formatObjectDisplay(obj)}
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

export default SportObjectSelector
