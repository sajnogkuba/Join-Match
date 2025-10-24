import { useState, useEffect, useCallback } from "react";
import { Search, UserMinus, X, UserPlus } from "lucide-react";
import axiosInstance from "../Api/axios";

type Friend = {
    id: number;
    name: string;
    email: string;
    urlOfPicture: string | null;
};

type SearchResult = {
    id: number;
    name: string;
    email: string;
    urlOfPicture: string | null;
};

const FriendCard = ({ friend, onRemove }: { 
    friend: Friend; 
    onRemove: (id: number) => void;
}) => (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center">
                {friend.urlOfPicture ? (
                    <img 
                        src={friend.urlOfPicture} 
                        alt={friend.name}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <span className="text-zinc-300 font-medium text-lg">
                        {friend.name.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
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
}) => (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center">
                {user.urlOfPicture ? (
                    <img 
                        src={user.urlOfPicture} 
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <span className="text-zinc-300 font-medium text-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
            <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-sm text-zinc-400">{user.email}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => onAddFriend(user.id)}
                className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors"
                title="Dodaj do znajomych"
            >
                <UserPlus size={16} className="text-white" />
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

    const handleRemoveFriend = (friendId: number) => {
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
    };

    const handleAddFriend = (userId: number) => {
        // TODO: Implement add friend API call
        console.log("Add friend:", userId);
        // For now, just add to friends list (this should be replaced with actual API call)
        const userToAdd = searchResults.find(user => user.id === userId);
        if (userToAdd) {
            setFriends(prev => [...prev, userToAdd]);
        }
    };

    // Debounced search function
    const searchUsers = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await axiosInstance.get(`/auth/search?query=${encodeURIComponent(query)}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    // Debounce effect
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


                <div className="space-y-3 max-h-96 overflow-y-auto dark-scrollbar">
                    {filteredFriends.length === 0 ? (
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
