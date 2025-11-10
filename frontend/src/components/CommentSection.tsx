import { useRef } from 'react'
import { Loader2 } from 'lucide-react'
import type { TeamPostCommentResponseDto } from '../Api/types/TeamPostComment'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'

interface CommentSectionProps {
	postId: number
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
}

export const CommentSection = ({
	postId,
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
}: CommentSectionProps) => {
	const commentEmojiPickerRef = useRef<HTMLDivElement>(null)

	return (
		<div className='mt-4 pt-4 border-t border-zinc-800'>
			<button
				onClick={onToggleComments}
				className='text-sm text-zinc-400 hover:text-violet-400 transition-colors mb-3'
			>
				{showComments ? 'Ukryj komentarze' : 'Pokaż komentarze'}
				{comments.length > 0 && (
					<span className='ml-2'>({comments.length})</span>
				)}
			</button>
			
			{showComments && (
				<div className='space-y-3 mb-4'>
					{loadingComments ? (
						<div className='flex items-center justify-center py-4'>
							<Loader2 className='animate-spin text-violet-400' size={18} />
							<span className='ml-2 text-zinc-400 text-sm'>Ładowanie komentarzy...</span>
						</div>
					) : comments.length > 0 ? (
						(() => {
							const { mainComments, repliesMap } = groupComments(comments)
							
							return mainComments.map((comment) => {
								const commentReplies = repliesMap.get(comment.commentId) || []
								const key = `${postId}-${comment.commentId}`
								const isReplying = replyingToComment.get(key) === comment.commentId
								const replyText = replyTexts.get(key) || ''
								const showReplyPicker = showReplyEmojiPicker.get(key) || false
								
								return (
									<CommentItem
										key={comment.commentId}
										comment={comment}
										replies={commentReplies}
										postId={postId}
										currentUserId={currentUserId}
										isReplying={isReplying}
										replyText={replyText}
										onReplyTextChange={(text) => onReplyTextChange(key, text)}
										onToggleReply={() => onToggleReply(key, comment.commentId)}
										onCancelReply={() => onCancelReply(key)}
										onSubmitReply={() => onSubmitReply(postId, comment.commentId)}
										isSubmitting={isSubmitting}
										showReplyEmojiPicker={showReplyPicker}
										setShowReplyEmojiPicker={(show) => setShowReplyEmojiPicker(key, show)}
										replyEmojiPickerRef={{ 
											get current() {
												return replyEmojiPickerRefs.current.get(key) || null
											},
											set current(value: HTMLDivElement | null) {
												if (value) {
													replyEmojiPickerRefs.current.set(key, value)
												} else {
													replyEmojiPickerRefs.current.delete(key)
												}
											}
										} as React.MutableRefObject<HTMLDivElement | null>}
									/>
								)
							})
						})()
					) : (
						<p className='text-zinc-400 text-sm text-center py-2'>Brak komentarzy</p>
					)}
					
					{commentHasNext && (
						<div className='flex justify-center pt-2'>
							<button
								onClick={onLoadMoreComments}
								disabled={loadingComments}
								className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm'
							>
								{loadingComments ? (
									<>
										<Loader2 size={16} className='animate-spin' />
										Ładowanie...
									</>
								) : (
									'Wczytaj więcej'
								)}
							</button>
						</div>
					)}
				</div>
			)}
			
			{currentUserId && (
				<CommentForm
					commentText={commentText}
					onCommentTextChange={onCommentTextChange}
					onSubmit={onSubmitComment}
					isSubmitting={isSubmitting}
					showEmojiPicker={showCommentEmojiPicker}
					setShowEmojiPicker={setShowCommentEmojiPicker}
					emojiPickerRef={commentEmojiPickerRef}
				/>
			)}
		</div>
	)
}
