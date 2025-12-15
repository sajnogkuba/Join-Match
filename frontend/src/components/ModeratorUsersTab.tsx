import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Search, Filter, Ban, Undo2, Send } from "lucide-react";
import axiosInstance from "../Api/axios.tsx";
import { getCookie } from "../utils/cookies";

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

    // 🔔 MODERATOR WARNING – NOWE
    const [notifyUser, setNotifyUser] = useState<ModeratorUser | null>(null);
    const [sendingNotification, setSendingNotification] = useState(false);

    useEffect(() => {
        try {
            setLoggedEmail(getCookie("email"));
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

                const mapped: ModeratorUser[] = res.data.content.map((u) => ({
                    id: u.id,
                    nickname: u.username,
                    email: u.email,
                    status: u.isBlocked ? "BANNED" : "ACTIVE",
                }));

                setUsers((prev) => (append ? [...prev, ...mapped] : mapped));
                setHasNextUsers(!res.data.last);
                currentUsersPageRef.current = res.data.number;
            } catch (e) {
                setErrorUsers("Wystąpił błąd podczas ładowania użytkowników.");
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
                if (
                    entries[0].isIntersecting &&
                    !loadingMoreUsers
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
        await axiosInstance.patch("/auth/block/user", { email });
        setUsers((prev) =>
            prev.map((u) =>
                u.email === email ? { ...u, status: "BANNED" } : u
            )
        );
    };

    const unlockUser = async (email: string) => {
        await axiosInstance.patch("/auth/unlock/user", { email });
        setUsers((prev) =>
            prev.map((u) =>
                u.email === email ? { ...u, status: "ACTIVE" } : u
            )
        );
    };

    // 🔔 WYSYŁANIE OSTRZEŻENIA
    const sendNotification = async () => {
        if (!notifyUser) return;

        try {
            setSendingNotification(true);
            await axiosInstance.post("/moderator/notification/warning", {
                usermailOfReceiver: notifyUser.email,
            });
            setNotifyUser(null);
        } catch {
            alert("Nie udało się wysłać ostrzeżenia");
        } finally {
            setSendingNotification(false);
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
                        className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 pl-9 pr-3 py-2 text-sm text-zinc-100"
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
                    {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-t border-zinc-800">
                            <td className="px-4 py-3">{u.nickname}</td>
                            <td className="px-4 py-3">{u.email}</td>

                            <td className="px-4 py-3">
                                {u.status === "ACTIVE" ? (
                                    <span className="bg-emerald-500/15 text-emerald-300 px-2 py-1 rounded-full text-xs">
                                            Odblokowany
                                        </span>
                                ) : (
                                    <span className="bg-red-500/15 text-red-300 px-2 py-1 rounded-full text-xs">
                                            Zablokowany
                                        </span>
                                )}
                            </td>

                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    {u.email !== loggedEmail && (
                                        <button
                                            onClick={() => setNotifyUser(u)}
                                            className="
        inline-flex items-center justify-center
        h-9 w-9
        rounded-lg
        border border-violet-600/40
        text-violet-300
        hover:bg-violet-900/20
    "
                                            title="Wyślij ostrzeżenie"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>

                                    )}

                                    {u.email === loggedEmail ? (
                                        <button
                                            disabled
                                            className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-600 cursor-not-allowed"
                                        >
                                            Nieaktywne
                                        </button>
                                    ) : u.status === "ACTIVE" ? (
                                        <button
                                            onClick={() => blockUser(u.email)}
                                            className="
        inline-flex items-center gap-2
        h-9 px-3
        rounded-lg
        border border-red-600/40
        text-red-300
        hover:bg-red-900/20
    "
                                        >
                                            <Ban className="h-4 w-4" />
                                            Zablokuj
                                        </button>

                                    ) : (
                                        <button
                                            onClick={() => unlockUser(u.email)}
                                            className="
        inline-flex items-center gap-2
        h-9 px-3
        rounded-lg
        border border-emerald-600/40
        text-emerald-300
        hover:bg-emerald-900/20
    "
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

            {/* 🔔 MODAL OSTRZEŻENIA */}
            {notifyUser && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                    <div className="bg-[#1f2632] p-6 rounded-2xl w-full max-w-md border border-zinc-800">
                        <h2 className="text-white font-semibold mb-2">
                            Wyślij ostrzeżenie
                        </h2>
                        <p className="text-zinc-400 mb-4">
                            Do użytkownika:{" "}
                            <span className="text-zinc-200">
                                {notifyUser.email}
                            </span>
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setNotifyUser(null)}
                                className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={sendNotification}
                                disabled={sendingNotification}
                                className="px-4 py-2 rounded-xl bg-violet-600 text-white"
                            >
                                {sendingNotification
                                    ? "Wysyłanie…"
                                    : "Wyślij"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ModeratorUsersTab;
