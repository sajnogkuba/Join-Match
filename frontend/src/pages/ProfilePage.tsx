// src/pages/ProfilePage.tsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../Api/axios"; // <== USTAW poprawną ścieżkę
import {
    Star, Users, Trophy, ChevronRight, Bookmark, Plus, Bike,
    Settings, UserRound, Lock, Bell, Globe2, LogOut, Database,
} from "lucide-react";

type SimpleUser = {
    name: string;
    email: string;
    dateOfBirth: string;
    urlOfPicture: string | null;
};

const sports = [
    { id: 1, name: "Piłka Nożna", level: "Średniozaawansowany", icon: Bike },
    { id: 2, name: "Kolarstwo", level: "Amator", icon: Bike },
];

const savedEvents = [
    { id: 101, title: "Luźna Gierka", place: "Koszykowa 13 – Warszawa", tag: "Piłka nożna",
        cover: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=300&auto=format&fit=crop" },
    { id: 102, title: "Mecz Zawodowy", place: "Łazienkowska 12 – Warszawa", tag: "Piłka nożna",
        cover: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=300&auto=format&fit=crop" },
];

const Sidebar = () => {
    const items = [
        { label: "General", icon: UserRound, active: true },
        { label: "Edit Profile", icon: Settings },
        { label: "Password", icon: Lock },
        { label: "Social Profiles", icon: Globe2 },
        { label: "Email Notifications", icon: Bell },
        { label: "Sessions", icon: Users },
        { label: "Applications", icon: Trophy },
        { label: "Data Export", icon: Database },
    ];
    return (
        <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
                {items.map(({ label, icon: Icon, active }) => (
                    <button
                        key={label}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                            active ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800/60"
                        }`}
                    >
                        <Icon size={18} />
                        <span className="text-sm">{label}</span>
                    </button>
                ))}
            </nav>
            <button className="mt-6 text-sm text-red-400 hover:text-red-300 inline-flex items-center gap-2">
                <LogOut size={16} />
                Delete Account
            </button>
        </aside>
    );
};

const ProfileCard = ({ user, loading }: { user: SimpleUser | null; loading: boolean }) => {
    const name = user?.name ?? (loading ? "Ładowanie…" : "—");
    const handle = "General";
    const avatar =
        user?.urlOfPicture ??
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=300&auto=format&fit=crop";
    const rating = 4.7;
    const friends = 67;
    const mainSport = "Piłka nożna";

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <img src={avatar} alt={`${name} avatar`} className="h-14 w-14 rounded-full object-cover ring-2 ring-zinc-700" />
                <div>
                    <p className="text-white font-semibold leading-tight">
                        {name} <span className="text-zinc-400">/ {handle}</span>
                    </p>
                    <p className="text-sm text-zinc-400">Update your username and manage your account</p>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Star size={16} className="fill-current" />
                        <span className="font-semibold text-white">{rating}</span>
                    </div>
                    <p className="text-xs text-zinc-400">Ocena</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Users size={16} />
                        <span className="font-semibold text-white">{friends}</span>
                    </div>
                    <p className="text-xs text-zinc-400">Znajomi</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Trophy size={16} />
                        <span className="font-semibold text-white">{mainSport}</span>
                    </div>
                    <p className="text-xs text-zinc-400">Główny sport</p>
                </div>
            </div>
        </div>
    );
};

const SportsList = () => (
    <section className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Sporty</h3>
        <ul className="space-y-3">
            {sports.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-zinc-800">
                            <s.icon />
                        </div>
                        <div>
                            <p className="text-white font-medium leading-tight">{s.name}</p>
                            <p className="text-xs text-zinc-400">Poziom: {s.level}</p>
                        </div>
                    </div>
                    <button className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800">
                        Ustaw jako główny
                    </button>
                </li>
            ))}
        </ul>

        <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
            <Plus size={16} />
            Dodaj sport +
        </button>
    </section>
);

const SavedEvent = ({ title, place, tag, cover }: { title: string; place: string; tag: string; cover: string }) => (
    <li className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
        <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
                <img src={cover} alt="" className="h-12 w-12 rounded-full object-cover" />
                <Bookmark className="absolute -left-1 -top-1 h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-white font-medium leading-tight">{title}</p>
                <p className="truncate text-xs text-zinc-400">{place}</p>
                <span className="mt-1 inline-block rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-200">{tag}</span>
            </div>
        </div>

        <Link to={`/events/${encodeURIComponent(title)}`} className="grid h-9 w-9 place-items-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition" aria-label="Zobacz wydarzenie">
            <ChevronRight />
        </Link>
    </li>
);

const SavedEvents = () => (
    <section className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Zapisane wydarzenia</h3>
        <ul className="space-y-3">{savedEvents.map((e) => <SavedEvent key={e.id} {...e} />)}</ul>
        <div className="pt-2">
            <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">Save Changes</button>
        </div>
    </section>
);

const ProfilePage = () => {
    const [user, setUser] = useState<SimpleUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setErrorMsg("Brak tokenu — zaloguj się ponownie.");
            setLoading(false);
            return;
        }

        console.log("Wysyłam GET /auth/user/details z query param token:", token);

        axiosInstance
            .get<SimpleUser>("/auth/user/details", { params: { token } }) // -> /api/auth/user/details?token=...
            .then(({ data }) => {
                console.log("✅ Odpowiedź:", data);
                setUser(data);
            })
            .catch((e) => {
                console.error("❌ Błąd pobierania profilu:", e);
                setErrorMsg("Nie udało się pobrać profilu.");
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#1f2632] text-zinc-300">
            {/* HERO */}
            <header className="relative h-[180px] md:h-[220px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center"
                     style={{ backgroundImage: "url(https://images.unsplash.com/photo-1604948501466-4e9b4d6f3e2b?q=80&w=1600&auto=format&fit=crop)" }} />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-6 md:px-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-white">Panel Profilu</h1>
                        <div className="mt-2 h-1 w-32 rounded-full bg-violet-600" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                <div className="rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800">
                    <ProfileCard user={user} loading={loading} />

                    {errorMsg && (
                        <p className="mt-4 rounded-lg bg-red-500/10 text-red-300 px-3 py-2 text-sm">
                            {errorMsg}
                        </p>
                    )}

                    <hr className="my-8 border-zinc-800" />

                    <div className="flex flex-col gap-8 lg:flex-row">
                        <Sidebar />
                        <div className="grid flex-1 grid-cols-1 gap-8 md:grid-cols-2">
                            <SportsList />
                            <SavedEvents />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
