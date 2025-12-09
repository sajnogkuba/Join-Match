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
