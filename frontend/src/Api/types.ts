import { EventStatus } from './types/EventStatus'

export interface JwtResponse {
	token: string
	refreshToken: string
	email: string
}

export interface UpdatePhotoRequest {
	token: string
	photoUrl: string
}

export interface Event {
	eventId: number
	eventName: string
	numberOfParticipants: number
	cost: number
	ownerId: number
	sportObjectName: string
	eventVisibilityId: number
	status: EventStatus
	scoreTeam1: number | null
	scoreTeam2: number | null
	eventDate: Date
	sportTypeName: string
	bookedParticipants: number
	imageUrl?: string
	// Optional fields commonly returned by the API/UI
	coverUrl?: string
	city?: string
	currency?: string
	minLevel?: number
	isBanned?: boolean
	paymentMethods: string[]
	description?: string
}

export type EventDetails = {
	eventId: number
	eventName: string
	description?: string
	numberOfParticipants: number
	bookedParticipants: number
	isForTeam: boolean
	cost: number
	currency: string
	status: EventStatus
	eventDate: string
	scoreTeam1: number | null
	scoreTeam2: number | null

	sportTypeName: string
	sportTypeURL?: string | null
	sportObjectName: string

	sportObjectId: number
	city: string
	street: string
	number: number
	secondNumber: number | null

	eventVisibilityId: number
	eventVisibilityName: string

	ownerId: number
	ownerName: string
	ownerAvatarUrl?: string

	skillLevel: string
	paymentMethods: string[]
	imageUrl?: string

	latitude: number
	longitude: number
	isBanned?: boolean
	isAttendanceChecked: boolean;
}