import { useEffect, useState } from "react";
import api from "../Api/axios";
import Avatar from "./Avatar";
import StarRatingDisplay from "./StarRatingDisplay";
import { parseLocalDate } from "../utils/formatDate";
import type { UserRatingResponse } from "../Api/types/Rating";

interface RatingsSectionProps {
    userId: number | null;
}

const RatingsSection = ({ userId }: RatingsSectionProps) => {
    const [userRatings, setUserRatings] = useState<UserRatingResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        
        setLoading(true);
        api
            .get(`/ratings/user/${userId}`)
            .then(({ data }) => {
                setUserRatings(data || []);
            })
            .catch(() => {
                setUserRatings([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    if (!userId) {
        return (
            <section className="space-y-6">
                <h3 className="text-white text-xl font-semibold">Oceny użytkownika</h3>
                <p className="text-sm text-zinc-400">Nie udało się załadować danych użytkownika.</p>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <h3 className="text-white text-xl font-semibold">Oceny użytkownika</h3>
            {loading ? (
                <p className="text-sm text-zinc-400">Ładowanie ocen…</p>
            ) : userRatings.length ? (
                <ul className="space-y-3">
                    {userRatings.map((r) => (
                        <li key={r.id} className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-3">
                                    <Avatar src={r.raterAvatarUrl || null} name={r.raterName} size="sm" className="ring-1 ring-zinc-700" />
                                    <div className="text-white text-sm font-medium">{r.raterName}</div>
                                </div>
                                <span className="text-xs text-zinc-500">{parseLocalDate(r.createdAt).format("DD.MM.YYYY HH:mm")}</span>
                            </div>
                            <StarRatingDisplay value={r.rating} size={18} />
                            {r.comment && <p className="text-sm text-zinc-300 mt-2">{r.comment}</p>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-zinc-500 text-sm italic">Brak ocen dla tego użytkownika.</p>
            )}
        </section>
    );
};

export default RatingsSection;

