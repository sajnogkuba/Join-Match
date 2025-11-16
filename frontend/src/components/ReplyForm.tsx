import { Smile, Loader2 } from 'lucide-react'
import EmojiPicker, { Theme } from 'emoji-picker-react'

interface ReplyFormProps {
	replyText: string
	onReplyTextChange: (text: string) => void
	authorName: string
	onCancel: () => void
	onSubmit: () => void
	isSubmitting: boolean
	showEmojiPicker: boolean
	setShowEmojiPicker: (show: boolean) => void
	emojiPickerRef: React.RefObject<HTMLDivElement | null>
}

export const ReplyForm = ({
	replyText,
	onReplyTextChange,
	authorName,
	onCancel,
	onSubmit,
	isSubmitting,
	showEmojiPicker,
	setShowEmojiPicker,
	emojiPickerRef,
}: ReplyFormProps) => {
	return (
		<div className='ml-12 space-y-2'>
			<div className='relative'>
				<textarea
					value={replyText}
					onChange={(e) => onReplyTextChange(e.target.value)}
					placeholder={`Odpowiedz ${authorName}...`}
					rows={2}
					className='w-full px-4 py-2 pr-12 rounded-lg bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-600 focus:border-transparent resize-none transition text-sm'
				/>
				<div className='absolute bottom-2 right-2'>
					<div className='relative' ref={emojiPickerRef}>
						<button
							type='button'
							onClick={(e) => {
								e.preventDefault()
								setShowEmojiPicker(!showEmojiPicker)
							}}
							className='p-1 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors'
							title='Emoji'
						>
							<Smile size={16} />
						</button>
						{showEmojiPicker && (
							<div className='absolute bottom-full right-0 mb-2 z-50'>
								<EmojiPicker
									onEmojiClick={(emojiData) => {
										onReplyTextChange(replyText + emojiData.emoji)
										setShowEmojiPicker(false)
									}}
									theme={Theme.DARK}
									width={350}
									height={400}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className='flex justify-end gap-2'>
				<button
					onClick={onCancel}
					className='px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium transition-colors'
				>
					Anuluj
				</button>
				<button
					onClick={onSubmit}
					disabled={isSubmitting || !replyText.trim()}
					className='px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
				>
					{isSubmitting ? (
						<>
							<Loader2 size={14} className='animate-spin' />
							Publikowanie...
						</>
					) : (
						'Odpowiedz'
					)}
				</button>
			</div>
		</div>
	)
}

