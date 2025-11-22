import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Search, Filter, Eye, Ban, Undo2 } from "lucide-react";
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

const PAGE_SIZE = 20;

const ModeratorUsersTab: React.FC = () => {
    const [loggedEmail, setLoggedEmail] = useState<string | null>(null);

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
        if (!hasNextUsers) return;

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
    }, [hasNextUsers, loadingMoreUsers, fetchUsers]);

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
        <section className="p-4 md:p-0">
            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        value={qUsers}
                        onChange={(e) => setQUsers(e.target.value)}
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
                        <th className="text-left px-4 py-3">Nick</th>
                        <th className="text-left px-4 py-3">E-mail</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-right px-4 py-3">Akcje</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loadingUsers && users.length === 0 && (
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
                            <td className="px-4 py-3">{u.nickname}</td>
                            <td className="px-4 py-3">{u.email}</td>

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

                                    {u.email === loggedEmail ? (
                                        // nie można zablokować samego siebie
                                        <button
                                            disabled
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-600 cursor-not-allowed"
                                            title="Nie możesz zablokować własnego konta"
                                        >
                                            <Ban className="h-4 w-4" />
                                            Nieaktywne
                                        </button>
                                    ) : u.status === "ACTIVE" ? (
                                        <button
                                            onClick={() =>
                                                blockUser(u.email)
                                            }
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-600/40 text-red-300 hover:bg-red-900/20"
                                        >
                                            <Ban className="h-4 w-4" />
                                            Zablokuj
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                unlockUser(u.email)
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
    );
};

export default ModeratorUsersTab;
