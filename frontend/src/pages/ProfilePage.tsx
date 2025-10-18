import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../Api/axios";
import type { UpdatePhotoRequest } from "../Api/types";
import Avatar from "../components/Avatar";
import Friends from "../components/Friends";
import {
    Star, Users, Trophy, ChevronRight, Bookmark, Plus,
    Settings, UserRound, Lock, Bell, Globe2, LogOut, Database,
    X, Upload, Camera, UserPlus
} from "lucide-react";

type SimpleUser = {
    name: string;
    email: string;
    dateOfBirth: string;
    urlOfPicture: string | null;
};

type UserSport = { id: number; name: string; level: number; url: string };
type UserSportsResponse = {
    sports: { sportId: number; name: string; url: string; rating: number }[];
};

const savedEvents = [
    { id: 101, title: "Luźna gierka", place: "Koszykowa 13 – Warszawa", tag: "Piłka nożna",
        cover: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=300&auto=format&fit=crop" },
    { id: 102, title: "Mecz zawodowy", place: "Łazienkowska 12 – Warszawa", tag: "Piłka nożna",
        cover: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=300&auto=format&fit=crop" },
];

const Sidebar = ({ activeSection, onSectionChange }: { 
    activeSection: string; 
    onSectionChange: (section: string) => void;
}) => {
    const items = [
        { label: "Ogólne", icon: UserRound, key: "general" },
        { label: "Edytuj profil", icon: Settings, key: "edit-profile" },
        { label: "Hasło", icon: Lock, key: "password" },
        { label: "Profile społecznościowe", icon: Globe2, key: "social-profiles" },
        { label: "E-mail i powiadomienia", icon: Bell, key: "email-notifications" },
        { label: "Znajomi", icon: UserPlus, key: "friends" },
        { label: "Sesje", icon: Users, key: "sessions" },
        { label: "Aplikacje", icon: Trophy, key: "apps" },
        { label: "Eksport danych", icon: Database, key: "export-data" },
    ];
    return (
        <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
                {items.map(({ label, icon: Icon, key }) => (
                    <button
                        key={key}
                        onClick={() => onSectionChange(key)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                            activeSection === key ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800/60"
                        }`}
                    >
                        <Icon size={18} />
                        <span className="text-sm">{label}</span>
                    </button>
                ))}
            </nav>
            <button className="mt-6 text-sm text-red-400 hover:text-red-300 inline-flex items-center gap-2">
                <LogOut size={16} />
                Usuń konto
            </button>
        </aside>
    );
};


const ProfileImageModal = ({ 
    isOpen, 
    onClose, 
    imageUrl, 
    userName,
    onPhotoUpdated,
    loading = false
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    imageUrl: string; 
    userName: string;
    onPhotoUpdated: (newPhotoUrl: string) => void;
    loading?: boolean;
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const uploadResponse = await api.post('/images/upload/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const photoUrl = uploadResponse.data;
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('Brak tokenu autoryzacji');

            const updateRequest: UpdatePhotoRequest = { token, photoUrl };
            await api.patch('/auth/user/photo', updateRequest);

            onPhotoUpdated(photoUrl);
            handleClose();
        } catch (error) {
            console.error('Błąd podczas przesyłania zdjęcia:', error);
            setError('Nie udało się przesłać zdjęcia. Spróbuj ponownie.');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;
    const displayImage = previewUrl || (imageUrl || null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
            <div className="relative w-[95%] max-w-md rounded-2xl bg-zinc-900 p-6 ring-1 ring-zinc-800 shadow-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
                
                <div className="flex flex-col items-center space-y-4">
                    <h3 className="text-white text-lg font-semibold">Zdjęcie profilowe</h3>
                    <div className="relative">
                        <Avatar 
                            src={displayImage} 
                            name={userName} 
                            size="lg"
                            loading={loading}
                            className="ring-4 ring-zinc-700 shadow-2xl"
                        />
                    </div>
                    
                    <div className="w-full space-y-3">
                        <input
                            type="file"
                            id="profile-image-upload"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <label
                            htmlFor="profile-image-upload"
                            className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-zinc-600 hover:border-violet-500 px-4 py-3 text-sm text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                            <Camera size={18} />
                            Wybierz nowe zdjęcie
                        </label>
                        
                        {selectedFile && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm text-zinc-400">
                                        Wybrano: {selectedFile.name}
                                    </span>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Upload size={16} />
                                        {uploading ? "Przesyłanie..." : "Prześlij"}
                                    </button>
                                </div>
                                {error && (
                                    <p className="text-sm text-red-400 text-center">
                                        {error}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileCard = ({ user, loading, onImageClick }: { 
    user: SimpleUser | null; 
    loading: boolean; 
    onImageClick: () => void;
}) => {
    const name = user?.name ?? (loading ? "Ładowanie…" : "—");
    const handle = "Profil";
    const rating = 4.7;
    const friends = 67;
    const mainSport = "Piłka nożna";

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <button onClick={onImageClick} className="relative group" disabled={loading}>
                    <Avatar 
                        src={user?.urlOfPicture ?? null} 
                        name={name} 
                        size="md"
                        loading={loading}
                        className="hover:ring-violet-500 transition-all duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                        <Camera size={16} className="opacity-0 group-hover:opacity-100 text-white transition-opacity duration-200" />
                    </div>
                </button>
                <div>
                    <p className="text-white font-semibold leading-tight">
                        {name} <span className="text-zinc-400">/ {handle}</span>
                    </p>
                    <p className="text-sm text-zinc-400">Zaktualizuj swoje dane i zarządzaj kontem</p>
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
        <Link to="#" className="grid h-9 w-9 place-items-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition" aria-label="Zobacz wydarzenie">
            <ChevronRight />
        </Link>
    </li>
);

const SavedEvents = () => (
    <section className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Zapisane wydarzenia</h3>
        <ul className="space-y-3">{savedEvents.map((e) => <SavedEvent key={e.id} {...e} />)}</ul>
        <div className="pt-2">
            <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
                Zapisz zmiany
            </button>
        </div>
    </section>
);

const SportsList = ({ items, onOpenAdd }: { items: UserSport[]; onOpenAdd: () => void }) => (
    <section className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Sporty</h3>
        <ul className="space-y-3">
            {items.map((s) => (
                <li key={`${s.id}-${s.name}`} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <img src={s.url} alt={s.name} className="h-10 w-10 rounded-full object-cover border border-zinc-700" />
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
            {items.length === 0 && <p className="text-zinc-400 text-sm">Brak sportów — dodaj pierwszy!</p>}
        </ul>
        <button onClick={onOpenAdd} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
            <Plus size={16} />
            Dodaj sport
        </button>
    </section>
);

const MainContent = ({ activeSection, sports, onOpenAdd }: { 
    activeSection: string; 
    sports: UserSport[]; 
    onOpenAdd: () => void;
}) => {
    switch (activeSection) {
        case "general":
            return (
                <div className="grid flex-1 grid-cols-1 gap-8 md:grid-cols-2">
                    <SportsList items={sports} onOpenAdd={onOpenAdd} />
                    <SavedEvents />
                </div>
            );
        case "friends":
            return (
                <div className="flex-1">
                    <Friends />
                </div>
            );
        default:
            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h3 className="text-white text-xl font-semibold mb-2">
                            {activeSection === "edit-profile" && "Edytuj profil"}
                            {activeSection === "password" && "Zmiana hasła"}
                            {activeSection === "social-profiles" && "Profile społecznościowe"}
                            {activeSection === "email-notifications" && "E-mail i powiadomienia"}
                            {activeSection === "sessions" && "Sesje"}
                            {activeSection === "apps" && "Aplikacje"}
                            {activeSection === "export-data" && "Eksport danych"}
                        </h3>
                        <p className="text-zinc-400">
                            Ta sekcja będzie dostępna wkrótce
                        </p>
                    </div>
                </div>
            );
    }
};

const ProfilePage = () => {
    const [user, setUser] = useState<SimpleUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [sports, setSports] = useState<UserSport[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("general");

    const handlePhotoUpdated = (newPhotoUrl: string) => {
        setUser(prev => prev ? { ...prev, urlOfPicture: newPhotoUrl } : null);
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setErrorMsg("Brak tokenu — zaloguj się ponownie.");
            setLoading(false);
            return;
        }
        api
            .get<SimpleUser>("/auth/user/details", { params: { token } })
            .then(({ data }) => setUser(data))
            .catch(() => setErrorMsg("Nie udało się pobrać profilu."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        api
            .get<UserSportsResponse>("/sport-type/user", { params: { token } })
            .then(({ data }) => {
                const mapped: UserSport[] = (data.sports ?? []).map(s => ({
                    id: s.sportId,
                    name: s.name,
                    url: s.url,
                    level: s.rating,
                }));
                setSports(mapped);
            })
            .catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-[#1f2632] text-zinc-300">
            <header className="relative h-[180px] md:h-[220px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url(https://images.unsplash.com/photo-1604948501466-4e9b4d6f3e2b?q=80&w=1600&auto=format&fit=crop)" }}
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-6 md:px-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-white">Panel profilu</h1>
                        <div className="mt-2 h-1 w-32 rounded-full bg-violet-600" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                <div className="rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800">
                    <ProfileCard 
                        user={user} 
                        loading={loading} 
                        onImageClick={() => setIsImageModalOpen(true)} 
                    />
                    {errorMsg && (
                        <p className="mt-4 rounded-lg bg-red-500/10 text-red-300 px-3 py-2 text-sm">
                            {errorMsg}
                        </p>
                    )}
                    <hr className="my-8 border-zinc-800" />
                    <div className="flex flex-col gap-8 lg:flex-row">
                        <Sidebar 
                            activeSection={activeSection} 
                            onSectionChange={setActiveSection} 
                        />
                        <MainContent 
                            activeSection={activeSection}
                            sports={sports}
                            onOpenAdd={() => console.log('Add sport clicked')}
                        />
                    </div>
                </div>
            </main>

            <ProfileImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={user?.urlOfPicture ?? ""}
                userName={user?.name ?? "Użytkownik"}
                onPhotoUpdated={handlePhotoUpdated}
                loading={loading}
            />
        </div>
    );
};

export default ProfilePage;
