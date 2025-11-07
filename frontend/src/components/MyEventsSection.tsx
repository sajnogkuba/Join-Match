// src/components/MyEventsSection.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { MapPin, CalendarDays, Users } from "lucide-react";
import api from "../Api/axios";
type EventStatus = "PLANNED" | "CANCELED" | "FINISHED";
type EventDateWire = number[] | string | Date;

interface OwnedEvent {
    eventId: number;
    eventName: string;
    numberOfParticipants: number;
    cost: number;
    ownerId: number;
    sportObjectName: string;
    eventVisibilityId: number;
    status: EventStatus;
    scoreTeam1: number | null;
    scoreTeam2: number | null;
    eventDate: EventDateWire;
    sportTypeName: string;
    bookedParticipants?: number;
    minLevel: number;
    imageUrl: string | null;
}

// ===== Helpery =====
function normalizeEventDate(d: EventDateWire): Dayjs {
    if (Array.isArray(d)) {
        const [y, m, day, h = 0, min = 0] = d;
        return dayjs(new Date(y, (m ?? 1) - 1, day, h, min));
    }
    return dayjs(d);
}

const MyEventsSection: React.FC = () => {
    const [events, setEvents] = useState<OwnedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setError("Brak tokenu — zaloguj się ponownie.");
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const { data } = await api.get<OwnedEvent[]>("/event/byUser", {
                    params: { token },
                });

                const sanitized = (data ?? []).map((e) => ({
                    ...e,
                    bookedParticipants: e.bookedParticipants ?? 0,
                }));
                setEvents(sanitized);
            } catch {
                setError("Nie udało się pobrać Twoich wydarzeń.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <section className="space-y-6">
            <header className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-white">Moje wydarzenia</h2>
                    <p className="text-sm text-zinc-400">Wydarzenia, których jesteś właścicielem.</p>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-16 text-zinc-400">Ładowanie…</div>
            ) : error ? (
                <div className="text-center py-16 text-red-400">{error}</div>
            ) : events.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
                    Nie masz jeszcze żadnych własnych wydarzeń.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((ev) => {
                        const d = normalizeEventDate(ev.eventDate);
                        const booked = ev.bookedParticipants ?? 0;
                        const hasImage = typeof ev.imageUrl === "string" && ev.imageUrl.trim() !== "";

                        return (
                            <div
                                key={ev.eventId}
                                className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-violet-600/40 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)]"
                            >
                                <Link
                                    to={`/event/${ev.eventId}`}
                                    className="block relative h-48 w-full bg-zinc-800 overflow-hidden"
                                >
                                    {hasImage ? (
                                        <img
                                            src={ev.imageUrl as string}
                                            alt={ev.eventName}
                                            onError={(e) => {
                                                const img = e.currentTarget as HTMLImageElement;
                                                img.style.display = "none";
                                                const fallback = img.nextElementSibling as HTMLElement | null;
                                                if (fallback) fallback.style.display = "flex";
                                            }}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : null}
                                    <div
                                        className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 group-hover:scale-105 transition-transform duration-500 ${
                                            hasImage ? "hidden" : "flex"
                                        }`}
                                        style={{ display: hasImage ? "none" : "flex" }}
                                    >
                                        <div className="text-center text-zinc-400">
                                            <div className="text-4xl mb-2">JoinMatch</div>
                                            <div className="text-sm font-medium">{ev.sportTypeName}</div>
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-5">
                                    <h3 className="text-lg font-semibold text-white mb-1">{ev.eventName}</h3>
                                    <p className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                                        <MapPin size={14} /> {ev.sportObjectName}
                                    </p>
                                    <p className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                                        <CalendarDays size={14} /> {d.format("DD.MM.YYYY HH:mm")}
                                    </p>
                                    <p className="text-sm text-zinc-400 mb-3 flex items-center gap-2">
                                        <Users size={14} /> {booked}/{ev.numberOfParticipants}
                                    </p>

                                    <div className="flex justify-end">
                                        <Link
                                            to={`/event/${ev.eventId}`}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 transition-colors"
                                        >
                                            Szczegóły
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default MyEventsSection;
