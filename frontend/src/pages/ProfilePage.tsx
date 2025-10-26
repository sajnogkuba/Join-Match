import { useEffect, useState } from "react";
import api from "../Api/axios";
import Friends from "../components/Friends";
import GeneralSection from "../components/GeneralSection";
import PasswordSection from "../components/PasswordSection";
import ProfileCard from "../components/ProfileCard";
import ProfileImageModal from "../components/ProfileImageModal";
import ProfileSidebar from "../components/ProfileSidebar";
import type { SimpleUser, SidebarItemKey } from "../Api/types/Profile";



const ProfilePage = () => {
    const [user, setUser] = useState<SimpleUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<SidebarItemKey>("Ogólne");

    const handlePhotoUpdated = (newPhotoUrl: string) => {
        setUser((prev) => (prev ? { ...prev, urlOfPicture: newPhotoUrl } : null));
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
                    <ProfileCard
                        user={user}
                        loading={loading}
                        onImageClick={() => setIsImageModalOpen(true)}
                        mainSportName=""
                    />
                    {errorMsg && (
                        <p className="mt-4 rounded-lg bg-red-500/10 text-red-300 px-3 py-2 text-sm">
                            {errorMsg}
                        </p>
                    )}
                    <hr className="my-8 border-zinc-800" />
                    <div className="flex flex-col gap-8 lg:flex-row">
                        <ProfileSidebar active={activeTab} onSelect={(t) => setActiveTab(t)} />
                        {activeTab === "Ogólne" && (
                            <GeneralSection userEmail={user?.email} />
                        )}
                        {activeTab === "Znajomi" && (
                            <div className="flex-1">
                                <Friends />
                            </div>
                        )}
                        {activeTab === "Hasło" && (
                            <div className="flex-1">
                                <PasswordSection />
                            </div>
                        )}
                    </div>
                </div>
            </main>


            <ProfileImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={user?.urlOfPicture ?? ""}
                userName={user?.name ?? "Użytkownik"}
                onPhotoUpdated={handlePhotoUpdated}
            />
        </div>
    );
};

export default ProfilePage;