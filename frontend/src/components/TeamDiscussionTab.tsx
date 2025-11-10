import { useState, useRef, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Heading } from '@tiptap/extension-heading'
import { Image } from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import Emoji from '@tiptap/extension-emoji'
import Placeholder from '@tiptap/extension-placeholder'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import api from '../Api/axios'
import type { TeamMember } from '../Api/types/TeamMember'
import type { Event } from '../Api/types'
import type { TeamPostRequestDto, TeamPostResponseDto, TeamPostPageResponse, PostType } from '../Api/types/TeamPost'
import type { User } from '../Api/types/User'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'
import { Bold, Italic, List, ListOrdered, Undo, Redo, Heading1, Heading2, Heading3, Palette, Smile, Type, Image as ImageIcon, AtSign, Link as LinkIcon, BarChart3, Loader2, Highlighter, Plus, X } from 'lucide-react'

interface TeamDiscussionTabProps {
	teamMembers: TeamMember[]
	teamId: number
}


interface MentionListProps {
	items: TeamMember[]
	command: (item: { id: string | number; label: string }) => void
	selectedIndex?: number
	setSelectedIndex?: (index: number | ((prev: number) => number)) => void
}

const MentionList = ({ items, command, selectedIndex = 0 }: MentionListProps) => {
	const ref = useRef<HTMLDivElement>(null)

	return (
		<div ref={ref} className='bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto'>
			{items.length ? (
				items.map((item, index) => (
					<button
						key={item.userId}
						onClick={() => command({ id: item.userId, label: item.userName })}
						className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${
							index === selectedIndex ? 'bg-violet-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'
						}`}
					>
						<span className='font-medium'>{item.userName}</span>
						<span className='text-xs text-zinc-400'>({item.userEmail})</span>
					</button>
				))
			) : (
				<div className='px-3 py-2 text-zinc-400 text-sm'>Brak wyników</div>
			)}
		</div>
	)
}

// Wspólna paleta kolorów dla tekstu i tła
const COLOR_PALETTE = [
	// Białe i szare
	'#FFFFFF', '#E5E7EB', '#9CA3AF', '#6B7280', '#374151', '#1F2937', '#111827', '#000000',
	// Czerwone
	'#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B',
	// Pomarańczowe
	'#FED7AA', '#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12',
	// Żółte
	'#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E',
	// Zielone
	'#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857', '#065F46',
	// Niebieskie
	'#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF',
	// Fioletowe
	'#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
	// Różowe
	'#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#9F1239',
]

const TeamDiscussionTab: React.FC<TeamDiscussionTabProps> = ({ teamMembers, teamId }) => {
	const [content, setContent] = useState('')
	const [currentUserId, setCurrentUserId] = useState<number | null>(null)
	const [showEditorModal, setShowEditorModal] = useState(false)
	const [publishing, setPublishing] = useState(false)
	const [showColorPicker, setShowColorPicker] = useState(false)
	const [showHighlightPicker, setShowHighlightPicker] = useState(false)
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const [showPollModal, setShowPollModal] = useState(false)
	const [showEventLinkModal, setShowEventLinkModal] = useState(false)
	const [events, setEvents] = useState<Event[]>([])
	const [loadingEvents, setLoadingEvents] = useState(false)
	const [pollQuestion, setPollQuestion] = useState('')
	const [pollOptions, setPollOptions] = useState(['', ''])
	const [uploadingImage, setUploadingImage] = useState(false)
	const [posts, setPosts] = useState<TeamPostResponseDto[]>([])
	const [loadingPosts, setLoadingPosts] = useState(false)
	const [page, setPage] = useState(0)
	const [hasNext, setHasNext] = useState(false)
	const [totalElements, setTotalElements] = useState(0)
	const colorPickerRef = useRef<HTMLDivElement>(null)
	const highlightPickerRef = useRef<HTMLDivElement>(null)
	const emojiPickerRef = useRef<HTMLDivElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const mentionExtension = Mention.configure({
		HTMLAttributes: {
			class: 'mention bg-violet-500/20 text-violet-300 px-1 rounded',
		},
		renderLabel({ node }) {
			return `@${node.attrs.label || node.attrs.id}`
		},
		renderHTML({ node }) {
			return [
				'span',
				{
					class: 'mention bg-violet-500/20 text-violet-300 px-1 rounded',
					'data-id': node.attrs.id,
					'data-type': 'mention',
				},
				`@${node.attrs.label || node.attrs.id}`,
			]
		},
		suggestion: {
			items: ({ query }: { query: string }) => {
				return teamMembers.filter((member) =>
					member.userName.toLowerCase().startsWith(query.toLowerCase()) ||
					member.userEmail.toLowerCase().startsWith(query.toLowerCase())
				).slice(0, 5)
			},
			render: () => {
				let component: ReactRenderer
				let popup: TippyInstance[]
				let selectedIndex = 0

				return {
					onStart: (props: any) => {
						selectedIndex = 0
						
						component = new ReactRenderer(MentionList, {
							props: {
								...props,
								selectedIndex: 0,
							},
							editor: props.editor,
						})

						if (!props.clientRect) {
							return
						}

						popup = tippy('body', {
							getReferenceClientRect: props.clientRect,
							appendTo: () => document.body,
							content: component.element,
							showOnCreate: true,
							interactive: true,
							trigger: 'manual',
							placement: 'bottom-start',
							theme: 'dark',
						})
					},
					onUpdate(props: any) {
						// Reset selectedIndex gdy lista się zmienia (nowe items)
						const currentItems = (component.props as any).items || []
						const newItems = props.items || []
						if (currentItems.length !== newItems.length || 
							currentItems[0]?.userId !== newItems[0]?.userId) {
							selectedIndex = 0
						}
						
						// Upewnij się, że selectedIndex jest w zakresie
						if (selectedIndex >= newItems.length) {
							selectedIndex = Math.max(0, newItems.length - 1)
						}
						
						component.updateProps({
							...props,
							selectedIndex,
						})

						if (!props.clientRect) {
							return
						}

						popup[0].setProps({
							getReferenceClientRect: props.clientRect,
						})
					},
					onKeyDown(props: any) {
						if (props.event.key === 'Escape') {
							props.event.preventDefault()
							props.event.stopPropagation()
							popup[0].hide()
							return true
						}

						// Użyj component.props zamiast props, ponieważ dane są w komponencie React
						const items = (component.props as any).items || []
						const command = (component.props as any).command

						if (props.event.key === 'ArrowUp') {
							props.event.preventDefault()
							props.event.stopPropagation()
							if (items.length > 0) {
								selectedIndex = (selectedIndex + items.length - 1) % items.length
								component.updateProps({ ...component.props, selectedIndex })
							}
							return true
						}

						if (props.event.key === 'ArrowDown') {
							props.event.preventDefault()
							props.event.stopPropagation()
							if (items.length > 0) {
								selectedIndex = (selectedIndex + 1) % items.length
								component.updateProps({ ...component.props, selectedIndex })
							}
							return true
						}

						if (props.event.key === 'Enter') {
							props.event.preventDefault()
							props.event.stopPropagation()
							if (items.length > 0 && selectedIndex >= 0 && selectedIndex < items.length) {
								const selectedItem = items[selectedIndex]
								if (selectedItem && command) {
									command({ id: selectedItem.userId, label: selectedItem.userName })
								}
							}
							return true
						}

						return false
					},
					onExit() {
						popup[0].destroy()
						component.destroy()
					},
				}
			},
		},
	})

	const imageExtension = Image.configure({
		inline: false,
		allowBase64: false,
	})

	const emojiExtension = Emoji.configure({
		enableEmoticons: true,
	})

	const highlightExtension = Highlight.configure({
		multicolor: true,
	})

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false,
			}),
			TextStyle,
			Color,
			highlightExtension,
			Heading.configure({
				levels: [1, 2, 3],
			}),
			imageExtension,
			mentionExtension,
			emojiExtension,
			Placeholder.configure({
				placeholder: 'Wpisz swoją wiadomość tutaj...',
			}),
		],
		content: '',
		onUpdate: ({ editor }) => {
			setContent(editor.getHTML())
		},
		editorProps: {
			attributes: {
				class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
			},
		},
	})

	// Pobierz currentUserId
	useEffect(() => {
		const token = localStorage.getItem('accessToken')
		if (token) {
			api.get<User>('/auth/user', { params: { token } })
				.then(({ data }) => setCurrentUserId(data.id))
				.catch(() => setCurrentUserId(null))
		}
	}, [])

	// Zamknij pickery po kliknięciu poza nimi
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
				setShowColorPicker(false)
			}
			if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target as Node)) {
				setShowHighlightPicker(false)
			}
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
				setShowEmojiPicker(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleImageUpload = async (file: File) => {
		if (!editor) return

		setUploadingImage(true)
		try {
			const formData = new FormData()
			formData.append('file', file)
			const response = await api.post('/images/upload/event', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			const imageUrl = response.data
			editor.chain().focus().setImage({ src: imageUrl }).run()
		} catch (error) {
			console.error('Błąd uploadu obrazu:', error)
			alert('Nie udało się przesłać obrazu')
		} finally {
			setUploadingImage(false)
		}
	}

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file && file.type.startsWith('image/')) {
			handleImageUpload(file)
		}
	}

	const fetchEvents = useCallback(async () => {
		setLoadingEvents(true)
		try {
			const response = await api.get('/event', {
				params: { page: 0, size: 20, sortBy: 'eventDate', direction: 'ASC' },
			})
			setEvents(response.data.content || [])
		} catch (error) {
			console.error('Błąd pobierania eventów:', error)
		} finally {
			setLoadingEvents(false)
		}
	}, [])

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
		setShowPollModal(false)
		setPollQuestion('')
		setPollOptions(['', ''])
	}

	const insertEventLink = (event: Event) => {
		if (!editor) return

		const eventLinkHTML = `
			<div class="event-link-container border border-violet-500/30 rounded-lg p-4 bg-violet-500/10 my-4">
				<div class="flex items-start gap-3">
					${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.eventName}" class="w-16 h-16 object-cover rounded-lg" />` : ''}
					<div class="flex-1">
						<h4 class="text-white font-semibold mb-1">${event.eventName}</h4>
						<p class="text-sm text-zinc-400 mb-2">${new Date(event.eventDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
						<p class="text-xs text-zinc-500">${event.sportTypeName} • ${event.city || 'Brak miasta'}</p>
						<a href="/event/${event.eventId}" class="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block">Zobacz szczegóły →</a>
					</div>
				</div>
			</div>
		`
		editor.chain().focus().insertContent(eventLinkHTML).run()
		setShowEventLinkModal(false)
	}

	// Pobierz posty
	const fetchPosts = useCallback(async (pageNum: number, append: boolean = false) => {
		try {
			if (append) {
				setLoadingPosts(true)
			} else {
				setLoadingPosts(true)
			}

			const params = {
				page: pageNum,
				size: 20,
				sort: 'createdAt',
				direction: 'DESC' as const,
			}

			const response = await api.get<TeamPostPageResponse>(`/team-post/${teamId}`, { params })
			const data = response.data

			if (append) {
				setPosts(prev => [...prev, ...(data.content || [])])
			} else {
				setPosts(data.content || [])
			}
			setHasNext(!data.last)
			setTotalElements(data.totalElements)
			setPage(pageNum)
		} catch (error) {
			console.error('Błąd pobierania postów:', error)
		} finally {
			setLoadingPosts(false)
		}
	}, [teamId])

	// Pobierz posty przy załadowaniu komponentu
	useEffect(() => {
		fetchPosts(0, false)
	}, [fetchPosts])

	// Wyciągnij mentionedUserIds z HTML content
	const extractMentionedUserIds = (htmlContent: string): number[] => {
		const parser = new DOMParser()
		const doc = parser.parseFromString(htmlContent, 'text/html')
		// TipTap Mention używa span z klasą "mention" i atrybutem data-id
		const mentionElements = doc.querySelectorAll('span.mention[data-id], span[data-type="mention"][data-id]')
		const userIds: number[] = []
		
		mentionElements.forEach((element) => {
			const userId = element.getAttribute('data-id')
			if (userId) {
				const id = parseInt(userId, 10)
				if (!isNaN(id)) {
					userIds.push(id)
				}
			}
		})
		
		return [...new Set(userIds)] // Usuń duplikaty
	}

	// Utwórz post
	const createPost = async () => {
		if (!editor || !currentUserId) {
			alert('Musisz być zalogowany, aby opublikować post')
			return
		}

		const htmlContent = editor.getHTML()
		const textContent = editor.getText().trim()

		if (!textContent || textContent === 'Wpisz swoją wiadomość tutaj...') {
			alert('Post nie może być pusty')
			return
		}

		setPublishing(true)

		try {
			const mentionedUserIds = extractMentionedUserIds(htmlContent)
			
			const postData: TeamPostRequestDto = {
				teamId,
				authorId: currentUserId,
				content: textContent,
				contentHtml: htmlContent,
				postType: 'TEXT' as PostType,
				mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
			}

			await api.post<TeamPostResponseDto>('/team-post', postData)
			
			// Sukces - zamknij modal i wyczyść edytor
			setShowEditorModal(false)
			editor.commands.clearContent()
			
			// Odśwież listę postów
			fetchPosts(0, false)
		} catch (error) {
			console.error('Błąd tworzenia posta:', error)
			alert('Nie udało się opublikować posta. Spróbuj ponownie.')
		} finally {
			setPublishing(false)
		}
	}

	if (!editor) {
		return null
	}

	return (
		<div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6'>
			<div className='flex items-center justify-between mb-4'>
				<h3 className='text-white text-lg font-semibold'>Dyskusja</h3>
				<button
					onClick={() => setShowEditorModal(true)}
					className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors'
				>
					<Plus size={18} />
					Nowy post
				</button>
			</div>
			
			{/* Lista postów */}
			<div className='space-y-4 mt-6'>
				{loadingPosts && posts.length === 0 ? (
					<div className='flex items-center justify-center py-8'>
						<Loader2 className='animate-spin text-violet-400' size={24} />
						<span className='ml-2 text-zinc-400'>Ładowanie postów...</span>
					</div>
				) : posts.length === 0 ? (
					<div className='text-center py-8 rounded-lg border border-zinc-800 bg-zinc-900/40'>
						<p className='text-zinc-400'>Brak postów w dyskusji. Bądź pierwszy!</p>
					</div>
				) : (
					<>
						{posts.map((post) => (
							<div
								key={post.postId}
								className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-900/60 transition-colors'
							>
								{/* Header posta */}
								<div className='flex items-center gap-3 mb-3'>
									<Link to={`/profile/${post.authorId}`}>
										<Avatar
											src={post.authorAvatarUrl || null}
											name={post.authorName}
											size='sm'
											className='ring-1 ring-zinc-700'
										/>
									</Link>
									<div className='flex-1'>
										<Link
											to={`/profile/${post.authorId}`}
											className='text-white font-medium hover:text-violet-400 transition-colors'
										>
											{post.authorName}
										</Link>
										<p className='text-xs text-zinc-400'>
											{new Date(post.createdAt).toLocaleDateString('pl-PL', {
												day: 'numeric',
												month: 'long',
												year: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</p>
									</div>
								</div>
								
								{/* Treść posta */}
								<div
									className='prose prose-invert max-w-none text-zinc-300 [&_*]:text-zinc-300 [&_strong]:text-white [&_em]:text-zinc-200 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_a]:text-violet-400 [&_a]:hover:text-violet-300 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_p]:my-2 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4 [&_.mention]:bg-violet-500/20 [&_.mention]:text-violet-300 [&_.mention]:px-1 [&_.mention]:rounded [&_.mention]:font-medium'
									dangerouslySetInnerHTML={{ __html: post.contentHtml }}
								/>
							</div>
						))}
						
						{/* Przycisk "Wczytaj więcej" */}
						{hasNext && (
							<div className='flex justify-center pt-4'>
								<button
									onClick={() => fetchPosts(page + 1, true)}
									disabled={loadingPosts}
									className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
								>
									{loadingPosts ? (
										<>
											<Loader2 size={18} className='animate-spin' />
											Ładowanie...
										</>
									) : (
										'Wczytaj więcej'
									)}
								</button>
							</div>
						)}
					</>
				)}
			</div>
			
			{/* Modal z edytorem */}
			{showEditorModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={() => setShowEditorModal(false)} />
					<div className='relative w-full max-w-4xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl max-h-[90vh] flex flex-col'>
						{/* Header modala */}
						<div className='flex items-center justify-between p-6 border-b border-zinc-800'>
							<h3 className='text-white text-xl font-semibold'>Nowy post</h3>
							<button
								onClick={() => setShowEditorModal(false)}
								className='p-2 rounded-xl hover:bg-zinc-800 transition-colors'
							>
								<X size={20} className='text-zinc-400 hover:text-white' />
							</button>
						</div>
						
						{/* Zawartość modala z edytorem */}
						<div className='flex-1 overflow-y-auto p-6'>
							{/* Toolbar */}
							<div className='mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 p-2'>
								{/* Nagłówki */}
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
								
								{/* Formatowanie */}
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
								
								{/* Kolor tekstu */}
								<div className='relative' ref={colorPickerRef}>
									<button
										onClick={() => setShowColorPicker(!showColorPicker)}
										className={`p-2 rounded-lg transition-colors ${
											showColorPicker
												? 'bg-violet-600 text-white'
												: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
										}`}
										title='Kolor tekstu'
									>
										<Palette size={18} />
									</button>
									{showColorPicker && (
										<div className='absolute top-full left-0 mt-2 z-50 bg-zinc-800 rounded-lg border border-zinc-700 p-4 shadow-xl min-w-[420px]'>
											<div className='grid grid-cols-8 gap-2.5'>
												{COLOR_PALETTE.map((color) => (
													<button
														key={color}
														onClick={() => {
															editor.chain().focus().setColor(color).run()
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
													editor.chain().focus().unsetColor().run()
													setShowColorPicker(false)
												}}
												className='mt-2 w-full px-3 py-1.5 text-xs rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors'
											>
												Usuń kolor
											</button>
										</div>
									)}
								</div>
								
								{/* Kolor tła tekstu */}
								<div className='relative' ref={highlightPickerRef}>
									<button
										onClick={() => setShowHighlightPicker(!showHighlightPicker)}
										className={`p-2 rounded-lg transition-colors ${
											showHighlightPicker || editor.isActive('highlight')
												? 'bg-violet-600 text-white'
												: 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
										}`}
										title='Kolor tła tekstu'
									>
										<Highlighter size={18} />
									</button>
									{showHighlightPicker && (
										<div className='absolute top-full left-0 mt-2 z-50 bg-zinc-800 rounded-lg border border-zinc-700 p-4 shadow-xl min-w-[420px]'>
											<div className='grid grid-cols-8 gap-2.5'>
												{COLOR_PALETTE.map((color) => (
													<button
														key={color}
														onClick={() => {
															editor.chain().focus().toggleHighlight({ color }).run()
															setShowHighlightPicker(false)
														}}
														className='w-8 h-8 rounded border-2 border-zinc-600 hover:border-zinc-400 transition-colors'
														style={{ backgroundColor: color }}
														title={color}
													/>
												))}
											</div>
											<button
												onClick={() => {
													editor.chain().focus().unsetHighlight().run()
													setShowHighlightPicker(false)
												}}
												className='mt-2 w-full px-3 py-1.5 text-xs rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors'
											>
												Usuń podświetlenie
											</button>
										</div>
									)}
								</div>
								<div className='h-6 w-px bg-zinc-700' />
								
								{/* Listy */}
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
								
								{/* Mentions */}
								<button
									onClick={() => editor.chain().focus().insertContent('@').run()}
									className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors'
									title='Wzmianka (@)'
								>
									<AtSign size={18} />
								</button>
								
								{/* Obrazy */}
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
								
								{/* Ankiety */}
								<button
									onClick={() => setShowPollModal(true)}
									disabled={true}
									className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
									title='Dodaj ankietę (niedostępne)'
								>
									<BarChart3 size={18} />
								</button>
								
								{/* Link do eventu */}
								<button
									onClick={() => {
										fetchEvents()
										setShowEventLinkModal(true)
									}}
									disabled={true}
									className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
									title='Link do eventu (niedostępne)'
								>
									<LinkIcon size={18} />
								</button>
								<div className='h-6 w-px bg-zinc-700' />
								
								{/* Emoji */}
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
													editor.chain().focus().insertContent(emojiData.emoji).run()
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
								
								{/* Undo/Redo */}
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

							{/* Editor */}
							<div className='rounded-lg border border-zinc-700 bg-zinc-800/40'>
								<EditorContent 
									editor={editor}
									className='[&_.ProseMirror]:text-white [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_li]:my-1 [&_.ProseMirror_p]:my-2 [&_.ProseMirror_strong]:font-bold [&_.ProseMirror_em]:italic [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-4 [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-3 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mt-2 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-4 [&_.ProseMirror_mark]:px-1 [&_.ProseMirror_mark]:rounded [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child::before]:text-zinc-500'
								/>
							</div>
						</div>
						
						{/* Stopka modala z przyciskami */}
						<div className='flex items-center justify-end gap-3 p-6 border-t border-zinc-800'>
							<button
								onClick={() => {
									setShowEditorModal(false)
									editor.commands.clearContent()
								}}
								className='px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-medium transition-colors'
							>
								Anuluj
							</button>
							<button
								onClick={createPost}
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
			)}

			{/* Modal ankiety */}
			{showPollModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={() => setShowPollModal(false)} />
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
										setShowPollModal(false)
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
			)}

			{/* Modal linku do eventu */}
			{showEventLinkModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={() => setShowEventLinkModal(false)} />
					<div className='relative bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
						<h3 className='text-white text-lg font-semibold mb-4'>Wybierz event</h3>
						{loadingEvents ? (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='animate-spin text-violet-400' size={24} />
								<span className='ml-2 text-zinc-400'>Ładowanie eventów...</span>
							</div>
						) : events.length === 0 ? (
							<div className='text-center py-8 text-zinc-400'>Brak dostępnych eventów</div>
						) : (
							<div className='space-y-3'>
								{events.map((event) => (
									<button
										key={event.eventId}
										onClick={() => insertEventLink(event)}
										className='w-full text-left p-4 rounded-lg border border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 transition-colors'
									>
										<div className='flex items-start gap-3'>
											{event.imageUrl && (
												<img src={event.imageUrl} alt={event.eventName} className='w-16 h-16 object-cover rounded-lg' />
											)}
											<div className='flex-1'>
												<h4 className='text-white font-semibold mb-1'>{event.eventName}</h4>
												<p className='text-sm text-zinc-400'>
													{new Date(event.eventDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
												</p>
												<p className='text-xs text-zinc-500 mt-1'>{event.sportTypeName} • {event.city || 'Brak miasta'}</p>
											</div>
										</div>
									</button>
								))}
							</div>
						)}
						<button
							onClick={() => setShowEventLinkModal(false)}
							className='mt-4 w-full px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-medium transition-colors'
						>
							Anuluj
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default TeamDiscussionTab
