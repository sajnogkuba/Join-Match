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
    comment: string
    createdAt: string
    raterName: string
  }
  
  export interface EventRatingResponse {
    id: number
    rating: number
    comment: string
    createdAt: string
    userName: string
  }