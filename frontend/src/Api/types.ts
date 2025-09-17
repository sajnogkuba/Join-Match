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

export type EventDetails = {
	eventId: number;
	eventName: string;
	numberOfParticipants: number;
	cost: number;
	currency: string;
	status: 'planned' | 'in_progress' | 'finished' | 'cancelled';
	eventDate: string;      // ISO
	scoreTeam1: number | null;
	scoreTeam2: number | null;
  
	sportTypeName: string;
	sportObjectName: string;
  
	sportObjectId: number;
	city: string;
	street: string;
	number: number;
	secondNumber: number | null;
	capacity: number;
  
	eventVisibilityId: number;
	eventVisibilityName: string;
  
	ownerId: number;
	ownerName: string;
  
	skillLevel: string;
	paymentMethod: string;
  };
  