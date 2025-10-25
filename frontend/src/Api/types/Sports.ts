export type SportTypeOption = { 
    id: number; 
    name: string; 
    url: string; 
};

export type UserSport = { 
    id: number; 
    name: string; 
    level: number; 
    url: string; 
    isMain?: boolean; 
};

export type UserSportsResponse = {
    sports: { 
        sportId: number; 
        name: string; 
        url: string; 
        rating: number; 
        isMain?: boolean; 
    }[];
};
