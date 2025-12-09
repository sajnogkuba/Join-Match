import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";
import StarRatingDisplay from "./StarRatingDisplay";
import StarRatingInput from "./StarRatingInput";
import type { SportTypeOption, UserSport, UserSportsResponse } from "../Api/types/Sports";
import type { SavedEventRef, EventDetails } from "../Api/types/Events";
import {
    ChevronRight,
    Plus,
    Check,
    X
} from "lucide-react";

const ClickableSavedEvent = ({
                                 title,
                                 place,
                                 tag,
                                 cover,
                                 eventId
                             }: {
    title: string;
    place: string;
    tag: string;
    cover?: string | null;
    eventId: number;
}) => {
    const navigate = useNavigate();
    return (
        <li
            onClick={() => navigate(`/event/${eventId}`)}
            className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 hover:bg-zinc-800/80 transition cursor-pointer"
        >
            <div className="flex items-center gap-3 min-w-0">
                {cover ? (
                    <img src={cover} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                    <div className="h-12 w-12 rounded-full bg-zinc-800 grid place-items-center text-xs text-zinc-400">
                        img
                    </div>
                )}
                <div className="min-w-0">
                    <p className="truncate text-white font-medium leading-tight">{title}</p>
                    <p className="truncate text-xs text-zinc-400">{place}</p>
                    <span className="mt-1 inline-block rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-200">
                        {tag}
                    </span>
                </div>
            </div>
            <ChevronRight />
        </li>
    );
};

