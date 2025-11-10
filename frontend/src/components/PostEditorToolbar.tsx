import { Editor } from '@tiptap/react'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { Bold, Italic, List, ListOrdered, Undo, Redo, Heading1, Heading2, Heading3, Smile, Type, Image as ImageIcon, AtSign, Link as LinkIcon, BarChart3 } from 'lucide-react'
import { ColorPicker } from './ColorPicker'

interface PostEditorToolbarProps {
	editor: Editor
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
}

export const PostEditorToolbar = ({
	editor,
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
}: PostEditorToolbarProps) => {
	return (
		<div className='mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 p-2'>
			<button
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={`p-2 rounded-lg transition-colors ${
					editor.isActive('heading', { level: 1 })
						? 'bg-violet-600 text-white'
						: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
				}`}
				title='Nagłówek 1'
			>
				<Heading1 size={18} />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={`p-2 rounded-lg transition-colors ${
					editor.isActive('heading', { level: 2 })
						? 'bg-violet-600 text-white'
						: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
				}`}
				title='Nagłówek 2'
			>
				<Heading2 size={18} />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				className={`p-2 rounded-lg transition-colors ${
					editor.isActive('heading', { level: 3 })
						? 'bg-violet-600 text-white'
						: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
				}`}
				title='Nagłówek 3'
			>
				<Heading3 size={18} />
			</button>
			<button
				onClick={() => editor.chain().focus().setParagraph().run()}
				className={`p-2 rounded-lg transition-colors ${
					editor.isActive('paragraph')
						? 'bg-violet-600 text-white'
						: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
				}`}
				title='Zwykły tekst'
			>
				<Type size={18} />
			</button>
			<div className='h-6 w-px bg-zinc-700' />
			
			<button
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={`p-2 rounded-lg transition-colors ${
					editor.isActive('bold')
						? 'bg-violet-600 text-white'
						: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
				}`}
				title='Pogrubienie'
			>
				<Bold size={18} />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={`p-2 rounded-lg transition-colors ${
					editor.isActive('italic')
						? 'bg-violet-600 text-white'
						: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
				}`}
				title='Kursywa'
			>
				<Italic size={18} />
			</button>
			<div className='h-6 w-px bg-zinc-700' />
			
			<ColorPicker
				editor={editor}
				showColorPicker={showColorPicker}
				setShowColorPicker={setShowColorPicker}
				isHighlight={false}
			/>
			
			<ColorPicker
				editor={editor}
				showColorPicker={showHighlightPicker}
				setShowColorPicker={setShowHighlightPicker}
				isHighlight={true}
			/>
			<div className='h-6 w-px bg-zinc-700' />
			
			<button
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={`p-2 rounded-lg transition-colors ${
					editor.isActive('bulletList')
						? 'bg-violet-600 text-white'
						: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
				}`}
				title='Lista punktowana'
			>
				<List size={18} />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={`p-2 rounded-lg transition-colors ${
					editor.isActive('orderedList')
						? 'bg-violet-600 text-white'
						: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
				}`}
				title='Lista numerowana'
			>
				<ListOrdered size={18} />
			</button>
			<div className='h-6 w-px bg-zinc-700' />
			
			<button
				onClick={() => editor.chain().focus().insertContent('@').run()}
				className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors'
				title='Wzmianka (@)'
			>
				<AtSign size={18} />
			</button>
			
			<button
				onClick={() => fileInputRef.current?.click()}
				disabled={true}
				className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
				title='Wstaw obraz (niedostępne)'
			>
				<ImageIcon size={18} />
			</button>
			<input
				ref={fileInputRef}
				type='file'
				accept='image/*'
				onChange={handleFileSelect}
				className='hidden'
			/>
			
			<button
				onClick={onPollClick}
				disabled={true}
				className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
				title='Dodaj ankietę (niedostępne)'
			>
				<BarChart3 size={18} />
			</button>
			
			<button
				onClick={onEventLinkClick}
				disabled={true}
				className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
				title='Link do eventu (niedostępne)'
			>
				<LinkIcon size={18} />
			</button>
			<div className='h-6 w-px bg-zinc-700' />
			
			<div className='relative' ref={emojiPickerRef}>
				<button
					onClick={() => setShowEmojiPicker(!showEmojiPicker)}
					className={`p-2 rounded-lg transition-colors ${
						showEmojiPicker
							? 'bg-violet-600 text-white'
							: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
					}`}
					title='Emoji'
				>
					<Smile size={18} />
				</button>
				{showEmojiPicker && (
					<div className='absolute top-full right-0 mt-2 z-50'>
						<EmojiPicker
							onEmojiClick={(emojiData) => {
								editor.commands.insertContent(emojiData.emoji)
								editor.commands.focus()
								setShowEmojiPicker(false)
							}}
							theme={Theme.DARK}
							width={350}
							height={400}
						/>
					</div>
				)}
			</div>
			<div className='h-6 w-px bg-zinc-700' />
			
			<button
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().chain().focus().undo().run()}
				className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
				title='Cofnij'
			>
				<Undo size={18} />
			</button>
			<button
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().chain().focus().redo().run()}
				className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
				title='Ponów'
			>
				<Redo size={18} />
			</button>
		</div>
	)
}

