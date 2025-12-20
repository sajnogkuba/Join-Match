import { useRef, useEffect, useState } from 'react'
import { Palette, X } from 'lucide-react'
import { COLOR_PALETTE } from '../constants/colorPalette'

interface TeamRoleColorPickerProps {
	value: string | null
	onChange: (color: string | null) => void
	showPicker: boolean
	setShowPicker: (show: boolean) => void
}

const TeamRoleColorPicker: React.FC<TeamRoleColorPickerProps> = ({
	value,
	onChange,
	showPicker,
	setShowPicker,
}) => {
	const pickerRef = useRef<HTMLDivElement>(null)
	const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 })

	// Aktualizuj pozycję pickera
	const updatePickerPosition = () => {
		if (pickerRef.current) {
			const rect = pickerRef.current.getBoundingClientRect()
			setPickerPosition({
				top: rect.bottom + 8,
				left: rect.left,
			})
		}
	}

	// Zamknij picker przy kliknięciu poza nim i aktualizuj pozycję
	useEffect(() => {
		if (!showPicker) return

		updatePickerPosition()

		const handleClickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
				setShowPicker(false)
			}
		}

		const handleScroll = () => {
			updatePickerPosition()
		}

		const handleResize = () => {
			updatePickerPosition()
		}

		document.addEventListener('mousedown', handleClickOutside)
		window.addEventListener('scroll', handleScroll, true)
		window.addEventListener('resize', handleResize)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			window.removeEventListener('scroll', handleScroll, true)
			window.removeEventListener('resize', handleResize)
		}
	}, [showPicker, setShowPicker])

	const handleColorSelect = (color: string) => {
		onChange(color)
		setShowPicker(false)
	}

	const handleRemoveColor = () => {
		onChange(null)
		setShowPicker(false)
	}

	return (
		<div className='relative' ref={pickerRef}>
			<button
				type='button'
				onClick={() => setShowPicker(!showPicker)}
				className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 transition-colors'
				title='Wybierz kolor roli'
			>
				<Palette size={16} className='text-zinc-400' />
				{value ? (
					<div className='flex items-center gap-2'>
						<div
							className='w-5 h-5 rounded border-2 border-zinc-600'
							style={{ backgroundColor: value }}
						/>
						<span className='text-xs text-zinc-300'>{value}</span>
					</div>
				) : (
					<span className='text-xs text-zinc-400'>Brak koloru</span>
				)}
			</button>

			{showPicker && (
				<div 
					className='fixed z-[9999] bg-zinc-800 rounded-lg border border-zinc-700 p-4 shadow-xl min-w-[420px]' 
					style={{
						top: `${pickerPosition.top}px`,
						left: `${pickerPosition.left}px`,
					}}
				>
					<div className='grid grid-cols-8 gap-2.5'>
						{COLOR_PALETTE.map((color) => (
							<button
								key={color}
								type='button'
								onClick={() => handleColorSelect(color)}
								className={`w-8 h-8 rounded border-2 transition-colors ${
									value === color
										? 'border-violet-400 ring-2 ring-violet-400/50'
										: 'border-zinc-600 hover:border-zinc-400'
								}`}
								style={{ backgroundColor: color }}
								title={color}
							/>
						))}
					</div>
					<button
						type='button'
						onClick={handleRemoveColor}
						className='mt-2 w-full px-3 py-1.5 text-xs rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors inline-flex items-center justify-center gap-2'
					>
						<X size={14} />
						Usuń kolor
					</button>
				</div>
			)}
		</div>
	)
}

export default TeamRoleColorPicker
