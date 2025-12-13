export const EventStatus = {
	PLANNED: 'PLANNED',
	FINISHED: 'FINISHED',
	CANCELED: 'CANCELED',
} as const

export type EventStatus = typeof EventStatus[keyof typeof EventStatus]