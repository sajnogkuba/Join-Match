import React, { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import axios from "axios";
import axiosInstance from "../Api/axios.tsx";

type Sport = {
    id: number;
    name: string;
    url: string;
};

const ModeratorSportsTab: React.FC = () => {
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newName, setNewName] = useState("");
    const [newFile, setNewFile] = useState<File | null>(null);
    const [savingNew, setSavingNew] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleError = (e: unknown, fallback: string) => {
        setError(e instanceof Error ? e.message : fallback);
    };

    const fetchSports = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await axiosInstance.get<Sport[]>("/sport-type");
            setSports(res.data);
        } catch (e) {
            handleError(e, "Nie udało się pobrać listy sportów.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSports();
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewFile(e.target.files[0]);
        }
    };

    const handleAddSport = async (e: FormEvent) => {
        e.preventDefault();

        if (!newName.trim()) {
            setError("Podaj nazwę sportu");
            return;
        }
        if (!newFile) {
            setError("Wybierz obrazek");
            return;
        }

        try {
            setSavingNew(true);
            setError(null);

            // 1) upload obrazka
            const formData = new FormData();
            formData.append("file", newFile);

            const uploadRes = await axiosInstance.post<string>(
                "/images/upload/sport",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const imageUrl = uploadRes.data;

            // 2) dodanie sportu
            await axiosInstance.post("/sport-type", {
                name: newName.trim(),
                url: imageUrl,
            });

            setNewName("");
            setNewFile(null);

            await fetchSports();
        } catch (e) {
            handleError(e, "Nie udało się dodać sportu.");
        } finally {
            setSavingNew(false);
        }
    };

    const startEdit = (sport: Sport) => {
        setEditingId(sport.id);
        setEditingName(sport.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleSaveEdit = async () => {
        if (editingId == null) return;
        if (!editingName.trim()) {
            setError("Nazwa sportu nie może być pusta");
            return;
        }

        try {
            setSavingEdit(true);
            setError(null);

            await axiosInstance.patch("/sport-type/updateName", {
                sportId: editingId,
                newName: editingName.trim(),
            });

            setEditingId(null);
            setEditingName("");
            await fetchSports();
        } catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 404) {
                setError("Sport nie istnieje.");
            } else {
                setError("Nie udało się zaktualizować nazwy sportu.");
            }
        } finally {
            setSavingEdit(false);
        }
    };


    const handleDelete = async (id: number) => {
        if (!window.confirm("Na pewno usunąć ten sport?")) return;

        try {
            setDeletingId(id);
            setError(null);

            await axiosInstance.delete(`/sport-type/deleteSport/${id}`);

            setSports((prev) => prev.filter((s) => s.id !== id));
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response) {
                const status = e.response.status;

                if (status === 404) {
                    setError("Sport nie istnieje.");
                } else if (status === 409) {
                    setError("Nie można usunąć sportu — posiada powiązania w systemie.");
                } else {
                    setError("Wystąpił nieoczekiwany błąd podczas usuwania sportu.");
                }
            } else {
                setError("Wystąpił błąd podczas usuwania sportu.");
            }
        } finally {
            setDeletingId(null);
        }
    };


    return (
        <div className="p-4 md:p-6 border-t border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-1">Sporty</h2>
            <p className="text-sm text-zinc-400 mb-6">
                Zarządzaj dyscyplinami sportowymi.
            </p>

            {error && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-200 text-sm">
                    {error}
                </div>
            )}

            {/* Formularz dodawania */}
            <div className="mb-8 rounded-2xl bg-black/40 border border-zinc-800 p-4">
                <h3 className="text-lg font-medium text-white mb-3">Dodaj sport</h3>

                <form onSubmit={handleAddSport} className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-xl text-zinc-100"
                        placeholder="Nazwa sportu"
                    />

                    <div className="flex-1">
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                            Obrazek
                        </label>

                        <input
                            id="uploadSportImage"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <label
                            htmlFor="uploadSportImage"
                            className="
            inline-flex items-center justify-center
            px-4 py-2 rounded-xl bg-violet-600
            text-sm font-medium text-white cursor-pointer
            hover:bg-violet-700 transition
        "
                        >
                            Wybierz zdjęcie
                        </label>

                        {newFile && (
                            <span className="text-zinc-400 ml-2 text-sm">
            {newFile.name}
        </span>
                        )}
                    </div>


                    <button
                        type="submit"
                        disabled={savingNew}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {savingNew ? "Dodawanie…" : "Dodaj"}
                    </button>
                </form>
            </div>

            {/* Lista sportów */}
            <div className="rounded-2xl bg-black/40 border border-zinc-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 text-sm text-zinc-200 font-medium">
                    Lista sportów
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-zinc-400">Ładowanie…</div>
                ) : sports.length === 0 ? (
                    <div className="px-4 py-6 text-zinc-400">Brak sportów.</div>
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {sports.map((sport) => (
                            <div key={sport.id} className="flex items-center gap-4 p-4">
                                <img
                                    src={sport.url}
                                    alt={sport.name}
                                    className="h-12 w-12 rounded-xl object-cover border border-zinc-700"
                                />

                                {editingId === sport.id ? (
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-xl text-zinc-100"
                                    />
                                ) : (
                                    <span className="flex-1 text-zinc-200">{sport.name}</span>
                                )}

                                {/* Buttons */}
                                {editingId === sport.id ? (
                                    <>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={savingEdit}
                                            className="px-3 py-1 bg-emerald-600/70 text-white rounded-lg text-xs"
                                        >
                                            Zapisz
                                        </button>

                                        <button
                                            onClick={cancelEdit}
                                            className="px-3 py-1 bg-zinc-700 text-white rounded-lg text-xs"
                                        >
                                            Anuluj
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => startEdit(sport)}
                                            className="px-3 py-1 bg-zinc-700 text-white rounded-lg text-xs"
                                        >
                                            Edytuj
                                        </button>

                                        <button
                                            onClick={() => handleDelete(sport.id)}
                                            disabled={deletingId === sport.id}
                                            className="px-3 py-1 bg-red-600/70 text-white rounded-lg text-xs"
                                        >
                                            {deletingId === sport.id ? "Usuwanie…" : "Usuń"}
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModeratorSportsTab;
