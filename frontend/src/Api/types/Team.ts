export interface Team {
	idTeam: number
	name: string
	city: string
	sportType: string
	description: string | null
	leaderId: number
	leaderName: string
	photoUrl: string | null
	isBanned?: boolean
}

export interface TeamDetails {
	idTeam: number
	name: string
	city: string
	sportType: string
	description: string | null
	leaderId: number
	leaderName: string
	leaderAvatarUrl: string | null
	photoUrl: string | null
	memberCount: number
	createdAt: string | null
	isBanned?: boolean
}

