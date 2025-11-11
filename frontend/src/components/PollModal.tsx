import { Editor } from '@tiptap/react'

interface PollModalProps {
	isOpen: boolean
	onClose: () => void
	editor: Editor | null
	pollQuestion: string
	setPollQuestion: (question: string) => void
	pollOptions: string[]
	setPollOptions: (options: string[]) => void
}

export const PollModal = ({ isOpen, onClose, editor, pollQuestion, setPollQuestion, pollOptions, setPollOptions }: PollModalProps) => {
	if (!isOpen) return null

	const insertPoll = () => {
		if (!editor || !pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2) {
			alert('Wypełnij pytanie i co najmniej 2 opcje')
			return
		}

		const validOptions = pollOptions.filter(opt => opt.trim())
		const pollHTML = `
			<div class="poll-container border border-zinc-700 rounded-lg p-4 bg-zinc-800/40 my-4">
				<h4 class="text-white font-semibold mb-3">${pollQuestion}</h4>
				<div class="poll-options space-y-2">
					${validOptions.map((option, index) => `
						<div class="poll-option flex items-center gap-2 p-2 rounded bg-zinc-700/50 hover:bg-zinc-700 cursor-pointer">
							<input type="radio" name="poll-${Date.now()}" value="${index}" class="cursor-pointer" />
							<span class="text-zinc-300">${option}</span>
						</div>
					`).join('')}
				</div>
				<p class="text-xs text-zinc-400 mt-2">Ankieta - głosowanie nieaktywne (funkcja w przygotowaniu)</p>
			</div>
		`
		editor.chain().focus().insertContent(pollHTML).run()
		onClose()
		setPollQuestion('')
		setPollOptions(['', ''])
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
			<div className='relative bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-md w-full'>
				<h3 className='text-white text-lg font-semibold mb-4'>Utwórz ankietę</h3>
				<div className='space-y-4'>
					<div>
						<label className='block text-zinc-400 text-sm mb-2'>Pytanie</label>
						<input
							type='text'
							value={pollQuestion}
							onChange={(e) => setPollQuestion(e.target.value)}
							className='w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-600 focus:border-transparent'
							placeholder='Zadaj pytanie...'
						/>
					</div>
					<div>
						<label className='block text-zinc-400 text-sm mb-2'>Opcje</label>
						{pollOptions.map((option, index) => (
							<input
								key={index}
								type='text'
								value={option}
								onChange={(e) => {
									const newOptions = [...pollOptions]
									newOptions[index] = e.target.value
									setPollOptions(newOptions)
								}}
								className='w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-600 focus:border-transparent mb-2'
								placeholder={`Opcja ${index + 1}`}
							/>
						))}
						<button
							onClick={() => setPollOptions([...pollOptions, ''])}
							className='text-sm text-violet-400 hover:text-violet-300'
						>
							+ Dodaj opcję
						</button>
					</div>
					<div className='flex gap-3'>
						<button
							onClick={insertPoll}
							className='flex-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors'
						>
							Dodaj ankietę
						</button>
						<button
							onClick={() => {
								onClose()
								setPollQuestion('')
								setPollOptions(['', ''])
							}}
							className='px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-medium transition-colors'
						>
							Anuluj
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

