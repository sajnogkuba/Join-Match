import { useEffect, useState } from "react";
import api from "../Api/axios";
import Avatar from "./Avatar";
import StarRatingDisplay from "./StarRatingDisplay";
import { parseLocalDate } from "../utils/formatDate";
import type { UserRatingResponse } from "../Api/types/Rating";
import { getCookie } from "../utils/cookies";
import ReportRatingModal from "../components/ReportRatingModal";
import { Flag } from "lucide-react";
import { toast } from "sonner";

interface RatingsSectionProps {
    userId: number | null;
}

const RatingsSection = ({ userId }: RatingsSectionProps) => {
    const [userRatings, setUserRatings] = useState<UserRatingResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [ratingToReport, setRatingToReport] = useState<UserRatingResponse | null>(null);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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

    const openReportModal = (rating: UserRatingResponse) => {
        setRatingToReport(rating);
        setShowReportModal(true);
    };

    const handleSubmitReport = async (message: string) => {
        if (!ratingToReport) return;

        const token = getCookie("accessToken");
        if (!token) {
            toast.error("Musisz być zalogowany, aby zgłosić opinię.");
            return;
        }

        try {
            setIsSubmittingReport(true);
            await api.post("/ratings/report/userRating", {
                token,
                idUserRating: ratingToReport.id,
                description: message,
            });

            toast.success("Dziękujemy, zgłoszenie opinii zostało wysłane do moderacji.");
            setShowReportModal(false);
            setRatingToReport(null);
        } catch (e: any) {
            console.error("❌ Błąd wysyłania zgłoszenia opinii użytkownika:", e);
            if (e?.response?.status === 400) {
                toast.error("Nie udało się wysłać zgłoszenia (400).");
            } else {
                toast.error("Nie udało się wysłać zgłoszenia opinii.");
            }
        } finally {
            setIsSubmittingReport(false);
        }
    };

    if (!userId) {
        return (
            <section className="space-y-6">
                <h3 className="text-white text-xl font-semibold">Oceny użytkownika</h3>
                <p className="text-sm text-zinc-400">Nie udało się załadować danych użytkownika.</p>
            </section>
        );
    }

    return (
        <>
            <section className="space-y-6">
                <h3 className="text-white text-xl font-semibold">Oceny użytkownika</h3>
                {loading ? (
                    <p className="text-sm text-zinc-400">Ładowanie ocen…</p>
                ) : userRatings.length ? (
                    <ul className="space-y-3">
                        {userRatings.map((r) => (
                            <li
                                key={r.id}
                                className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={r.raterAvatarUrl || null}
                                            name={r.raterName}
                                            size="sm"
                                            className="ring-1 ring-zinc-700"
                                        />
                                        <div className="text-white text-sm font-medium">
                                            {r.raterName}
                                        </div>
                                    </div>
                                    <span className="text-xs text-zinc-500">
                                        {parseLocalDate(r.createdAt).format(
                                            "DD.MM.YYYY HH:mm"
                                        )}
                                    </span>
                                </div>
                                <StarRatingDisplay value={r.rating} size={18} />
                                {r.comment && (
                                    <p className="text-sm text-zinc-300 mt-2">
                                        {r.comment}
                                    </p>
                                )}

                                {/* Przyciski akcji pod opinią */}
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => openReportModal(r)}
                                        className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200"
                                    >
                                        <Flag size={12} />
                                        Zgłoś opinię
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-zinc-500 text-sm italic">
                        Brak ocen dla tego użytkownika.
                    </p>
                )}
            </section>

            {showReportModal && ratingToReport && (
                <ReportRatingModal
                    isOpen={showReportModal}
                    onClose={() => {
                        setShowReportModal(false);
                        setRatingToReport(null);
                    }}
                    rating={{
                        id: ratingToReport.id,
                        userName: ratingToReport.raterName,
                        raterAvatarUrl: ratingToReport.raterAvatarUrl || undefined,
                        rating: ratingToReport.rating,
                        comment: ratingToReport.comment,
                    }}
                    onSubmit={handleSubmitReport}
                    isSubmitting={isSubmittingReport}
                />
            )}
        </>
    );
};

export default RatingsSection;
