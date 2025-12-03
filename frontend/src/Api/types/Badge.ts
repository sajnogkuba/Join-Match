export type BadgeResponseDto = {
    id: number;
    code: string;
    name: string;
    description: string;
    iconUrl: string;
    conditionType: string;
    conditionValue: number;
    active: boolean;
    category: string;
};

export type UserBadgeResponseDto = {
    id: number;
    code: string;
    name: string;
    description: string;
    iconUrl: string;
    conditionType: string;
    conditionValue: number;
    active: boolean;
    category: string;
    owned: boolean;
    earnedAt: string | null;
};

