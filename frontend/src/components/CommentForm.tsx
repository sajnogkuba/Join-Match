import { Smile, Loader2 } from 'lucide-react'
import EmojiPicker, { Theme } from 'emoji-picker-react'

interface CommentFormProps {
	commentText: string
	onCommentTextChange: (text: string) => void
	onSubmit: () => void
	isSubmitting: boolean
	showEmojiPicker: boolean
	setShowEmojiPicker: (show: boolean) => void
	emojiPickerRef: React.RefObject<HTMLDivElement>
}

export const CommentForm = ({
	commentText,
	onCommentTextChange,
	onSubmit,
	isSubmitting,
	showEmojiPicker,
	setShowEmojiPicker,
	emojiPickerRef,
}: CommentFormProps) => {
	return (
		<div className='space-y-2'>
			<div className='relative'>
				<textarea
					value={commentText}
					onChange={(e) => onCommentTextChange(e.target.value)}
					placeholder='Napisz komentarz...'
					rows={3}
					className='w-full px-4 py-2 pr-12 rounded-lg bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-600 focus:border-transparent resize-none transition'
				/>
				<div className='absolute bottom-2 right-2'>
					<div className='relative' ref={emojiPickerRef}>
						<button
							type='button'
							onClick={(e) => {
								e.preventDefault()
								setShowEmojiPicker(!showEmojiPicker)
							}}
							className='p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors'
							title='Emoji'
						>
							<Smile size={18} />
						</button>
						{showEmojiPicker && (
							<div className='absolute bottom-full right-0 mb-2 z-50'>
								<EmojiPicker
									onEmojiClick={(emojiData) => {
										onCommentTextChange(commentText + emojiData.emoji)
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
			<div className='flex justify-end'>
				<button
					onClick={onSubmit}
					disabled={isSubmitting || !commentText.trim()}
					className='px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm'
				>
					{isSubmitting ? (
						<>
							<Loader2 size={16} className='animate-spin' />
							Publikowanie...
						</>
					) : (
						'Dodaj komentarz'
					)}
				</button>
			</div>
		</div>
	)
}

