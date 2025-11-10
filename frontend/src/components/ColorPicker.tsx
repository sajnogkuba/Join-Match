import { useRef } from 'react'
import { Editor } from '@tiptap/react'
import { Palette, Highlighter } from 'lucide-react'
import { COLOR_PALETTE } from '../constants/colorPalette'

interface ColorPickerProps {
	editor: Editor
	showColorPicker: boolean
	setShowColorPicker: (show: boolean) => void
	isHighlight?: boolean
}

export const ColorPicker = ({ editor, showColorPicker, setShowColorPicker, isHighlight = false }: ColorPickerProps) => {
	const pickerRef = useRef<HTMLDivElement>(null)

	return (
		<div className='relative' ref={pickerRef}>
			<button
				onClick={() => setShowColorPicker(!showColorPicker)}
				className={`p-2 rounded-lg transition-colors ${
					showColorPicker || (isHighlight && editor.isActive('highlight'))
						? 'bg-violet-600 text-white'
						: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
				}`}
				title={isHighlight ? 'Kolor tła tekstu' : 'Kolor tekstu'}
			>
				{isHighlight ? <Highlighter size={18} /> : <Palette size={18} />}
			</button>
			{showColorPicker && (
				<div className='absolute top-full left-0 mt-2 z-50 bg-zinc-800 rounded-lg border border-zinc-700 p-4 shadow-xl min-w-[420px]'>
					<div className='grid grid-cols-8 gap-2.5'>
						{COLOR_PALETTE.map((color) => (
							<button
								key={color}
								onClick={() => {
									if (isHighlight) {
										editor.chain().focus().toggleHighlight({ color }).run()
									} else {
										editor.chain().focus().setColor(color).run()
									}
									setShowColorPicker(false)
								}}
								className='w-8 h-8 rounded border-2 border-zinc-600 hover:border-zinc-400 transition-colors'
								style={{ backgroundColor: color }}
								title={color}
							/>
						))}
					</div>
					<button
						onClick={() => {
							if (isHighlight) {
								editor.chain().focus().unsetHighlight().run()
							} else {
								editor.chain().focus().unsetColor().run()
							}
							setShowColorPicker(false)
						}}
						className='mt-2 w-full px-3 py-1.5 text-xs rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors'
					>
						{isHighlight ? 'Usuń podświetlenie' : 'Usuń kolor'}
					</button>
				</div>
			)}
		</div>
	)
}

