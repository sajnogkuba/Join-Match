import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import api from '../Api/axios'
import type { TeamMember } from '../Api/types/TeamMember'
import type { Event } from '../Api/types'
import type { User } from '../Api/types/User'
import { usePostEditor } from '../hooks/usePostEditor'
import { usePosts } from '../hooks/usePosts'
import { useComments } from '../hooks/useComments'
import { PostEditorModal } from './PostEditorModal'
import { PollModal } from './PollModal'
import { EventLinkModal } from './EventLinkModal'
import { PostList } from './PostList'

interface TeamDiscussionTabProps {
	teamMembers: TeamMember[]
	teamId: number
}

const TeamDiscussionTab: React.FC<TeamDiscussionTabProps> = ({ teamMembers, teamId }) => {
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
	
	const [editingPostId, setEditingPostId] = useState<number | null>(null)
	const [editingPostContent, setEditingPostContent] = useState<string | null>(null)

	const {
		editor,
		colorPickerRef,
		highlightPickerRef,
		emojiPickerRef,
		fileInputRef,
		handleFileSelect,
		setEditorContent,
	} = usePostEditor(teamMembers)

	const {
		posts,
		loadingPosts,
		page,
		hasNext,
		fetchPosts,
		createPost: createPostHook,
		updatePost,
	} = usePosts(teamId)

	const {
		comments,
		loadingComments,
		commentTexts,
		replyTexts,
		postingComment,
		showComments,
		commentHasNext,
		replyingToComment,
		setCommentTexts,
		setReplyTexts,
		setReplyingToComment,
		postComment,
		groupComments,
		toggleComments,
		loadMoreComments,
		updateComment,
	} = useComments()

	const commentEmojiPickerRefs = useRef<Map<number, HTMLDivElement | null>>(new Map())
	const replyEmojiPickerRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
	const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState<Map<number, boolean>>(new Map())
	const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState<Map<string, boolean>>(new Map())

	useEffect(() => {
		const token = localStorage.getItem('accessToken')
		if (token) {
			api.get<User>('/auth/user', { params: { token } })
				.then(({ data }) => setCurrentUserId(data.id))
				.catch(() => setCurrentUserId(null))
		}
	}, [])

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
			
			commentEmojiPickerRefs.current.forEach((ref, postId) => {
				if (ref && !ref.contains(event.target as Node)) {
					setShowCommentEmojiPicker(prev => {
						const newMap = new Map(prev)
						newMap.set(postId, false)
						return newMap
					})
				}
			})
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [colorPickerRef, highlightPickerRef, emojiPickerRef])

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

	const handleCreatePost = async () => {
		if (!editor || !currentUserId) {
			alert('Musisz być zalogowany, aby opublikować post')
			return
		}

		setPublishing(true)
		try {
			const success = await createPostHook(editor, currentUserId)
			if (success) {
				setShowEditorModal(false)
			}
		} finally {
			setPublishing(false)
		}
	}

	const handleCommentTextChange = (postId: number, text: string) => {
		setCommentTexts(prev => {
			const newMap = new Map(prev)
			newMap.set(postId, text)
			return newMap
		})
	}

	const handleReplyTextChange = (key: string, text: string) => {
		setReplyTexts(prev => {
			const newMap = new Map(prev)
			newMap.set(key, text)
			return newMap
		})
	}

	const handleToggleReply = (key: string, commentId: number) => {
		setReplyingToComment(prev => {
			const newMap = new Map(prev)
			if (prev.get(key) === commentId) {
				newMap.set(key, null)
			} else {
				newMap.set(key, commentId)
			}
			return newMap
		})
	}

	const handleCancelReply = (key: string) => {
		setReplyingToComment(prev => {
			const newMap = new Map(prev)
			newMap.set(key, null)
			return newMap
		})
		setReplyTexts(prev => {
			const newMap = new Map(prev)
			newMap.set(key, '')
			return newMap
		})
	}

	const handleSubmitReply = async (postId: number, commentId: number) => {
		if (!currentUserId) return
		await postComment(postId, currentUserId, commentId)
	}

	const handleSubmitComment = async (postId: number) => {
		if (!currentUserId) return
		await postComment(postId, currentUserId, null)
	}

	const handleEditPost = (postId: number) => {
		const post = posts.find(p => p.postId === postId)
		if (post && editor) {
			setEditingPostId(postId)
			setEditingPostContent(post.contentHtml)
			setEditorContent(post.contentHtml)
			setShowEditorModal(true)
		}
	}

	const handleSaveEdit = async () => {
		if (!editor || !currentUserId || !editingPostId) {
			return
		}

		// TODO: Backend integration - call API to update post
		// For now, just close the modal
		setPublishing(true)
		try {
			// Placeholder for future API call
			// await updatePostAPI(editingPostId, editor.getHTML())
			
			setShowEditorModal(false)
			setEditingPostId(null)
			setEditingPostContent(null)
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
					onClick={() => {
						setEditingPostId(null)
						setEditingPostContent(null)
						if (editor) {
							editor.commands.clearContent()
						}
						setShowEditorModal(true)
					}}
					className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors'
				>
					<Plus size={18} />
					Nowy post
				</button>
			</div>
			
			<div className='space-y-4 mt-6'>
				<PostList
					posts={posts}
					loadingPosts={loadingPosts}
					hasNext={hasNext}
					onLoadMore={() => fetchPosts(page + 1, true)}
					currentUserId={currentUserId}
					comments={comments}
					loadingComments={loadingComments}
					showComments={showComments}
					commentHasNext={commentHasNext}
					commentTexts={commentTexts}
					onCommentTextChange={handleCommentTextChange}
					onToggleComments={toggleComments}
					onLoadMoreComments={loadMoreComments}
					onSubmitComment={handleSubmitComment}
					postingComment={postingComment}
					showCommentEmojiPicker={showCommentEmojiPicker}
					setShowCommentEmojiPicker={(postId, show) => {
						setShowCommentEmojiPicker(prev => {
							const newMap = new Map(prev)
							newMap.set(postId, show)
							return newMap
						})
					}}
					groupComments={groupComments}
					replyingToComment={replyingToComment}
					replyTexts={replyTexts}
					onReplyTextChange={handleReplyTextChange}
					onToggleReply={handleToggleReply}
					onCancelReply={handleCancelReply}
					onSubmitReply={handleSubmitReply}
					showReplyEmojiPicker={showReplyEmojiPicker}
					setShowReplyEmojiPicker={(key, show) => {
						setShowReplyEmojiPicker(prev => {
							const newMap = new Map(prev)
							newMap.set(key, show)
							return newMap
						})
					}}
					replyEmojiPickerRefs={replyEmojiPickerRefs}
					onUpdateComment={updateComment}
					onUpdateReply={updateComment}
					onUpdatePost={updatePost}
					onEditPost={handleEditPost}
				/>
			</div>
			
			<PostEditorModal
				isOpen={showEditorModal}
				onClose={() => {
					const wasEditing = editingPostId !== null
					setShowEditorModal(false)
					setEditingPostId(null)
					setEditingPostContent(null)
					if (editor && !wasEditing) {
						editor.commands.clearContent()
					}
				}}
				editor={editor}
				publishing={publishing}
				currentUserId={currentUserId}
				showColorPicker={showColorPicker}
				setShowColorPicker={setShowColorPicker}
				showHighlightPicker={showHighlightPicker}
				setShowHighlightPicker={setShowHighlightPicker}
				showEmojiPicker={showEmojiPicker}
				setShowEmojiPicker={setShowEmojiPicker}
				fileInputRef={fileInputRef}
				handleFileSelect={handleFileSelect}
				onPollClick={() => setShowPollModal(true)}
				onEventLinkClick={() => {
					fetchEvents()
					setShowEventLinkModal(true)
				}}
				emojiPickerRef={emojiPickerRef}
				onPublish={editingPostId ? handleSaveEdit : handleCreatePost}
				mode={editingPostId ? 'edit' : 'create'}
				initialContent={editingPostContent || undefined}
			/>

			<PollModal
				isOpen={showPollModal}
				onClose={() => {
					setShowPollModal(false)
					setPollQuestion('')
					setPollOptions(['', ''])
				}}
				editor={editor}
				pollQuestion={pollQuestion}
				setPollQuestion={setPollQuestion}
				pollOptions={pollOptions}
				setPollOptions={setPollOptions}
			/>

			<EventLinkModal
				isOpen={showEventLinkModal}
				onClose={() => setShowEventLinkModal(false)}
				editor={editor}
				events={events}
				loadingEvents={loadingEvents}
			/>
		</div>
	)
}

export default TeamDiscussionTab
