import Avatar from "./Avatar";
import { Star, Users, Trophy, Camera } from "lucide-react";
import type { SimpleUser } from "../Api/types/Profile";

interface ProfileCardProps {
    user: SimpleUser | null;
    loading: boolean;
    onImageClick: () => void;
    mainSportName: string;
    friendsCount?: number;
}

const ProfileCard = ({
    user,
    loading,
    onImageClick,
    mainSportName,
    friendsCount = 0
}: ProfileCardProps) => {
    const name = user?.name ?? (loading ? "Ładowanie…" : "—");
    const handle = "Profil";
    const rating = 4.7;

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
                        <Camera
                            size={16}
                            className="opacity-0 group-hover:opacity-100 text-white transition-opacity duration-200"
                        />
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
                        <span className="font-semibold text-white">{friendsCount}</span>
                    </div>
                    <p className="text-xs text-zinc-400">Znajomi</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Trophy size={16} />
                        <span className="font-semibold text-white">{mainSportName || "—"}</span>
                    </div>
                    <p className="text-xs text-zinc-400">Główny sport</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
