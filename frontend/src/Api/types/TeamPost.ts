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

