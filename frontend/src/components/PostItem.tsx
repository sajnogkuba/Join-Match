import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2, RotateCcw } from 'lucide-react'
import Avatar from './Avatar'
import type { TeamPostResponseDto } from '../Api/types/TeamPost'
import { CommentSection } from './CommentSection'
import type { TeamPostCommentResponseDto } from '../Api/types/TeamPostComment'
import { Reactions } from './Reactions'
import { usePostReactions } from '../hooks/usePostReactions'

interface PostItemProps {
	post: TeamPostResponseDto
	currentUserId: number | null
	comments: TeamPostCommentResponseDto[]
	loadingComments: boolean
	showComments: boolean
	commentHasNext: boolean
	commentText: string
	onCommentTextChange: (text: string) => void
	onToggleComments: () => void
	onLoadMoreComments: () => void
	onSubmitComment: () => void
	isSubmitting: boolean
	showCommentEmojiPicker: boolean
	setShowCommentEmojiPicker: (show: boolean) => void
	groupComments: (commentsList: TeamPostCommentResponseDto[]) => {
		mainComments: TeamPostCommentResponseDto[]
		repliesMap: Map<number, TeamPostCommentResponseDto[]>
	}
	replyingToComment: Map<string, number | null>
	replyTexts: Map<string, string>
	onReplyTextChange: (key: string, text: string) => void
	onToggleReply: (key: string, commentId: number) => void
	onCancelReply: (key: string) => void
	onSubmitReply: (postId: number, commentId: number) => void
	showReplyEmojiPicker: Map<string, boolean>
	setShowReplyEmojiPicker: (key: string, show: boolean) => void
	replyEmojiPickerRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>
	onUpdateComment?: (commentId: number, updates: Partial<TeamPostCommentResponseDto>) => void
	onUpdateReply?: (commentId: number, updates: Partial<TeamPostCommentResponseDto>) => void
	onUpdatePost?: (postId: number, updates: Partial<TeamPostResponseDto>) => void
	onEditPost?: (postId: number) => void
	onDeletePost?: (postId: number) => void
	onRestorePost?: (postId: number) => void
	onEditComment?: (postId: number, commentId: number, content: string) => Promise<boolean>
	onDeleteComment?: (postId: number, commentId: number) => void
	onRestoreComment?: (postId: number, commentId: number) => Promise<boolean>
}

