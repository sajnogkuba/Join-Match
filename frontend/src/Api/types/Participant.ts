export interface Participant {
	id: number
	userId: number
	userEmail: string
	userName: string
	userAvatarUrl?: string | null
	skillLevel?: string
	attendanceStatusName: string
	attendanceStatusId: number
	eventId: number
	eventName: string
	isPaid: boolean
	sportRating?: number | null
}

export interface UserEventResponseDto {
	id: number
	userId: number
	userEmail: string
	userName: string
	userAvatarUrl: string
	attendanceStatusName: string
	eventId: number
	eventName: string
	isPaid: boolean
	sportRating: number | null
}

export interface UserEventPageResponse {
	content: UserEventResponseDto[]
	totalElements: number
	totalPages: number
	number: number
	size: number
	first: boolean
	last: boolean
	numberOfElements: number
	empty: boolean
}
