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
	postType: string
	content: string
	contentHtml: string
	createdAt: string
	updatedAt: string
	isDeleted: boolean
	deletedAt: string | null
	mentionedUserIds: number[]
}

