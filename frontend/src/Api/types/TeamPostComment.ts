export interface TeamPostCommentRequestDto {
	postId: number
	authorId: number
	parentCommentId?: number | null
	content: string
}

export interface TeamPostCommentResponseDto {
	commentId: number
	postId: number
	authorId: number
	authorName: string
	authorAvatarUrl: string | null
	parentCommentId: number | null
	content: string
	createdAt: string
	updatedAt: string
	isDeleted: boolean
	deletedAt: string | null
	replyIds: number[]
	reactionCounts?: Record<number, number>
}

export interface TeamPostCommentReactionRequestDto {
	userId: number
	commentId: number
	reactionTypeId: number
}

export interface TeamPostCommentReactionResponseDto {
	id: number
	userId: number
	userName?: string
	userAvatarUrl?: string | null
	commentId: number
	reactionType: {
		id: number
		name: string
		emoji: string
		description: string
	}
	createdAt: string
}

export interface TeamPostCommentPageResponse {
	content: TeamPostCommentResponseDto[]
	totalElements: number
	totalPages: number
	number: number
	size: number
	first: boolean
	last: boolean
	numberOfElements: number
	empty: boolean
}

