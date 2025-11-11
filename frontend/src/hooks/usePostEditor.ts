import { useState, useRef, useCallback } from 'react'
import { useEditor } from '@tiptap/react'
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
import api from '../Api/axios'
import type { TeamMember } from '../Api/types/TeamMember'
import { MentionList } from '../components/MentionList'

export const usePostEditor = (teamMembers: TeamMember[]) => {
	const [content, setContent] = useState('')
	const [uploadingImage, setUploadingImage] = useState(false)
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
						const currentItems = (component.props as any).items || []
						const newItems = props.items || []
						if (currentItems.length !== newItems.length || 
							currentItems[0]?.userId !== newItems[0]?.userId) {
							selectedIndex = 0
						}
						
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

	const handleImageUpload = useCallback(async (file: File) => {
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
	}, [editor])

	const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file && file.type.startsWith('image/')) {
			handleImageUpload(file)
		}
	}, [handleImageUpload])

	return {
		editor,
		content,
		uploadingImage,
		colorPickerRef,
		highlightPickerRef,
		emojiPickerRef,
		fileInputRef,
		handleFileSelect,
	}
}

