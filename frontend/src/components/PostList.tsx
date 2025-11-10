import { Loader2 } from 'lucide-react'
import type { TeamPostResponseDto } from '../Api/types/TeamPost'
import { PostItem } from './PostItem'
import type { TeamPostCommentResponseDto } from '../Api/types/TeamPostComment'

interface PostListProps {
	posts: TeamPostResponseDto[]
	loadingPosts: boolean
	hasNext: boolean
	onLoadMore: () => void
	currentUserId: number | null
	comments: Map<number, TeamPostCommentResponseDto[]>
	loadingComments: Map<number, boolean>
	showComments: Map<number, boolean>
	commentHasNext: Map<number, boolean>
	commentTexts: Map<number, string>
	onCommentTextChange: (postId: number, text: string) => void
	onToggleComments: (postId: number) => void
	onLoadMoreComments: (postId: number) => void
	onSubmitComment: (postId: number) => void
	postingComment: Map<number, boolean>
	showCommentEmojiPicker: Map<number, boolean>
	setShowCommentEmojiPicker: (postId: number, show: boolean) => void
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

export const PostList = ({
	posts,
	loadingPosts,
	hasNext,
	onLoadMore,
	currentUserId,
	comments,
	loadingComments,
	showComments,
	commentHasNext,
	commentTexts,
	onCommentTextChange,
	onToggleComments,
	onLoadMoreComments,
	onSubmitComment,
	postingComment,
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
}: PostListProps) => {
	if (loadingPosts && posts.length === 0) {
		return (
			<div className='flex items-center justify-center py-8'>
				<Loader2 className='animate-spin text-violet-400' size={24} />
				<span className='ml-2 text-zinc-400'>Ładowanie postów...</span>
			</div>
		)
	}

	if (posts.length === 0) {
		return (
			<div className='text-center py-8 rounded-lg border border-zinc-800 bg-zinc-900/40'>
				<p className='text-zinc-400'>Brak postów w dyskusji. Bądź pierwszy!</p>
			</div>
		)
	}

	return (
		<>
			{posts.map((post) => (
				<PostItem
					key={post.postId}
					post={post}
					currentUserId={currentUserId}
					comments={comments.get(post.postId) || []}
					loadingComments={loadingComments.get(post.postId) || false}
					showComments={showComments.get(post.postId) || false}
					commentHasNext={commentHasNext.get(post.postId) || false}
					commentText={commentTexts.get(post.postId) || ''}
					onCommentTextChange={(text) => onCommentTextChange(post.postId, text)}
					onToggleComments={() => onToggleComments(post.postId)}
					onLoadMoreComments={() => onLoadMoreComments(post.postId)}
					onSubmitComment={() => onSubmitComment(post.postId)}
					isSubmitting={postingComment.get(post.postId) || false}
					showCommentEmojiPicker={showCommentEmojiPicker.get(post.postId) || false}
					setShowCommentEmojiPicker={(show) => setShowCommentEmojiPicker(post.postId, show)}
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
				/>
			))}
			
			{hasNext && (
				<div className='flex justify-center pt-4'>
					<button
						onClick={onLoadMore}
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
	)
}

