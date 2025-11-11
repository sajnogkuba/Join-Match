import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import type { TeamPostResponseDto } from '../Api/types/TeamPost'
import { CommentSection } from './CommentSection'
import type { TeamPostCommentResponseDto } from '../Api/types/TeamPostComment'
import { Reactions } from './Reactions'

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
}: PostItemProps) => {
	return (
		<div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-900/60 transition-colors'>
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
			
			<div
				className='prose prose-invert max-w-none text-zinc-300 [&_*]:text-zinc-300 [&_strong]:text-white [&_em]:text-zinc-200 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_a]:text-violet-400 [&_a]:hover:text-violet-300 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_p]:my-2 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4 [&_.mention]:bg-violet-500/20 [&_.mention]:text-violet-300 [&_.mention]:px-1 [&_.mention]:rounded [&_.mention]:font-medium'
				dangerouslySetInnerHTML={{ __html: post.contentHtml }}
			/>
			
			<Reactions
				targetId={post.postId}
				onReactionClick={(reactionTypeId) => {
					// TODO: Implement reaction click handler when backend endpoints are ready
				}}
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
			/>
		</div>
	)
}

