import { useState, useEffect } from "react";
import { UserPlus, Search, MessageCircle, UserMinus } from "lucide-react";

type Friend = {
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

const Friends = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [newFriendEmail, setNewFriendEmail] = useState("");

    // Mock data for now - replace with actual API calls
    useEffect(() => {
        const mockFriends: Friend[] = [
            {
                id: 1,
                name: "Jan Kowalski",
                email: "jan.kowalski@example.com",
                urlOfPicture: null
            },
            {
                id: 2,
                name: "Anna Nowak",
                email: "anna.nowak@example.com",
                urlOfPicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=100&auto=format&fit=crop"
            },
            {
                id: 3,
                name: "Piotr Wiśniewski",
                email: "piotr.wisniewski@example.com",
                urlOfPicture: null
            }
        ];
        
        setTimeout(() => {
            setFriends(mockFriends);
            setLoading(false);
        }, 1000);
    }, []);

    const handleRemoveFriend = (friendId: number) => {
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
    };

    const handleMessage = (friendId: number) => {
        // TODO: Implement messaging functionality
        console.log("Message friend:", friendId);
    };

    const handleAddFriend = async () => {
        if (!newFriendEmail.trim()) return;
        
        // TODO: Implement add friend API call
        console.log("Add friend:", newFriendEmail);
        setNewFriendEmail("");
        setShowAddFriend(false);
    };

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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-white text-xl font-semibold">Znajomi</h3>
                <button
                    onClick={() => setShowAddFriend(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                >
                    <UserPlus size={16} />
                    Dodaj znajomego
                </button>
            </div>

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

            {showAddFriend && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <h4 className="text-white font-medium mb-3">Dodaj znajomego</h4>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Adres e-mail znajomego"
                            value={newFriendEmail}
                            onChange={(e) => setNewFriendEmail(e.target.value)}
                            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-white placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                        <button
                            onClick={handleAddFriend}
                            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                        >
                            Wyślij zaproszenie
                        </button>
                        <button
                            onClick={() => setShowAddFriend(false)}
                            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                        >
                            Anuluj
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {filteredFriends.length === 0 ? (
                    <div className="text-center py-8">
                        <UserPlus size={48} className="mx-auto text-zinc-600 mb-4" />
                        <p className="text-zinc-400">
                            {searchQuery ? "Nie znaleziono znajomych" : "Brak znajomych"}
                        </p>
                        {!searchQuery && (
                            <p className="text-sm text-zinc-500 mt-1">
                                Dodaj pierwszego znajomego, aby rozpocząć
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
    );
};

export default Friends;
