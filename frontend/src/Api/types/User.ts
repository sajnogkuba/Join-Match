export interface User {
    id: number;
    name: string;
    email: string;
    dateOfBirth: Date;
    urlOfPicture: string;
  }
  export interface SportInfo {
    id: number;
    name: string;
    level: string;
  }
  
  export interface FriendInfo {
    id: number;
    name: string;
    email: string;
    urlOfPicture: string | null;
  }
  
  export interface UsersResponse {
    id: number;
    name: string;
    email: string;
    dateOfBirth: string;
    urlOfPicture: string;
    sports: SportInfo[];
    friends: FriendInfo[];
  }
  