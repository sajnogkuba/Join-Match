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

