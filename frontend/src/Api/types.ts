export interface JwtResponse {
	token: string
	refreshToken: string
	email: string
}

export interface Event {
	eventId: number;
	eventName: string;
	numberOfParticipants: number;
	cost: number;
	ownerId: number;
	sportObjectName: string;
	eventVisibilityId: number;
	status: 'planned' | 'ongoing' | 'finished';
	scoreTeam1: number | null;
	scoreTeam2: number | null;
	eventDate: Date;
	sportTypeName: string;
	bookedParticipants: number;
}
