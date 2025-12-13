import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface UniversalDatePickerProps {
	value: string
	onChange: (date: string) => void
	placeholder?: string
	error?: boolean
	disabled?: boolean
	mode?: 'event' | 'birth' // 'event' - blokuje przeszłe, 'birth' - blokuje przyszłe
	theme?: 'violet' | 'purple' // Kolory dopasowane do kontekstu
}

const MONTHS = [
	'Styczeń',
	'Luty',
	'Marzec',
	'Kwiecień',
	'Maj',
	'Czerwiec',
	'Lipiec',
	'Sierpień',
	'Wrzesień',
	'Październik',
	'Listopad',
	'Grudzień',
]

const DAYS_OF_WEEK = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie']

export default function DatePicker({
	value,
	onChange,
	placeholder = 'Wybierz datę',
	error = false,
	disabled = false,
	mode = 'event',
	theme = 'violet',
}: UniversalDatePickerProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [position, setPosition] = useState({ top: 0, left: 0 })
	const [showYearSelector, setShowYearSelector] = useState(false)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const calendarRef = useRef<HTMLDivElement>(null)

	// Parse initial value
	useEffect(() => {
		if (value) {
			const date = new Date(value)
			if (!isNaN(date.getTime())) {
				setSelectedDate(date)
				setCurrentMonth(date)
			}
		}
	}, [value])

	// Calculate position when opening
	const calculatePosition = () => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			const newPosition = {
				top: rect.bottom + 8,
				left: rect.left,
			}
			setPosition(newPosition)
		}
	}

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				calendarRef.current &&
				!calendarRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
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

	const formatDisplayDate = (date: Date | null) => {
		if (!date) return ''
		return date.toLocaleDateString('pl-PL', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})
	}

	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear()
		const month = date.getMonth()
		const firstDay = new Date(year, month, 1)
		const lastDay = new Date(year, month + 1, 0)
		const daysInMonth = lastDay.getDate()
		const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0

		return { daysInMonth, startingDayOfWeek }
	}

	const isDateInPast = (date: Date) => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return date < today
	}

	const isDateInFuture = (date: Date) => {
		const today = new Date()
		today.setHours(23, 59, 59, 999) // End of today
		return date > today
	}

	const isDateTooOld = (date: Date) => {
		const hundredYearsAgo = new Date()
		hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100)
		return date < hundredYearsAgo
	}

	const isDateSelected = (date: Date) => {
		if (!selectedDate) return false
		return date.toDateString() === selectedDate.toDateString()
	}

	const handleDateSelect = (day: number) => {
		const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

		// Different validation based on mode
		if (mode === 'event' && isDateInPast(newDate)) return // Don't allow past dates for events
		if (mode === 'birth' && (isDateInFuture(newDate) || isDateTooOld(newDate))) return // Don't allow future dates or dates older than 100 years for birth

		setSelectedDate(newDate)
		const yyyy = newDate.getFullYear()
		const mm = String(newDate.getMonth() + 1).padStart(2, '0')
		const dd = String(newDate.getDate()).padStart(2, '0')

		onChange(`${yyyy}-${mm}-${dd}`)

		setIsOpen(false)
	}

	const navigateMonth = (direction: 'prev' | 'next') => {
		setCurrentMonth(prev => {
			const newMonth = new Date(prev)
			if (direction === 'prev') {
				newMonth.setMonth(prev.getMonth() - 1)
			} else {
				newMonth.setMonth(prev.getMonth() + 1)
			}
			return newMonth
		})
	}

	const selectYear = (year: number) => {
		setCurrentMonth(prev => {
			const newMonth = new Date(prev)
			newMonth.setFullYear(year)
			return newMonth
		})
		setShowYearSelector(false)
	}

	const getYearRange = () => {
		const currentYear = new Date().getFullYear()
		if (mode === 'birth') {
			const startYear = currentYear - 100
			const endYear = currentYear
			return Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i)
		} else {
			// For events, show current year and next 10 years
			const startYear = currentYear
			const endYear = currentYear + 10
			return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
		}
	}

	const getThemeClasses = () => {
		if (theme === 'purple') {
			return {
				primary: 'purple-600',
				primaryHover: 'purple-700',
				primaryLight: 'purple-400',
				inputBg: 'bg-gray-800',
				inputBorder: 'border-gray-600',
				inputBorderHover: 'hover:border-gray-500',
				focusRing: 'focus:ring-purple-500',
			}
		} else {
			return {
				primary: 'violet-600',
				primaryHover: 'violet-700',
				primaryLight: 'violet-400',
				inputBg: 'bg-zinc-900/70',
				inputBorder: 'border-zinc-700',
				inputBorderHover: 'hover:border-zinc-600',
				focusRing: 'focus:ring-violet-600',
			}
		}
	}

	const themeClasses = getThemeClasses()
	const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)

	return (
		<div className='relative'>
			{/* Input field */}
			<button
				ref={buttonRef}
				type='button'
				onClick={() => {
					if (!disabled) {
						calculatePosition()
						setIsOpen(!isOpen)
					}
				}}
				disabled={disabled}
				className={`w-full px-4 py-3 rounded-xl ${themeClasses.inputBg} border text-white placeholder-gray-400 ${
					themeClasses.focusRing
				} focus:border-transparent transition text-left flex items-center justify-between ${
					error ? 'border-red-500' : themeClasses.inputBorder
				} ${disabled ? 'opacity-60 cursor-not-allowed' : `${themeClasses.inputBorderHover} cursor-pointer`}`}>
				<span className={selectedDate ? 'text-white' : 'text-gray-400'}>
					{selectedDate ? formatDisplayDate(selectedDate) : placeholder}
				</span>
				<CalendarIcon size={20} className='text-zinc-400' />
			</button>

			{/* Calendar dropdown */}
			{isOpen &&
				createPortal(
					<motion.div
						ref={calendarRef}
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className='fixed bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-[9999] p-4 min-w-[320px]'
						style={{
							top: `${position.top}px`,
							left: `${position.left}px`,
							transform: 'translateZ(0)', // Force hardware acceleration
						}}>
						{/* Header */}
						<div className='flex items-center justify-between mb-4'>
							<button
								type='button'
								onClick={() => navigateMonth('prev')}
								className='p-2 hover:bg-zinc-800 rounded-lg transition-colors'>
								<ChevronLeft size={20} className='text-zinc-300' />
							</button>

							<div className='flex items-center gap-2'>
								<button
									type='button'
									onClick={() => setShowYearSelector(!showYearSelector)}
									className={`text-white font-semibold text-lg hover:text-${themeClasses.primaryLight} transition-colors px-2 py-1 rounded`}>
									{MONTHS[currentMonth.getMonth()]}
								</button>
								<button
									type='button'
									onClick={() => setShowYearSelector(!showYearSelector)}
									className={`text-white font-semibold text-lg hover:text-${themeClasses.primaryLight} transition-colors px-2 py-1 rounded`}>
									{currentMonth.getFullYear()}
								</button>
							</div>

							<button
								type='button'
								onClick={() => navigateMonth('next')}
								className='p-2 hover:bg-zinc-800 rounded-lg transition-colors'>
								<ChevronRight size={20} className='text-zinc-300' />
							</button>
						</div>

						{/* Year Selector */}
						{showYearSelector && (
							<div className='mb-4 p-3 bg-zinc-800 rounded-lg'>
								<div className='flex items-center justify-between mb-2'>
									<h4 className='text-white font-medium'>Wybierz rok</h4>
									<button
										type='button'
										onClick={() => setShowYearSelector(false)}
										className='text-zinc-400 hover:text-white transition-colors'>
										✕
									</button>
								</div>
								<div className='grid grid-cols-4 gap-2 max-h-32 overflow-y-auto dark-scrollbar'>
									{getYearRange().map(year => (
										<button
											key={year}
											type='button'
											onClick={() => selectYear(year)}
											className={`px-2 py-1 text-sm rounded transition-colors ${
												year === currentMonth.getFullYear()
													? `bg-${themeClasses.primary} text-white`
													: 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
											}`}>
											{year}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Days of week */}
						<div className='grid grid-cols-7 gap-1 mb-2'>
							{DAYS_OF_WEEK.map(day => (
								<div key={day} className='text-center text-xs text-zinc-400 font-medium py-2'>
									{day}
								</div>
							))}
						</div>

						{/* Calendar grid */}
						<div className='grid grid-cols-7 gap-1'>
							{/* Empty cells for days before month starts */}
							{Array.from({ length: startingDayOfWeek }).map((_, index) => (
								<div key={`empty-${index}`} className='h-10' />
							))}

							{/* Days of the month */}
							{Array.from({ length: daysInMonth }, (_, index) => {
								const day = index + 1
								const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
								const isPast = isDateInPast(date)
								const isFuture = isDateInFuture(date)
								const isTooOld = isDateTooOld(date)
								const isSelected = isDateSelected(date)
								const isToday = date.toDateString() === new Date().toDateString()

								// Determine if date should be disabled based on mode
								let isDisabled = false
								if (mode === 'event' && isPast) isDisabled = true
								if (mode === 'birth' && (isFuture || isTooOld)) isDisabled = true

								return (
									<button
										key={day}
										type='button'
										onClick={() => handleDateSelect(day)}
										disabled={isDisabled}
										className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
											isSelected
												? `bg-${themeClasses.primary} text-white shadow-lg`
												: isToday
												? `bg-zinc-700 text-${themeClasses.primaryLight} border border-${themeClasses.primary}`
												: isDisabled
												? 'text-zinc-600 cursor-not-allowed'
												: 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
										}`}>
										{day}
									</button>
								)
							})}
						</div>

						{/* Footer */}
						<div className='mt-4 pt-3 border-t border-zinc-700'>
							<div className='flex items-center justify-between text-xs text-zinc-400'>
								<span>Dziś: {new Date().toLocaleDateString('pl-PL')}</span>
								{selectedDate && (
									<button
										type='button'
										onClick={() => {
											setSelectedDate(null)
											onChange('')
											setIsOpen(false)
										}}
										className='text-red-400 hover:text-red-300 transition-colors'>
										Wyczyść
									</button>
								)}
							</div>
							{mode === 'birth' && (
								<div className='text-xs text-zinc-500 mt-1'>Można wybrać daty z przeszłości (max 100 lat wstecz)</div>
							)}
						</div>
					</motion.div>,
					document.body
				)}
		</div>
	)
}