export const PostItem = ({
	post,
	currentUserId,
	comments,
	loadingComments,
	showComments,
	commentHasNext,
	commentText,
	onCommentTextChange,
	onToggleComments,
	onLoadMoreComments,
	onSubmitComment,
	isSubmitting,
	showCommentEmojiPicker,
	setShowCommentEmojiPicker,
	groupComments,
	replyingToComment,
	replyTexts,
	onReplyTextChange,
	onToggleReply,
	onCancelReply,
	onSubmitReply,
	showReplyEmojiPicker,
	setShowReplyEmojiPicker,
	replyEmojiPickerRefs,
	onUpdateComment,
	onUpdateReply,
	onUpdatePost,
	onEditPost,
	onDeletePost,
	onRestorePost,
	onEditComment,
	onDeleteComment,
	onRestoreComment,
}: PostItemProps) => {
	const isAuthor = currentUserId === post.authorId
	const isDeleted = post.isDeleted
	const { addOrUpdateReaction, getUserReaction, deleteReaction } = usePostReactions()
	const [userReactionTypeId, setUserReactionTypeId] = useState<number | null>(null)
	const [updatingReaction, setUpdatingReaction] = useState(false)
	const [localReactionCounts, setLocalReactionCounts] = useState<Record<number, number> | undefined>(post.reactionCounts)

	useEffect(() => {
		setLocalReactionCounts(post.reactionCounts)
	}, [post.reactionCounts])

	useEffect(() => {
		if (currentUserId && post.postId) {
			getUserReaction(post.postId, currentUserId).then(reactionTypeId => {
				setUserReactionTypeId(reactionTypeId)
			}).catch(() => {
				setUserReactionTypeId(null)
			})
		} else {
			setUserReactionTypeId(null)
		}
	}, [currentUserId, post.postId, getUserReaction])

	const handleReactionClick = async (postId: number, reactionTypeId: number) => {
		if (!currentUserId || updatingReaction) {
			return
		}

		setUpdatingReaction(true)
		try {
			const currentReactionCounts = post.reactionCounts
			const previousUserReactionTypeId = userReactionTypeId
			
			if (previousUserReactionTypeId === reactionTypeId) {
				const updatedCounts = await deleteReaction(
					postId,
					currentUserId,
					currentReactionCounts,
					reactionTypeId
				)
				
				if (updatedCounts !== null) {
					setLocalReactionCounts(updatedCounts)
					onUpdatePost?.(postId, { reactionCounts: updatedCounts })
					setUserReactionTypeId(null)
				} else {
					alert('Nie udało się usunąć reakcji.')
				}
			} else {
				const updatedCounts = await addOrUpdateReaction(
					postId, 
					currentUserId, 
					reactionTypeId,
					currentReactionCounts,
					previousUserReactionTypeId
				)
				
				if (updatedCounts) {
					setLocalReactionCounts(updatedCounts)
					let newUserReaction: number | null = null
					try {
						newUserReaction = await getUserReaction(postId, currentUserId)
					} catch {
						newUserReaction = reactionTypeId
					}
					
					if (newUserReaction === null) {
						newUserReaction = reactionTypeId
					}
					
					onUpdatePost?.(postId, { reactionCounts: updatedCounts })
					setUserReactionTypeId(newUserReaction)
				} else {
					alert('Nie udało się zapisać reakcji. Sprawdź konsolę przeglądarki.')
				}
			}
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message || 'Nieznany błąd'
			alert(`Błąd podczas zapisywania reakcji: ${errorMessage}`)
		} finally {
			setUpdatingReaction(false)
		}
	}

	return (
		<div className={`rounded-lg border border-zinc-800 p-4 transition-colors ${
			isDeleted && isAuthor 
				? 'bg-zinc-900/20 opacity-60' 
				: isDeleted 
					? 'bg-zinc-900/40' 
					: 'bg-zinc-900/40 hover:bg-zinc-900/60'
		}`}>
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
						className={`font-medium transition-colors ${
							isDeleted && isAuthor
								? 'text-zinc-500'
								: 'text-white hover:text-violet-400'
						}`}
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
						{(() => {
							if (!post.updatedAt) return null
							const createdAt = new Date(post.createdAt).getTime()
							const updatedAt = new Date(post.updatedAt).getTime()
							// Sprawdź czy updatedAt jest późniejsze niż createdAt (z tolerancją 1 sekundy na różnice w zapisie)
							if (updatedAt > createdAt + 1000) {
								return (
									<>
										<br />
										<span className='text-zinc-500 italic'>
											Edytowano - {new Date(post.updatedAt).toLocaleDateString('pl-PL', {
												day: 'numeric',
												month: 'long',
												year: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</>
								)
							}
							return null
						})()}
						{isDeleted && post.deletedAt && (
							<>
								<br />
								<span className='text-zinc-500 italic'>
									Usunięto - {new Date(post.deletedAt).toLocaleDateString('pl-PL', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</span>
							</>
						)}
					</p>
				</div>
				{isAuthor && !isDeleted && (
					<div className='flex items-center gap-1'>
						{onEditPost && (
							<button
								onClick={() => onEditPost(post.postId)}
								className='p-2 rounded-lg text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 transition-colors'
								title='Edytuj post'
							>
								<Edit size={18} />
							</button>
						)}
						{onDeletePost && (
							<button
								onClick={() => onDeletePost(post.postId)}
								className='p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors'
								title='Usuń post'
							>
								<Trash2 size={18} />
							</button>
						)}
					</div>
				)}
				{isAuthor && isDeleted && onRestorePost && (
					<button
						onClick={() => onRestorePost(post.postId)}
						className='p-2 rounded-lg text-zinc-400 hover:text-green-400 hover:bg-zinc-800 transition-colors'
						title='Przywróć post'
					>
						<RotateCcw size={18} />
					</button>
				)}
			</div>
			
			{isDeleted && !isAuthor ? (
				<div className='text-zinc-500 italic py-4'>
					Post został usunięty przez {post.authorName}
					{post.deletedAt && (
						<> - {new Date(post.deletedAt).toLocaleDateString('pl-PL', {
							day: 'numeric',
							month: 'long',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						})}</>
					)}
				</div>
			) : (
				<>
					<div
						className={`prose prose-invert max-w-none [&_*]:text-zinc-300 [&_strong]:text-white [&_em]:text-zinc-200 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_a]:text-violet-400 [&_a]:hover:text-violet-300 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_p]:my-2 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4 [&_.mention]:bg-violet-500/20 [&_.mention]:text-violet-300 [&_.mention]:px-1 [&_.mention]:rounded [&_.mention]:font-medium ${
							isDeleted && isAuthor ? 'text-zinc-500' : 'text-zinc-300'
						}`}
						dangerouslySetInnerHTML={{ __html: post.contentHtml }}
					/>
					
					{!isDeleted && (
						<>
							<Reactions
								targetId={post.postId}
								reactionCounts={localReactionCounts}
								userReactionTypeId={userReactionTypeId}
								onReactionClick={currentUserId ? (reactionTypeId) => handleReactionClick(post.postId, reactionTypeId) : undefined}
							/>
							
							<CommentSection
								postId={post.postId}
								currentUserId={currentUserId}
								comments={comments}
								loadingComments={loadingComments}
								showComments={showComments}
								commentHasNext={commentHasNext}
								commentText={commentText}
								onCommentTextChange={onCommentTextChange}
								onToggleComments={onToggleComments}
								onLoadMoreComments={onLoadMoreComments}
								onSubmitComment={onSubmitComment}
								isSubmitting={isSubmitting}
								showCommentEmojiPicker={showCommentEmojiPicker}
								setShowCommentEmojiPicker={setShowCommentEmojiPicker}
								groupComments={groupComments}
								replyingToComment={replyingToComment}
								replyTexts={replyTexts}
								onReplyTextChange={onReplyTextChange}
								onToggleReply={onToggleReply}
								onCancelReply={onCancelReply}
								onSubmitReply={onSubmitReply}
								showReplyEmojiPicker={showReplyEmojiPicker}
								setShowReplyEmojiPicker={setShowReplyEmojiPicker}
								replyEmojiPickerRefs={replyEmojiPickerRefs}
								onUpdateComment={onUpdateComment}
								onUpdateReply={onUpdateReply}
								onEditComment={onEditComment}
								onDeleteComment={onDeleteComment}
								onRestoreComment={onRestoreComment}
							/>
						</>
					)}
				</>
			)}
		</div>
	)
}

