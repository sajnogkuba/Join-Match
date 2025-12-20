import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'
import api from '../Api/axios'
import type { TeamPostResponseDto } from '../Api/types/TeamPost'
import type { TeamMember } from '../Api/types/TeamMember'
import type { User } from '../Api/types/User'
import { usePostEditor } from '../hooks/usePostEditor'
import { useComments } from '../hooks/useComments'
import { PostItem } from '../components/PostItem'
import { PostEditorModal } from '../components/PostEditorModal'
import AlertModal from '../components/AlertModal'

const PostPage: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const [searchParams] = useSearchParams()
	const highlightCommentIdParam = searchParams.get('highlightComment')
	const highlightCommentId = highlightCommentIdParam ? parseInt(highlightCommentIdParam, 10) : null
	
	const [post, setPost] = useState<TeamPostResponseDto | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [currentUserId, setCurrentUserId] = useState<number | null>(null)
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
	const [editingPostId, setEditingPostId] = useState<number | null>(null)
	const [_editingPostContent, setEditingPostContent] = useState<string | null>(null)
	const [showEditorModal, setShowEditorModal] = useState(false)
	const [publishing, setPublishing] = useState(false)
	const [showDeletePostModal, setShowDeletePostModal] = useState(false)
	const [postToDelete, setPostToDelete] = useState<number | null>(null)
	const [deletingPost, setDeletingPost] = useState(false)
	const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false)
	const [commentToDelete, setCommentToDelete] = useState<{ postId: number; commentId: number } | null>(null)
	const [deletingComment, setDeletingComment] = useState(false)
	const [showColorPicker, setShowColorPicker] = useState(false)
	const [showHighlightPicker, setShowHighlightPicker] = useState(false)
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)

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
		updateCommentAPI,
		deleteCommentAPI,
		restoreCommentAPI,
	} = useComments()

	const replyEmojiPickerRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
	const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState<Map<number, boolean>>(new Map())
	const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState<Map<string, boolean>>(new Map())

	useEffect(() => {
		api.get<User>('/auth/user')
				.then(({ data }) => setCurrentUserId(data.id))
				.catch(() => setCurrentUserId(null));
	}, [])

	useEffect(() => {
		if (!id) {
			setError('Nieprawidłowy identyfikator posta')
			setLoading(false)
			return
		}

		const fetchPost = async () => {
			try {
				setLoading(true)
				const response = await api.get<TeamPostResponseDto>(`/team-post/post/${id}`)
				const postData = response.data
				setPost(postData)

				// Fetch team members for post editor
				try {
					type TeamMembersPageResponse = {
						content: TeamMember[]
						totalElements: number
						totalPages: number
						number: number
						size: number
						first: boolean
						last: boolean
						numberOfElements: number
						empty: boolean
					}
					const membersResponse = await api.get<TeamMembersPageResponse>(
						`/user-team/${postData.teamId}/members`,
						{ params: { page: 0, size: 100, sort: 'userName', direction: 'ASC' } }
					)
					setTeamMembers(membersResponse.data.content || [])
				} catch (err) {
					console.error('Błąd pobierania członków drużyny:', err)
				}
			} catch (err: any) {
				console.error('Błąd pobierania posta:', err)
				if (err.response?.status === 404) {
					setError('Post nie został znaleziony')
				} else {
					setError('Nie udało się pobrać posta')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchPost()
	}, [id])

	useEffect(() => {
		if (post && post.postId) {
			const postId = post.postId
			const isShowing = showComments.get(postId) || false
			if (!isShowing) {
				toggleComments(postId)
			}
		}
	}, [post, showComments, toggleComments])

	const prevLoadingRef = useRef<Map<number, boolean>>(new Map())
	const isSearchingForCommentRef = useRef<Map<number, boolean>>(new Map())
	
	useEffect(() => {
		if (!highlightCommentId || !post) {
			isSearchingForCommentRef.current.set(post?.postId || 0, false)
			return
		}
		
		const postId = post.postId
		const postComments = comments.get(postId) || []
		const commentExists = postComments.some(c => c.commentId === highlightCommentId)
		
		if (commentExists) {
			isSearchingForCommentRef.current.set(postId, false)
			return
		}
		
		const hasNext = commentHasNext.get(postId) || false
		const isLoading = loadingComments.get(postId) || false
		const prevLoading = prevLoadingRef.current.get(postId) || false
		const isSearching = isSearchingForCommentRef.current.get(postId) || false
		
		if (!commentExists && hasNext) {
			isSearchingForCommentRef.current.set(postId, true)
			if (prevLoading && !isLoading) {
				loadMoreComments(postId)
			} else if (!isLoading && !isSearching) {
				loadMoreComments(postId)
			}
		} else if (!hasNext) {
			isSearchingForCommentRef.current.set(postId, false)
		}
		
		prevLoadingRef.current.set(postId, isLoading)
	}, [highlightCommentId, post, comments, commentHasNext, loadingComments, loadMoreComments])

	const [effectiveLoadingComments, setEffectiveLoadingComments] = useState<Map<number, boolean>>(new Map())
	
	useEffect(() => {
		if (!post) return
		const postId = post.postId
		const isLoading = loadingComments.get(postId) || false
		const isSearching = isSearchingForCommentRef.current.get(postId) || false
		
		setEffectiveLoadingComments(prev => {
			const newMap = new Map(prev)
			newMap.set(postId, isLoading || isSearching)
			return newMap
		})
	}, [post, loadingComments, comments])

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
	}, [colorPickerRef, highlightPickerRef, emojiPickerRef])

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
		if (post && editor) {
			setEditingPostId(postId)
			setEditingPostContent(post.contentHtml)
			setEditorContent(post.contentHtml)
			setShowEditorModal(true)
		}
	}

	const handleSaveEdit = async () => {
		if (!editor || !currentUserId || !editingPostId || !post) {
			return
		}

		setPublishing(true)
		try {
			const htmlContent = editor.getHTML()
			const textContent = editor.getText().trim()

			if (!textContent || textContent === 'Wpisz swoją wiadomość tutaj...') {
				alert('Post nie może być pusty')
				return
			}

			const { extractMentionedUserIds } = await import('../utils/mentionUtils')
			const mentionedUserIds = extractMentionedUserIds(htmlContent)

			const postData = {
				teamId: post.teamId,
				authorId: currentUserId,
				content: textContent,
				contentHtml: htmlContent,
				postType: 'TEXT' as const,
				mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
			}

			const response = await api.put<TeamPostResponseDto>(`/team-post/${editingPostId}`, postData)
			setPost(response.data)
			setShowEditorModal(false)
			setEditingPostId(null)
			setEditingPostContent(null)
		} catch (error: any) {
			console.error('Błąd edycji posta:', error)
			const errorMessage = error.response?.data?.message || error.message || 'Nieznany błąd'
			alert(`Nie udało się zapisać zmian: ${errorMessage}`)
		} finally {
			setPublishing(false)
		}
	}

	const handleDeletePost = (postId: number) => {
		setPostToDelete(postId)
		setShowDeletePostModal(true)
	}

	const handleConfirmDelete = async () => {
		if (!postToDelete) return

		setDeletingPost(true)
		try {
			await api.delete(`/team-post/${postToDelete}`)
			if (post) {
				setPost({
					...post,
					isDeleted: true,
					deletedAt: new Date().toISOString(),
				})
			}
			setShowDeletePostModal(false)
			setPostToDelete(null)
		} catch (error: any) {
			console.error('Błąd usuwania posta:', error)
			alert('Nie udało się usunąć posta. Spróbuj ponownie.')
		} finally {
			setDeletingPost(false)
		}
	}

	const handleRestorePost = async (postId: number) => {
		try {
			await api.patch(`/team-post/${postId}/restore`)
			if (post) {
				setPost({
					...post,
					isDeleted: false,
					deletedAt: null,
				})
			}
		} catch (error: any) {
			console.error('Błąd przywracania posta:', error)
			alert('Nie udało się przywrócić posta. Spróbuj ponownie.')
		}
	}

	const handleUpdatePost = (postId: number, updates: Partial<TeamPostResponseDto>) => {
		if (post && post.postId === postId) {
			setPost({ ...post, ...updates })
		}
	}

	const handleEditComment = async (postId: number, commentId: number, content: string) => {
		return await updateCommentAPI(postId, commentId, content)
	}

	const handleDeleteComment = (postId: number, commentId: number) => {
		setCommentToDelete({ postId, commentId })
		setShowDeleteCommentModal(true)
	}

	const handleConfirmDeleteComment = async () => {
		if (!commentToDelete) return

		setDeletingComment(true)
		try {
			const success = await deleteCommentAPI(commentToDelete.postId, commentToDelete.commentId)
			if (success) {
				setShowDeleteCommentModal(false)
				setCommentToDelete(null)
			}
		} finally {
			setDeletingComment(false)
		}
	}

	const handleRestoreComment = async (postId: number, commentId: number) => {
		return await restoreCommentAPI(postId, commentId)
	}

	if (loading) {
		return (
			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8 mt-20'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					<div className='grid place-items-center p-10'>
						<div className='flex items-center gap-2 text-zinc-300'>
							<Loader2 className='animate-spin' /> Ładowanie…
						</div>
					</div>
				</div>
			</main>
		)
	}

	if (error || !post) {
		return (
			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8 mt-20'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					<div className='grid place-items-center p-10 text-center'>
						<AlertTriangle className='mx-auto mb-4 text-rose-400' size={48} />
						<h2 className='text-white text-xl font-semibold mb-2'>Błąd</h2>
						<p className='text-zinc-400 mb-4'>{error || 'Nie znaleziono posta'}</p>
						<Link
							to='/teams'
							className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors'
						>
							<ArrowLeft size={18} />
							Powrót do drużyn
						</Link>
					</div>
				</div>
			</main>
		)
	}

	if (!editor) {
		return null
	}

	return (
		<main className='mx-auto max-w-4xl px-4 py-8 md:px-8 mt-20'>
			<div className='mb-6'>
				<Link
					to={`/team/${post.teamId}?tab=dyskusja`}
					className='inline-flex items-center gap-2 text-zinc-400 hover:text-violet-400 transition-colors'
				>
					<ArrowLeft size={18} />
					Powrót do dyskusji drużyny
				</Link>
			</div>

			<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
				<PostItem
					post={post}
					highlightCommentId={highlightCommentId}
					currentUserId={currentUserId}
					comments={comments.get(post.postId) || []}
					loadingComments={effectiveLoadingComments.get(post.postId) || false}
					showComments={showComments.get(post.postId) || false}
					commentHasNext={commentHasNext.get(post.postId) || false}
					commentText={commentTexts.get(post.postId) || ''}
					onCommentTextChange={(text) => handleCommentTextChange(post.postId, text)}
					onToggleComments={() => toggleComments(post.postId)}
					onLoadMoreComments={() => loadMoreComments(post.postId)}
					onSubmitComment={() => handleSubmitComment(post.postId)}
					isSubmitting={postingComment.get(post.postId) || false}
					showCommentEmojiPicker={showCommentEmojiPicker.get(post.postId) || false}
					setShowCommentEmojiPicker={(show) => {
						setShowCommentEmojiPicker(prev => {
							const newMap = new Map(prev)
							newMap.set(post.postId, show)
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
					onUpdateComment={(commentId, updates) => updateComment(post.postId, commentId, updates)}
					onUpdateReply={(commentId, updates) => updateComment(post.postId, commentId, updates)}
					onUpdatePost={handleUpdatePost}
					onEditPost={handleEditPost}
					onDeletePost={handleDeletePost}
					onRestorePost={handleRestorePost}
					onEditComment={handleEditComment}
					onDeleteComment={handleDeleteComment}
					onRestoreComment={handleRestoreComment}
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
				onPollClick={() => {}}
				onEventLinkClick={() => {}}
				emojiPickerRef={emojiPickerRef}
				onPublish={editingPostId ? handleSaveEdit : () => {}}
				mode={editingPostId ? 'edit' : 'create'}
			/>

			<AlertModal
				isOpen={showDeletePostModal}
				onClose={() => {
					setShowDeletePostModal(false)
					setPostToDelete(null)
				}}
				title='Usuń post'
				message='Czy na pewno chcesz usunąć ten post? Post będzie widoczny jako usunięty dla innych użytkowników, ale nadal będziesz mógł go zobaczyć (wyszarzony).'
				variant='warning'
				showConfirm={true}
				onConfirm={handleConfirmDelete}
				confirmText='Usuń post'
				cancelText='Anuluj'
				isLoading={deletingPost}
			/>

			<AlertModal
				isOpen={showDeleteCommentModal}
				onClose={() => {
					setShowDeleteCommentModal(false)
					setCommentToDelete(null)
				}}
				title='Usuń komentarz'
				message='Czy na pewno chcesz usunąć ten komentarz? Komentarz będzie widoczny jako usunięty dla innych użytkowników, ale nadal będziesz mógł go zobaczyć (wyszarzony).'
				variant='warning'
				showConfirm={true}
				onConfirm={handleConfirmDeleteComment}
				confirmText='Usuń komentarz'
				cancelText='Anuluj'
				isLoading={deletingComment}
			/>
		</main>
	)
}

export default PostPage

