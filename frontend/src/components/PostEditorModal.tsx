import { EditorContent } from '@tiptap/react'
import { Editor } from '@tiptap/react'
import { Loader2, X } from 'lucide-react'
import { PostEditorToolbar } from './PostEditorToolbar'

interface PostEditorModalProps {
	isOpen: boolean
	onClose: () => void
	editor: Editor | null
	publishing: boolean
	currentUserId: number | null
	showColorPicker: boolean
	setShowColorPicker: (show: boolean) => void
	showHighlightPicker: boolean
	setShowHighlightPicker: (show: boolean) => void
	showEmojiPicker: boolean
	setShowEmojiPicker: (show: boolean) => void
	fileInputRef: React.RefObject<HTMLInputElement | null>
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
	onPollClick: () => void
	onEventLinkClick: () => void
	emojiPickerRef: React.RefObject<HTMLDivElement | null>
	onPublish: () => void
}

export const PostEditorModal = ({
	isOpen,
	onClose,
	editor,
	publishing,
	currentUserId,
	showColorPicker,
	setShowColorPicker,
	showHighlightPicker,
	setShowHighlightPicker,
	showEmojiPicker,
	setShowEmojiPicker,
	fileInputRef,
	handleFileSelect,
	onPollClick,
	onEventLinkClick,
	emojiPickerRef,
	onPublish,
}: PostEditorModalProps) => {
	if (!isOpen || !editor) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
			<div className='relative w-full max-w-4xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl max-h-[90vh] flex flex-col'>
				<div className='flex items-center justify-between p-6 border-b border-zinc-800'>
					<h3 className='text-white text-xl font-semibold'>Nowy post</h3>
					<button
						onClick={onClose}
						className='p-2 rounded-xl hover:bg-zinc-800 transition-colors'
					>
						<X size={20} className='text-zinc-400 hover:text-white' />
					</button>
				</div>
				
				<div className='flex-1 overflow-y-auto p-6'>
					<PostEditorToolbar
						editor={editor}
						showColorPicker={showColorPicker}
						setShowColorPicker={setShowColorPicker}
						showHighlightPicker={showHighlightPicker}
						setShowHighlightPicker={setShowHighlightPicker}
						showEmojiPicker={showEmojiPicker}
						setShowEmojiPicker={setShowEmojiPicker}
						fileInputRef={fileInputRef}
						handleFileSelect={handleFileSelect}
						onPollClick={onPollClick}
						onEventLinkClick={onEventLinkClick}
						emojiPickerRef={emojiPickerRef}
					/>

					<div className='rounded-lg border border-zinc-700 bg-zinc-800/40'>
						<EditorContent 
							editor={editor}
							className='[&_.ProseMirror]:text-white [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_li]:my-1 [&_.ProseMirror_p]:my-2 [&_.ProseMirror_strong]:font-bold [&_.ProseMirror_em]:italic [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-4 [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-3 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mt-2 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-4 [&_.ProseMirror_mark]:px-1 [&_.ProseMirror_mark]:rounded [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child::before]:text-zinc-500'
						/>
					</div>
				</div>
				
				<div className='flex items-center justify-end gap-3 p-6 border-t border-zinc-800'>
					<button
						onClick={() => {
							onClose()
							editor.commands.clearContent()
						}}
						className='px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-medium transition-colors'
					>
						Anuluj
					</button>
					<button
						onClick={onPublish}
						disabled={publishing || !currentUserId}
						className='px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
					>
						{publishing ? (
							<>
								<Loader2 size={18} className='animate-spin' />
								Publikowanie...
							</>
						) : (
							'Opublikuj'
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

