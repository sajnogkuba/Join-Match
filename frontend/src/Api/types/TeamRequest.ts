export type TeamRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface TeamRequestResponseDto {
	requestId: number
	receiverId: number
	teamId: number
	status: TeamRequestStatus
	createdAt: string
	updatedAt: string
}

export interface TeamRequestRequestDto {
	receiverId: number
	teamId: number
}

