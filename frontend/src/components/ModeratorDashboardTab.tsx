import React, { useEffect, useState } from "react";
import {  Star, Ticket, Users, UsersRound, UserCheck } from "lucide-react";
import axiosInstance from "../Api/axios.tsx";

type DashboardStats = {
    numberOfRecentReportsCompetitions: number;
    numberOfRecentReportsEventRatings: number;
    numberOfRecentReportsEvents: number;
    numberOfRecentReportsTeams: number;
    numberOfRecentReportsUserRating: number;
    numberOfRecentReportsUser: number;
};

const ModeratorDashboardTab: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axiosInstance.get<DashboardStats>("/moderator/dashboard");
                setStats(res.data);
            } catch {
                setError("Nie udało się pobrać danych dashboardu.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <section className="p-4 md:p-0">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Podsumowanie zgłoszeń</h2>
            </div>

            {loading && (
                <div className="text-zinc-400 text-sm">
                    Ładowanie danych dashboardu…
                </div>
            )}

            {error && (
                <div className="text-red-400 text-sm mb-4">
                    {error}
                </div>
            )}

            {stats && !loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <DashboardCard
                        icon={<Ticket className="h-5 w-5" />}
                        title="Zgłoszenia wydarzeń"
                        value={stats.numberOfRecentReportsEvents}
                        badge="Eventy"
                    />
                    <DashboardCard
                        icon={<Star className="h-5 w-5" />}
                        title="Zgłoszenia ocen wydarzeń"
                        value={stats.numberOfRecentReportsEventRatings}
                        badge="Oceny wydarzeń"
                    />
                    <DashboardCard
                        icon={<UserCheck className="h-5 w-5" />}
                        title="Zgłoszenia ocen użytkowników"
                        value={stats.numberOfRecentReportsUserRating}
                        badge="Oceny użytkowników"
                    />
                    <DashboardCard
                        icon={<UsersRound className="h-5 w-5" />}
                        title="Zgłoszenia drużyn"
                        value={stats.numberOfRecentReportsTeams}
                        badge="Drużyny"
                    />
                    <DashboardCard
                        icon={<Users className="h-5 w-5" />}
                        title="Zgłoszenia użytkowników"
                        value={stats.numberOfRecentReportsUser}
                        badge="Użytkownicy"
                    />
                </div>
            )}
        </section>
    );
};

type DashboardCardProps = {
    icon: React.ReactNode;
    title: string;
    value: number;
    badge: string;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
                                                         icon,
                                                         title,
                                                         value,
                                                         badge,
                                                     }) => {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300">
                        {icon}
                    </div>
                    <div className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        {badge}
                    </div>
                </div>
                <span className="text-2xl font-semibold text-white">
                    {value}
                </span>
            </div>
            <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
        </div>
    );
};

export default ModeratorDashboardTab;
