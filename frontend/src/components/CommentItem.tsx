import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2, RotateCcw, X, Check } from 'lucide-react'
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
	onEditComment?: (postId: number, commentId: number, content: string) => Promise<boolean>
	onDeleteComment?: (postId: number, commentId: number) => void
	onRestoreComment?: (postId: number, commentId: number) => Promise<boolean>
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
	onEditComment,
	onDeleteComment,
	onRestoreComment,
}: CommentItemProps) => {
	const isAuthor = currentUserId === comment.authorId
	const isDeleted = comment.isDeleted
	const [isEditing, setIsEditing] = useState(false)
	const [editContent, setEditContent] = useState(comment.content)
	const [savingEdit, setSavingEdit] = useState(false)
	const [editingReplyId, setEditingReplyId] = useState<number | null>(null)
	const [editReplyContent, setEditReplyContent] = useState<string>('')
	const [savingReplyEdit, setSavingReplyEdit] = useState(false)

	const { addOrUpdateReaction, getUserReaction, deleteReaction, getReactionUsers } = useCommentReactions()
	const [userReactionTypeId, setUserReactionTypeId] = useState<number | null>(null)
	const [userReactionsForReplies, setUserReactionsForReplies] = useState<Map<number, number | null>>(new Map())
	const [updatingReaction, setUpdatingReaction] = useState(false)
	const [localReactionCounts, setLocalReactionCounts] = useState<Record<number, number> | undefined>(comment.reactionCounts)
	const [localReactionCountsForReplies, setLocalReactionCountsForReplies] = useState<Map<number, Record<number, number>>>(new Map())

	useEffect(() => {
		setEditContent(comment.content)
	}, [comment.content])

	useEffect(() => {
		setLocalReactionCounts(comment.reactionCounts)
	}, [comment.reactionCounts])

	useEffect(() => {
		const newMap = new Map<number, Record<number, number>>()
		replies.forEach(reply => {
			if (reply.reactionCounts) {
				newMap.set(reply.commentId, reply.reactionCounts)
			}
		})
		setLocalReactionCountsForReplies(newMap)
	}, [replies])

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
				? localReactionCountsForReplies.get(commentId) || replies.find(r => r.commentId === commentId)?.reactionCounts
				: localReactionCounts || comment.reactionCounts
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
						setLocalReactionCountsForReplies(prev => {
							const newMap = new Map(prev)
							newMap.set(commentId, updatedCounts)
							return newMap
						})
						onUpdateReply?.(commentId, { reactionCounts: updatedCounts })
						setUserReactionsForReplies(prev => {
							const newMap = new Map(prev)
							newMap.set(commentId, null)
							return newMap
						})
					} else {
						setLocalReactionCounts(updatedCounts)
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
						setLocalReactionCountsForReplies(prev => {
							const newMap = new Map(prev)
							newMap.set(commentId, updatedCounts)
							return newMap
						})
						onUpdateReply?.(commentId, { reactionCounts: updatedCounts })
						setUserReactionsForReplies(prev => {
							const newMap = new Map(prev)
							newMap.set(commentId, newUserReaction)
							return newMap
						})
					} else {
						setLocalReactionCounts(updatedCounts)
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

	const handleSaveEdit = async () => {
		if (!onEditComment || !editContent.trim()) {
			return
		}

		setSavingEdit(true)
		try {
			const success = await onEditComment(postId, comment.commentId, editContent.trim())
			if (success) {
				setIsEditing(false)
			}
		} finally {
			setSavingEdit(false)
		}
	}

	const handleCancelEdit = () => {
		setIsEditing(false)
		setEditContent(comment.content)
	}

	const handleSaveReplyEdit = async (replyId: number) => {
		if (!onEditComment || !editReplyContent.trim()) {
			return
		}

		setSavingReplyEdit(true)
		try {
			const success = await onEditComment(postId, replyId, editReplyContent.trim())
			if (success) {
				setEditingReplyId(null)
				setEditReplyContent('')
			}
		} finally {
			setSavingReplyEdit(false)
		}
	}

	const handleCancelReplyEdit = (reply: TeamPostCommentResponseDto) => {
		setEditingReplyId(null)
		setEditReplyContent(reply.content)
	}

	return (
		<div className='space-y-2'>
			<div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
				isDeleted && isAuthor 
					? 'bg-zinc-800/20 opacity-60' 
					: isDeleted 
						? 'bg-zinc-800/40' 
						: 'bg-zinc-800/40'
			}`}>
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
							className={`font-medium text-sm transition-colors ${
								isDeleted && isAuthor
									? 'text-zinc-500'
									: 'text-white hover:text-violet-400'
							}`}
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
							{(() => {
								if (!comment.updatedAt) return null
								const createdAt = new Date(comment.createdAt).getTime()
								const updatedAt = new Date(comment.updatedAt).getTime()
								if (updatedAt > createdAt + 1000) {
									return (
										<>
											{' • '}
											<span className='italic'>Edytowano</span>
										</>
									)
								}
								return null
							})()}
							{isDeleted && comment.deletedAt && (
								<>
									{' • '}
									<span className='italic'>Usunięto</span>
								</>
							)}
						</span>
					</div>
					{isEditing ? (
						<div className='space-y-2'>
							<textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								rows={3}
								className='w-full px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-600 focus:border-transparent resize-none transition text-sm'
								disabled={savingEdit}
							/>
							<div className='flex items-center gap-2'>
								<button
									onClick={handleSaveEdit}
									disabled={savingEdit || !editContent.trim()}
									className='px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1'
								>
									<Check size={14} />
									Zapisz
								</button>
								<button
									onClick={handleCancelEdit}
									disabled={savingEdit}
									className='px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1'
								>
									<X size={14} />
									Anuluj
								</button>
							</div>
						</div>
					) : isDeleted && !isAuthor ? (
						<div className='text-zinc-500 italic text-sm py-2'>
							Komentarz został usunięty przez {comment.authorName}
							{comment.deletedAt && (
								<> - {new Date(comment.deletedAt).toLocaleDateString('pl-PL', {
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
							<p className={`text-sm whitespace-pre-wrap ${
								isDeleted && isAuthor ? 'text-zinc-500' : 'text-zinc-300'
							}`}>{comment.content}</p>
							{!isDeleted && currentUserId && (
								<div className='flex items-center gap-2 mt-2 flex-wrap'>
									<Reactions
										targetId={comment.commentId}
										compact={true}
										reactionCounts={localReactionCounts}
										userReactionTypeId={userReactionTypeId}
										onReactionClick={(reactionTypeId) => handleReactionClick(comment.commentId, reactionTypeId, false)}
										getReactionUsers={getReactionUsers}
									/>
									<button
										onClick={onToggleReply}
										className='text-xs text-zinc-400 hover:text-violet-400 transition-colors whitespace-nowrap'
									>
										{isReplying ? 'Anuluj odpowiedź' : 'Odpowiedz'}
									</button>
								</div>
							)}
							{!isDeleted && !currentUserId && (
								<div className='mt-2'>
									<Reactions
										targetId={comment.commentId}
										compact={true}
										reactionCounts={localReactionCounts}
										userReactionTypeId={null}
										onReactionClick={undefined}
										getReactionUsers={getReactionUsers}
									/>
								</div>
							)}
						</>
					)}
				</div>
				{isAuthor && !isDeleted && (
					<div className='flex items-center gap-1'>
						{onEditComment && (
							<button
								onClick={() => setIsEditing(true)}
								className='p-1.5 rounded-lg text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 transition-colors'
								title='Edytuj komentarz'
							>
								<Edit size={16} />
							</button>
						)}
						{onDeleteComment && (
							<button
								onClick={() => onDeleteComment(postId, comment.commentId)}
								className='p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors'
								title='Usuń komentarz'
							>
								<Trash2 size={16} />
							</button>
						)}
					</div>
				)}
				{isAuthor && isDeleted && onRestoreComment && (
					<button
						onClick={() => onRestoreComment(postId, comment.commentId)}
						className='p-1.5 rounded-lg text-zinc-400 hover:text-green-400 hover:bg-zinc-800 transition-colors'
						title='Przywróć komentarz'
					>
						<RotateCcw size={16} />
					</button>
				)}
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
					{replies.map((reply) => {
						const isReplyAuthor = currentUserId === reply.authorId
						const isReplyDeleted = reply.isDeleted
						const isEditingReply = editingReplyId === reply.commentId

						return (
							<div
								key={reply.commentId}
								className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
									isReplyDeleted && isReplyAuthor 
										? 'bg-zinc-800/15 opacity-60' 
										: isReplyDeleted 
											? 'bg-zinc-800/30' 
											: 'bg-zinc-800/30'
								}`}
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
											className={`font-medium text-xs transition-colors ${
												isReplyDeleted && isReplyAuthor
													? 'text-zinc-500'
													: 'text-white hover:text-violet-400'
											}`}
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
											{(() => {
												if (!reply.updatedAt) return null
												const createdAt = new Date(reply.createdAt).getTime()
												const updatedAt = new Date(reply.updatedAt).getTime()
												if (updatedAt > createdAt + 1000) {
													return (
														<>
															{' • '}
															<span className='italic'>Edytowano</span>
														</>
													)
												}
												return null
											})()}
											{isReplyDeleted && reply.deletedAt && (
												<>
													{' • '}
													<span className='italic'>Usunięto</span>
												</>
											)}
										</span>
									</div>
									{isEditingReply ? (
										<div className='space-y-2'>
											<textarea
												value={editReplyContent}
												onChange={(e) => setEditReplyContent(e.target.value)}
												rows={2}
												className='w-full px-2 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-600 focus:border-transparent resize-none transition text-xs'
												disabled={savingReplyEdit}
											/>
											<div className='flex items-center gap-2'>
												<button
													onClick={() => handleSaveReplyEdit(reply.commentId)}
													disabled={savingReplyEdit || !editReplyContent.trim()}
													className='px-2 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1'
												>
													<Check size={12} />
													Zapisz
												</button>
												<button
													onClick={() => handleCancelReplyEdit(reply)}
													disabled={savingReplyEdit}
													className='px-2 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1'
												>
													<X size={12} />
													Anuluj
												</button>
											</div>
										</div>
									) : isReplyDeleted && !isReplyAuthor ? (
										<div className='text-zinc-500 italic text-xs py-1'>
											Odpowiedź została usunięta przez {reply.authorName}
											{reply.deletedAt && (
												<> - {new Date(reply.deletedAt).toLocaleDateString('pl-PL', {
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
											<p className={`text-xs whitespace-pre-wrap ${
												isReplyDeleted && isReplyAuthor ? 'text-zinc-500' : 'text-zinc-300'
											}`}>{reply.content}</p>
											{!isReplyDeleted && (
												<div className='mt-2'>
													<Reactions
														targetId={reply.commentId}
														compact={true}
														reactionCounts={localReactionCountsForReplies.get(reply.commentId) || reply.reactionCounts}
														userReactionTypeId={currentUserId ? userReactionsForReplies.get(reply.commentId) || null : null}
														onReactionClick={currentUserId ? (reactionTypeId) => handleReactionClick(reply.commentId, reactionTypeId, true) : undefined}
														getReactionUsers={getReactionUsers}
													/>
												</div>
											)}
										</>
									)}
								</div>
								{isReplyAuthor && !isReplyDeleted && (
									<div className='flex items-center gap-1'>
										{onEditComment && (
											<button
												onClick={() => {
													setEditingReplyId(reply.commentId)
													setEditReplyContent(reply.content)
												}}
												className='p-1 rounded-lg text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 transition-colors'
												title='Edytuj odpowiedź'
											>
												<Edit size={14} />
											</button>
										)}
										{onDeleteComment && (
											<button
												onClick={() => onDeleteComment(postId, reply.commentId)}
												className='p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors'
												title='Usuń odpowiedź'
											>
												<Trash2 size={14} />
											</button>
										)}
									</div>
								)}
								{isReplyAuthor && isReplyDeleted && onRestoreComment && (
									<button
										onClick={() => onRestoreComment(postId, reply.commentId)}
										className='p-1 rounded-lg text-zinc-400 hover:text-green-400 hover:bg-zinc-800 transition-colors'
										title='Przywróć odpowiedź'
									>
										<RotateCcw size={14} />
									</button>
								)}
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

