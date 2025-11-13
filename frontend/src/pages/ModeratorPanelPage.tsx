import React, { useMemo, useState } from "react";
import {
    ShieldCheck,
    Users,
    Ticket,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Search,
    Ban,
    Undo2,
    Eye,
    Filter,
    Settings2,
    ChevronRight,
    MapPin,
    CalendarClock,
    Volleyball,
    Trophy,
    Circle,
} from "lucide-react";

/**
 * ModeratorPanelPage — mock panelu moderatora dopasowany do Join Match
 */

type ModUser = {
    id: number;
    nickname: string;
    email: string;
    eventsCount: number;
    status: "ACTIVE" | "BANNED";
    city?: string;
    rating?: number;
};

type ModEvent = {
    id: number;
    name: string;
    owner: string;
    sport: "Piłka nożna" | "Siatkówka" | "Koszykówka";
    city: string;
    place: string;
    date: string;
    pricePLN: number;
    participants: string;
    status: "NEW" | "APPROVED" | "FLAGGED";
};

type Report = {
    id: number;
    type: "Spam" | "Hejt" | "Fałszywe dane" | "Naruszenie regulaminu";
    targetType: "USER" | "EVENT";
    targetId: number;
    targetName: string;
    reporter: string;
    createdAt: string;
    status: "OPEN" | "RESOLVED" | "REJECTED";
    note?: string;
};

const ACCENT = "bg-violet-600";
const CARD_BG = "bg-black/60";
const RING = "ring-1 ring-zinc-800";

const mockUsers: ModUser[] = [
    { id: 1, nickname: "Jakub S.", email: "kuba@joinmatch.pl", eventsCount: 12, status: "ACTIVE", city: "Gdynia", rating: 4.7 },
    { id: 2, nickname: "Anka_90", email: "anna@mail.com", eventsCount: 2, status: "BANNED", city: "Kraków", rating: 3.9 },
    { id: 3, nickname: "PiotrK", email: "piotr@example.com", eventsCount: 6, status: "ACTIVE", city: "Warszawa", rating: 4.2 },
    { id: 4, nickname: "VolleyPro", email: "vp@sample.com", eventsCount: 0, status: "ACTIVE", city: "Poznań", rating: 4.9 },
];

const mockEvents: ModEvent[] = [
    {
        id: 31,
        name: "Event3",
        owner: "Jakub Sajnog",
        sport: "Siatkówka",
        city: "Wołomin",
        place: "Boisko Zielona Polana",
        date: "2025-10-03 12:00",
        pricePLN: 15,
        participants: "5/15",
        status: "APPROVED",
    },
    {
        id: 44,
        name: "hh h",
        owner: "User123",
        sport: "Piłka nożna",
        city: "Kraków",
        place: "Orlik 2012",
        date: "2025-10-03 17:54",
        pricePLN: 0,
        participants: "2/2",
        status: "NEW",
    },
    {
        id: 52,
        name: "Event2",
        owner: "TeamBasket",
        sport: "Koszykówka",
        city: "Gdynia",
        place: "Hala Sportowa SP 8",
        date: "2025-10-02 11:00",
        pricePLN: 0,
        participants: "2/5",
        status: "FLAGGED",
    },
];

const mockReports: Report[] = [
    {
        id: 201,
        type: "Spam",
        targetType: "EVENT",
        targetId: 44,
        targetName: "hh h",
        reporter: "Anka_90",
        createdAt: "2025-10-03 18:10",
        status: "OPEN",
        note: "Powtarzające się ogłoszenia pod różnymi nazwami.",
    },
    {
        id: 202,
        type: "Hejt",
        targetType: "USER",
        targetId: 2,
        targetName: "Anka_90",
        reporter: "Jakub S.",
        createdAt: "2025-10-03 18:22",
        status: "OPEN",
    },
    {
        id: 203,
        type: "Fałszywe dane",
        targetType: "EVENT",
        targetId: 31,
        targetName: "Event3",
        reporter: "PiotrK",
        createdAt: "2025-10-04 09:05",
        status: "RESOLVED",
        note: "Zmienione na APPROVED po weryfikacji.",
    },
];

