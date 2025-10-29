import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface TimePickerProps {
	value: string
	onChange: (time: string) => void
	placeholder?: string
	error?: boolean
	disabled?: boolean
	theme?: 'violet' | 'purple'
}

export default function TimePicker({ 
	value, 
	onChange, 
	placeholder = "Wybierz godzinę",
	error = false,
	disabled = false,
	theme = 'violet'
}: TimePickerProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState({ top: 0, left: 0 })
	const buttonRef = useRef<HTMLButtonElement>(null)
	const timeRef = useRef<HTMLDivElement>(null)

	// Calculate position when opening
	const calculatePosition = () => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			const newPosition = {
				top: rect.bottom + 8,
				left: rect.left
			}
			setPosition(newPosition)
		}
	}

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (timeRef.current && !timeRef.current.contains(event.target as Node) &&
				buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
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

	const formatDisplayTime = () => {
		if (!value) return ''
		const [hours, minutes] = value.split(':')
		return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
	}

	const handleTimeSelect = (hours: number, minutes: number) => {
		const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
		onChange(timeString)
		setIsOpen(false)
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
				focusRing: 'focus:ring-purple-500'
			}
		} else {
			return {
				primary: 'violet-600',
				primaryHover: 'violet-700',
				primaryLight: 'violet-400',
				inputBg: 'bg-zinc-900/70',
				inputBorder: 'border-zinc-700',
				inputBorderHover: 'hover:border-zinc-600',
				focusRing: 'focus:ring-violet-600'
			}
		}
	}

	const themeClasses = getThemeClasses()

	// Generate hour and minute options
	const hours = Array.from({ length: 24 }, (_, i) => i)
	const minutes = Array.from({ length: 60 }, (_, i) => i)
	
	// Parse current value to get selected hour and minute
	const [selectedHour, selectedMinute] = value ? value.split(':').map(Number) : [null, null]

	return (
		<div className="relative">
			{/* Input field */}
			<button
				ref={buttonRef}
				type="button"
				onClick={() => {
					if (!disabled) {
						calculatePosition()
						setIsOpen(!isOpen)
					}
				}}
				disabled={disabled}
				className={`w-full px-4 py-3 rounded-xl ${themeClasses.inputBg} border text-white placeholder-gray-400 ${themeClasses.focusRing} focus:border-transparent transition text-left flex items-center justify-between ${
					error ? 'border-red-500' : themeClasses.inputBorder
				} ${disabled ? 'opacity-60 cursor-not-allowed' : `${themeClasses.inputBorderHover} cursor-pointer`}`}
			>
				<span className={value ? 'text-white' : 'text-gray-400'}>
					{value ? formatDisplayTime() : placeholder}
				</span>
				<Clock size={20} className="text-zinc-300" />
			</button>

			{/* Time dropdown */}
			{isOpen && createPortal(
				<motion.div
					ref={timeRef}
					initial={{ opacity: 0, y: -10, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -10, scale: 0.95 }}
					transition={{ duration: 0.2 }}
					className="fixed bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-[9999] p-3 w-[180px]"
					style={{
						top: `${position.top}px`,
						left: `${position.left}px`,
						transform: 'translateZ(0)' // Force hardware acceleration
					}}
				>
					{/* Two-column time picker */}
					<div className="flex gap-1">
						{/* Hours column */}
						<div className="flex-1">
							<div className="text-xs text-zinc-400 text-center mb-1 font-medium">Godziny</div>
							<div className="max-h-60 overflow-y-auto dark-scrollbar border border-zinc-700 rounded-lg">
								{hours.map(hour => {
									const isSelected = selectedHour === hour
									return (
										<button
											key={hour}
											type="button"
											onClick={() => {
												const currentMinute = selectedMinute ?? 0
												handleTimeSelect(hour, currentMinute)
											}}
											className={`w-full px-1 py-1 text-xs transition-colors text-center ${
												isSelected
													? `bg-${themeClasses.primary} text-white`
													: 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
											}`}
										>
											{hour.toString().padStart(2, '0')}
										</button>
									)
								})}
							</div>
						</div>

						{/* Divider */}
						<div className="w-px bg-zinc-700"></div>

						{/* Minutes column */}
						<div className="flex-1">
							<div className="text-xs text-zinc-400 text-center mb-1 font-medium">Minuty</div>
							<div className="max-h-60 overflow-y-auto dark-scrollbar border border-zinc-700 rounded-lg">
								{minutes.map(minute => {
									const isSelected = selectedMinute === minute
									return (
										<button
											key={minute}
											type="button"
											onClick={() => {
												const currentHour = selectedHour ?? 0
												handleTimeSelect(currentHour, minute)
											}}
											className={`w-full px-1 py-1 text-xs transition-colors text-center ${
												isSelected
													? `bg-${themeClasses.primary} text-white`
													: 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
											}`}
										>
											{minute.toString().padStart(2, '0')}
										</button>
									)
								})}
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="mt-3 pt-2 border-t border-zinc-700">
						<div className="flex items-center justify-between text-xs text-zinc-400">
							<span>Wybierz godzinę</span>
							{value && (
								<button
									type="button"
									onClick={() => {
										onChange('')
										setIsOpen(false)
									}}
									className="text-red-400 hover:text-red-300 transition-colors"
								>
									Wyczyść
								</button>
							)}
						</div>
					</div>
				</motion.div>,
				document.body
			)}
		</div>
	)
}
