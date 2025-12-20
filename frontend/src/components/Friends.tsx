import { useState, useEffect, useCallback } from "react";
import { Search, UserMinus, X, UserPlus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../Api/axios";
import type { User } from "../Api/types/User";
import type { Friend, SearchResult, PendingRequest } from "../Api/types/Friends";
import Avatar from "./Avatar";

const FriendCard = ({ friend, onRemove }: { 
    friend: Friend; 
    onRemove: (friend: Friend) => void;
}) => (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <Link 
            to={`/profile/${friend.id}`}
            className="flex items-center gap-3 flex-1 hover:bg-zinc-800/30 rounded-lg p-2 -m-2 transition-colors"
        >
            <Avatar 
                src={friend.urlOfPicture} 
                name={friend.name}
                size="sm"
            />
            <div>
                <p className="text-white font-medium">{friend.name}</p>
                <p className="text-sm text-zinc-400">{friend.email}</p>
            </div>
        </Link>
        <div className="flex items-center gap-2">
            <button
                onClick={() => onRemove(friend)}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-red-600/20 transition-colors"
                title="Usuń znajomego"
            >
                <span className="flex items-center gap-1 sm:gap-2">
                    <UserMinus size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline text-xs sm:text-sm">Usuń znajomego</span>
                </span>
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
        <Link 
            to={`/profile/${user.id}`}
            className="flex items-center gap-3 flex-1 hover:bg-zinc-800/30 rounded-lg p-2 -m-2 transition-colors"
        >
            <Avatar 
                src={user.urlOfPicture} 
                name={user.name}
                size="sm"
            />
                <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
            </Link>
            <div className="flex items-center gap-2">
                {isPending ? (
                    <button
                        disabled
                        className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-zinc-600 text-zinc-400 cursor-not-allowed text-xs sm:text-sm font-medium"
                        title="Zaproszenie oczekuje na odpowiedź"
                    >
                        <UserPlus size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Oczekuje na odpowiedź</span>
                        <span className="sm:hidden">Oczekuje</span>
                    </button>
                ) : (
                    <button
                        onClick={() => onAddFriend(user.id)}
                        className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-xs sm:text-sm font-medium text-white"
                        title="Wyślij zaproszenie"
                    >
                        <UserPlus size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Wyślij zaproszenie</span>
                        <span className="sm:hidden">Wyślij</span>
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
        <Link 
            to={`/profile/${request.senderId}`}
            className="flex items-center gap-3 flex-1 hover:bg-zinc-800/30 rounded-lg p-2 -m-2 transition-colors"
        >
            <Avatar 
                src={request.senderUrlOfPicture} 
                name={request.senderName}
                size="sm"
            />
            <div>
                <p className="text-white font-medium">{request.senderName}</p>
                <p className="text-sm text-zinc-400">{request.senderEmail}</p>
            </div>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
            <button
                onClick={() => onAccept(request.requestId)}
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-xs sm:text-sm font-medium text-white"
                title="Zaakceptuj zaproszenie"
            >
                <span>✓</span>
                <span className="hidden sm:inline">Zaakceptuj</span>
            </button>
            <button
                onClick={() => onReject(request.requestId)}
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-zinc-600 hover:bg-zinc-500 transition-colors text-xs sm:text-sm font-medium text-white"
                title="Odrzuć zaproszenie"
            >
                <span>✗</span>
                <span className="hidden sm:inline">Odrzuć</span>
            </button>
        </div>
    </div>
);

const Friends = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchPopup, setShowSearchPopup] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<"friends" | "pending">("friends");
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null);

    useEffect(() => {
        axiosInstance.get<User>('/auth/user').then(response => {
            setCurrentUser(response.data);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!currentUser?.id) return;
        
        setIsInitialLoading(true);
        
        Promise.all([
            axiosInstance.get(`/friends/${currentUser.id}`),
            axiosInstance.get(`/friends/requests/${currentUser.id}`)
        ])
        .then(([friendsResponse, pendingResponse]) => {
            setFriends(friendsResponse.data);
            setPendingRequests(pendingResponse.data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            setFriends([]);
            setPendingRequests([]);
        })
        .finally(() => {
            setIsInitialLoading(false);
        });
    }, [currentUser]);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash === '#pending-requests') {
            setActiveTab('pending');
            setTimeout(() => {
                window.history.replaceState(null, '', window.location.pathname);
            }, 100);
        } else if (hash === '#friends') {
            setActiveTab('friends');
            setTimeout(() => {
                window.history.replaceState(null, '', window.location.pathname);
            }, 100);
        }
    }, []);


    const handleRemoveFriend = (friend: Friend) => {
        setFriendToDelete(friend);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteFriend = () => {
        if (!friendToDelete) return;
        
        axiosInstance.delete(`/friends/${friendToDelete.friendshipId}`)
            .then(() => {
                setFriends(prev => prev.filter(friend => friend.friendshipId !== friendToDelete.friendshipId));
                setShowDeleteConfirm(false);
                setFriendToDelete(null);
            })
            .catch(error => {
                console.error("Error deleting friendship:", error);
                setShowDeleteConfirm(false);
                setFriendToDelete(null);
            });
    };

    const cancelDeleteFriend = () => {
        setShowDeleteConfirm(false);
        setFriendToDelete(null);
    };

    const handleCloseSearchPopup = () => {
        setShowSearchPopup(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleAcceptRequest = (requestId: number) => {
        axiosInstance.patch(`/friends/request/${requestId}/accept`)
            .then(() => {
                setPendingRequests(prev => prev.filter(request => request.requestId !== requestId));
                if (currentUser?.id) {
                    setLoading(true);
                    axiosInstance.get(`/friends/${currentUser.id}`)
                        .then(response => {
                            setFriends(response.data);
                        })
                        .catch(error => {
                            console.error('Error reloading friends:', error);
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                }
            })
            .catch(error => {
                console.error("Error accepting friend request:", error);
            });
    };

    const handleRejectRequest = (requestId: number) => {
        axiosInstance.delete(`/friends/request/${requestId}`)
            .then(() => {
                setPendingRequests(prev => prev.filter(request => request.requestId !== requestId));
            })
            .catch(error => {
                console.error("Error rejecting friend request:", error);
            });
    };

    const handleAddFriend = (userId: number) => {
        axiosInstance.post(`/friends/request`, {
            senderId: currentUser?.id,
            receiverId: userId
        }).then(() => {
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

                <div className="space-y-3 max-h-96 overflow-y-auto dark-scrollbar">
                    {isInitialLoading ? (
                        <div className="grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10">
                            <div className="flex items-center gap-2 text-zinc-300">
                                <Loader2 className="animate-spin" /> Ładowanie…
                            </div>
                        </div>
                    ) : activeTab === "friends" ? (
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
                        pendingRequests.length === 0 ? (
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

            {showSearchPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleCloseSearchPopup}
                    />
                    
                    <div className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <h3 className="text-white text-xl font-semibold">Szukaj znajomych</h3>
                            <button
                                onClick={handleCloseSearchPopup}
                                className="p-2 rounded-xl hover:bg-zinc-800 transition-colors"
                            >
                                <X size={20} className="text-zinc-400 hover:text-white" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
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

            {showDeleteConfirm && friendToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={cancelDeleteFriend}
                    />
                    
                    <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <h3 className="text-white text-xl font-semibold">Usuń znajomego</h3>
                            <button
                                onClick={cancelDeleteFriend}
                                className="p-2 rounded-xl hover:bg-zinc-800 transition-colors"
                            >
                                <X size={20} className="text-zinc-400 hover:text-white" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-zinc-300 mb-6">
                                Czy na pewno chcesz usunąć <span className="text-white font-medium">{friendToDelete.name}</span> ze znajomych?
                            </p>
                            
                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    onClick={cancelDeleteFriend}
                                    className="flex-1 rounded-xl border border-zinc-700 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={confirmDeleteFriend}
                                    className="flex-1 rounded-xl bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-500 transition-colors"
                                >
                                    Usuń znajomego
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Friends;
