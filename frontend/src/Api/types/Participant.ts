export interface Participant {
	id: number
	userId: number
	userEmail: string
	userName: string
	userAvatarUrl?: string | null
	skillLevel?: string
	attendanceStatusName: string
	eventId: number
	eventName: string
	isPaid: boolean
}
