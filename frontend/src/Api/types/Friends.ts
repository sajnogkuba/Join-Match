export type Friend = {
    id: number;
    friendshipId: number;
    name: string;
    email: string;
    urlOfPicture: string | null;
};

export type SearchResult = {
    id: number;
    name: string;
    email: string;
    urlOfPicture: string | null;
    friendRequestStatus?: string;
};

export type PendingRequest = {
    requestId: number;
    senderId: number;
    receiverId: number;
    senderName: string;
    senderEmail: string;
    senderUrlOfPicture: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
};
