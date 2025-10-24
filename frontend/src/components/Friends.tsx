import { useState, useEffect, useCallback } from "react";
import { Search, UserMinus, X, UserPlus } from "lucide-react";
import axiosInstance from "../Api/axios";
import type { User } from "../Api/types/User";
import type { Friend, SearchResult, PendingRequest } from "../Api/types/Friends";
import Avatar from "./Avatar";

const FriendCard = ({ friend, onRemove }: { 
    friend: Friend; 
    onRemove: (id: number) => void;
}) => (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-3">
            <Avatar 
                src={friend.urlOfPicture} 
                name={friend.name}
                size="sm"
            />
            <div>
                <p className="text-white font-medium">{friend.name}</p>
                <p className="text-sm text-zinc-400">{friend.email}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => onRemove(friend.id)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-red-600/20 transition-colors"
                title="Usuń ze znajomych"
            >
                <UserMinus size={16} className="text-zinc-300 hover:text-red-400" />
            </button>
        </div>
    </div>
);

const SearchResultCard = ({ user, onAddFriend }: { 
    user: SearchResult; 
    onAddFriend: (id: number) => void;
}) => {
    const isPending = user.friendRequestStatus === "PENDING";
    
    return (
        <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-3">
            <Avatar 
                src={user.urlOfPicture} 
                name={user.name}
                size="sm"
            />
                <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isPending ? (
                    <button
                        disabled
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-600 text-zinc-400 cursor-not-allowed text-sm font-medium"
                        title="Zaproszenie oczekuje na odpowiedź"
                    >
                        <UserPlus size={16} />
                        Oczekuje na odpowiedź
                    </button>
                ) : (
                    <button
                        onClick={() => onAddFriend(user.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-sm font-medium text-white"
                        title="Wyślij zaproszenie"
                    >
                        <UserPlus size={16} />
                        Wyślij zaproszenie
                    </button>
                )}
            </div>
        </div>
    );
};

const PendingRequestCard = ({ request, onAccept, onReject }: { 
    request: PendingRequest; 
    onAccept: (id: number) => void;
    onReject: (id: number) => void;
}) => (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-3">
            <Avatar 
                src={request.senderUrlOfPicture} 
                name={request.senderName}
                size="sm"
            />
            <div>
                <p className="text-white font-medium">{request.senderName}</p>
                <p className="text-sm text-zinc-400">{request.senderEmail}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => onAccept(request.requestId)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-sm font-medium text-white"
                title="Zaakceptuj zaproszenie"
            >
                ✓ Zaakceptuj
            </button>
            <button
                onClick={() => onReject(request.requestId)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-600 hover:bg-zinc-500 transition-colors text-sm font-medium text-white"
                title="Odrzuć zaproszenie"
            >
                ✗ Odrzuć
            </button>
        </div>
    </div>
);

const Friends = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchPopup, setShowSearchPopup] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<"friends" | "pending">("friends");
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [pendingLoading, setPendingLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        axiosInstance.get<User>('/auth/user', { params: { token } }).then(response => {
            setCurrentUser(response.data);
        });
    }, []);

    // Fetch pending requests when currentUser is loaded
    useEffect(() => {
        if (!currentUser?.id) return;
        
        setPendingLoading(true);
        axiosInstance.get(`/friends/requests/${currentUser.id}`)
            .then(response => {
                setPendingRequests(response.data);
            })
            .catch(error => {
                console.error('Error fetching pending requests:', error);
                setPendingRequests([]);
            })
            .finally(() => {
                setPendingLoading(false);
            });
    }, [currentUser]);


    const handleRemoveFriend = (friendId: number) => {
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
    };

    const handleAcceptRequest = (requestId: number) => {
        console.log("Accepting friend request:", requestId);
        // TODO: Implement accept friend request API call
        // For now, just remove from pending requests
        setPendingRequests(prev => prev.filter(request => request.requestId !== requestId));
    };

    const handleRejectRequest = (requestId: number) => {
        console.log("Rejecting friend request:", requestId);
        // TODO: Implement reject friend request API call
        // For now, just remove from pending requests
        setPendingRequests(prev => prev.filter(request => request.requestId !== requestId));
    };

    const handleAddFriend = (userId: number) => {
        console.log("Add friend clicked for user ID:", userId);
        console.log(localStorage.getItem('accessToken'));
        console.log(currentUser);
        
        axiosInstance.post(`/friends/request`, {
            senderId: currentUser?.id,
            receiverId: userId
        }).then(response => {
            console.log(response.data);
            
            // Update the search results to show PENDING status for this user
            setSearchResults(prev => 
                prev.map(user => 
                    user.id === userId 
                        ? { ...user, friendRequestStatus: "PENDING" }
                        : user
                )
            );
        }).catch(error => {
            console.error("Error sending friend request:", error);
        });
    };

    const searchUsers = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }


        if (!currentUser?.id) {
            console.log("Current user not loaded yet, skipping search");
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await axiosInstance.get(`/auth/search?query=${encodeURIComponent(query)}&senderId=${currentUser.id}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchUsers(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchUsers]);



    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-white text-xl font-semibold">Znajomi</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                            <div className="h-12 w-12 rounded-full bg-zinc-700 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-zinc-700 rounded animate-pulse w-32" />
                                <div className="h-3 bg-zinc-700 rounded animate-pulse w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-white text-xl font-semibold">Znajomi</h3>
                    <button
                        onClick={() => setShowSearchPopup(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                    >
                        <Search size={16} />
                        Szukaj znajomych
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 rounded-xl bg-zinc-800/60 p-1">
                    <button
                        onClick={() => setActiveTab("friends")}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === "friends"
                                ? "bg-violet-600 text-white"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                        }`}
                    >
                        Aktualni znajomi
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === "pending"
                                ? "bg-violet-600 text-white"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                        }`}
                    >
                        Oczekujące zaproszenia
                    </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-3 max-h-96 overflow-y-auto dark-scrollbar">
                    {activeTab === "friends" ? (
                        // Current Friends Tab
                        filteredFriends.length === 0 ? (
                            <div className="text-center py-8">
                                <Search size={48} className="mx-auto text-zinc-600 mb-4" />
                                <p className="text-zinc-400">
                                    {searchQuery ? "Nie znaleziono znajomych" : "Brak znajomych"}
                                </p>
                                {!searchQuery && (
                                    <p className="text-sm text-zinc-500 mt-1">
                                        Użyj wyszukiwania, aby znaleźć znajomych
                                    </p>
                                )}
                            </div>
                        ) : (
                            filteredFriends.map(friend => (
                                <FriendCard
                                    key={friend.id}
                                    friend={friend}
                                    onRemove={handleRemoveFriend}
                                />
                            ))
                        )
                    ) : (
                        // Pending Requests Tab
                        pendingLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
                                <p className="text-zinc-400">Ładowanie zaproszeń...</p>
                            </div>
                        ) : pendingRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <Search size={48} className="mx-auto text-zinc-600 mb-4" />
                                <p className="text-zinc-400">Brak oczekujących zaproszeń</p>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Oczekujące zaproszenia znajomych pojawią się tutaj
                                </p>
                            </div>
                        ) : (
                            pendingRequests.map(request => (
                                <PendingRequestCard
                                    key={request.requestId}
                                    request={request}
                                    onAccept={handleAcceptRequest}
                                    onReject={handleRejectRequest}
                                />
                            ))
                        )
                    )}
                </div>
            </div>

            {/* Search Friends Popup */}
            {showSearchPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowSearchPopup(false)}
                    />
                    
                    {/* Popup Container */}
                    <div className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <h3 className="text-white text-xl font-semibold">Szukaj znajomych</h3>
                            <button
                                onClick={() => setShowSearchPopup(false)}
                                className="p-2 rounded-xl hover:bg-zinc-800 transition-colors"
                            >
                                <X size={20} className="text-zinc-400 hover:text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Szukaj znajomych..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-10 py-3 text-white placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                />
                            </div>

                            {/* Search Results */}
                            <div className="max-h-80 overflow-y-auto space-y-3 dark-scrollbar">
                                {searchLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
                                        <p className="text-zinc-400">Szukanie...</p>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Search size={48} className="mx-auto text-zinc-600 mb-4" />
                                        <p className="text-zinc-400">
                                            {searchQuery ? "Nie znaleziono użytkowników" : "Wpisz nazwę lub email użytkownika"}
                                        </p>
                                    </div>
                                ) : (
                                    searchResults.map(user => (
                                        <SearchResultCard
                                            key={user.id}
                                            user={user}
                                            onAddFriend={handleAddFriend}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Friends;
