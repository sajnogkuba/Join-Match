export type SavedEventRef = { 
    id: number; 
    userId: number; 
    eventId: number; 
};

export type EventDetails = {
    eventId: number;
    eventName: string;
    numberOfParticipants: number;
    cost: number;
    currency: string;
    status: string;
    eventDate: string;
    scoreTeam1: number | null;
    scoreTeam2: number | null;
    sportTypeName: string;
    sportObjectName: string;
    sportObjectId: number;
    city: string;
    street: string;
    number: number | string;
    secondNumber: string | null;
    eventVisibilityId: number;
    eventVisibilityName: string;
    ownerId: number;
    ownerName: string;
    skillLevel: string;
    paymentMethod: string;
    imageUrl?: string;
};
