import { useEffect, useState, useMemo } from "react";
import api from "../Api/axios";
import type { BadgeResponseDto } from "../Api/types/Badge";
import { Loader2 } from "lucide-react";

type BadgeGroup = {
    category: string;
    badges: BadgeResponseDto[];
};

const BadgesSection: React.FC = () => {
    const [badges, setBadges] = useState<BadgeResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Grupowanie odznak według kategorii
    const groupedBadges = useMemo(() => {
        const groups = new Map<string, BadgeResponseDto[]>();
        
        badges.forEach((badge) => {
            const category = badge.category || "Inne";
            if (!groups.has(category)) {
                groups.set(category, []);
            }
            groups.get(category)!.push(badge);
        });

        // Sortowanie odznak w grupie (np. po conditionValue lub nazwie)
        const sortedGroups: BadgeGroup[] = Array.from(groups.entries())
            .map(([category, badges]) => ({
                category,
                badges: badges.sort((a, b) => {
                    // Sortuj po conditionValue jeśli istnieje, w przeciwnym razie po nazwie
                    if (a.conditionValue && b.conditionValue) {
                        return a.conditionValue - b.conditionValue;
                    }
                    return a.name.localeCompare(b.name);
                }),
            }))
            .sort((a, b) => {
                // "Podstawowe" zawsze pierwsze
                if (a.category === "Podstawowe") return -1;
                if (b.category === "Podstawowe") return 1;
                // Reszta alfabetycznie
                return a.category.localeCompare(b.category);
            });

        return sortedGroups;
    }, [badges]);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get<BadgeResponseDto[]>("/badge");
                setBadges(response.data || []);
            } catch (err: any) {
                if (err.response?.status === 204) {
                    // No Content - brak odznak
                    setBadges([]);
                } else {
                    setError("Nie udało się pobrać odznak.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBadges();
    }, []);

    return (
        <section className="space-y-6 flex flex-col h-full max-h-[calc(100vh-300px)]">
            <header className="flex items-end justify-between flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-semibold text-white">Odznaki</h2>
                    <p className="text-sm text-zinc-400">Twoje odznaki i osiągnięcia.</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 dark-scrollbar">
                {loading ? (
                    <div className="text-center py-16 text-zinc-400 flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Ładowanie…</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 text-red-400">{error}</div>
                ) : groupedBadges.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
                        <p>Brak dostępnych odznak.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groupedBadges.map((group) => (
                            <div key={group.category} className="space-y-4">
                                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">
                                    {group.category}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {group.badges.map((badge) => (
                                        <div
                                            key={badge.id}
                                            className="flex flex-col items-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition min-h-[180px]"
                                        >
                                            <div className="relative mb-3">
                                                <img
                                                    src={badge.iconUrl}
                                                    alt={badge.name}
                                                    className="w-16 h-16 object-contain filter grayscale"
                                                />
                                            </div>
                                            <h4 className="text-sm font-semibold text-white text-center mb-1 line-clamp-2 break-words">
                                                {badge.name}
                                            </h4>
                                            <p className="text-xs text-zinc-400 text-center line-clamp-5 break-words flex-grow">
                                                {badge.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default BadgesSection;

