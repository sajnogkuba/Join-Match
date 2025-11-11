import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import type { TeamPostCommentResponseDto } from '../Api/types/TeamPostComment'
import { ReplyForm } from './ReplyForm'
import { Reactions } from './Reactions'
import { useCommentReactions } from '../hooks/useCommentReactions'

interface CommentItemProps {
	comment: TeamPostCommentResponseDto
	replies: TeamPostCommentResponseDto[]
	postId: number
	currentUserId: number | null
	isReplying: boolean
	replyText: string
	onReplyTextChange: (text: string) => void
	onToggleReply: () => void
	onCancelReply: () => void
	onSubmitReply: () => void
	isSubmitting: boolean
	showReplyEmojiPicker: boolean
	setShowReplyEmojiPicker: (show: boolean) => void
	replyEmojiPickerRef: React.RefObject<HTMLDivElement | null>
	onUpdateComment?: (commentId: number, updates: Partial<TeamPostCommentResponseDto>) => void
	onUpdateReply?: (commentId: number, updates: Partial<TeamPostCommentResponseDto>) => void
}

export const CommentItem = ({
	comment,
	replies,
	postId,
	currentUserId,
	isReplying,
	replyText,
	onReplyTextChange,
	onToggleReply,
	onCancelReply,
	onSubmitReply,
	isSubmitting,
	showReplyEmojiPicker,
	setShowReplyEmojiPicker,
	replyEmojiPickerRef,
	onUpdateComment,
	onUpdateReply,
}: CommentItemProps) => {
	const { addOrUpdateReaction, getUserReaction, deleteReaction } = useCommentReactions()
	const [userReactionTypeId, setUserReactionTypeId] = useState<number | null>(null)
	const [userReactionsForReplies, setUserReactionsForReplies] = useState<Map<number, number | null>>(new Map())
	const [updatingReaction, setUpdatingReaction] = useState(false)

	useEffect(() => {
		if (currentUserId && comment.commentId) {
			getUserReaction(comment.commentId, currentUserId).then(reactionTypeId => {
				setUserReactionTypeId(reactionTypeId)
			}).catch(() => {
				setUserReactionTypeId(null)
			})
		} else {
			setUserReactionTypeId(null)
		}
	}, [currentUserId, comment.commentId, getUserReaction])

	useEffect(() => {
		if (currentUserId && replies.length > 0) {
			replies.forEach(reply => {
				getUserReaction(reply.commentId, currentUserId).then(reactionTypeId => {
					setUserReactionsForReplies(prev => {
						const newMap = new Map(prev)
						newMap.set(reply.commentId, reactionTypeId)
						return newMap
					})
				}).catch(() => {
					setUserReactionsForReplies(prev => {
						const newMap = new Map(prev)
						newMap.set(reply.commentId, null)
						return newMap
					})
				})
			})
		} else {
			setUserReactionsForReplies(new Map())
		}
	}, [currentUserId, replies, getUserReaction])

	const handleReactionClick = async (commentId: number, reactionTypeId: number, isReply: boolean = false) => {
		if (!currentUserId || updatingReaction) {
			return
		}

		setUpdatingReaction(true)
		try {
			const currentReactionCounts = isReply 
				? replies.find(r => r.commentId === commentId)?.reactionCounts
				: comment.reactionCounts
			const previousUserReactionTypeId = isReply
				? userReactionsForReplies.get(commentId) || null
				: userReactionTypeId
			
			if (previousUserReactionTypeId === reactionTypeId) {
				const updatedCounts = await deleteReaction(
					commentId,
					currentUserId,
					currentReactionCounts,
					reactionTypeId
				)
				
				if (updatedCounts !== null) {
					if (isReply) {
						onUpdateReply?.(commentId, { reactionCounts: updatedCounts })
						setUserReactionsForReplies(prev => {
							const newMap = new Map(prev)
							newMap.set(commentId, null)
							return newMap
						})
					} else {
						onUpdateComment?.(commentId, { reactionCounts: updatedCounts })
						setUserReactionTypeId(null)
					}
				} else {
					alert('Nie udało się usunąć reakcji.')
				}
			} else {
				const updatedCounts = await addOrUpdateReaction(
					commentId, 
					currentUserId, 
					reactionTypeId,
					currentReactionCounts,
					previousUserReactionTypeId
				)
				
				if (updatedCounts) {
					let newUserReaction: number | null = null
					try {
						newUserReaction = await getUserReaction(commentId, currentUserId)
					} catch {
						newUserReaction = reactionTypeId
					}
					
					if (newUserReaction === null) {
						newUserReaction = reactionTypeId
					}
					
					if (isReply) {
						onUpdateReply?.(commentId, { reactionCounts: updatedCounts })
						setUserReactionsForReplies(prev => {
							const newMap = new Map(prev)
							newMap.set(commentId, newUserReaction)
							return newMap
						})
					} else {
						onUpdateComment?.(commentId, { reactionCounts: updatedCounts })
						setUserReactionTypeId(newUserReaction)
					}
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
		<div className='space-y-2'>
			<div className='flex items-start gap-3 p-3 rounded-lg bg-zinc-800/40'>
				<Link to={`/profile/${comment.authorId}`}>
					<Avatar
						src={comment.authorAvatarUrl || null}
						name={comment.authorName}
						size='sm'
						className='ring-1 ring-zinc-700'
					/>
				</Link>
				<div className='flex-1'>
					<div className='flex items-center gap-2 mb-1'>
						<Link
							to={`/profile/${comment.authorId}`}
							className='text-white font-medium text-sm hover:text-violet-400 transition-colors'
						>
							{comment.authorName}
						</Link>
						<span className='text-xs text-zinc-500'>
							{new Date(comment.createdAt).toLocaleDateString('pl-PL', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							})}
						</span>
					</div>
					<p className='text-zinc-300 text-sm whitespace-pre-wrap'>{comment.content}</p>
					{currentUserId && (
						<div className='flex items-center gap-2 mt-2 flex-wrap'>
							<Reactions
								targetId={comment.commentId}
								compact={true}
								reactionCounts={comment.reactionCounts}
								userReactionTypeId={userReactionTypeId}
								onReactionClick={(reactionTypeId) => handleReactionClick(comment.commentId, reactionTypeId, false)}
							/>
							<button
								onClick={onToggleReply}
								className='text-xs text-zinc-400 hover:text-violet-400 transition-colors whitespace-nowrap'
							>
								{isReplying ? 'Anuluj odpowiedź' : 'Odpowiedz'}
							</button>
						</div>
					)}
					{!currentUserId && (
						<div className='mt-2'>
							<Reactions
								targetId={comment.commentId}
								compact={true}
								reactionCounts={comment.reactionCounts}
								userReactionTypeId={null}
								onReactionClick={undefined}
							/>
						</div>
					)}
				</div>
			</div>
			
			{isReplying && currentUserId && (
				<ReplyForm
					replyText={replyText}
					onReplyTextChange={onReplyTextChange}
					authorName={comment.authorName}
					onCancel={onCancelReply}
					onSubmit={onSubmitReply}
					isSubmitting={isSubmitting}
					showEmojiPicker={showReplyEmojiPicker}
					setShowEmojiPicker={setShowReplyEmojiPicker}
					emojiPickerRef={replyEmojiPickerRef}
				/>
			)}
			
			{replies.length > 0 && (
				<div className='ml-12 space-y-2 mt-2 border-l-2 border-zinc-700 pl-4'>
					{replies.map((reply) => (
						<div
							key={reply.commentId}
							className='flex items-start gap-3 p-2 rounded-lg bg-zinc-800/30'
						>
							<Link to={`/profile/${reply.authorId}`}>
								<Avatar
									src={reply.authorAvatarUrl || null}
									name={reply.authorName}
									size='sm'
									className='ring-1 ring-zinc-700'
								/>
							</Link>
							<div className='flex-1'>
								<div className='flex items-center gap-2 mb-1'>
									<Link
										to={`/profile/${reply.authorId}`}
										className='text-white font-medium text-xs hover:text-violet-400 transition-colors'
									>
										{reply.authorName}
									</Link>
									<span className='text-xs text-zinc-500'>
										{new Date(reply.createdAt).toLocaleDateString('pl-PL', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</div>
								<p className='text-zinc-300 text-xs whitespace-pre-wrap'>{reply.content}</p>
								<div className='mt-2'>
									<Reactions
										targetId={reply.commentId}
										compact={true}
										reactionCounts={reply.reactionCounts}
										userReactionTypeId={currentUserId ? userReactionsForReplies.get(reply.commentId) || null : null}
										onReactionClick={currentUserId ? (reactionTypeId) => handleReactionClick(reply.commentId, reactionTypeId, true) : undefined}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

