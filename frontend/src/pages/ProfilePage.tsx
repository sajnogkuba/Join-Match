import { useEffect, useState } from "react";
import api from "../Api/axios";
import Friends from "../components/Friends";
import GeneralSection from "../components/GeneralSection";
import PasswordSection from "../components/PasswordSection";
import ProfileCard from "../components/ProfileCard";
import ProfileImageModal from "../components/ProfileImageModal";
import ProfileSidebar from "../components/ProfileSidebar";
import RatingsSection from "../components/RatingsSection";
import type { SimpleUser, SidebarItemKey } from "../Api/types/Profile";
import type { UserRatingResponse } from "../Api/types/Rating";
import type { UserSportsResponse } from "../Api/types/Sports";
import type { User } from "../Api/types/User";
import MyEventsSection from "../components/MyEventsSection.tsx";
import MyParticipationsSection from "../components/MyParticipationsSection.tsx";
import BadgesSection from "../components/BadgesSection.tsx";
import { getCookie } from "../utils/cookies";



const ProfilePage = () => {
    const [user, setUser] = useState<SimpleUser | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<SidebarItemKey>("Ogólne");
    const [mainSportName, setMainSportName] = useState<string>("");
    const [friendsCount, setFriendsCount] = useState<number>(0);
    const [userRatings, setUserRatings] = useState<UserRatingResponse[]>([]);

    const handlePhotoUpdated = (newPhotoUrl: string) => {
        setUser((prev) => (prev ? { ...prev, urlOfPicture: newPhotoUrl } : null));
    };

    const refreshMainSport = () => {
        const token = getCookie("accessToken");
        if (!token) return;
        
        api
            .get<UserSportsResponse>("/sport-type/user", { params: { token } })
            .then(({ data }) => {
                const mainSport = data.sports?.find((s) => s.isMain);
                setMainSportName(mainSport?.name || "");
            })
            .catch(() => setMainSportName(""));
    };

    const fetchFriendsCount = () => {
        const token = getCookie("accessToken");
        if (!token || !currentUser?.id) return;
        
        api
            .get(`/friends/${currentUser.id}`)
            .then(({ data }) => {
                setFriendsCount(data.length);
            })
            .catch(() => {
                setFriendsCount(0);
            });
    };

    const fetchUserRatings = async () => {
        if (!currentUser?.id) return;
        try {
            const res = await api.get(`/ratings/user/${currentUser.id}`);
            setUserRatings(res.data || []);
        } catch {
            setUserRatings([]);
        }
    };


    useEffect(() => {
        const token = getCookie("accessToken");
        if (!token) {
            setErrorMsg("Brak tokenu — zaloguj się ponownie.");
            setLoading(false);
            return;
        }

        api
            .get<User>("/auth/user", { params: { token } })
            .then(({ data: userData }) => {
                setCurrentUser(userData);
                
                return api.get<SimpleUser>("/auth/user/details", { params: { token } });
            })
            .then(({ data: userDetails }) => {
                setUser(userDetails);
            })
            .catch(() => setErrorMsg("Nie udało się pobrać profilu."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        refreshMainSport();
    }, [activeTab]);

    useEffect(() => {
        if (currentUser?.id) {
            fetchFriendsCount();
            fetchUserRatings();
        }
    }, [currentUser]);

    const averageRating = userRatings.length
        ? userRatings.reduce((a, r) => a + r.rating, 0) / userRatings.length
        : null;

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#pending-requests') {
                setActiveTab('Znajomi');
            } else if (hash === '#friends') {
                setActiveTab('Znajomi');
            }
        };
        
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
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
                        mainSportName={mainSportName}
                        friendsCount={friendsCount}
                        averageRating={averageRating}
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
                            <GeneralSection 
                                userEmail={user?.email} 
                                onMainSportChanged={refreshMainSport}
                            />
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
                        {activeTab === "Oceny" && (
                            <div className="flex-1">
                                <RatingsSection userId={currentUser?.id ?? null} />
                            </div>
                        )}
                        {activeTab === "Moje wydarzenia" && (
                            <div className="flex-1">
                                <MyEventsSection />
                            </div>
                        )}
                        {activeTab === "Biorę udział" && (
                            <div className="flex-1">
                                <MyParticipationsSection />
                            </div>
                        )}
                        {activeTab === "Odznaki" && (
                            <div className="flex-1">
                                <BadgesSection userId={currentUser?.id ?? null} />
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