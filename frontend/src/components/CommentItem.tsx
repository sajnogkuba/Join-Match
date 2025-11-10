import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import type { TeamPostCommentResponseDto } from '../Api/types/TeamPostComment'
import { ReplyForm } from './ReplyForm'

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
}: CommentItemProps) => {
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
						<button
							onClick={onToggleReply}
							className='text-xs text-zinc-400 hover:text-violet-400 transition-colors mt-2'
						>
							{isReplying ? 'Anuluj odpowiedź' : 'Odpowiedz'}
						</button>
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
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

