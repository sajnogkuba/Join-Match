import React, {
    useMemo,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";

import {
    ShieldCheck,
    Users,
    Ticket,
    AlertTriangle,
    Search,
    Ban,
    Undo2,
    Eye,
    Filter,
    Settings2,
} from "lucide-react";

import axiosInstance from "../Api/axios.tsx";

type BackendUserDto = {
    id: number;
    username: string;
    email: string;
    isBlocked: boolean;
};

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

type ModeratorUser = {
    id: number;
    nickname: string;
    email: string;
    status: "ACTIVE" | "BANNED";
};

const CARD_BG = "bg-black/60";
const RING = "ring-1 ring-zinc-800";

type TabKey = "dashboard" | "users" | "events" | "reports" | "settings";

const PAGE_SIZE = 20;

const ModeratorPanelPage: React.FC = () => {
    const [tab, setTab] = useState<TabKey>("dashboard");

    // email aktualnie zalogowanego użytkownika
    const [loggedEmail, setLoggedEmail] = useState<string | null>(null);

    // ---------- USERS ----------
    const [qUsers, setQUsers] = useState("");
    const [users, setUsers] = useState<ModeratorUser[]>([]);

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
    const [errorUsers, setErrorUsers] = useState<string | null>(null);
    const [hasNextUsers, setHasNextUsers] = useState(false);

    const currentUsersPageRef = useRef(0);
    const observerTargetUsers = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        try {
            const email = localStorage.getItem("email");
            setLoggedEmail(email);
        } catch {
            setLoggedEmail(null);
        }
    }, []);

    const fetchUsers = useCallback(
        async (pageNum: number, append: boolean = false) => {
            try {
                if (!append) setLoadingUsers(true);
                else setLoadingMoreUsers(true);

                const res = await axiosInstance.get<
                    PageResponse<BackendUserDto>
                >(`/auth/moderation?page=${pageNum}&size=${PAGE_SIZE}`);

                const data = res.data;

                const mapped: ModeratorUser[] = data.content.map((u) => ({
                    id: u.id,
                    nickname: u.username,
                    email: u.email,
                    status: u.isBlocked ? "BANNED" : "ACTIVE",
                }));

                if (append) {
                    setUsers((prev) => [...prev, ...mapped]);
                } else {
                    setUsers(mapped);
                }

                setHasNextUsers(!data.last);
                currentUsersPageRef.current = data.number;
            } catch (e) {
                const msg =
                    e instanceof Error
                        ? e.message
                        : "Wystąpił błąd podczas ładowania użytkowników.";
                setErrorUsers(msg);
            } finally {
                setLoadingUsers(false);
                setLoadingMoreUsers(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchUsers(0, false);
    }, [fetchUsers]);

    // Infinite scroll
    useEffect(() => {
        if (tab !== "users" || !hasNextUsers) return;

        const target = observerTargetUsers.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    !loadingMoreUsers &&
                    hasNextUsers
                ) {
                    fetchUsers(currentUsersPageRef.current + 1, true);
                }
            },
            { threshold: 1 }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [tab, hasNextUsers, loadingMoreUsers, fetchUsers]);

    const filteredUsers = useMemo(
        () =>
            users.filter(
                (u) =>
                    u.nickname.toLowerCase().includes(qUsers.toLowerCase()) ||
                    u.email.toLowerCase().includes(qUsers.toLowerCase())
            ),
        [qUsers, users]
    );

    const blockUser = async (email: string) => {
        try {
            await axiosInstance.patch("/auth/block/user", { email });
            setUsers((prev) =>
                prev.map((u) =>
                    u.email === email ? { ...u, status: "BANNED" } : u
                )
            );
        } catch (err) {
            console.error("Błąd blokowania użytkownika", err);
        }
    };

    const unlockUser = async (email: string) => {
        try {
            await axiosInstance.patch("/auth/unlock/user", { email });
            setUsers((prev) =>
                prev.map((u) =>
                    u.email === email ? { ...u, status: "ACTIVE" } : u
                )
            );
        } catch (err) {
            console.error("Błąd odblokowywania użytkownika", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#1f2632] text-zinc-300">
            {/* HEADER */}
            <header className="relative h-[160px] md:h-[200px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop)",
                    }}
                />
                <div className="absolute inset-0 bg-black/70" />

                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-6 md:px-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
                            <ShieldCheck className="h-7 w-7 text-violet-400" />
                            Panel moderatora
                        </h1>
                        <div className="mt-2 h-1 w-40 rounded-full bg-violet-600" />
                    </div>
                </div>
            </header>

            {/* BODY */}
            <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                <div
                    className={`rounded-3xl ${CARD_BG} p-0 md:p-6 ${RING} shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]`}
                >
                    {/* TABS */}
                    <div className="flex flex-col md:flex-row gap-2 md:gap-3 p-4 md:p-0 md:pb-6">
                        {[
                            {
                                key: "dashboard",
                                label: "Dashboard",
                                icon: <ShieldCheck className="h-4 w-4" />,
                            },
                            {
                                key: "users",
                                label: "Użytkownicy",
                                icon: <Users className="h-4 w-4" />,
                            },
                            {
                                key: "events",
                                label: "Wydarzenia",
                                icon: <Ticket className="h-4 w-4" />,
                            },
                            {
                                key: "reports",
                                label: "Zgłoszenia",
                                icon: <AlertTriangle className="h-4 w-4" />,
                            },
                            {
                                key: "settings",
                                label: "Ustawienia",
                                icon: <Settings2 className="h-4 w-4" />,
                            },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setTab(item.key as TabKey)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                                    tab === item.key
                                        ? "border-violet-600 bg-violet-600/20 text-white"
                                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* TAB USERS */}
                    {tab === "users" && (
                        <section className="p-4 md:p-0">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        value={qUsers}
                                        onChange={(e) =>
                                            setQUsers(e.target.value)
                                        }
                                        placeholder="Szukaj po nicku lub e-mailu…"
                                        className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 pl-9 pr-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-violet-600"
                                    />
                                </div>
                                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800">
                                    <Filter className="h-4 w-4" />
                                    Filtry
                                </button>
                            </div>

                            {errorUsers && (
                                <p className="text-red-400 mb-2">{errorUsers}</p>
                            )}

                            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-zinc-900/60">
                                    <tr className="text-zinc-400">
                                        <th className="text-left px-4 py-3">
                                            Nick
                                        </th>
                                        <th className="text-left px-4 py-3">
                                            E-mail
                                        </th>
                                        <th className="text-left px-4 py-3">
                                            Status
                                        </th>
                                        <th className="text-right px-4 py-3">
                                            Akcje
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {loadingUsers &&
                                        users.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-6 text-center text-zinc-400"
                                                >
                                                    Ładowanie…
                                                </td>
                                            </tr>
                                        )}

                                    {filteredUsers.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="border-t border-zinc-800"
                                        >
                                            <td className="px-4 py-3">
                                                {u.nickname}
                                            </td>
                                            <td className="px-4 py-3">
                                                {u.email}
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-4 py-3">
                                                {u.status === "ACTIVE" ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                                                            Odblokowany
                                                        </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/40">
                                                            Zablokowany
                                                        </span>
                                                )}
                                            </td>

                                            {/* AKCJE */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800">
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    {u.email ===
                                                    loggedEmail ? (
                                                        // nie można zablokować samego siebie
                                                        <button
                                                            disabled
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-600 cursor-not-allowed"
                                                            title="Nie możesz zablokować własnego konta"
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                            Nieaktywne
                                                        </button>
                                                    ) : u.status ===
                                                    "ACTIVE" ? (
                                                        <button
                                                            onClick={() =>
                                                                blockUser(
                                                                    u.email
                                                                )
                                                            }
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-600/40 text-red-300 hover:bg-red-900/20"
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                            Zablokuj
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                unlockUser(
                                                                    u.email
                                                                )
                                                            }
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/20"
                                                        >
                                                            <Undo2 className="h-4 w-4" />
                                                            Odblokuj
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div
                                ref={observerTargetUsers}
                                className="h-12 flex items-center justify-center text-xs text-zinc-500"
                            >
                                {loadingMoreUsers
                                    ? "Wczytywanie…"
                                    : hasNextUsers
                                        ? "Przewiń niżej aby wczytać więcej…"
                                        : users.length > 0
                                            ? "Załadowano wszystkich użytkowników."
                                            : null}
                            </div>
                        </section>
                    )}

                    {/* DASHBOARD */}
                    {tab === "dashboard" && (
                        <section className="p-4">
                            <p className="text-zinc-400">
                                Tutaj możesz dodać statystyki lub opis panelu.
                            </p>
                        </section>
                    )}

                    {/* EVENTS */}
                    {tab === "events" && (
                        <section className="p-4">
                            <p className="text-zinc-400">
                                W przyszłości tutaj pojawi się sekcja
                                moderacji wydarzeń.
                            </p>
                        </section>
                    )}

                    {/* REPORTS */}
                    {tab === "reports" && (
                        <section className="p-4">
                            <p className="text-zinc-400">
                                Tutaj będą zgłoszenia użytkowników.
                            </p>
                        </section>
                    )}

                    {/* SETTINGS */}
                    {tab === "settings" && (
                        <section className="p-4">
                            <p className="text-zinc-400">
                                Tutaj będą ustawienia panelu moderatora.
                            </p>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ModeratorPanelPage;
