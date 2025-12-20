import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Eye, Check, X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../Api/axios.tsx";
import { getCookie } from "../utils/cookies";

type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    last: boolean;
    first: boolean;
    empty: boolean;
};

// DTO z backendu (ModeratorUserReportDto)
type ModeratorUserReportDto = {
    id: number;

    reportedUserId: number;
    reportedUserEmail: string;
    reportedUsername: string;
    reportedUserAvatarUrl: string | null;

    reporterUserId: number;
    reporterUserEmail: string;
    reporterUsername: string;
    reporterAvatarUrl: string | null;

    description: string;
    active: boolean;
    viewed: boolean;
};

// Typ używany w FE
type ReportedUserItem = {
    id: number;

    reportedUserId: number;
    reportedUserEmail: string;
    reportedUsername: string;
    reportedUserAvatarUrl: string | null;

    reporterId: number;
    reporterUserEmail: string;
    reporterUsername: string;
    reporterAvatarUrl: string | null;

    description: string;
    active: boolean;
    viewed: boolean;
};

const PAGE_SIZE = 20;

const ModeratorReportedUsersTab: React.FC = () => {
    const [reports, setReports] = useState<ReportedUserItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNext, setHasNext] = useState(false);

    const currentPageRef = useRef(0);
    const observerTargetRef = useRef<HTMLDivElement | null>(null);

    const loggedEmail =
        typeof window !== "undefined" ? getCookie("email") : null;

    const getUserProfileLink = (
        email: string | null | undefined,
        id: number
    ) => {
        if (!loggedEmail || !email) return `/profile/${id}`;
        return email === loggedEmail ? `/profile` : `/profile/${id}`;
    };

    const fetchReports = useCallback(
        async (pageNum: number, append: boolean = false) => {
            try {
                if (!append) setLoading(true);
                else setLoadingMore(true);
                setError(null);

                const res = await axiosInstance.get<
                    PageResponse<ModeratorUserReportDto>
                >(
                    `/moderator/reportUsers?page=${pageNum}&size=${PAGE_SIZE}`
                );

                const mapped: ReportedUserItem[] = res.data.content.map(
                    (item) => ({
                        id: item.id,

                        reportedUserId: item.reportedUserId,
                        reportedUserEmail: item.reportedUserEmail,
                        reportedUsername: item.reportedUsername,
                        reportedUserAvatarUrl: item.reportedUserAvatarUrl,

                        reporterId: item.reporterUserId,
                        reporterUserEmail: item.reporterUserEmail,
                        reporterUsername: item.reporterUsername,
                        reporterAvatarUrl: item.reporterAvatarUrl,

                        description: item.description,
                        active: !!item.active,
                        viewed: !!item.viewed,
                    })
                );

                if (append) {
                    setReports((prev) => [...prev, ...mapped]);
                } else {
                    setReports(mapped);
                }

                setHasNext(!res.data.last);
                currentPageRef.current = res.data.number;
            } catch (e) {
                console.error(e);
                setError("Nie udało się załadować zgłoszonych użytkowników.");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchReports(0, false);
    }, [fetchReports]);

    useEffect(() => {
        if (!hasNext) return;

        const target = observerTargetRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !loadingMore && hasNext) {
                    fetchReports(currentPageRef.current + 1, true);
                }
            },
            { threshold: 1 }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [hasNext, loadingMore, fetchReports]);

    const filteredReports = useMemo(() => {
        const q = "".toLowerCase();
        if (!q) return reports;

        return reports.filter((r) => {
            const reportedName = (r.reportedUsername ?? "").toLowerCase();
            const reporterName = (r.reporterUsername ?? "").toLowerCase();
            const reportedEmail = (r.reportedUserEmail ?? "").toLowerCase();
            const reporterEmail = (r.reporterUserEmail ?? "").toLowerCase();

            return (
                reportedName.includes(q) ||
                reporterName.includes(q) ||
                reportedEmail.includes(q) ||
                reporterEmail.includes(q)
            );
        });
    }, [reports]);

    // ==== AKCJE ====

    const handleAccept = async (id: number) => {
        try {
            await axiosInstance.patch(
                `/moderator/reportUser/${id}/accept`
            );
            setReports((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, active: true, viewed: true } : r
                )
            );
        } catch (e) {
            console.error(e);
            alert("Nie udało się zaakceptować zgłoszenia użytkownika.");
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axiosInstance.patch(
                `/moderator/reportUser/${id}/reject`
            );
            setReports((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, active: false, viewed: true } : r
                )
            );
        } catch (e) {
            console.error(e);
            alert("Nie udało się odrzucić zgłoszenia użytkownika.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Na pewno usunąć to zgłoszenie użytkownika?")) return;

        try {
            await axiosInstance.delete(
                `/moderator/reportUser/${id}/delete`
            );
            setReports((prev) => prev.filter((r) => r.id !== id));
        } catch (e) {
            console.error(e);
            alert("Nie udało się usunąć zgłoszenia użytkownika.");
        }
    };

    const handleToggleViewed = async (report: ReportedUserItem) => {
        const { id, viewed } = report;

        try {
            if (!viewed) {
                await axiosInstance.patch(
                    `/moderator/reportUser/${id}/toggle-viewed`
                );
                setReports((prev) =>
                    prev.map((r) =>
                        r.id === id ? { ...r, viewed: true } : r
                    )
                );
            } else {
                await axiosInstance.patch(
                    `/moderator/reportUser/${id}/toggle-unviewed`
                );
                setReports((prev) =>
                    prev.map((r) =>
                        r.id === id ? { ...r, viewed: false } : r
                    )
                );
            }
        } catch (e) {
            console.error(e);
            alert("Nie udało się zmienić statusu przeczytania zgłoszenia.");
        }
    };

    return (
        <section className="p-4 md:p-0">

            {error && <p className="text-red-400 mb-2">{error}</p>}

            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="min-w-full text-sm">
                    <thead className="bg-zinc-900/60">
                    <tr className="text-zinc-400">
                        <th className="text-left px-4 py-3">Zgłaszający</th>
                        <th className="text-left px-4 py-3">Zgłoszony użytkownik</th>
                        <th className="text-left px-4 py-3">Opis zgłoszenia</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-right px-4 py-3">Akcje</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading && reports.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-4 py-6 text-center text-zinc-400"
                            >
                                Ładowanie…
                            </td>
                        </tr>
                    )}

                    {filteredReports.map((r) => {
                        const isUnseen = !r.viewed;

                        return (
                            <tr
                                key={r.id}
                                className="border-t border-zinc-800"
                            >
                                {/* Zgłaszający */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {r.reporterAvatarUrl && (
                                            <img
                                                src={r.reporterAvatarUrl}
                                                alt={r.reporterUsername}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        )}
                                        <div className="flex flex-col">
                                            <Link
                                                to={getUserProfileLink(
                                                    r.reporterUserEmail,
                                                    r.reporterId
                                                )}
                                                className={
                                                    isUnseen
                                                        ? "font-semibold text-white hover:text-violet-300 transition"
                                                        : "font-medium text-zinc-100 hover:text-violet-300 transition"
                                                }
                                            >
                                                {r.reporterUsername}
                                            </Link>
                                            <span
                                                className={
                                                    "text-xs text-zinc-500 " +
                                                    (isUnseen ? "font-semibold" : "")
                                                }
                                            >
                                                {r.reporterUserEmail}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* Zgłoszony użytkownik */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {r.reportedUserAvatarUrl && (
                                            <img
                                                src={r.reportedUserAvatarUrl}
                                                alt={r.reportedUsername}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        )}
                                        <div className="flex flex-col">
                                            <Link
                                                to={getUserProfileLink(
                                                    r.reportedUserEmail,
                                                    r.reportedUserId
                                                )}
                                                className={
                                                    isUnseen
                                                        ? "font-semibold text-white hover:text-violet-300 transition"
                                                        : "font-medium text-zinc-100 hover:text-violet-300 transition"
                                                }
                                            >
                                                {r.reportedUsername}
                                            </Link>
                                            <span className="text-xs text-zinc-500">
                                                {r.reportedUserEmail}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* Opis zgłoszenia */}
                                <td className="px-4 py-3 max-w-xs">
                                    <p
                                        className={
                                            "text-xs line-clamp-3 " +
                                            (isUnseen
                                                ? "text-zinc-100 font-semibold"
                                                : "text-zinc-200")
                                        }
                                    >
                                        {r.description}
                                    </p>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                                r.active
                                                    ? "bg-violet-500/15 text-violet-300 border-violet-500/40"
                                                    : "bg-zinc-700/30 text-zinc-300 border-zinc-600/60"
                                            }`}
                                        >
                                            {r.active ? "Aktywne" : "Nieaktywne"}
                                        </span>
                                </td>

                                {/* Akcje */}
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleAccept(r.id)}
                                            className="p-2 rounded-lg border border-emerald-600/60 hover:bg-emerald-600/20 hover:border-emerald-500 transition"
                                            title="Akceptuj zgłoszenie użytkownika"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => handleReject(r.id)}
                                            className="p-2 rounded-lg border border-red-600/60 hover:bg-red-600/20 hover:border-red-500 transition"
                                            title="Odrzuć zgłoszenie użytkownika"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition"
                                            title="Usuń zgłoszenie użytkownika"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleToggleViewed(r)
                                            }
                                            className={`p-2 rounded-lg border transition ${
                                                isUnseen
                                                    ? "border-blue-500/70 hover:bg-blue-600/20"
                                                    : "border-zinc-700 hover:bg-zinc-800"
                                            }`}
                                            title={
                                                isUnseen
                                                    ? "Oznacz jako przeczytane"
                                                    : "Oznacz jako nieprzeczytane"
                                            }
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            <div
                ref={observerTargetRef}
                className="h-12 flex items-center justify-center text-xs text-zinc-500"
            >
                {loadingMore
                    ? "Wczytywanie…"
                    : hasNext
                        ? "Przewiń niżej aby wczytać więcej…"
                        : reports.length > 0
                            ? "Załadowano wszystkie zgłoszenia użytkowników."
                            : null}
            </div>
        </section>
    );
};

export default ModeratorReportedUsersTab;
