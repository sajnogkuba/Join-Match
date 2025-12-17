export type UserRankingItem = {
	userId: number
	userName: string
	userEmail: string
	userAvatarUrl: string | null
	averageRating: number
	totalRatings: number
	position: number
}

export type TeamRankingItem = {
	teamId: number
	teamName: string
	teamCity: string
	teamPhotoUrl: string | null
	leaderId: number
	leaderName: string
	leaderEmail: string
	leaderAvatarUrl: string | null
	memberCount: number
	position: number
}

export type EventRankingItem = {
	eventId: number
	eventName: string
	eventImageUrl: string | null
	eventCity: string
	sportTypeName: string
	ownerId: number
	ownerName: string
	ownerEmail: string
	ownerAvatarUrl: string | null
	averageRating: number
	totalRatings: number
	participantCount: number
	position: number
}

export type BadgeRankingItem = {
	userId: number
	userName: string
	userEmail: string
	userAvatarUrl: string | null
	badgeCount: number
	position: number
}