const StatCard = ({
                      icon,
                      label,
                      value,
                      hint,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    hint?: string;
}) => (
    <div className={`rounded-2xl ${CARD_BG} ${RING} p-4 flex items-start gap-4`}>
        <div className={`p-2 rounded-xl ${ACCENT} text-white`}>{icon}</div>
        <div>
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="text-2xl font-semibold text-white leading-tight">{value}</p>
            {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
        </div>
    </div>
);

const Chip = ({ children, tone = "zinc" }: { children: React.ReactNode; tone?: "zinc" | "green" | "red" | "amber" }) => {
    const m =
        tone === "green"
            ? "bg-emerald-500/15 text-emerald-300 border-emerald-600/30"
            : tone === "red"
                ? "bg-red-500/15 text-red-300 border-red-600/30"
                : tone === "amber"
                    ? "bg-amber-500/15 text-amber-300 border-amber-600/30"
                    : "bg-zinc-500/10 text-zinc-200 border-zinc-700";
    return <span className={`text-xs px-2 py-1 rounded-lg border ${m}`}>{children}</span>;
};

const SportIcon = ({ sport }: { sport: ModEvent["sport"] }) => {
    const cl = "h-4 w-4";
    if (sport === "Siatkówka") return <Volleyball className={cl} />;
    if (sport === "Piłka nożna") return <Circle className={cl} />;
    // Koszykówka (lub fallback)
    return <Trophy className={cl} />;
};

type TabKey = "dashboard" | "users" | "events" | "reports" | "settings";

const ModeratorPanelPage: React.FC = () => {
    const [tab, setTab] = useState<TabKey>("dashboard");
    const [qUsers, setQUsers] = useState("");
    const [qEvents, setQEvents] = useState("");
    const [users, setUsers] = useState<ModUser[]>(mockUsers);
    const [events, setEvents] = useState<ModEvent[]>(mockEvents);
    const [reports, setReports] = useState<Report[]>(mockReports);
    const [onlyOpenReports, setOnlyOpenReports] = useState(true);
    const [eventStatusFilter, setEventStatusFilter] = useState<"ALL" | "NEW" | "APPROVED" | "FLAGGED">("ALL");

    const filteredUsers = useMemo(
        () =>
            users.filter(
                (u) =>
                    u.nickname.toLowerCase().includes(qUsers.toLowerCase()) ||
                    u.email.toLowerCase().includes(qUsers.toLowerCase())
            ),
        [qUsers, users]
    );

    const filteredEvents = useMemo(() => {
        const byQ = events.filter(
            (e) =>
                e.name.toLowerCase().includes(qEvents.toLowerCase()) ||
                e.city.toLowerCase().includes(qEvents.toLowerCase()) ||
                e.owner.toLowerCase().includes(qEvents.toLowerCase())
        );
        if (eventStatusFilter === "ALL") return byQ;
        return byQ.filter((e) => e.status === eventStatusFilter);
    }, [qEvents, events, eventStatusFilter]);

    const filteredReports = useMemo(
        () => reports.filter((r) => (onlyOpenReports ? r.status === "OPEN" : true)),
        [reports, onlyOpenReports]
    );

    const approveEvent = (id: number) =>
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "APPROVED" } : e)));

    const removeEvent = (id: number) => setEvents((prev) => prev.filter((e) => e.id !== id));

    const flagEvent = (id: number) =>
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "FLAGGED" } : e)));

    const banUser = (id: number) =>
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "BANNED" } : u)));

    const unbanUser = (id: number) =>
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "ACTIVE" } : u)));

    const resolveReport = (id: number) =>
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "RESOLVED" } : r)));

    const rejectReport = (id: number) =>
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)));

    return (
        <div className="min-h-screen bg-[#1f2632] text-zinc-300">
            {/* Header */}
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

            {/* Body */}
            <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                <div className={`rounded-3xl ${CARD_BG} p-0 md:p-6 ${RING} shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]`}>
                    {/* Top nav */}
                    <div className="flex flex-col md:flex-row gap-2 md:gap-3 p-4 md:p-0 md:pb-6">
                        {[
                            { key: "dashboard", label: "Dashboard", icon: <ShieldCheck className="h-4 w-4" /> },
                            { key: "users", label: "Użytkownicy", icon: <Users className="h-4 w-4" /> },
                            { key: "events", label: "Wydarzenia", icon: <Ticket className="h-4 w-4" /> },
                            { key: "reports", label: "Zgłoszenia", icon: <AlertTriangle className="h-4 w-4" /> },
                            { key: "settings", label: "Ustawienia", icon: <Settings2 className="h-4 w-4" /> },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setTab(item.key as TabKey)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                                    tab === (item.key as TabKey)
                                        ? "border-violet-600 bg-violet-600/20 text-white"
                                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Tabs */}
                    {tab === "dashboard" && (
                        <section className="p-4 md:p-0">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <StatCard icon={<Users className="h-5 w-5" />} label="Użytkownicy" value={users.length} hint="Łącznie w systemie" />
                                <StatCard icon={<Ticket className="h-5 w-5" />} label="Wydarzenia" value={events.length} hint="Wszystkie statusy" />
                                <StatCard
                                    icon={<AlertTriangle className="h-5 w-5" />}
                                    label="Otwarte zgłoszenia"
                                    value={reports.filter((r) => r.status === "OPEN").length}
                                    hint="Wymagają reakcji"
                                />
                                <StatCard
                                    icon={<CheckCircle2 className="h-5 w-5" />}
                                    label="Zatwierdzone eventy"
                                    value={events.filter((e) => e.status === "APPROVED").length}
                                />
                            </div>

                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className={`rounded-2xl ${CARD_BG} ${RING} p-4`}>
                                    <h3 className="text-white font-semibold mb-4">Najnowsze wydarzenia</h3>
                                    <ul className="space-y-3">
                                        {events.slice(0, 5).map((e) => (
                                            <li key={e.id} className="flex items-center justify-between gap-3 border border-zinc-800 rounded-xl p-3">
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium truncate flex items-center gap-2">
                                                        <SportIcon sport={e.sport} />
                                                        {e.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {e.city} • {e.place}
                                                        <CalendarClock className="h-3 w-3 ml-2" />
                                                        {e.date}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Chip tone={e.status === "APPROVED" ? "green" : e.status === "FLAGGED" ? "amber" : "zinc"}>
                                                        {e.status}
                                                    </Chip>
                                                    <button className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={`rounded-2xl ${CARD_BG} ${RING} p-4`}>
                                    <h3 className="text-white font-semibold mb-4">Ostatnie zgłoszenia</h3>
                                    <ul className="space-y-3">
                                        {reports.slice(0, 5).map((r) => (
                                            <li key={r.id} className="flex items-center justify-between gap-3 border border-zinc-800 rounded-xl p-3">
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium truncate">
                                                        #{r.id} • {r.type} • {r.targetName}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">Zgłosił: {r.reporter} • {r.createdAt}</p>
                                                </div>
                                                <Chip tone={r.status === "OPEN" ? "amber" : r.status === "RESOLVED" ? "green" : "red"}>{r.status}</Chip>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}

                    {tab === "users" && (
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

                            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-zinc-900/60">
                                    <tr className="text-zinc-400">
                                        <th className="text-left px-4 py-3">Nick</th>
                                        <th className="text-left px-4 py-3">E-mail</th>
                                        <th className="text-left px-4 py-3">Miasto</th>
                                        <th className="text-left px-4 py-3">Wydarzenia</th>
                                        <th className="text-left px-4 py-3">Ocena</th>
                                        <th className="text-left px-4 py-3">Status</th>
                                        <th className="text-right px-4 py-3">Akcje</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-t border-zinc-800">
                                            <td className="px-4 py-3 text-white">{u.nickname}</td>
                                            <td className="px-4 py-3">{u.email}</td>
                                            <td className="px-4 py-3">{u.city ?? "—"}</td>
                                            <td className="px-4 py-3">{u.eventsCount}</td>
                                            <td className="px-4 py-3">{u.rating ?? "—"}</td>
                                            <td className="px-4 py-3">
                                                <Chip tone={u.status === "ACTIVE" ? "green" : "red"}>{u.status}</Chip>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    {u.status === "ACTIVE" ? (
                                                        <button
                                                            onClick={() => banUser(u.id)}
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-600/40 text-red-300 hover:bg-red-900/20"
                                                        >
                                                            <Ban className="h-4 w-4" /> Zablokuj
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => unbanUser(u.id)}
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/20"
                                                        >
                                                            <Undo2 className="h-4 w-4" /> Odblokuj
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                                                Brak wyników.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {tab === "events" && (
                        <section className="p-4 md:p-0">
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                                <div className="flex-1 relative">
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        value={qEvents}
                                        onChange={(e) => setQEvents(e.target.value)}
                                        placeholder="Szukaj po nazwie, mieście lub właścicielu…"
                                        className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 pl-9 pr-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-violet-600"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={eventStatusFilter}
                                        onChange={(e) =>
                                            setEventStatusFilter(e.target.value as "ALL" | "NEW" | "APPROVED" | "FLAGGED")
                                        }
                                        className="rounded-xl bg-zinc-900/60 border border-zinc-800 px-3 py-2 text-sm"
                                    >
                                        <option value="ALL">Wszystkie statusy</option>
                                        <option value="NEW">Nowe</option>
                                        <option value="APPROVED">Zatwierdzone</option>
                                        <option value="FLAGGED">Oznaczone</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {filteredEvents.map((e) => (
                                    <div key={e.id} className={`rounded-2xl ${CARD_BG} ${RING} p-4 flex flex-col gap-3`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-white font-semibold leading-tight">{e.name}</p>
                                                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                                                    <SportIcon sport={e.sport} />
                                                    {e.sport}
                                                </p>
                                            </div>
                                            <Chip tone={e.status === "APPROVED" ? "green" : e.status === "FLAGGED" ? "amber" : "zinc"}>
                                                {e.status}
                                            </Chip>
                                        </div>
                                        <p className="text-xs text-zinc-400 flex items-center gap-2">
                                            <MapPin className="h-3 w-3" />
                                            {e.city} • {e.place}
                                        </p>
                                        <p className="text-xs text-zinc-400 flex items-center gap-2">
                                            <CalendarClock className="h-3 w-3" />
                                            {e.date} • {e.participants} • {e.pricePLN.toFixed(2)} zł
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-xs text-zinc-400">Właściciel: {e.owner}</span>
                                            <button className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                onClick={() => approveEvent(e.id)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/20"
                                            >
                                                <CheckCircle2 className="h-4 w-4" /> Zatwierdź
                                            </button>
                                            <button
                                                onClick={() => flagEvent(e.id)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-600/40 text-amber-300 hover:bg-amber-900/20"
                                            >
                                                <AlertTriangle className="h-4 w-4" /> Oznacz
                                            </button>
                                            <button
                                                onClick={() => removeEvent(e.id)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-600/40 text-red-300 hover:bg-red-900/20 ml-auto"
                                            >
                                                <XCircle className="h-4 w-4" /> Usuń
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredEvents.length === 0 && (
                                    <div className="col-span-full rounded-2xl border border-zinc-800 p-6 text-center text-zinc-400">
                                        Brak wyników.
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {tab === "reports" && (
                        <section className="p-4 md:p-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="accent-violet-600"
                                            checked={onlyOpenReports}
                                            onChange={(e) => setOnlyOpenReports(e.target.checked)}
                                        />
                                        Pokaż tylko otwarte
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {filteredReports.map((r) => (
                                    <div key={r.id} className="rounded-2xl border border-zinc-800 p-4 flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-white font-semibold">
                                                #{r.id} • {r.type} • <span className="text-zinc-300">{r.targetType}:</span> {r.targetName}
                                            </p>
                                            <p className="text-xs text-zinc-400 mt-1">
                                                Zgłosił: {r.reporter} • {r.createdAt}
                                            </p>
                                            {r.note && <p className="text-xs text-zinc-300 mt-2">Notatka: {r.note}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Chip tone={r.status === "OPEN" ? "amber" : r.status === "RESOLVED" ? "green" : "red"}>{r.status}</Chip>
                                            <button className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            {r.status === "OPEN" ? (
                                                <>
                                                    <button
                                                        onClick={() => resolveReport(r.id)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/20"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" /> Rozpatrz
                                                    </button>
                                                    <button
                                                        onClick={() => rejectReport(r.id)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-600/40 text-red-300 hover:bg-red-900/20"
                                                    >
                                                        <XCircle className="h-4 w-4" /> Odrzuć
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300">
                                                    Archiwum <ChevronRight className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {filteredReports.length === 0 && (
                                    <div className="rounded-2xl border border-zinc-800 p-6 text-center text-zinc-400">Brak zgłoszeń.</div>
                                )}
                            </div>
                        </section>
                    )}

                    {tab === "settings" && (
                        <section className="p-6">
                            <p className="text-zinc-400 text-sm">
                                Tu dodamy zarządzanie rolami, edycję kategorii sportów, reguły moderacji i logi działań. Na razie mock.
                            </p>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ModeratorPanelPage;