const SavedEvents = ({ userEmail }: { userEmail?: string }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<EventDetails[]>([]);

    useEffect(() => {
        if (!userEmail) return;
        setLoading(true);
        setError(null);
        api
            .get<SavedEventRef[]>("/user-saved-event/by-user-email", {
                params: { userEmail }
            })
            .then(async ({ data }) => {
                const ids = (data || []).map((d) => d.eventId);
                if (ids.length === 0) {
                    setItems([]);
                    return;
                }
                const details = await Promise.all(
                    ids.map(async (id) => (await api.get<EventDetails>(`/event/${id}`)).data)
                );
                setItems(details);
            })
            .catch(() => setError("Nie udało się pobrać zapisanych wydarzeń."))
            .finally(() => setLoading(false));
    }, [userEmail]);

    return (
        <section className="space-y-4">
            <h3 className="text-white text-xl font-semibold">Zapisane wydarzenia</h3>
            {loading && <p className="text-sm text-zinc-400">Ładowanie…</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
            {!loading && !error && (
                <ul className="space-y-3 max-h-96 overflow-y-auto dark-scrollbar">
                    {items.map((e) => {
                        const place = [e.city, e.street, e.number].filter(Boolean).join(", ");
                        return (
                            <ClickableSavedEvent
                                key={e.eventId}
                                eventId={e.eventId}
                                title={e.eventName}
                                place={place || "—"}
                                tag={e.sportTypeName || "Wydarzenie"}
                                cover={e.imageUrl || null}
                            />
                        );
                    })}
                    {items.length === 0 && (
                        <p className="text-sm text-zinc-400">Brak zapisanych wydarzeń.</p>
                    )}
                </ul>
            )}
        </section>
    );
};

const AddSportModal = ({
                           open,
                           onClose,
                           onAdded
                       }: {
    open: boolean;
    onClose: () => void;
    onAdded: (s: UserSport) => void;
}) => {
    const [options, setOptions] = useState<SportTypeOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sportId, setSportId] = useState<number | "">("");
    const [level, setLevel] = useState("");
    const [err, setErr] = useState<string | null>(null);

    const levelNum = Number(level);
    const levelValid = Number.isInteger(levelNum) && levelNum >= 1 && levelNum <= 5;

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setErr(null);
        api
            .get<SportTypeOption[]>("/sport-type")
            .then(({ data }) => setOptions(data))
            .catch(() => setErr("Nie udało się pobrać listy sportów."))
            .finally(() => setLoading(false));
    }, [open]);

    const selected = sportId ? options.find((o) => o.id === sportId) : undefined;

    const handleAdd = async () => {
        if (!sportId || !levelValid || !selected) return;
        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken") || "";
            await api.post("/sport-type/user", {
                token,
                sportId,
                rating: levelNum
            });
            onAdded({
                id: selected.id,
                name: selected.name,
                url: selected.url,
                level: levelNum
            });
            onClose();
            setSportId("");
            setLevel("");
        } catch {
            setErr("Nie udało się dodać sportu.");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative w-[95%] max-w-md rounded-2xl bg-zinc-900 p-5 ring-1 ring-zinc-800 shadow-2xl">
                <h4 className="text-white text-lg font-semibold">Dodaj sport</h4>
                <p className="text-sm text-zinc-400 mt-1">Wybierz sport i ustaw poziom.</p>
                <div className="mt-4 space-y-3">
                    <label className="block">
                        <span className="text-sm text-zinc-300">Sport</span>
                        <select
                            disabled={loading || saving}
                            className="mt-1 w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-600"
                            value={sportId}
                            onChange={(e) =>
                                setSportId(e.target.value ? Number(e.target.value) : "")
                            }
                        >
                            <option value="">
                                {loading ? "Ładowanie…" : "— wybierz sport —"}
                            </option>
                            {options.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    {selected && (
                        <div className="flex items-center gap-3">
                            <img
                                src={selected.url}
                                alt={selected.name}
                                className="h-10 w-10 rounded-full object-cover border border-zinc-700"
                            />
                            <span className="text-sm text-zinc-300">{selected.name}</span>
                        </div>
                    )}
                    <div>
                        <StarRatingInput
                            label="Poziom (1–5)"
                            max={5}
                            value={levelNum || 0}
                            onChange={(v) => setLevel(String(v))}
                        />
                        {!level || levelValid ? (
                            <p className="text-xs text-zinc-500 mt-1">
                                Wybierz liczbę gwiazdek 1–5.
                            </p>
                        ) : (
                            <p className="text-xs text-red-400 mt-1">
                                Poziom musi być w zakresie 1–5.
                            </p>
                        )}
                    </div>
                    {err && <p className="text-sm text-red-400">{err}</p>}
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                        disabled={saving}
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!sportId || !levelValid || saving}
                        className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                    >
                        {saving ? "Dodawanie…" : "Dodaj"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NOWE: lista sportów + usuwanie ---

const SportsList = ({
                        items,
                        onOpenAdd,
                        onSetMain,
                        onRemove,
                        settingIndex,
                        removingIndex,
                        errorMsg
                    }: {
    items: UserSport[];
    onOpenAdd: () => void;
    onSetMain: (index: number) => void;
    onRemove: (index: number) => void;
    settingIndex: number | null;
    removingIndex: number | null;
    errorMsg: string | null;
}) => (
    <section className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Sporty</h3>

        {errorMsg && (
            <p className="rounded-lg bg-red-500/10 text-red-300 px-3 py-2 text-sm">
                {errorMsg}
            </p>
        )}

        <ul className="space-y-3">
            {items.map((s, index) => {
                const isMain = !!s.isMain;
                const isSettingLoading = settingIndex === index;
                const isRemovingLoading = removingIndex === index;

                return (
                    <li
                        key={`${index}-${s.id}-${s.name}`}
                        className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3"
                    >
                        {/* left: avatar + info */}
                        <div className="flex items-center gap-3 min-w-0">
                            <img
                                src={s.url}
                                alt={s.name}
                                className="h-10 w-10 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                            />
                            <div className="min-w-0">
                                <p className="text-white font-medium leading-tight truncate">{s.name}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <StarRatingDisplay value={s.level > 5 ? s.level / 2 : s.level} size={14} />
                                </div>
                            </div>
                        </div>

                        {/* right: actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => onSetMain(index)}
                                disabled={isMain || isSettingLoading || isRemovingLoading}
                                className={`rounded-xl px-3 py-1.5 text-sm ${
                                    isMain
                                        ? "bg-violet-500 text-white"
                                        : "border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                                } disabled:opacity-100`}
                            >
                                {isMain ? (
                                    <span className="inline-flex items-center gap-1">
                                        <Check size={16} /> Główny
                                    </span>
                                ) : isSettingLoading ? (
                                    "Ustawianie…"
                                ) : (
                                    "Ustaw jako główny"
                                )}
                            </button>

                            {/* usuwanie */}
                            <button
                                onClick={() => onRemove(index)}
                                disabled={isSettingLoading || isRemovingLoading}
                                className="p-2 rounded-xl border border-red-600/40 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                    isMain
                                        ? "Najpierw zmień główny sport, a potem usuń."
                                        : "Usuń ten sport z profilu"
                                }
                            >
                                <X size={16} />
                                {isRemovingLoading ? "Usuwanie…" : ""}
                            </button>
                        </div>
                    </li>
                );
            })}
            {items.length === 0 && (
                <p className="text-zinc-400 text-sm">Brak sportów — dodaj pierwszy!</p>
            )}
        </ul>

        <button
            onClick={onOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
        >
            <Plus size={16} />
            Dodaj sport
        </button>
    </section>
);

const GeneralSection = ({
                            userEmail,
                            onMainSportChanged
                        }: {
    userEmail?: string;
    onMainSportChanged?: () => void;
}) => {
    const [sports, setSports] = useState<UserSport[]>([]);
    const [settingMainIndex, setSettingMainIndex] = useState<number | null>(null);
    const [removingIndex, setRemovingIndex] = useState<number | null>(null);
    const [openAdd, setOpenAdd] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        api
            .get<UserSportsResponse>("/sport-type/user", { params: { token } })
            .then(({ data }) => {
                const mapped: UserSport[] = (data.sports ?? []).map((s) => ({
                    id: s.sportId,
                    name: s.name,
                    url: s.url,
                    level: s.rating,
                    isMain: s.isMain
                }));
                setSports(mapped);
            })
            .catch(() => {});
    }, []);

    const handleSetMain = async (index: number) => {
        const item = sports[index];
        if (!item || item.isMain) return;
        if (!userEmail) return;

        setErrorMessage(null);
        setSettingMainIndex(index);

        const prevSports = sports;

        // optycznie przełącz
        setSports((prev) => prev.map((s, i) => ({ ...s, isMain: i === index })));

        try {
            await api.patch("/sport-type/mainSport", {
                email: userEmail,
                idSport: item.id
            });
            onMainSportChanged?.();
        } catch {
            // rollback
            setSports(prevSports);
            setErrorMessage("Nie udało się ustawić głównego sportu.");
        } finally {
            setSettingMainIndex(null);
        }
    };

    const handleRemoveSport = async (index: number) => {
        const item = sports[index];
        if (!item) return;

        if (item.isMain) {
            setErrorMessage("Najpierw zmień główny sport, a potem usuń.");
            return;
        }

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        setErrorMessage(null);
        setRemovingIndex(index);

        const prevSports = sports;

        setSports((prev) => prev.filter((_, i) => i !== index));

        try {
            await api.delete("/sport-type/user/sport", {
                data: {
                    token: token,
                    idSport: item.id,
                },
            });
        } catch {
            setSports(prevSports);
            setErrorMessage("Nie udało się usunąć sportu.");
        } finally {
            setRemovingIndex(null);
        }
    };


    return (
        <>
            <div className="grid flex-1 grid-cols-1 gap-8 md:grid-cols-2">
                <SportsList
                    items={sports}
                    onOpenAdd={() => setOpenAdd(true)}
                    onSetMain={handleSetMain}
                    onRemove={handleRemoveSport}
                    settingIndex={settingMainIndex}
                    removingIndex={removingIndex}
                    errorMsg={errorMessage}
                />
                <SavedEvents userEmail={userEmail} />
            </div>

            <AddSportModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onAdded={async (s) => {
                    const wasEmpty = sports.length === 0;
                    setSports((prev) => {
                        const next = [...prev, s];
                        if (wasEmpty) {
                            return next.map((item, i) => ({
                                ...item,
                                isMain: i === next.length - 1
                            }));
                        }
                        return next;
                    });

                    if (wasEmpty && userEmail) {
                        try {
                            await api.patch("/sport-type/mainSport", {
                                email: userEmail,
                                idSport: s.id
                            });
                            onMainSportChanged?.();
                        } catch (error) {
                            console.error("Failed to set main sport:", error);
                            setErrorMessage("Nie udało się ustawić głównego sportu dla pierwszego sportu.");
                        }
                    }
                }}
            />
        </>
    );
};

export default GeneralSection;
