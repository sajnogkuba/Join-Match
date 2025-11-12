export type PostType = 'TEXT' | 'IMAGE' | 'POLL' | 'SYSTEM'

export interface TeamPostRequestDto {
	teamId: number
	authorId: number
	content: string
	contentHtml?: string
	postType?: PostType
	mentionedUserIds?: number[]
}

export interface TeamPostResponseDto {
	postId: number
	teamId: number
	authorId: number
	authorName: string
	authorAvatarUrl: string | null
	postType: string
	content: string
	contentHtml: string
	createdAt: string
	updatedAt: string
	isDeleted: boolean
	deletedAt: string | null
	mentionedUserIds: number[]
	reactionCounts?: Record<number, number>
}

export interface TeamPostReactionRequestDto {
	userId: number
	postId: number
	reactionTypeId: number
}

export interface TeamPostReactionResponseDto {
	id: number
	userId: number
	postId: number
	reactionType: {
		id: number
		name: string
		emoji: string
		description: string
	}
	createdAt: string
}

export interface TeamPostPageResponse {
	content: TeamPostResponseDto[]
	totalElements: number
	totalPages: number
	number: number
	size: number
	first: boolean
	last: boolean
	numberOfElements: number
	empty: boolean
}

