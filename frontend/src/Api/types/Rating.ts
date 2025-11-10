export interface UserRatingRequest {
    raterId: number
    ratedId: number
    rating: number
    comment?: string
  }
  
  export interface EventRatingRequest {
    userId: number
    eventId: number
    rating: number
    comment?: string
  }
  
  export interface UserRatingResponse {
    id: number
    rating: number
    userEmail: string
    comment: string
    createdAt: string
    raterName: string
    raterAvatarUrl: string
  }
  
export interface EventRatingResponse {
    id: number
    rating: number
    comment: string
    createdAt: string
    userName: string
}

export interface OrganizerRatingRequest {
  raterId: number
  organizerId: number
  eventId: number
  rating: number
  comment?: string
}

export interface OrganizerRatingResponse {
  id: number
  rating: number
  comment: string
  createdAt: string
  raterName: string
  raterEmail: string
  raterAvatarUrl?: string
  eventId: number
  eventName: string
  raterId: number
}
