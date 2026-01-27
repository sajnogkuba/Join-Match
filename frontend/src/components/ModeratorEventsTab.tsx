import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Eye, Check, X, Trash2, ArrowUpDown } from "lucide-react";
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

type EventReportItem = {
    id: number;
    description: string;

    reporterId: number;
    userEmail: string;
    reporterUsername: string;
    reporterAvatarUrl: string | null;

    eventId: number;
    eventName: string;
    eventImageUrl: string | null;
    eventDate: string;

    viewed: boolean;
    active: boolean;
};

const PAGE_SIZE = 20;

const ModeratorEventsTab: React.FC = () => {
    const [reports, setReports] = useState<EventReportItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNext, setHasNext] = useState(false);

    const currentPageRef = useRef(0);
    const observerTargetRef = useRef<HTMLDivElement | null>(null);

    const loggedEmail =
        typeof window !== "undefined" ? getCookie("email") : null;

    const [sortBy, setSortBy] = useState<string>("viewed_desc_id_desc");

    const getUserProfileLink = (reporterEmail: string, reporterId: number) => {
        if (!loggedEmail) return `/profile/${reporterId}`;
        return reporterEmail === loggedEmail ? `/profile` : `/profile/${reporterId}`;
    };

    const fetchReports = useCallback(
        async (pageNum: number, append: boolean = false) => {
            try {
                if (!append) setLoading(true);
                else setLoadingMore(true);
                setError(null);

                const res = await axiosInstance.get<PageResponse<EventReportItem>>(
                    `/moderator/reportEvents?page=${pageNum}&size=${PAGE_SIZE}`
                );

                const data = res.data;

                if (append) {
                    setReports((prev) => [...prev, ...data.content]);
                } else {
                    setReports(data.content);
                }

                setHasNext(!data.last);
                currentPageRef.current = data.number;
            } catch (e) {
                setError("Nie udało się załadować zgłoszeń wydarzeń.");
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

    const filteredReports = useMemo(
        () =>
            reports.filter((r) => {
                const q = "".toLowerCase();
                return (
                    r.eventName.toLowerCase().includes(q) ||
                    r.reporterUsername.toLowerCase().includes(q) ||
                    (r.userEmail ?? "").toLowerCase().includes(q)
                );
            }),
        [reports]
    );

    const sortedAndFilteredReports = useMemo(() => {
        const result = [...filteredReports];

        result.sort((a, b) => {
            let comparison = 0;

            if (sortBy.startsWith("viewed_desc")) {
                if (a.viewed !== b.viewed) {
                    if (!a.viewed && b.viewed) return -1;
                    if (a.viewed && !b.viewed) return 1;
                }
                if (sortBy.includes("date")) {
                    const dateA = new Date(a.eventDate).getTime();
                    const dateB = new Date(b.eventDate).getTime();
                    return sortBy.includes("desc") ? dateB - dateA : dateA - dateB;
                } else {
                    return sortBy.includes("desc") ? b.id - a.id : a.id - b.id;
                }
            }

            switch (sortBy) {
                case "reporter_asc":
                    comparison = a.reporterUsername.localeCompare(
                        b.reporterUsername,
                        "pl",
                        { sensitivity: "base" }
                    );
                    break;
                case "reporter_desc":
                    comparison = b.reporterUsername.localeCompare(
                        a.reporterUsername,
                        "pl",
                        { sensitivity: "base" }
                    );
                    break;
                case "event_asc":
                    comparison = a.eventName.localeCompare(b.eventName, "pl", {
                        sensitivity: "base",
                    });
                    break;
                case "event_desc":
                    comparison = b.eventName.localeCompare(a.eventName, "pl", {
                        sensitivity: "base",
                    });
                    break;
                case "date_asc":
                    const dateA_asc = new Date(a.eventDate).getTime();
                    const dateB_asc = new Date(b.eventDate).getTime();
                    comparison = dateA_asc - dateB_asc;
                    break;
                case "date_desc":
                    const dateA_desc = new Date(a.eventDate).getTime();
                    const dateB_desc = new Date(b.eventDate).getTime();
                    comparison = dateB_desc - dateA_desc;
                    break;
                case "status_asc":
                    if (a.active === b.active) comparison = 0;
                    else if (a.active && !b.active) comparison = -1;
                    else comparison = 1;
                    break;
                case "status_desc":
                    if (a.active === b.active) comparison = 0;
                    else if (!a.active && b.active) comparison = -1;
                    else comparison = 1;
                    break;
                default:
                    comparison = b.id - a.id;
            }

            return comparison;
        });

        return result;
    }, [filteredReports, sortBy]);

    const formatDate = (value: string) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleString("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleAccept = async (id: number) => {
        try {
            await axiosInstance.patch(`/moderator/reportEvent/${id}/accept`);
            setReports((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, active: true, viewed: true } : r
                )
            );
        } catch {
            console.error("Nie udało się zaakceptować zgłoszenia.");
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axiosInstance.patch(`/moderator/reportEvent/${id}/reject`);
            setReports((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, active: false, viewed: true } : r
                )
            );
        } catch {
            console.error("Nie udało się odrzucić zgłoszenia.");
        }
    };

    const handleDeleteReport = async (id: number) => {
        if (!window.confirm("Na pewno chcesz usunąć to zgłoszenie?")) return;

        try {
            await axiosInstance.delete(`/moderator/reportEvent/${id}/delete`);
            setReports((prev) => prev.filter((r) => r.id !== id));
        } catch {
            console.error("Nie udało się usunąć zgłoszenia.");
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        if (!window.confirm("Czy na pewno chcesz usunąć całe wydarzenie?")) return;

        try {
            await axiosInstance.delete(`/event/delete/event/${eventId}`);
            setReports((prev) => prev.filter((r) => r.eventId !== eventId));
        } catch {
            console.error("Nie udało się usunąć wydarzenia.");
        }
    };

    const handleToggleViewed = async (report: EventReportItem) => {
        const { id, viewed } = report;

        try {
            if (!viewed) {
                await axiosInstance.patch(`/moderator/reportEvent/${id}/toggle-viewed`);
                setReports((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, viewed: true } : r))
                );
            } else {
                await axiosInstance.patch(`/moderator/reportEvent/${id}/toggle-unviewed`);
                setReports((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, viewed: false } : r))
                );
            }
        } catch {
            console.error("Nie udało się zmienić statusu przeczytania.");
        }
    };

    return (
        <section className="p-4 md:p-0">
            <div className="flex items-center gap-2 mb-4 justify-end">
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 pr-8 text-sm text-zinc-200"
                    >
                        <option value="viewed_desc_id_desc">
                            Nieprzeczytane najpierw, potem najnowsze
                        </option>
                        <option value="viewed_desc_date_desc">
                            Nieprzeczytane najpierw, potem data (najnowsze)
                        </option>
                        <option value="viewed_desc_date_asc">
                            Nieprzeczytane najpierw, potem data (najstarsze)
                        </option>
                        <option value="reporter_asc">
                            Zgłaszający A-Z
                        </option>
                        <option value="reporter_desc">
                            Zgłaszający Z-A
                        </option>
                        <option value="event_asc">
                            Wydarzenie A-Z
                        </option>
                        <option value="event_desc">
                            Wydarzenie Z-A
                        </option>
                        <option value="date_desc">
                            Data (najnowsze)
                        </option>
                        <option value="date_asc">
                            Data (najstarsze)
                        </option>
                        <option value="status_asc">
                            Status (Aktywny/Nieaktywny)
                        </option>
                        <option value="status_desc">
                            Status (Nieaktywny/Aktywny)
                        </option>
                    </select>
                    <ArrowUpDown
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60"
                        size={16}
                    />
                </div>
            </div>

            {error && <p className="text-red-400 mb-2">{error}</p>}

            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="min-w-full text-sm">
                    <thead className="bg-zinc-900/60">
                    <tr className="text-zinc-400">
                        <th className="text-left px-4 py-3">Zgłaszający</th>
                        <th className="text-left px-4 py-3">Wydarzenie</th>
                        <th className="text-left px-4 py-3">Opis</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-right px-4 py-3">Akcje</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading && reports.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                                Ładowanie…
                            </td>
                        </tr>
                    )}

                    {sortedAndFilteredReports.map((r) => {
                        const isUnseen = !r.viewed;

                        return (
                            <tr key={r.id} className="border-t border-zinc-800">

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
                                                to={getUserProfileLink(r.userEmail, r.reporterId)}
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
                                                    {r.userEmail}
                                                </span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {r.eventImageUrl && (
                                            <img
                                                src={r.eventImageUrl}
                                                alt={r.eventName}
                                                className="h-10 w-16 rounded-lg object-cover"
                                            />
                                        )}

                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2">

                                                <Link
                                                    to={`/event/${r.eventId}`}
                                                    className={
                                                        isUnseen
                                                            ? "font-semibold text-white hover:text-violet-300 transition"
                                                            : "font-medium text-zinc-100 hover:text-violet-300 transition"
                                                    }
                                                >
                                                    {r.eventName}
                                                </Link>

                                                <button
                                                    onClick={() => handleDeleteEvent(r.eventId)}
                                                    className="p-1 rounded-md border border-red-700 hover:bg-red-800/40 transition ml-1"
                                                    title="Usuń wydarzenie"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-400" />
                                                </button>
                                            </div>

                                            <span
                                                className={
                                                    "text-xs text-zinc-400 " +
                                                    (isUnseen ? "font-semibold" : "")
                                                }
                                            >
                                                    {formatDate(r.eventDate)}
                                                </span>
                                        </div>
                                    </div>
                                </td>

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

                                <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                                r.active
                                                    ? "bg-violet-500/15 text-violet-300 border-violet-500/40"
                                                    : "bg-zinc-700/30 text-zinc-300 border-zinc-600/60"
                                            }`}
                                        >
                                            {r.active ? "Aktywny" : "Nieaktywny"}
                                        </span>
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">

                                        <button
                                            onClick={() => handleAccept(r.id)}
                                            className="p-2 rounded-lg border border-emerald-600/60 hover:bg-emerald-600/20 hover:border-emerald-500 transition"
                                            title="Akceptuj zgłoszenie"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => handleReject(r.id)}
                                            className="p-2 rounded-lg border border-red-600/60 hover:bg-red-600/20 hover:border-red-500 transition"
                                            title="Odrzuć zgłoszenie"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteReport(r.id)}
                                            className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition"
                                            title="Usuń zgłoszenie"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => handleToggleViewed(r)}
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
                            ? "Załadowano wszystkie zgłoszenia."
                            : null}
            </div>
        </section>
    );
};

export default ModeratorEventsTab;
