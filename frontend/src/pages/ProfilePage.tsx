import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../Api/axios";
import Avatar from "../components/Avatar";
import Friends from "../components/Friends";
import StarRatingInput from "../components/StarRatingInput";
import {
    Star,
    Users,
    Trophy,
    ChevronRight,
    Bookmark,
    Plus,
    Settings,
    UserRound,
    Lock,
    Bell,
    Globe2,
    LogOut,
    Database,
    X,
    Upload,
    Camera,
    UserPlus,
    Check
} from "lucide-react";

type SimpleUser = {
    name: string;
    email: string;
    urlOfPicture: string | null;
};

type SportTypeOption = { id: number; name: string; url: string };
type UserSport = { id: number; name: string; level: number; url: string; isMain?: boolean };
type UserSportsResponse = {
    sports: { sportId: number; name: string; url: string; rating: number; isMain?: boolean }[];
};

type SavedEventRef = { id: number; userId: number; eventId: number };
type EventDetails = {
    eventId: number;
    eventName: string;
    numberOfParticipants: number;
    cost: number;
    currency: string;
    status: string;
    eventDate: string;
    sportTypeName: string;
    sportObjectName: string;
    sportObjectId: number;
    city: string;
    street: string;
    number: number | string;
    secondNumber: string | null;
    eventVisibilityId: number;
    eventVisibilityName: string;
    ownerId: number;
    ownerName: string;
    skillLevel: string;
    paymentMethod: string;
    imageUrl?: string;
};

type SidebarItemKey =
    | "General"
    | "Edit Profile"
    | "Password"
    | "Social Profiles"
    | "Email Notifications"
    | "Friends"
    | "Sessions"
    | "Applications"
    | "Data Export";

const Sidebar = ({
    active,
    onSelect
}: {
    active: SidebarItemKey;
    onSelect: (key: SidebarItemKey) => void;
}) => {
    const items: { label: SidebarItemKey; icon: React.ComponentType<{ size?: number }> }[] = [
        { label: "General", icon: UserRound },
        { label: "Edit Profile", icon: Settings },
        { label: "Password", icon: Lock },
        { label: "Social Profiles", icon: Globe2 },
        { label: "Email Notifications", icon: Bell },
        { label: "Friends", icon: UserPlus },
        { label: "Sessions", icon: Users },
        { label: "Applications", icon: Trophy },
        { label: "Data Export", icon: Database }
    ];

    return (
        <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
                {items.map(({ label, icon: Icon }) => (
                    <button
                        key={label}
                        onClick={() => onSelect(label)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                            active === label
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-300 hover:bg-zinc-800/60"
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
            formData.append("file", selectedFile);
            const uploadResponse = await api.post("/images/upload/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const photoUrl = uploadResponse.data;
            const token = localStorage.getItem("accessToken");
            if (!token) throw new Error("Brak tokenu autoryzacji");
            await api.patch("/auth/user/photo", { token, photoUrl });
            onPhotoUpdated(photoUrl);
            handleClose();
        } catch {
            setError("Nie udało się przesłać zdjęcia. Spróbuj ponownie.");
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

    const displayImage = previewUrl || imageUrl || null;

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
                                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const [user, setUser] = useState<SimpleUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [sports, setSports] = useState<UserSport[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<SidebarItemKey>("General");

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

    return (
        <div className="min-h-screen bg-[#1f2632] text-zinc-300">
            <header className="relative h-[180px] md:h-[220px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1604948501466-4e9b4d6f3e2b?q=80&w=1600&auto=format&fit=crop)"
                    }}
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
                    <div className="flex flex-col gap-8 lg:flex-row">
                        <Sidebar active={activeTab} onSelect={setActiveTab} />
                        {activeTab === "General" && (
                            <div className="flex-1 text-white">Sekcja ogólna</div>
                        )}
                        {activeTab === "Friends" && (
                            <div className="flex-1">
                                <Friends />
                            </div>
                        )}
                        {activeTab !== "General" && activeTab !== "Friends" && (
                            <div className="flex-1 text-sm text-zinc-500">Wkrótce</div>
                        )}
                    </div>
                </div>
            </main>

            <ProfileImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={user?.urlOfPicture ?? ""}
                userName={user?.name ?? "Użytkownik"}
                onPhotoUpdated={(url) => setUser((u) => (u ? { ...u, urlOfPicture: url } : u))}
            />
        </div>
    );
};

export default ProfilePage;
